import { FALLBACK_WEDDING_CONTENT } from '@/lib/wedding-content/fallback';
import { toViewWeddingContent } from '@/lib/wedding-content/mapper';
import { parseWeddingContent } from '@/lib/wedding-content/schema';
import staticWeddingContent from '@/content/wedding-content.main.json';
import type { WeddingContentResponse, WeddingContentV1 } from '@/types';

export async function getWeddingContent(slug = 'main'): Promise<WeddingContentResponse> {
  const data = staticWeddingContent as {
    slug?: string;
    version?: number;
    content?: unknown;
  };

  try {
    const parsed = parseWeddingContent(data.content);
    return {
      slug: data.slug ?? slug,
      version: data.version ?? 1,
      content: toViewWeddingContent(parsed),
    };
  } catch (parseError) {
    console.error('[wedding-content] invalid static schema, using fallback', {
      slug,
      version: data.version,
      parseError,
    });
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

  void validatedContent;

  return {
    success: false,
    code: 'UPDATE_FAILED',
    message: 'Wedding content is managed as static project files.',
  };
}
