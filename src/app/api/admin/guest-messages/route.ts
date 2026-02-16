import type { NextRequest } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { isAdminRequest } from '@/lib/server/admin-auth';
import { fail, ok } from '@/lib/server/http';

function isMissingDisplayOrderColumnError(error: { code?: string; message?: string } | null) {
  if (!error) return false;
  return error.code === '42703' || (error.message ?? '').includes('display_order');
}

export async function GET(request: NextRequest) {
  if (!isAdminRequest(request)) {
    return fail(401, 'UNAUTHORIZED', 'admin authorization required');
  }

  const supabase = createServerSupabaseClient({ serviceRole: true });
  const primaryResult = await supabase
    .from('guest_messages')
    .select('id, author, message, is_public, created_at, display_order')
    .order('is_public', { ascending: false })
    .order('display_order', { ascending: true })
    .order('created_at', { ascending: false });

  let data = primaryResult.data;
  let error = primaryResult.error;
  let usedDisplayOrder = true;

  if (error && isMissingDisplayOrderColumnError(error)) {
    usedDisplayOrder = false;
    const fallbackResult = await supabase
      .from('guest_messages')
      .select('id, author, message, is_public, created_at')
      .order('created_at', { ascending: false });
    data = fallbackResult.data as typeof data;
    error = fallbackResult.error as typeof error;
  }

  if (error) {
    return fail(500, 'ADMIN_GUEST_MESSAGES_FETCH_FAILED', error.message);
  }

  return ok({
    messages: (data ?? []).map((item, index) => ({
      id: item.id,
      author: item.author,
      message: item.message,
      isPublic: item.is_public ?? true,
      createdAt: item.created_at,
      displayOrder: usedDisplayOrder ? (item.display_order ?? 0) : index,
    })),
  });
}
