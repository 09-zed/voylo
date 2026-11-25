import { t } from '@/i18n';
import { colors } from '@/theme';
import { photos } from './photos';
import type { CoverKey } from './trips';

type Cover = {
  key: CoverKey;
  /** Flat colour shown while the photo loads, or instead of it when there is none. */
  color: string;
  photo?: number;
  /** Text colour on top of the cover (white on photos, which get a dark fade). */
  textColor: string;
};

const KEYS: { key: CoverKey; color: string; plainText: string }[] = [
  { key: 'ville', color: colors.night, plainText: colors.white },
  { key: 'plage', color: colors.sky, plainText: colors.black },
  { key: 'montagne', color: colors.lime, plainText: colors.black },
  { key: 'roadtrip', color: colors.sunset, plainText: colors.black },
];

export const COVERS: Cover[] = KEYS.map(({ key, color, plainText }) => {
  const photo = photos.covers[key];
  return { key, color, photo, textColor: photo ? colors.white : plainText };
});

export function coverFor(key: CoverKey | null) {
  return COVERS.find((c) => c.key === key) ?? COVERS[0];
}

export function coverLabel(key: CoverKey) {
  return t(`covers.${key}`);
}
