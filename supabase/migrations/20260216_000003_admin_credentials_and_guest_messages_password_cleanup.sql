-- admin credentials (single row) + guest_messages password legacy cleanup

create table if not exists public.admin_credentials (
  key text primary key,
  password_hash text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

do $$
begin
  if not exists (
    select 1
    from pg_trigger
    where tgname = 'set_admin_credentials_updated_at'
  ) then
    create trigger set_admin_credentials_updated_at
      before update on public.admin_credentials
      for each row
      execute function public.set_updated_at();
  end if;
end
$$;

alter table public.admin_credentials enable row level security;

do $$
begin
  if not exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and tablename = 'admin_credentials'
      and policyname = 'Service role manage admin credentials'
  ) then
    create policy "Service role manage admin credentials"
      on public.admin_credentials
      for all
      using (auth.role() = 'service_role')
      with check (auth.role() = 'service_role');
  end if;
end
$$;

do $$
begin
  if exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'guest_messages'
      and column_name = 'password'
  ) then
    execute '
      alter table public.guest_messages
      alter column password drop not null
    ';
  end if;
end
$$;
