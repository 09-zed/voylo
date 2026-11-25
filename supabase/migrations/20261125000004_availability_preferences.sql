-- Step 5: everyone's available days, budget and preferences for a trip.
-- Writes go through functions so a person can only ever replace their own answers.

create table public.availability_days (
  trip_id uuid not null references public.trips (id) on delete cascade,
  user_id uuid not null references public.profiles (id) on delete cascade,
  day date not null,
  primary key (trip_id, user_id, day),
  foreign key (trip_id, user_id) references public.trip_members (trip_id, user_id) on delete cascade
);

create table public.member_preferences (
  trip_id uuid not null,
  user_id uuid not null references public.profiles (id) on delete cascade,
  budget_min integer check (budget_min >= 0),
  budget_max integer check (budget_max is null or budget_max >= coalesce(budget_min, 0)),
  vibes text[] not null default '{}'
    check (vibes <@ array['plage', 'ville', 'nature', 'fete', 'detente', 'culture', 'gastronomie', 'sport']),
  availability_set boolean not null default false,
  updated_at timestamptz not null default now(),
  primary key (trip_id, user_id),
  foreign key (trip_id, user_id) references public.trip_members (trip_id, user_id) on delete cascade
);

alter table public.availability_days enable row level security;
alter table public.member_preferences enable row level security;

create policy "Members read the trip's availability"
on public.availability_days for select
to authenticated
using (public.is_trip_member(trip_id));

create policy "Members read the trip's preferences"
on public.member_preferences for select
to authenticated
using (public.is_trip_member(trip_id));

grant select on public.availability_days to authenticated;
grant select on public.member_preferences to authenticated;

-- Replaces the caller's available days for one trip.
create function public.set_my_availability(target_trip uuid, days date[])
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  me uuid := (select auth.uid());
begin
  if me is null or not public.is_trip_member(target_trip) then
    raise exception 'not_a_member';
  end if;
  if coalesce(array_length(days, 1), 0) > 366 then
    raise exception 'too_many_days';
  end if;

  delete from public.availability_days where trip_id = target_trip and user_id = me;

  insert into public.availability_days (trip_id, user_id, day)
  select target_trip, me, d from (select distinct unnest(days) as d) as picked;

  insert into public.member_preferences (trip_id, user_id, availability_set)
  values (target_trip, me, true)
  on conflict (trip_id, user_id) do update set availability_set = true, updated_at = now();
end;
$$;

-- Saves the caller's budget range and vibes for one trip.
create function public.set_my_preferences(target_trip uuid, min_budget integer, max_budget integer, picked_vibes text[])
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  me uuid := (select auth.uid());
begin
  if me is null or not public.is_trip_member(target_trip) then
    raise exception 'not_a_member';
  end if;

  insert into public.member_preferences (trip_id, user_id, budget_min, budget_max, vibes)
  values (target_trip, me, min_budget, max_budget, coalesce(picked_vibes, '{}'))
  on conflict (trip_id, user_id) do update
    set budget_min = excluded.budget_min,
        budget_max = excluded.budget_max,
        vibes = excluded.vibes,
        updated_at = now();
end;
$$;

-- Organizers lock in the trip's dates.
create function public.fix_trip_dates(target_trip uuid, first_day date, last_day date)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  if not public.is_trip_organizer(target_trip) then
    raise exception 'not_an_organizer';
  end if;
  if last_day < first_day then
    raise exception 'invalid_range';
  end if;

  update public.trips
  set start_date = first_day, end_date = last_day, period_label = null, status = 'dates_fixees'
  where id = target_trip;
end;
$$;

revoke execute on function public.set_my_availability(uuid, date[]) from public, anon;
revoke execute on function public.set_my_preferences(uuid, integer, integer, text[]) from public, anon;
revoke execute on function public.fix_trip_dates(uuid, date, date) from public, anon;
grant execute on function public.set_my_availability(uuid, date[]) to authenticated;
grant execute on function public.set_my_preferences(uuid, integer, integer, text[]) to authenticated;
grant execute on function public.fix_trip_dates(uuid, date, date) to authenticated;
