import { StyleSheet, Text, type TextProps } from 'react-native';

import { colors, fonts } from '@/theme';

type Variant = 'display' | 'title' | 'body' | 'bodyStrong' | 'caption';

type Props = TextProps & {
  variant?: Variant;
  color?: string;
};

export function AppText({ variant = 'body', color = colors.black, style, ...rest }: Props) {
  return <Text {...rest} style={[styles[variant], { color }, style]} />;
}

const styles = StyleSheet.create({
  display: { fontFamily: fonts.display, fontSize: 40, lineHeight: 45, letterSpacing: -0.8 },
  title: { fontFamily: fonts.display, fontSize: 24, lineHeight: 29, letterSpacing: -0.4 },
  body: { fontFamily: fonts.body, fontSize: 17, lineHeight: 25 },
  bodyStrong: { fontFamily: fonts.bodyStrong, fontSize: 17, lineHeight: 25 },
  caption: { fontFamily: fonts.bodyStrong, fontSize: 13, lineHeight: 18 },
});
