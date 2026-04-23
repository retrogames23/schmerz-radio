-- Game saves: 3 fixed slots per user, owner-scoped RLS.
create table public.game_saves (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  slot smallint not null check (slot between 1 and 3),
  payload jsonb not null,
  scene text not null,
  inventory_count integer not null default 0,
  flag_count integer not null default 0,
  saved_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, slot)
);

alter table public.game_saves enable row level security;

create policy "Users can view their own saves"
  on public.game_saves for select
  to authenticated
  using (auth.uid() = user_id);

create policy "Users can insert their own saves"
  on public.game_saves for insert
  to authenticated
  with check (auth.uid() = user_id);

create policy "Users can update their own saves"
  on public.game_saves for update
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Users can delete their own saves"
  on public.game_saves for delete
  to authenticated
  using (auth.uid() = user_id);

-- Auto-bump updated_at
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger game_saves_set_updated_at
  before update on public.game_saves
  for each row execute function public.set_updated_at();

create index game_saves_user_idx on public.game_saves(user_id);