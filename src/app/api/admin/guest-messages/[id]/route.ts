import type { NextRequest } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { hasValidCsrf, isAdminRequest } from '@/lib/server/admin-auth';
import { fail, ok } from '@/lib/server/http';

export async function PATCH(request: NextRequest, context: { params: { id: string } }) {
  if (!isAdminRequest(request)) return fail(401, 'UNAUTHORIZED', 'admin authorization required');
  if (!hasValidCsrf(request)) return fail(403, 'CSRF_INVALID', 'csrf token is invalid');

  const id = context.params.id;
  let body: { isPublic?: boolean };
  try {
    body = (await request.json()) as { isPublic?: boolean };
  } catch {
    return fail(400, 'INVALID_JSON', 'invalid request body');
  }

  if (typeof body.isPublic !== 'boolean') {
    return fail(400, 'VALIDATION_ERROR', 'isPublic is required');
  }

  const supabase = createServerSupabaseClient({ serviceRole: true });
  const { error } = await supabase
    .from('guest_messages')
    .update({ is_public: body.isPublic })
    .eq('id', id);

  if (error) return fail(500, 'ADMIN_GUEST_MESSAGE_UPDATE_FAILED', error.message);

  await supabase.from('admin_audit_logs').insert([
    {
      action: 'UPDATE_GUEST_MESSAGE_VISIBILITY',
      target: 'guest_messages',
      target_id: id,
      detail: { isPublic: body.isPublic },
    },
  ]);

  return ok({ success: true });
}

export async function DELETE(request: NextRequest, context: { params: { id: string } }) {
  if (!isAdminRequest(request)) return fail(401, 'UNAUTHORIZED', 'admin authorization required');
  if (!hasValidCsrf(request)) return fail(403, 'CSRF_INVALID', 'csrf token is invalid');

  const id = context.params.id;
  const supabase = createServerSupabaseClient({ serviceRole: true });
  const { error } = await supabase.from('guest_messages').delete().eq('id', id);

  if (error) return fail(500, 'ADMIN_GUEST_MESSAGE_DELETE_FAILED', error.message);

  await supabase.from('admin_audit_logs').insert([
    {
      action: 'DELETE_GUEST_MESSAGE',
      target: 'guest_messages',
      target_id: id,
    },
  ]);

  return ok({ success: true });
}
