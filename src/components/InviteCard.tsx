import * as Clipboard from 'expo-clipboard';
import { useEffect, useState } from 'react';
import { Share, StyleSheet, View } from 'react-native';

import { t } from '@/i18n';
import { colors, fonts, radius, space } from '@/theme';
import { AppText } from './AppText';
import { Button } from './Button';

type Props = { tripName: string; code: string; solo: boolean };

/** The invite code, big enough to read out loud, with share and copy actions. */
export function InviteCard({ tripName, code, solo }: Props) {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!copied) return;
    const timer = setTimeout(() => setCopied(false), 2000);
    return () => clearTimeout(timer);
  }, [copied]);

  const share = () => Share.share({ message: t('trip.shareMessage', { name: tripName, code }) });

  const copy = async () => {
    await Clipboard.setStringAsync(code);
    setCopied(true);
  };

  return (
    <View style={styles.card}>
      <AppText variant="title">{t('trip.inviteTitle')}</AppText>
      <AppText style={styles.text}>{solo ? t('trip.soloHint') : t('trip.inviteText')}</AppText>
      {solo && <AppText style={styles.text}>{t('trip.inviteText')}</AppText>}

      <View style={styles.codeRow}>
        <View style={styles.code} accessible accessibilityLabel={code.split('').join(' ')}>
          <AppText style={styles.codeText}>{code}</AppText>
        </View>
        <Button
          label={copied ? t('trip.copied') : t('trip.copy')}
          variant="link"
          onPress={copy}
          accessibilityLiveRegion="polite"
        />
      </View>

      <Button label={t('trip.share')} onPress={share} />
    </View>
  );
}

const styles = StyleSheet.create({
  card: { backgroundColor: colors.lime, borderRadius: radius.m, padding: space.xl, gap: space.s },
  text: { fontSize: 15, lineHeight: 21 },
  codeRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginVertical: space.s },
  code: {
    backgroundColor: colors.white,
    borderRadius: radius.s,
    paddingHorizontal: space.l,
    paddingVertical: space.s,
    transform: [{ rotate: '-2deg' }],
  },
  codeText: { fontFamily: fonts.display, fontSize: 28, lineHeight: 34, letterSpacing: 2 },
});
