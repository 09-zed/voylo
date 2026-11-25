import { StyleSheet, View } from 'react-native';

import { colors, fonts } from '@/theme';
import { AppText } from './AppText';

type Props = {
  days: number;
  caption: string;
  size?: 'large' | 'small';
  tilt?: number;
};

/** The "J–35" sticker: lime, white border, slightly tilted. */
export function CountdownSticker({ days, caption, size = 'large', tilt = 6 }: Props) {
  const large = size === 'large';
  const label = `J–${Math.max(0, days)}`;

  return (
    <View
      accessible
      accessibilityLabel={`${label}, ${caption}`}
      style={[styles.sticker, large ? styles.large : styles.small, { transform: [{ rotate: `${tilt}deg` }] }]}
    >
      <AppText style={[styles.number, { fontSize: large ? 38 : 24, lineHeight: large ? 42 : 28 }]}>{label}</AppText>
      {large && <AppText variant="caption">{caption}</AppText>}
    </View>
  );
}

const styles = StyleSheet.create({
  sticker: {
    backgroundColor: colors.lime,
    borderColor: colors.white,
    alignItems: 'center',
    boxShadow: '0 1px 2px rgba(20, 40, 0, 0.14), 0 10px 24px rgba(20, 40, 0, 0.2)',
  },
  large: { borderWidth: 4, borderRadius: 20, paddingHorizontal: 16, paddingTop: 8, paddingBottom: 10 },
  small: { borderWidth: 3, borderRadius: 14, paddingHorizontal: 10, paddingVertical: 4 },
  number: { fontFamily: fonts.display, fontVariant: ['tabular-nums'] },
});
