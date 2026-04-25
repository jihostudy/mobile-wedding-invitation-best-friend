import { getWeddingContent } from '@/lib/wedding-content/repository';
import { fail, ok } from '@/lib/server/http';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const slug = searchParams.get('slug') || 'main';

  try {
    console.log('[api/wedding-content] request received', { slug });
    const content = await getWeddingContent(slug);
    console.log('[api/wedding-content] request succeeded', {
      slug,
      version: content.version,
      sectionCount: content.content.pageSectionOrder.length,
    });
    return ok(content);
  } catch (error) {
    console.error('[api/wedding-content] request failed', { slug, error });
    return fail(500, 'INTERNAL_ERROR', 'Failed to get wedding content');
  }
}
