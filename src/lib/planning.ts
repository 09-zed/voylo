import { supabase } from './supabase';

export type Vibe = 'plage' | 'ville' | 'nature' | 'fete' | 'detente' | 'culture' | 'gastronomie' | 'sport';
export const VIBES: Vibe[] = ['plage', 'ville', 'nature', 'fete', 'detente', 'culture', 'gastronomie', 'sport'];

/** Budget ranges offered as choices (euros, all included). max null = no upper limit. */
export const BUDGETS: { min: number; max: number | null }[] = [
  { min: 0, max: 200 },
  { min: 200, max: 400 },
  { min: 400, max: 700 },
  { min: 700, max: 1000 },
  { min: 1000, max: null },
];

export type MemberAnswers = {
  userId: string;
  days: string[];
  availabilitySet: boolean;
  budgetMin: number | null;
  budgetMax: number | null;
  vibes: Vibe[];
};

export type Planning = Map<string, MemberAnswers>;

export async function fetchPlanning(tripId: string): Promise<Planning> {
  const [days, prefs] = await Promise.all([
    supabase.from('availability_days').select('user_id, day').eq('trip_id', tripId),
    supabase
      .from('member_preferences')
      .select('user_id, budget_min, budget_max, vibes, availability_set')
      .eq('trip_id', tripId),
  ]);
  if (days.error) throw days.error;
  if (prefs.error) throw prefs.error;

  const planning: Planning = new Map();
  const entry = (userId: string) => {
    let answers = planning.get(userId);
    if (!answers) {
      answers = { userId, days: [], availabilitySet: false, budgetMin: null, budgetMax: null, vibes: [] };
      planning.set(userId, answers);
    }
    return answers;
  };

  for (const row of prefs.data) {
    const answers = entry(row.user_id);
    answers.availabilitySet = row.availability_set;
    answers.budgetMin = row.budget_min;
    answers.budgetMax = row.budget_max;
    answers.vibes = row.vibes as Vibe[];
  }
  for (const row of days.data) {
    entry(row.user_id).days.push(row.day);
  }
  for (const answers of planning.values()) answers.days.sort();

  return planning;
}

export async function saveMyAnswers(
  tripId: string,
  answers: { days: string[] | null; budgetMin: number | null; budgetMax: number | null; vibes: Vibe[] },
) {
  if (answers.days) {
    const { error } = await supabase.rpc('set_my_availability', { target_trip: tripId, days: answers.days });
    if (error) throw error;
  }
  const { error } = await supabase.rpc('set_my_preferences', {
    target_trip: tripId,
    min_budget: answers.budgetMin,
    max_budget: answers.budgetMax,
    picked_vibes: answers.vibes,
  });
  if (error) throw error;
}

export async function fixTripDates(tripId: string, firstDay: string, lastDay: string) {
  const { error } = await supabase.rpc('fix_trip_dates', { target_trip: tripId, first_day: firstDay, last_day: lastDay });
  if (error) throw error;
}

/** Has this person told the group anything yet? */
export function hasAnswered(answers: MemberAnswers | undefined) {
  return !!answers && (answers.availabilitySet || answers.budgetMin !== null);
}

export { bestRanges, countByDay, groupBudget, type DateRange } from './planningMath';

/** Trips where the signed-in person has already shared availability or a budget. */
export async function fetchMyAnsweredTripIds(userId: string) {
  const { data, error } = await supabase
    .from('member_preferences')
    .select('trip_id, availability_set, budget_min')
    .eq('user_id', userId);
  if (error) throw error;
  return new Set(data.filter((row) => row.availability_set || row.budget_min !== null).map((row) => row.trip_id as string));
}
