import { getWeddingContent } from '@/lib/wedding-content/repository';
import { fail, ok } from '@/lib/server/http';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const slug = searchParams.get('slug') || 'main';

  try {
    const content = await getWeddingContent(slug);
    return ok(content);
  } catch (error) {
    console.error('Failed to get wedding content:', error);
    return fail(500, 'INTERNAL_ERROR', 'Failed to get wedding content');
  }
}
