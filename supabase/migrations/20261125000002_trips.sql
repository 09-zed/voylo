-- Trips and their members. Creating and joining go through functions
-- (create_trip, join_trip) so the invite code and the organizer role
-- are always set by the server, never by the app.

create table public.trips (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(btrim(name)) between 1 and 60),
  cover text check (cover in ('ville', 'plage', 'montagne', 'roadtrip')),
  period_label text check (char_length(period_label) <= 60),
  start_date date,
  end_date date check (end_date is null or start_date is null or end_date >= start_date),
  destination text check (char_length(destination) <= 80),
  status text not null default 'discussion'
    check (status in ('discussion', 'dates_fixees', 'en_cours', 'termine')),
  invite_code text not null unique,
  created_by uuid not null references auth.users (id) on delete cascade,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger trips_touch_updated_at
before update on public.trips
for each row execute function public.touch_updated_at();

create table public.trip_members (
  trip_id uuid not null references public.trips (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  role text not null default 'participant' check (role in ('organisateur', 'participant')),
  joined_at timestamptz not null default now(),
  primary key (trip_id, user_id)
);

create index trip_members_user_id_idx on public.trip_members (user_id);

-- Membership checks used by the policies. "security definer" lets them read
-- trip_members without running into that table's own policies.
create function public.is_trip_member(target_trip uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.trip_members
    where trip_id = target_trip and user_id = (select auth.uid())
  );
$$;

create function public.is_trip_organizer(target_trip uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.trip_members
    where trip_id = target_trip and user_id = (select auth.uid()) and role = 'organisateur'
  );
$$;

-- Row level security
alter table public.trips enable row level security;
alter table public.trip_members enable row level security;

create policy "Members read their trips"
on public.trips for select
to authenticated
using (public.is_trip_member(id));

create policy "Organizers update their trips"
on public.trips for update
to authenticated
using (public.is_trip_organizer(id))
with check (public.is_trip_organizer(id));

create policy "Organizers delete their trips"
on public.trips for delete
to authenticated
using (public.is_trip_organizer(id));

create policy "Members see who is on their trips"
on public.trip_members for select
to authenticated
using (public.is_trip_member(trip_id));

create policy "Leave a trip, or organizers remove someone"
on public.trip_members for delete
to authenticated
using (user_id = (select auth.uid()) or public.is_trip_organizer(trip_id));

create policy "Organizers change roles"
on public.trip_members for update
to authenticated
using (public.is_trip_organizer(trip_id))
with check (public.is_trip_organizer(trip_id));

-- People can read the profiles of anyone they travel with.
create policy "Read profiles of travel companions"
on public.profiles for select
to authenticated
using (
  exists (
    select 1
    from public.trip_members mine
    join public.trip_members theirs on theirs.trip_id = mine.trip_id
    where mine.user_id = (select auth.uid()) and theirs.user_id = profiles.id
  )
);

grant select, update, delete on public.trips to authenticated;
grant select, update, delete on public.trip_members to authenticated;

-- Invite codes look like VOY-4K7P. The alphabet skips 0/O and 1/I/L,
-- which are easy to confuse when someone reads a code out loud.
create function public.new_invite_code()
returns text
language plpgsql
volatile
set search_path = ''
as $$
declare
  alphabet constant text := '23456789ABCDEFGHJKMNPQRSTUVWXYZ';
  candidate text;
begin
  loop
    candidate := 'VOY-';
    for i in 1..4 loop
      candidate := candidate || substr(alphabet, 1 + floor(random() * length(alphabet))::int, 1);
    end loop;
    exit when not exists (select 1 from public.trips where invite_code = candidate);
  end loop;
  return candidate;
end;
$$;

create function public.create_trip(
  trip_name text,
  trip_cover text default null,
  trip_period text default null,
  trip_start date default null
)
returns public.trips
language plpgsql
security definer
set search_path = ''
as $$
declare
  me uuid := (select auth.uid());
  created public.trips;
begin
  if me is null then
    raise exception 'not_signed_in';
  end if;

  insert into public.trips (name, cover, period_label, start_date, status, invite_code, created_by)
  values (
    btrim(trip_name),
    trip_cover,
    nullif(btrim(trip_period), ''),
    trip_start,
    case when trip_start is null then 'discussion' else 'dates_fixees' end,
    public.new_invite_code(),
    me
  )
  returning * into created;

  insert into public.trip_members (trip_id, user_id, role)
  values (created.id, me, 'organisateur');

  return created;
end;
$$;

create function public.join_trip(code text)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  me uuid := (select auth.uid());
  target uuid;
begin
  if me is null then
    raise exception 'not_signed_in';
  end if;

  select id into target from public.trips where invite_code = upper(btrim(code));

  if target is null then
    raise exception 'unknown_code';
  end if;

  insert into public.trip_members (trip_id, user_id, role)
  values (target, me, 'participant')
  on conflict (trip_id, user_id) do nothing;

  return target;
end;
$$;

revoke execute on function public.create_trip(text, text, text, date) from public, anon;
revoke execute on function public.join_trip(text) from public, anon;
grant execute on function public.create_trip(text, text, text, date) to authenticated;
grant execute on function public.join_trip(text) to authenticated;
