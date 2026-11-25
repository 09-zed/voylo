-- Profiles: one row per signed-in person, keyed by their auth user id.

create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  first_name text not null check (char_length(btrim(first_name)) between 1 and 40),
  avatar_url text,
  locale text not null default 'fr' check (locale in ('fr', 'en')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.profiles is 'Public profile of a Voylo user (first name, photo, language).';

-- Keep updated_at current on every change.
create function public.touch_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger profiles_touch_updated_at
before update on public.profiles
for each row execute function public.touch_updated_at();

-- Row level security: for now, people only see and edit their own profile.
-- Step 4 (trips) adds read access to the profiles of people you travel with.
alter table public.profiles enable row level security;

create policy "Read own profile"
on public.profiles for select
to authenticated
using ((select auth.uid()) = id);

create policy "Create own profile"
on public.profiles for insert
to authenticated
with check ((select auth.uid()) = id);

create policy "Update own profile"
on public.profiles for update
to authenticated
using ((select auth.uid()) = id)
with check ((select auth.uid()) = id);

grant select, insert, update on public.profiles to authenticated;
