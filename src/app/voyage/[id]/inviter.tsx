import * as Clipboard from 'expo-clipboard';
import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { Pressable, Share, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Path } from 'react-native-svg';

import { AppText } from '@/components/AppText';
import { Button } from '@/components/Button';
import { Sticker } from '@/components/Sticker';
import { t } from '@/i18n';
import { fetchTrip, useLoad } from '@/lib/trips';
import { colors, fonts, radius, space, touchTarget } from '@/theme';

/** Shown right after a trip is created, and from "Invite your friends" on the home tab. */
export default function InviteScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const insets = useSafeAreaInsets();
  const { data: trip } = useLoad(() => fetchTrip(id));
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!copied) return;
    const timer = setTimeout(() => setCopied(false), 2000);
    return () => clearTimeout(timer);
  }, [copied]);

  const openTrip = () => router.replace({ pathname: '/voyage/[id]', params: { id } });
  const share = () => trip && Share.share({ message: t('trip.shareMessage', { name: trip.name, code: trip.inviteCode }) });
  const copy = async () => {
    if (!trip) return;
    await Clipboard.setStringAsync(trip.inviteCode);
    setCopied(true);
  };

  return (
    <View style={[styles.screen, { paddingTop: insets.top + space.s, paddingBottom: insets.bottom + space.l }]}>
      <Pressable accessibilityRole="button" accessibilityLabel={t('invite.close')} onPress={openTrip} style={styles.close}>
        <Svg width={24} height={24} viewBox="0 0 24 24" fill="none" stroke={colors.black} strokeWidth={2.2} strokeLinecap="round">
          <Path d="M18 6 6 18" />
          <Path d="m6 6 12 12" />
        </Svg>
      </Pressable>
      <Sticker name="avion" width={112} tilt={-6} style={styles.plane} />

      <AppText style={styles.title} accessibilityRole="header">
        {t('invite.title')}
      </AppText>
      <AppText style={styles.text}>{t('invite.text')}</AppText>

      <View style={styles.codeCard} accessible accessibilityLabel={`${t('invite.codeLabel')} : ${trip?.inviteCode.split('').join(' ') ?? ''}`}>
        <AppText variant="caption" color={colors.textMuted}>
          {t('invite.codeLabel')}
        </AppText>
        <AppText style={styles.code}>{trip?.inviteCode ?? '…'}</AppText>
      </View>
      <Button label={copied ? t('invite.copied') : t('invite.copy')} variant="link" onPress={copy} style={styles.copy} />

      <Sticker name="cest-parti" width={170} tilt={-7} style={styles.letsGo} />

      <View style={styles.footer}>
        {trip && trip.members.length === 1 && (
          <AppText variant="bodyStrong" style={styles.solo}>
            {t('invite.solo')}
          </AppText>
        )}
        <Button label={t('invite.share')} onPress={share} disabled={!trip} />
        <Button label={t('invite.later')} variant="link" onPress={openTrip} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.lime, paddingHorizontal: space.xl },
  close: { width: touchTarget, height: touchTarget, marginLeft: -10, alignItems: 'center', justifyContent: 'center' },
  plane: { position: 'absolute', right: 18, top: 56 },
  title: { fontFamily: fonts.display, fontSize: 38, lineHeight: 41, letterSpacing: -0.6, marginTop: space.xl, maxWidth: 300 },
  text: { fontSize: 17, lineHeight: 25, marginTop: space.m, maxWidth: 320 },
  codeCard: {
    alignSelf: 'center',
    alignItems: 'center',
    marginTop: space.xxl,
    paddingVertical: space.l,
    paddingHorizontal: space.xxl,
    borderRadius: radius.l,
    backgroundColor: colors.white,
    transform: [{ rotate: '-3deg' }],
    boxShadow: '0 1px 2px rgba(40,60,0,0.16), 0 14px 32px rgba(40,60,0,0.22)',
  },
  code: { fontFamily: fonts.display, fontSize: 40, lineHeight: 48, letterSpacing: 2 },
  copy: { alignSelf: 'center', marginTop: space.m },
  letsGo: { marginTop: space.l, marginLeft: -4 },
  footer: { marginTop: 'auto', gap: space.s },
  solo: { fontSize: 15 },
});
