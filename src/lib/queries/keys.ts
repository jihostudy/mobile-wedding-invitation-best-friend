export const queryKeys = {
  weddingContent: (slug: string) => ['wedding-content', slug] as const,
  guestMessages: (publicOnly: boolean) => ['guest-messages', { publicOnly }] as const,
  adminGuestMessages: () => ['admin', 'guest-messages'] as const,
  adminRsvpResponses: () => ['admin', 'rsvp-responses'] as const,
  adminSnapSubmissions: (filters?: Record<string, string>) => ['admin', 'snap-submissions', filters ?? {}] as const,
};
