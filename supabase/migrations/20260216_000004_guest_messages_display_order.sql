-- guest_messages display order for admin drag-and-drop sorting

alter table public.guest_messages
  add column if not exists display_order integer;

with ranked as (
  select
    id,
    row_number() over (
      partition by is_public
      order by created_at desc, id asc
    ) - 1 as next_order
  from public.guest_messages
)
update public.guest_messages gm
set display_order = ranked.next_order
from ranked
where gm.id = ranked.id
  and (gm.display_order is null or gm.display_order < 0);

update public.guest_messages
set display_order = 0
where display_order is null;

alter table public.guest_messages
  alter column display_order set default 0;

alter table public.guest_messages
  alter column display_order set not null;

create index if not exists idx_guest_messages_public_display_order_created_at
  on public.guest_messages(is_public, display_order asc, created_at desc);

