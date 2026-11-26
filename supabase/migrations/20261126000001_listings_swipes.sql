-- Step 7: lodging picked by swiping. Members add listings (a link plus what the
-- app could read from it, and the price they saw), everyone swipes, the most
-- liked one wins, and an organizer confirms it.

create table public.listings (
  id uuid primary key default gen_random_uuid(),
  trip_id uuid not null references public.trips (id) on delete cascade,
  added_by uuid not null references public.profiles (id) on delete cascade,
  url text not null check (url ~* '^https?://'),
  url_key text not null,
  source text not null default 'autre' check (source in ('airbnb', 'booking', 'autre')),
  title text not null check (char_length(btrim(title)) between 1 and 120),
  image_url text check (image_url ~* '^https://'),
  details text check (char_length(details) <= 200),
  price_amount numeric(10, 2) not null check (price_amount > 0 and price_amount < 100000),
  price_unit text not null default 'night' check (price_unit in ('night', 'total')),
  note text check (char_length(note) <= 140),
  created_at timestamptz not null default now(),
  -- The same listing can't be proposed twice in one trip.
  unique (trip_id, url_key),
  foreign key (trip_id, added_by) references public.trip_members (trip_id, user_id) on delete cascade
);

create index listings_trip_id_idx on public.listings (trip_id);

create table public.listing_swipes (
  listing_id uuid not null references public.listings (id) on delete cascade,
  user_id uuid not null references public.profiles (id) on delete cascade,
  liked boolean not null,
  created_at timestamptz not null default now(),
  primary key (listing_id, user_id)
);

-- The lodging the group settled on.
alter table public.trips
  add column chosen_listing_id uuid references public.listings (id) on delete set null;

alter table public.listings enable row level security;
alter table public.listing_swipes enable row level security;

create policy "Members read the trip's listings"
on public.listings for select
to authenticated
using (public.is_trip_member(trip_id));

create policy "Members add listings as themselves"
on public.listings for insert
to authenticated
with check (public.is_trip_member(trip_id) and added_by = (select auth.uid()));

create policy "Authors or organizers remove a listing"
on public.listings for delete
to authenticated
using (added_by = (select auth.uid()) or public.is_trip_organizer(trip_id));

create function public.listing_trip(target_listing uuid)
returns uuid
language sql
stable
security definer
set search_path = ''
as $$
  select trip_id from public.listings where id = target_listing;
$$;

create policy "Members see the trip's swipes"
on public.listing_swipes for select
to authenticated
using (public.is_trip_member(public.listing_trip(listing_id)));

create policy "Swipe for yourself"
on public.listing_swipes for insert
to authenticated
with check (user_id = (select auth.uid()) and public.is_trip_member(public.listing_trip(listing_id)));

create policy "Change your own swipe"
on public.listing_swipes for update
to authenticated
using (user_id = (select auth.uid()))
with check (user_id = (select auth.uid()));

create policy "Undo your own swipe"
on public.listing_swipes for delete
to authenticated
using (user_id = (select auth.uid()));

grant select, insert, delete on public.listings to authenticated;
grant select, insert, update, delete on public.listing_swipes to authenticated;

-- Organizers confirm the lodging (or clear the choice with null).
create function public.choose_listing(target_trip uuid, target_listing uuid)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  if not public.is_trip_organizer(target_trip) then
    raise exception 'not_an_organizer';
  end if;
  if target_listing is not null
     and not exists (select 1 from public.listings where id = target_listing and trip_id = target_trip) then
    raise exception 'unknown_listing';
  end if;
  update public.trips set chosen_listing_id = target_listing where id = target_trip;
end;
$$;

revoke execute on function public.choose_listing(uuid, uuid) from public, anon;
grant execute on function public.choose_listing(uuid, uuid) to authenticated;
