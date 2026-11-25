import { Pressable, StyleSheet } from 'react-native';

import { colors, fonts, radius, space, touchTarget } from '@/theme';
import { AppText } from './AppText';

type Props = {
  label: string;
  selected: boolean;
  onPress: () => void;
  /** "radio" when only one can be picked, "checkbox" when several can. */
  kind?: 'radio' | 'checkbox';
};

export function Chip({ label, selected, onPress, kind = 'checkbox' }: Props) {
  return (
    <Pressable
      accessibilityRole={kind}
      accessibilityState={{ checked: selected }}
      onPress={onPress}
      style={({ pressed }) => [styles.chip, selected && styles.selected, pressed && styles.pressed]}
    >
      <AppText style={styles.label} color={selected ? colors.lime : colors.black}>
        {label}
      </AppText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  chip: {
    minHeight: touchTarget,
    paddingHorizontal: space.l,
    borderRadius: radius.pill,
    backgroundColor: colors.surface,
    justifyContent: 'center',
  },
  selected: { backgroundColor: colors.black },
  pressed: { transform: [{ scale: 0.97 }] },
  label: { fontFamily: fonts.bodyStrong, fontSize: 15, lineHeight: 20 },
});
