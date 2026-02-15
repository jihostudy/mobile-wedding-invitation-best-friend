'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiFetch } from '@/lib/api/client';
import { queryKeys } from '@/lib/queries/keys';
import { getWeddingContentQueryOptions } from '@/lib/queries/wedding-content-options';
import type { UpdateWeddingContentRequest } from '@/types';

export { getWeddingContentQueryOptions } from '@/lib/queries/wedding-content-options';

export function useWeddingContentQuery(slug = 'main') {
  return useQuery(getWeddingContentQueryOptions(slug));
}

export function useUpdateWeddingContentMutation(slug = 'main', adminPassword?: string, csrfToken?: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: UpdateWeddingContentRequest) =>
      apiFetch<{ success: true; version: number }>(`/api/admin/wedding-content?slug=${encodeURIComponent(slug)}`, {
        method: 'PATCH',
        headers: {
          'x-admin-password': adminPassword || '',
          'x-csrf-token': csrfToken || '',
        },
        body: JSON.stringify(payload),
      }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.weddingContent(slug) });
    },
  });
}
