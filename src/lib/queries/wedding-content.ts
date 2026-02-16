'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { getCookieValue } from '@/lib/client/cookies';
import { apiFetch } from '@/lib/api/client';
import { queryKeys } from '@/lib/queries/keys';
import { getWeddingContentQueryOptions } from '@/lib/queries/wedding-content-options';
import type {
  UpdateWeddingContentRequest,
  WeddingContentAssetUploadResponse,
  WeddingContentResponse,
} from '@/types';

export { getWeddingContentQueryOptions } from '@/lib/queries/wedding-content-options';

export function useWeddingContentQuery(slug = 'main') {
  return useQuery(getWeddingContentQueryOptions(slug));
}

export function useAdminWeddingContentQuery(slug = 'main') {
  return useQuery({
    queryKey: queryKeys.adminWeddingContent(slug),
    queryFn: () =>
      apiFetch<WeddingContentResponse>(
        `/api/admin/wedding-content?slug=${encodeURIComponent(slug)}`,
      ),
    staleTime: 5 * 60 * 1000,
  });
}

export function useUpdateWeddingContentMutation(slug = 'main') {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: UpdateWeddingContentRequest) =>
      apiFetch<{ success: true; version: number }>(`/api/admin/wedding-content?slug=${encodeURIComponent(slug)}`, {
        method: 'PATCH',
        headers: {
          'x-csrf-token': getCookieValue('admin_csrf'),
        },
        body: JSON.stringify(payload),
      }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.weddingContent(slug) });
      void queryClient.invalidateQueries({
        queryKey: queryKeys.adminWeddingContent(slug),
      });
    },
  });
}

export function useUploadWeddingContentAssetMutation(slug = 'main') {
  return useMutation({
    mutationFn: async (payload: { file: File }) => {
      const formData = new FormData();
      formData.set('file', payload.file);

      return apiFetch<WeddingContentAssetUploadResponse>(
        `/api/admin/wedding-content/assets?slug=${encodeURIComponent(slug)}`,
        {
          method: 'POST',
          headers: {
            'x-csrf-token': getCookieValue('admin_csrf'),
          },
          body: formData,
        },
      );
    },
  });
}
