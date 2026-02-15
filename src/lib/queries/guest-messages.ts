'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiFetch } from '@/lib/api/client';
import { queryKeys } from '@/lib/queries/keys';
import type { GuestMessageDto, GuestMessageInput } from '@/types';

export function useGuestMessagesQuery(publicOnly = true) {
  return useQuery({
    queryKey: queryKeys.guestMessages(publicOnly),
    queryFn: () => apiFetch<{ messages: GuestMessageDto[] }>(`/api/guest-messages?publicOnly=${String(publicOnly)}`),
    staleTime: 30 * 1000,
  });
}

export function useCreateGuestMessageMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: GuestMessageInput) =>
      apiFetch<{ success: true; id: string }>('/api/guest-messages', {
        method: 'POST',
        body: JSON.stringify(payload),
      }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.guestMessages(true) });
      void queryClient.invalidateQueries({ queryKey: queryKeys.adminGuestMessages() });
    },
  });
}
