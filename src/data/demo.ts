// Demo data used until Supabase is connected (step 3 of plan.md).
import { colors } from '@/theme';
import type { Member } from '@/components/AvatarStack';

export type DemoTrip = {
  id: string;
  name: string;
  departure: string; // ISO date, local day
  members: Member[];
  pendingBudget: string;
  poll: {
    question: string;
    options: { label: string; votes: number }[];
  };
  balance: { to: string; amount: number };
};

export const demoTrips: DemoTrip[] = [
  {
    id: 'amsterdam',
    name: 'Amsterdam',
    departure: '2026-12-30',
    members: [
      { id: 'me', name: 'Toi', color: colors.sunset },
      { id: 'lea', name: 'Léa', color: colors.sky },
      { id: 'sami', name: 'Sami', color: colors.lime },
      { id: 'ines', name: 'Inès', color: colors.black },
    ],
    pendingBudget: 'Sami',
    poll: {
      question: 'Samedi soir, où on mange ?',
      options: [
        { label: 'Street food', votes: 1 },
        { label: 'Resto indonésien', votes: 1 },
      ],
    },
    balance: { to: 'Léa', amount: 18.5 },
  },
];

export function findDemoTrip(id: string) {
  return demoTrips.find((trip) => trip.id === id);
}
