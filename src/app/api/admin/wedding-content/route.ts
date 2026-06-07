import type { NextRequest } from 'next/server';
import { getWeddingContent } from '@/lib/wedding-content/repository';
import { hasValidCsrf, isAdminRequest } from '@/lib/server/admin-auth';
import { fail, ok } from '@/lib/server/http';
import type { UpdateWeddingContentRequest } from '@/types';

export async function PATCH(request: NextRequest) {
  if (!isAdminRequest(request)) {
    return fail(401, 'UNAUTHORIZED', 'admin authorization required');
  }
  if (!hasValidCsrf(request)) {
    return fail(403, 'CSRF_INVALID', 'csrf token is invalid');
  }

  let body: UpdateWeddingContentRequest;
  try {
    body = (await request.json()) as UpdateWeddingContentRequest;
  } catch {
    return fail(400, 'INVALID_JSON', 'invalid request body');
  }

  if (!body || typeof body.expectedVersion !== 'number' || !body.content) {
    return fail(400, 'VALIDATION_ERROR', 'content and expectedVersion are required');
  }

  return fail(
    410,
    'STATIC_CONTENT_MANAGED_IN_REPOSITORY',
    'Wedding content is managed as static project files.',
  );
}

export async function GET(request: NextRequest) {
  if (!isAdminRequest(request)) {
    return fail(401, 'UNAUTHORIZED', 'admin authorization required');
  }

  const { searchParams } = new URL(request.url);
  const slug = searchParams.get('slug') || 'main';
  const content = await getWeddingContent(slug);
  return ok(content);
}
