import { router } from 'expo-router';
import type { ReactNode } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Path } from 'react-native-svg';

import { t } from '@/i18n';
import { colors, space, touchTarget } from '@/theme';
import { AppText } from './AppText';

type Props = {
  title: string;
  subtitle: string;
  children: ReactNode;
  footer: ReactNode;
};

/** Shared layout for short form screens: back button, title, fields, action at the bottom. */
export function FormScreen({ title, subtitle, children, footer }: Props) {
  const insets = useSafeAreaInsets();

  return (
    <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView
        contentContainerStyle={[styles.content, { paddingTop: insets.top + space.s, paddingBottom: insets.bottom + space.l }]}
        keyboardShouldPersistTaps="handled"
      >
        <Pressable accessibilityRole="button" accessibilityLabel={t('common.back')} onPress={() => router.back()} style={styles.back}>
          <Svg width={24} height={24} viewBox="0 0 24 24" fill="none" stroke={colors.black} strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round">
            <Path d="m15 18-6-6 6-6" />
          </Svg>
        </Pressable>

        <AppText variant="display" accessibilityRole="header" style={styles.title}>
          {title}
        </AppText>
        <AppText color={colors.textMuted} style={styles.subtitle}>
          {subtitle}
        </AppText>

        <View style={styles.fields}>{children}</View>
        <View style={styles.footer}>{footer}</View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: colors.white },
  content: { flexGrow: 1, paddingHorizontal: space.xl },
  back: {
    width: touchTarget,
    height: touchTarget,
    marginLeft: -10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: { marginTop: space.xl },
  subtitle: { marginTop: space.s },
  fields: { marginTop: space.xxl, gap: space.l },
  footer: { marginTop: 'auto', paddingTop: space.xl, gap: space.s },
});
