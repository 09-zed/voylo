-- Adds the "hiver" (winter city) cover option.
alter table public.trips drop constraint trips_cover_check;
alter table public.trips add constraint trips_cover_check
  check (cover in ('ville', 'hiver', 'plage', 'montagne', 'roadtrip'));
