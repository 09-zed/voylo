import { StyleSheet, View } from 'react-native';

import { colors, radius, space } from '@/theme';
import { AppText } from '../AppText';
import { Sticker, type StickerName } from '../Sticker';

/** Placeholder for a trip section that arrives in a later step of plan.md. */
export function ComingSoon({ title, text, sticker }: { title: string; text: string; sticker: StickerName }) {
  return (
    <View style={styles.box}>
      <Sticker name={sticker} width={96} tilt={-8} />
      <AppText variant="title" style={styles.title}>
        {title}
      </AppText>
      <AppText color={colors.textMuted} style={styles.text}>
        {text}
      </AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  box: {
    alignItems: 'center',
    gap: space.s,
    paddingVertical: space.xxl,
    paddingHorizontal: space.xl,
    borderRadius: radius.l,
    backgroundColor: colors.surface,
  },
  title: { textAlign: 'center', marginTop: space.s },
  text: { textAlign: 'center' },
});
