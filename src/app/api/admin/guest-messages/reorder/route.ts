import type { NextRequest } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { hasValidCsrf, isAdminRequest } from '@/lib/server/admin-auth';
import { fail, ok } from '@/lib/server/http';

export async function PATCH(request: NextRequest) {
  if (!isAdminRequest(request)) return fail(401, 'UNAUTHORIZED', 'admin authorization required');
  if (!hasValidCsrf(request)) return fail(403, 'CSRF_INVALID', 'csrf token is invalid');

  let body: { ids?: string[] };
  try {
    body = (await request.json()) as { ids?: string[] };
  } catch {
    return fail(400, 'INVALID_JSON', 'invalid request body');
  }

  const ids = body.ids ?? [];
  if (!Array.isArray(ids) || ids.length === 0) {
    return fail(400, 'VALIDATION_ERROR', 'ids are required');
  }
  if (new Set(ids).size !== ids.length) {
    return fail(400, 'VALIDATION_ERROR', 'ids must be unique');
  }

  const supabase = createServerSupabaseClient({ serviceRole: true });
  const { data: publicRows, error: fetchError } = await supabase
    .from('guest_messages')
    .select('id')
    .eq('is_public', true);

  if (fetchError) {
    return fail(500, 'ADMIN_GUEST_MESSAGES_FETCH_FAILED', fetchError.message);
  }

  const publicIds = new Set((publicRows ?? []).map((row) => row.id));
  if (publicIds.size !== ids.length || ids.some((id) => !publicIds.has(id))) {
    return fail(400, 'VALIDATION_ERROR', 'ids must match all public guest message ids');
  }

  for (const [index, id] of ids.entries()) {
    const { error } = await supabase
      .from('guest_messages')
      .update({ display_order: index })
      .eq('id', id)
      .eq('is_public', true);
    if (error) {
      return fail(500, 'ADMIN_GUEST_MESSAGE_REORDER_FAILED', error.message);
    }
  }

  await supabase.from('admin_audit_logs').insert([
    {
      action: 'REORDER_GUEST_MESSAGES',
      target: 'guest_messages',
      detail: { orderedPublicIds: ids },
    },
  ]);

  return ok({ success: true });
}

