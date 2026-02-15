import { createServerSupabaseClient } from '@/lib/supabase/server';
import { fail, ok } from '@/lib/server/http';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const publicOnly = searchParams.get('publicOnly') !== 'false';

  const supabase = createServerSupabaseClient();
  const query = supabase
    .from('guest_messages')
    .select('id, author, message, is_public, created_at')
    .order('created_at', { ascending: false });

  const { data, error } = publicOnly
    ? await query.eq('is_public', true)
    : await query;

  if (error) {
    return fail(500, 'GUEST_MESSAGES_FETCH_FAILED', error.message);
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

export async function POST(request: Request) {
  let body: { author?: string; message?: string; isPublic?: boolean };
  try {
    body = (await request.json()) as { author?: string; message?: string; isPublic?: boolean };
  } catch {
    return fail(400, 'INVALID_JSON', 'Invalid request body');
  }

  const author = body.author?.trim() || '';
  const message = body.message?.trim() || '';
  const isPublic = body.isPublic ?? true;

  if (!author) return fail(400, 'VALIDATION_ERROR', 'author is required');
  if (!message) return fail(400, 'VALIDATION_ERROR', 'message is required');

  const supabase = createServerSupabaseClient();
  const { data, error } = await supabase
    .from('guest_messages')
    .insert([{ author, message, is_public: isPublic }])
    .select('id')
    .single();

  if (error) {
    return fail(500, 'GUEST_MESSAGE_CREATE_FAILED', error.message);
  }

  return ok({ success: true, id: data.id });
}
