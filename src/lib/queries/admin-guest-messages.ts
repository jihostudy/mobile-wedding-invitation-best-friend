'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiFetch } from '@/lib/api/client';
import { queryKeys } from '@/lib/queries/keys';
import type { GuestMessageDto } from '@/types';

export function useAdminGuestMessagesQuery(adminPassword?: string) {
  return useQuery({
    queryKey: queryKeys.adminGuestMessages(),
    queryFn: () =>
      apiFetch<{ messages: GuestMessageDto[] }>('/api/admin/guest-messages', {
        headers: { 'x-admin-password': adminPassword || '' },
      }),
    staleTime: 10 * 1000,
  });
}

export function useAdminUpdateGuestMessageVisibilityMutation(adminPassword?: string, csrfToken?: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: { id: string; isPublic: boolean }) =>
      apiFetch<{ success: true }>(`/api/admin/guest-messages/${payload.id}`, {
        method: 'PATCH',
        headers: {
          'x-admin-password': adminPassword || '',
          'x-csrf-token': csrfToken || '',
        },
        body: JSON.stringify({ isPublic: payload.isPublic }),
      }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.adminGuestMessages() });
      void queryClient.invalidateQueries({ queryKey: queryKeys.guestMessages(true) });
    },
  });
}

export function useAdminDeleteGuestMessageMutation(adminPassword?: string, csrfToken?: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) =>
      apiFetch<{ success: true }>(`/api/admin/guest-messages/${id}`, {
        method: 'DELETE',
        headers: {
          'x-admin-password': adminPassword || '',
          'x-csrf-token': csrfToken || '',
        },
      }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.adminGuestMessages() });
      void queryClient.invalidateQueries({ queryKey: queryKeys.guestMessages(true) });
    },
  });
}
