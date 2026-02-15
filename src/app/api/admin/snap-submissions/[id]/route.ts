import type { NextRequest } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { hasValidCsrf, isAdminRequest } from '@/lib/server/admin-auth';
import { fail, ok } from '@/lib/server/http';

export async function PATCH(request: NextRequest, context: { params: { id: string } }) {
  if (!isAdminRequest(request)) return fail(401, 'UNAUTHORIZED', 'admin authorization required');
  if (!hasValidCsrf(request)) return fail(403, 'CSRF_INVALID', 'csrf token is invalid');

  const id = context.params.id;
  let body: { status?: 'uploaded' | 'rejected' | 'approved' };
  try {
    body = (await request.json()) as { status?: 'uploaded' | 'rejected' | 'approved' };
  } catch {
    return fail(400, 'INVALID_JSON', 'invalid request body');
  }

  if (!body.status || !['uploaded', 'rejected', 'approved'].includes(body.status)) {
    return fail(400, 'VALIDATION_ERROR', 'invalid status');
  }

  const supabase = createServerSupabaseClient({ serviceRole: true });
  const { error } = await supabase
    .from('snap_upload_submissions')
    .update({ status: body.status })
    .eq('id', id);

  if (error) return fail(500, 'ADMIN_SNAP_UPDATE_FAILED', error.message);

  await supabase.from('admin_audit_logs').insert([
    {
      action: 'UPDATE_SNAP_SUBMISSION_STATUS',
      target: 'snap_upload_submissions',
      target_id: id,
      detail: { status: body.status },
    },
  ]);

  return ok({ success: true });
}
