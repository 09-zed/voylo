// Voylo design tokens — see plan.md, section 7.

export const colors = {
  lime: '#C7FF00',
  sky: '#6EC6FF',
  sunset: '#FF7A00',
  black: '#000000',
  white: '#FFFFFF',

  // Soft tints for cards (black text stays readable on all of them).
  skyTint: '#EAF6FF',
  sunsetTint: '#FFE7D1',
  surface: '#F3F5F7',

  // Neutrals
  textMuted: '#4A5560',
  border: '#D5DCE3',

  // Stand-in for photos until the real ones arrive.
  night: '#1D3B5A',
} as const;

export const fonts = {
  display: 'Montserrat_800ExtraBold',
  body: 'Inter_400Regular',
  bodyStrong: 'Inter_600SemiBold',
} as const;

export const space = {
  xs: 4,
  s: 8,
  m: 12,
  l: 16,
  xl: 24,
  xxl: 32,
  xxxl: 48,
} as const;

export const radius = {
  s: 12,
  m: 20,
  l: 28,
  pill: 999,
} as const;

export const touchTarget = 44;
