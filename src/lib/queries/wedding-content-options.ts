import { queryOptions } from '@tanstack/react-query';
import { apiFetch } from '@/lib/api/client';
import { queryKeys } from '@/lib/queries/keys';
import type { WeddingContentResponse } from '@/types';

export async function fetchWeddingContent(slug = 'main') {
  return apiFetch<WeddingContentResponse>(`/api/wedding-content?slug=${encodeURIComponent(slug)}`);
}

export function getWeddingContentQueryOptions(slug = 'main') {
  return queryOptions({
    queryKey: queryKeys.weddingContent(slug),
    queryFn: () => fetchWeddingContent(slug),
    staleTime: 5 * 60 * 1000,
  });
}
