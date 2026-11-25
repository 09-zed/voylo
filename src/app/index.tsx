import { router } from 'expo-router';
import { StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppText } from '@/components/AppText';
import { Button } from '@/components/Button';
import { BurstDoodle, HeartDoodle, PlaneDoodle, SquiggleDoodle } from '@/components/Doodles';
import { Highlight } from '@/components/Highlight';
import { Logo } from '@/components/Logo';
import { PhotoPlaceholder } from '@/components/PhotoPlaceholder';
import { Polaroid } from '@/components/Polaroid';
import { t } from '@/i18n';
import { colors, space } from '@/theme';

export default function WelcomeScreen() {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.screen, { paddingTop: insets.top + space.l, paddingBottom: insets.bottom + space.l }]}>
      <Logo size={56} />

      <View style={styles.plane}>
        <PlaneDoodle />
      </View>
      <View style={styles.burst}>
        <BurstDoodle />
      </View>

      <View style={styles.photo}>
        <Polaroid>
          <PhotoPlaceholder label={t('welcome.photoLabel')} color={colors.sunset} style={styles.photoInner} />
          <View style={styles.heart}>
            <HeartDoodle />
          </View>
        </Polaroid>
      </View>

      <View style={styles.bottom}>
        <View style={styles.signature}>
          <Highlight tilt={-3}>{t('welcome.signatureLine1')}</Highlight>
          <Highlight tilt={-2}>{t('welcome.signatureLine2')}</Highlight>
        </View>
        <View style={styles.squiggle}>
          <SquiggleDoodle />
        </View>
        <AppText style={styles.pitch}>{t('welcome.pitch')}</AppText>

        <View style={styles.actions}>
          <Button label={t('welcome.start')} onPress={() => router.push('/connexion')} />
          <Button label={t('welcome.haveCode')} variant="link" onPress={() => router.push('/rejoindre')} />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.sky,
    paddingHorizontal: space.xl,
    overflow: 'hidden',
  },
  plane: { position: 'absolute', left: 28, top: 196, transform: [{ rotate: '-18deg' }] },
  burst: { position: 'absolute', left: 112, top: 300 },
  photo: { alignSelf: 'flex-end', marginTop: space.l },
  photoInner: { height: 190 },
  heart: { position: 'absolute', right: -14, bottom: 8, transform: [{ rotate: '10deg' }] },
  bottom: { marginTop: 'auto' },
  signature: { gap: 6, alignItems: 'flex-start' },
  squiggle: { marginTop: 10, marginLeft: 16 },
  pitch: { marginTop: space.l, maxWidth: 310 },
  actions: { marginTop: 28, gap: space.s },
});
