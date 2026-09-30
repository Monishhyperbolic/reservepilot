create table if not exists public.clients (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  company_name text not null default 'My treasury',
  monthly_burn numeric not null default 35000,
  reserve_target_months numeric not null default 3,
  refresh_interval integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Keep existing Supabase projects in sync with the current settings model.
alter table public.clients
  add column if not exists refresh_interval integer not null default 0;

create table if not exists public.holdings (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  symbol text not null,
  name text not null,
  amount numeric not null check (amount >= 0),
  created_at timestamptz not null default now()
);

create table if not exists public.snapshots (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  value numeric not null default 0,
  stable numeric not null default 0,
  runway numeric not null default 0,
  created_at timestamptz not null default now()
);

alter table public.clients enable row level security;
alter table public.holdings enable row level security;
alter table public.snapshots enable row level security;

create policy "Users manage their client profile" on public.clients for all using (auth.uid() = id) with check (auth.uid() = id);
create policy "Users manage their holdings" on public.holdings for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "Users manage their snapshots" on public.snapshots for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.clients (id, email) values (new.id, new.email)
  on conflict (id) do update set email = excluded.email;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute procedure public.handle_new_user();
