import type { NextRequest } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import {
  getAdminCredentialKey,
  hashAdminPassword,
  safeEquals,
} from '@/lib/server/admin-auth';
import { fail, ok } from '@/lib/server/http';

export async function POST(request: NextRequest) {
  const bootstrapToken = request.headers.get('x-bootstrap-token') || '';
  const expectedToken = process.env.ADMIN_BOOTSTRAP_TOKEN || '';

  if (!bootstrapToken || !expectedToken || !safeEquals(bootstrapToken, expectedToken)) {
    return fail(401, 'UNAUTHORIZED', 'bootstrap authorization required');
  }

  let body: { password?: string };
  try {
    body = (await request.json()) as { password?: string };
  } catch {
    return fail(400, 'INVALID_JSON', 'invalid request body');
  }

  const password = body.password?.trim() || '';
  if (!password) {
    return fail(400, 'VALIDATION_ERROR', 'password is required');
  }

  const supabase = createServerSupabaseClient({ serviceRole: true });
  const credentialKey = getAdminCredentialKey();

  const { data: existing, error: existingError } = await supabase
    .from('admin_credentials')
    .select('key')
    .eq('key', credentialKey)
    .maybeSingle();

  if (existingError) {
    return fail(500, 'ADMIN_BOOTSTRAP_CHECK_FAILED', existingError.message);
  }

  if (existing) {
    return fail(409, 'ALREADY_INITIALIZED', 'admin credential is already initialized');
  }

  const { error } = await supabase.from('admin_credentials').insert([
    {
      key: credentialKey,
      password_hash: hashAdminPassword(password),
    },
  ]);

  if (error) {
    return fail(500, 'ADMIN_BOOTSTRAP_FAILED', error.message);
  }

  return ok({ success: true });
}
