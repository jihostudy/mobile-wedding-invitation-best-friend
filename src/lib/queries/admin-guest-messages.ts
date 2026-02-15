'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { getCookieValue } from '@/lib/client/cookies';
import { apiFetch } from '@/lib/api/client';
import { queryKeys } from '@/lib/queries/keys';
import type { GuestMessageDto } from '@/types';

export function useAdminGuestMessagesQuery() {
  return useQuery({
    queryKey: queryKeys.adminGuestMessages(),
    queryFn: () => apiFetch<{ messages: GuestMessageDto[] }>('/api/admin/guest-messages'),
    staleTime: 10 * 1000,
  });
}

export function useAdminUpdateGuestMessageVisibilityMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: { id: string; isPublic: boolean }) =>
      apiFetch<{ success: true }>(`/api/admin/guest-messages/${payload.id}`, {
        method: 'PATCH',
        headers: {
          'x-csrf-token': getCookieValue('admin_csrf'),
        },
        body: JSON.stringify({ isPublic: payload.isPublic }),
      }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.adminGuestMessages() });
      void queryClient.invalidateQueries({ queryKey: queryKeys.guestMessages(true) });
    },
  });
}

export function useAdminDeleteGuestMessageMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) =>
      apiFetch<{ success: true }>(`/api/admin/guest-messages/${id}`, {
        method: 'DELETE',
        headers: {
          'x-csrf-token': getCookieValue('admin_csrf'),
        },
      }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.adminGuestMessages() });
      void queryClient.invalidateQueries({ queryKey: queryKeys.guestMessages(true) });
    },
  });
}
