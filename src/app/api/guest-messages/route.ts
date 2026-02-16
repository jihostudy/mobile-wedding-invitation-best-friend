import { createServerSupabaseClient } from '@/lib/supabase/server';
import { fail, ok } from '@/lib/server/http';

function isMissingDisplayOrderColumnError(error: { code?: string; message?: string } | null) {
  if (!error) return false;
  return error.code === '42703' || (error.message ?? '').includes('display_order');
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const publicOnly = searchParams.get('publicOnly') !== 'false';

  const supabase = createServerSupabaseClient();
  const primaryQuery = supabase
    .from('guest_messages')
    .select('id, author, message, is_public, created_at, display_order')
    .order('is_public', { ascending: false })
    .order('display_order', { ascending: true })
    .order('created_at', { ascending: false });

  const primaryResult = publicOnly
    ? await primaryQuery.eq('is_public', true)
    : await primaryQuery;

  let data = primaryResult.data;
  let error = primaryResult.error;
  let usedDisplayOrder = true;

  if (error && isMissingDisplayOrderColumnError(error)) {
    usedDisplayOrder = false;
    const fallbackQuery = supabase
      .from('guest_messages')
      .select('id, author, message, is_public, created_at')
      .order('created_at', { ascending: false });

    const fallbackResult = publicOnly
      ? await fallbackQuery.eq('is_public', true)
      : await fallbackQuery;
    data = fallbackResult.data as typeof data;
    error = fallbackResult.error as typeof error;
  }

  if (error) {
    return fail(500, 'GUEST_MESSAGES_FETCH_FAILED', error.message);
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

  // Public guestbook submissions are validated at API level.
  // Use service role here to avoid environment-specific RLS policy drift.
  const supabase = createServerSupabaseClient({ serviceRole: true });
  let displayOrder = 0;
  let supportsDisplayOrder = true;
  if (isPublic) {
    const { data: lastPublicMessage, error: orderError } = await supabase
      .from('guest_messages')
      .select('display_order')
      .eq('is_public', true)
      .order('display_order', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (orderError && !isMissingDisplayOrderColumnError(orderError)) {
      return fail(500, 'GUEST_MESSAGE_ORDER_FETCH_FAILED', orderError.message);
    }
    if (orderError && isMissingDisplayOrderColumnError(orderError)) {
      supportsDisplayOrder = false;
    }

    displayOrder = (lastPublicMessage?.display_order ?? -1) + 1;
  }

  let insertResult = await supabase
    .from('guest_messages')
    .insert([
      {
        author,
        message,
        is_public: isPublic,
        ...(supportsDisplayOrder ? { display_order: displayOrder } : {}),
      },
    ])
    .select('id')
    .single();

  if (insertResult.error && isMissingDisplayOrderColumnError(insertResult.error)) {
    insertResult = await supabase
      .from('guest_messages')
      .insert([{ author, message, is_public: isPublic }])
      .select('id')
      .single();
  }

  const { data, error } = insertResult;

  if (error) {
    return fail(500, 'GUEST_MESSAGE_CREATE_FAILED', error.message);
  }

  return ok({ success: true, id: data.id });
}
