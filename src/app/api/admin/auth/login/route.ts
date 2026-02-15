import { createServerSupabaseClient } from '@/lib/supabase/server';
import {
  getAdminCredentialKey,
  issueAdminAuthCookies,
  verifyAdminPassword,
} from '@/lib/server/admin-auth';
import { fail, ok } from '@/lib/server/http';

export async function POST(request: Request) {
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
  const { data, error } = await supabase
    .from('admin_credentials')
    .select('password_hash')
    .eq('key', credentialKey)
    .maybeSingle();

  if (error) {
    return fail(500, 'ADMIN_LOGIN_FAILED', error.message);
  }

  if (!data?.password_hash) {
    return fail(503, 'ADMIN_NOT_INITIALIZED', 'admin credential is not initialized');
  }

  if (!verifyAdminPassword(password, data.password_hash)) {
    return fail(401, 'UNAUTHORIZED', 'invalid admin password');
  }

  const response = ok({ success: true });
  const issued = issueAdminAuthCookies(response);
  if (!issued) {
    return fail(500, 'ADMIN_SESSION_SECRET_MISSING', 'admin session secret is not configured');
  }

  return response;
}
