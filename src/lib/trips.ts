import { useFocusEffect } from 'expo-router';
import { useCallback, useEffect, useRef, useState } from 'react';

import { colors } from '@/theme';
import { supabase } from './supabase';

export type CoverKey = 'ville' | 'plage' | 'montagne' | 'roadtrip';
export type TripStatus = 'discussion' | 'dates_fixees' | 'en_cours' | 'termine';
export type Role = 'organisateur' | 'participant';

export type TripMember = {
  userId: string;
  role: Role;
  firstName: string;
  avatarUrl: string | null;
  color: string;
};

export type Trip = {
  id: string;
  name: string;
  cover: CoverKey | null;
  periodLabel: string | null;
  startDate: string | null;
  endDate: string | null;
  status: TripStatus;
  inviteCode: string;
  members: TripMember[];
};

type TripRow = {
  id: string;
  name: string;
  cover: CoverKey | null;
  period_label: string | null;
  start_date: string | null;
  end_date: string | null;
  status: TripStatus;
  invite_code: string;
  trip_members: {
    user_id: string;
    role: Role;
    joined_at: string;
    profiles: { first_name: string; avatar_url: string | null } | null;
  }[];
};

const TRIP_FIELDS =
  'id, name, cover, period_label, start_date, end_date, status, invite_code, trip_members(user_id, role, joined_at, profiles(first_name, avatar_url))';

const AVATAR_COLORS = [colors.sunset, colors.sky, colors.lime, colors.black];

/** Same person, same colour, on every screen. */
function colorFor(userId: string) {
  let hash = 0;
  for (const char of userId) hash = (hash * 31 + char.charCodeAt(0)) | 0;
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}

function toTrip(row: TripRow): Trip {
  const members = [...row.trip_members]
    .sort((a, b) => a.joined_at.localeCompare(b.joined_at))
    .map((m) => ({
      userId: m.user_id,
      role: m.role,
      firstName: m.profiles?.first_name ?? '?',
      avatarUrl: m.profiles?.avatar_url ?? null,
      color: colorFor(m.user_id),
    }));

  return {
    id: row.id,
    name: row.name,
    cover: row.cover,
    periodLabel: row.period_label,
    startDate: row.start_date,
    endDate: row.end_date,
    status: row.status,
    inviteCode: row.invite_code,
    members,
  };
}

/** Upcoming trips first (soonest at the top), then trips without dates. */
function byDeparture(a: Trip, b: Trip) {
  if (a.startDate && b.startDate) return a.startDate.localeCompare(b.startDate);
  if (a.startDate) return -1;
  if (b.startDate) return 1;
  return a.name.localeCompare(b.name);
}

export async function fetchTrips() {
  const { data, error } = await supabase.from('trips').select(TRIP_FIELDS).returns<TripRow[]>();
  if (error) throw error;
  return data.map(toTrip).sort(byDeparture);
}

export async function fetchTrip(id: string) {
  const { data, error } = await supabase.from('trips').select(TRIP_FIELDS).eq('id', id).maybeSingle<TripRow>();
  if (error) throw error;
  return data ? toTrip(data) : null;
}

export async function createTrip(input: {
  name: string;
  cover: CoverKey | null;
  periodLabel: string | null;
  startDate: string | null;
}) {
  const { data, error } = await supabase
    .rpc('create_trip', {
      trip_name: input.name,
      trip_cover: input.cover,
      trip_period: input.periodLabel,
      trip_start: input.startDate,
    })
    .single<{ id: string }>();
  if (error) throw error;
  return data.id;
}

/** Returns the trip id. Throws an error whose message is "unknown_code" for a wrong code. */
export async function joinTrip(code: string) {
  const { data, error } = await supabase.rpc('join_trip', { code });
  if (error) throw error;
  return data as string;
}

/** Loads data when the screen is shown, and again each time it comes back into view. */
export function useLoad<T>(load: () => Promise<T>) {
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<Error | null>(null);
  const [loading, setLoading] = useState(true);
  const loadRef = useRef(load);

  useEffect(() => {
    loadRef.current = load;
  });

  const refresh = useCallback(async () => {
    try {
      const result = await loadRef.current();
      setData(result);
      setError(null);
    } catch (e) {
      setError(e as Error);
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      refresh();
    }, [refresh]),
  );

  return { data, error, loading, refresh };
}
