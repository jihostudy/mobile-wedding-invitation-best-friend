import type { NextRequest } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { hasValidCsrf, isAdminRequest } from '@/lib/server/admin-auth';
import { fail, ok } from '@/lib/server/http';

function isMissingDisplayOrderColumnError(error: { code?: string; message?: string } | null) {
  if (!error) return false;
  return error.code === '42703' || (error.message ?? '').includes('display_order');
}

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
  const { data: currentMessage, error: currentMessageError } = await supabase
    .from('guest_messages')
    .select('is_public')
    .eq('id', id)
    .maybeSingle();

  if (currentMessageError) {
    return fail(500, 'ADMIN_GUEST_MESSAGE_FETCH_FAILED', currentMessageError.message);
  }
  if (!currentMessage) {
    return fail(404, 'NOT_FOUND', 'guest message not found');
  }

  let nextDisplayOrder: number | undefined;
  if (!currentMessage.is_public && body.isPublic) {
    const { data: lastPublicMessage, error: orderError } = await supabase
      .from('guest_messages')
      .select('display_order')
      .eq('is_public', true)
      .order('display_order', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (orderError && !isMissingDisplayOrderColumnError(orderError)) {
      return fail(500, 'ADMIN_GUEST_MESSAGE_ORDER_FETCH_FAILED', orderError.message);
    }
    if (!orderError) {
      nextDisplayOrder = (lastPublicMessage?.display_order ?? -1) + 1;
    }
  }

  const { error } = await supabase
    .from('guest_messages')
    .update({
      is_public: body.isPublic,
      ...(typeof nextDisplayOrder === 'number' ? { display_order: nextDisplayOrder } : {}),
    })
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
