import type { NextRequest } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { isAdminRequest } from '@/lib/server/admin-auth';
import { fail, ok } from '@/lib/server/http';

export async function GET(request: NextRequest) {
  if (!isAdminRequest(request)) {
    return fail(401, 'UNAUTHORIZED', 'admin authorization required');
  }

  const supabase = createServerSupabaseClient({ serviceRole: true });
  const { data, error } = await supabase
    .from('guest_messages')
    .select('id, author, message, is_public, created_at')
    .order('created_at', { ascending: false });

  if (error) {
    return fail(500, 'ADMIN_GUEST_MESSAGES_FETCH_FAILED', error.message);
  }

  return ok({
    messages: (data ?? []).map((item) => ({
      id: item.id,
      author: item.author,
      message: item.message,
      isPublic: item.is_public ?? true,
      createdAt: item.created_at,
    })),
  });
}
