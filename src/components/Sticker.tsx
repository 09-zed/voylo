import { Image } from 'expo-image';
import type { ImageStyle, StyleProp } from 'react-native';

// Die-cut stickers (assets/stickers). Decorative: hidden from screen readers.
const STICKERS = {
  avion: { source: require('../../assets/stickers/avion.png'), ratio: 428 / 600 },
  billet: { source: require('../../assets/stickers/billet.png'), ratio: 310 / 600 },
  'cest-parti': { source: require('../../assets/stickers/cest-parti.png'), ratio: 216 / 600 },
  coeur: { source: require('../../assets/stickers/coeur.png'), ratio: 533 / 600 },
  eclat: { source: require('../../assets/stickers/eclat.png'), ratio: 600 / 591 },
  'entre-potes': { source: require('../../assets/stickers/entre-potes.png'), ratio: 195 / 600 },
  globe: { source: require('../../assets/stickers/globe.png'), ratio: 600 / 586 },
  montagne: { source: require('../../assets/stickers/montagne.png'), ratio: 439 / 600 },
  'on-part': { source: require('../../assets/stickers/on-part.png'), ratio: 600 / 597 },
  palmier: { source: require('../../assets/stickers/palmier.png'), ratio: 600 / 511 },
  peace: { source: require('../../assets/stickers/peace.png'), ratio: 600 / 484 },
  pin: { source: require('../../assets/stickers/pin.png'), ratio: 600 / 448 },
  polaroid: { source: require('../../assets/stickers/polaroid.png'), ratio: 597 / 600 },
  soleil: { source: require('../../assets/stickers/soleil.png'), ratio: 600 / 595 },
  valise: { source: require('../../assets/stickers/valise.png'), ratio: 572 / 600 },
} as const;

export type StickerName = keyof typeof STICKERS;

type Props = {
  name: StickerName;
  width: number;
  /** Rotation in degrees, for the hand-placed look. */
  tilt?: number;
  style?: StyleProp<ImageStyle>;
};

export function Sticker({ name, width, tilt = 0, style }: Props) {
  const sticker = STICKERS[name];
  return (
    <Image
      source={sticker.source}
      accessible={false}
      importantForAccessibility="no-hide-descendants"
      style={[{ width, height: width * sticker.ratio, transform: [{ rotate: `${tilt}deg` }] }, style]}
      contentFit="contain"
    />
  );
}
