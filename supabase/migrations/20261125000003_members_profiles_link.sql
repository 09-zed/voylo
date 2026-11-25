-- Lets the API return each member's profile together with the membership
-- (trip_members → profiles). Every member has a profile: the app asks for a
-- first name before anyone can create or join a trip.
alter table public.trip_members
  add constraint trip_members_user_profile_fkey
  foreign key (user_id) references public.profiles (id) on delete cascade;
