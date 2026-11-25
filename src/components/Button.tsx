import { ActivityIndicator, Pressable, StyleSheet, Text, View, type PressableProps } from 'react-native';

import { colors, fonts, radius, touchTarget } from '@/theme';

type Variant = 'primary' | 'small' | 'link';

type Props = Omit<PressableProps, 'children'> & {
  label: string;
  variant?: Variant;
  /** Shows a spinner next to the label and ignores presses. */
  loading?: boolean;
};

export function Button({ label, variant = 'primary', loading = false, style, ...rest }: Props) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled: !!rest.disabled, busy: loading }}
      {...rest}
      onPress={loading ? undefined : rest.onPress}
      style={(state) => [
        styles.base,
        styles[variant],
        state.pressed && styles.pressed,
        rest.disabled && styles.disabled,
        typeof style === 'function' ? style(state) : style,
      ]}
    >
      <View style={styles.row}>
        {loading && <ActivityIndicator color={labelStyles[variant].color} />}
        <Text style={labelStyles[variant]}>{label}</Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    minHeight: touchTarget,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primary: {
    height: 60,
    borderRadius: radius.pill,
    backgroundColor: colors.black,
    paddingHorizontal: 24,
  },
  small: {
    borderRadius: radius.pill,
    backgroundColor: colors.black,
    paddingHorizontal: 16,
  },
  link: {
    height: 48,
  },
  row: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  pressed: {
    transform: [{ scale: 0.97 }],
  },
  disabled: {
    opacity: 0.4,
  },
});

const labelStyles = StyleSheet.create({
  primary: { fontFamily: fonts.display, fontSize: 19, color: colors.lime },
  small: { fontFamily: fonts.bodyStrong, fontSize: 15, color: colors.white },
  link: {
    fontFamily: fonts.bodyStrong,
    fontSize: 17,
    color: colors.black,
    textDecorationLine: 'underline',
  },
});
