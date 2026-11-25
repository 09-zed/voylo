import Svg, { Path } from 'react-native-svg';

import { colors } from '@/theme';

type Props = { size?: number; color?: string };

// Decorative hand-drawn marks. Hidden from screen readers.

export function PlaneDoodle({ size = 72, color = colors.black }: Props) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={1.4} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <Path d="M17.8 19.2 16 11l3.5-3.5C21 6 21.5 4 21 3c-1-.5-3 0-4.5 1.5L13 8 4.8 6.2c-.5-.1-.9.1-1.1.5l-.3.5c-.2.5-.1 1 .3 1.3L9 12l-2 3H4l-1 1 3 2 2 3 1-1v-3l3-2 3.5 5.3c.3.4.8.5 1.3.3l.5-.2c.4-.3.6-.7.5-1.2z" />
    </Svg>
  );
}

export function HeartDoodle({ size = 36, color = colors.black }: Props) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <Path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
    </Svg>
  );
}

export function BurstDoodle({ size = 40, color = colors.sunset }: Props) {
  return (
    <Svg width={size} height={size} viewBox="0 0 40 40" fill="none" stroke={color} strokeWidth={3.5} strokeLinecap="round" aria-hidden>
      <Path d="M8 30 L2 36" />
      <Path d="M18 26 L16 36" />
      <Path d="M26 30 L30 38" />
    </Svg>
  );
}

export function SquiggleDoodle({ width = 200, color = colors.black }: { width?: number; color?: string }) {
  return (
    <Svg width={width} height={(width * 18) / 200} viewBox="0 0 200 18" fill="none" stroke={color} strokeWidth={5} strokeLinecap="round" aria-hidden>
      <Path d="M4 13 C 60 3, 140 3, 196 11" />
    </Svg>
  );
}
