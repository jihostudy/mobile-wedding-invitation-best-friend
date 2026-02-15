import { createServerSupabaseClient } from '@/lib/supabase/server';
import { FALLBACK_WEDDING_CONTENT } from '@/lib/wedding-content/fallback';
import { toViewWeddingContent } from '@/lib/wedding-content/mapper';
import { parseWeddingContent } from '@/lib/wedding-content/schema';
import type { WeddingContentResponse, WeddingContentV1 } from '@/types';

export async function getWeddingContent(slug = 'main'): Promise<WeddingContentResponse> {
  const supabase = createServerSupabaseClient();
  const { data, error } = await supabase
    .from('wedding_content')
    .select('slug, version, content')
    .eq('slug', slug)
    .maybeSingle();

  if (error || !data) {
    if (error) {
      console.error('Failed to fetch wedding content:', error);
    }
    return {
      slug,
      version: 1,
      content: FALLBACK_WEDDING_CONTENT,
    };
  }

  try {
    const parsed = parseWeddingContent(data.content);
    return {
      slug: data.slug,
      version: data.version,
      content: toViewWeddingContent(parsed),
    };
  } catch (parseError) {
    console.error('Invalid wedding content schema, using fallback:', parseError);
    return {
      slug,
      version: data.version ?? 1,
      content: FALLBACK_WEDDING_CONTENT,
    };
  }
}

export async function updateWeddingContent(params: {
  slug: string;
  expectedVersion: number;
  content: WeddingContentV1;
}): Promise<
  | { success: true; version: number }
  | {
      success: false;
      code: 'VERSION_CONFLICT' | 'UPDATE_FAILED' | 'VALIDATION_ERROR';
      latestVersion?: number;
      message: string;
      details?: unknown;
    }
> {
  let validatedContent: WeddingContentV1;
  try {
    validatedContent = parseWeddingContent(params.content);
  } catch (error) {
    return {
      success: false,
      code: 'VALIDATION_ERROR',
      message: 'Invalid wedding content payload',
      details: error,
    };
  }

  const supabase = createServerSupabaseClient({ serviceRole: true });

  const { data: current, error: readError } = await supabase
    .from('wedding_content')
    .select('version')
    .eq('slug', params.slug)
    .maybeSingle();

  if (readError) {
    return { success: false, code: 'UPDATE_FAILED', message: readError.message };
  }

  const latestVersion = current?.version ?? 1;
  if (latestVersion !== params.expectedVersion) {
    return {
      success: false,
      code: 'VERSION_CONFLICT',
      latestVersion,
      message: 'Content version conflict',
    };
  }

  const nextVersion = latestVersion + 1;
  const { error: updateError } = await supabase
    .from('wedding_content')
    .upsert([
      {
        slug: params.slug,
        version: nextVersion,
        content: validatedContent,
      },
    ], { onConflict: 'slug' });

  if (updateError) {
    return { success: false, code: 'UPDATE_FAILED', message: updateError.message };
  }

  await supabase.from('admin_audit_logs').insert([
    {
      action: 'UPDATE_WEDDING_CONTENT',
      target: 'wedding_content',
      target_id: params.slug,
      detail: { expectedVersion: params.expectedVersion, nextVersion },
    },
  ]);

  return { success: true, version: nextVersion };
}
