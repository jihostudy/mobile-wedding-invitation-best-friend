-- RSVP no longer collects contact information. Keep the legacy column optional
-- for compatibility with existing rows and deployments that still have it.
alter table public.rsvp_responses
  alter column contact drop not null,
  alter column contact set default '';
