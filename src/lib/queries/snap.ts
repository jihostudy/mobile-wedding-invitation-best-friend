'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { getCookieValue } from '@/lib/client/cookies';
import { apiFetch } from '@/lib/api/client';
import { queryKeys } from '@/lib/queries/keys';
import type { SnapSubmissionDto, SnapUploadInput } from '@/types';

export function useCreateSnapSubmissionMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: SnapUploadInput) => {
      const formData = new FormData();
      formData.set('uploaderName', payload.uploaderName);
      formData.set('eventSlug', payload.eventSlug || 'main');
      payload.files.forEach((file) => formData.append('files', file));
      return apiFetch<{ success: true; id: string }>('/api/snap-submissions', {
        method: 'POST',
        body: formData,
        headers: {},
      });
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.adminSnapSubmissions() });
    },
  });
}

export function useAdminSnapSubmissionsQuery(filters?: Record<string, string>) {
  const query = new URLSearchParams(filters ?? {});
  return useQuery({
    queryKey: queryKeys.adminSnapSubmissions(filters),
    queryFn: () =>
      apiFetch<{ submissions: SnapSubmissionDto[] }>(`/api/admin/snap-submissions?${query.toString()}`),
    staleTime: 10 * 1000,
  });
}

export function useAdminUpdateSnapSubmissionStatusMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: { id: string; status: 'uploaded' | 'rejected' | 'approved' }) =>
      apiFetch<{ success: true }>(`/api/admin/snap-submissions/${payload.id}`, {
        method: 'PATCH',
        headers: {
          'x-csrf-token': getCookieValue('admin_csrf'),
        },
        body: JSON.stringify({ status: payload.status }),
      }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.adminSnapSubmissions() });
    },
  });
}
