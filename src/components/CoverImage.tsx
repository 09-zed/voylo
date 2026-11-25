import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { StyleSheet, View, type ViewStyle } from 'react-native';

import { coverFor } from '@/lib/covers';
import type { CoverKey } from '@/lib/trips';

type Props = {
  cover: CoverKey | null;
  style?: ViewStyle;
  /** Darkens the bottom so white text on top stays readable. */
  fade?: boolean;
};

/** A trip's cover: its photo when there is one, its flat colour otherwise. */
export function CoverImage({ cover, style, fade = false }: Props) {
  const c = coverFor(cover);
  return (
    <View style={[{ backgroundColor: c.color }, style]} aria-hidden>
      {c.photo !== undefined && (
        <>
          <Image source={c.photo} style={StyleSheet.absoluteFill} contentFit="cover" transition={200} />
          {fade && (
            <LinearGradient
              colors={['rgba(0, 0, 0, 0.35)', 'rgba(0, 0, 0, 0)', 'rgba(0, 0, 0, 0.65)']}
              locations={[0, 0.4, 1]}
              style={StyleSheet.absoluteFill}
            />
          )}
        </>
      )}
    </View>
  );
}
