import type { NextRequest } from 'next/server';
import { getWeddingContent, updateWeddingContent } from '@/lib/wedding-content/repository';
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

  const { searchParams } = new URL(request.url);
  const slug = searchParams.get('slug') || 'main';

  let body: UpdateWeddingContentRequest;
  try {
    body = (await request.json()) as UpdateWeddingContentRequest;
  } catch {
    return fail(400, 'INVALID_JSON', 'invalid request body');
  }

  if (!body || typeof body.expectedVersion !== 'number' || !body.content) {
    return fail(400, 'VALIDATION_ERROR', 'content and expectedVersion are required');
  }

  const result = await updateWeddingContent({
    slug,
    expectedVersion: body.expectedVersion,
    content: body.content,
  });

  if (!result.success && result.code === 'VERSION_CONFLICT') {
    return fail(409, 'VERSION_CONFLICT', result.message, undefined, {
      latestVersion: result.latestVersion,
    });
  }

  if (!result.success && result.code === 'VALIDATION_ERROR') {
    return fail(400, 'VALIDATION_ERROR', result.message, result.details);
  }

  if (!result.success) {
    return fail(500, result.code, result.message);
  }

  return ok({ success: true, version: result.version });
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
