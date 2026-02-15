'use client';

import { useMutation, useQuery } from '@tanstack/react-query';
import { apiFetch } from '@/lib/api/client';
import { queryKeys } from '@/lib/queries/keys';
import type { RsvpResponseDto, RsvpResponseInput } from '@/types';

export function useCreateRsvpMutation() {
  return useMutation({
    mutationFn: (payload: RsvpResponseInput) =>
      apiFetch<{ success: true; id: string }>('/api/rsvp-responses', {
        method: 'POST',
        body: JSON.stringify(payload),
      }),
  });
}

export function useAdminRsvpResponsesQuery(adminPassword?: string) {
  return useQuery({
    queryKey: queryKeys.adminRsvpResponses(),
    queryFn: () =>
      apiFetch<{ responses: RsvpResponseDto[] }>('/api/admin/rsvp-responses', {
        headers: { 'x-admin-password': adminPassword || '' },
      }),
    staleTime: 10 * 1000,
  });
}
