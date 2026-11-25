import { t } from '@/i18n';
import { colors } from '@/theme';
import type { CoverKey } from './trips';

type Cover = { key: CoverKey; color: string; textColor: string };

// Flat colours until the photos from docs/prompts-photos.md arrive.
export const COVERS: Cover[] = [
  { key: 'ville', color: colors.night, textColor: colors.white },
  { key: 'plage', color: colors.sky, textColor: colors.black },
  { key: 'montagne', color: colors.lime, textColor: colors.black },
  { key: 'roadtrip', color: colors.sunset, textColor: colors.black },
];

export function coverFor(key: CoverKey | null) {
  return COVERS.find((c) => c.key === key) ?? COVERS[0];
}

export function coverLabel(key: CoverKey) {
  return t(`covers.${key}`);
}
