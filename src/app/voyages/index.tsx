import { router } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppText } from '@/components/AppText';
import { AvatarStack } from '@/components/AvatarStack';
import { Button } from '@/components/Button';
import { CountdownSticker } from '@/components/CountdownSticker';
import { Logo } from '@/components/Logo';
import { PhotoPlaceholder } from '@/components/PhotoPlaceholder';
import { demoTrips } from '@/data/demo';
import { t } from '@/i18n';
import { useAuth } from '@/lib/auth';
import { daysUntil, formatDay } from '@/lib/dates';
import { colors, radius, space } from '@/theme';

export default function TripsScreen() {
  const insets = useSafeAreaInsets();
  const { profile, signOut } = useAuth();

  return (
    <View style={styles.screen}>
      <ScrollView contentContainerStyle={[styles.content, { paddingTop: insets.top + space.s }]}>
        <View style={styles.top}>
          <Logo size={32} />
          {profile && <Button label={t('trips.signOut')} variant="link" onPress={signOut} />}
        </View>
        {profile && (
          <AppText variant="bodyStrong" style={styles.hello}>
            {t('trips.hello', { name: profile.first_name })}
          </AppText>
        )}
        <AppText variant="display" accessibilityRole="header" style={styles.title}>
          {t('trips.title')}
        </AppText>

        <View style={styles.list}>
          {demoTrips.map((trip) => (
            <Pressable
              key={trip.id}
              accessibilityRole="link"
              accessibilityLabel={trip.name}
              onPress={() => router.push(`/voyages/${trip.id}`)}
              style={({ pressed }) => [styles.card, pressed && styles.pressed]}
            >
              <PhotoPlaceholder label={t('trip.photoLabel')} color={colors.night} textColor={colors.white} style={styles.cardPhoto} />
              <View style={styles.sticker}>
                <CountdownSticker days={daysUntil(trip.departure)} caption={t('trips.countdownSuffix')} size="small" />
              </View>
              <View style={styles.cardBody}>
                <View style={styles.cardText}>
                  <AppText variant="title">{trip.name}</AppText>
                  <AppText variant="caption" color={colors.textMuted}>
                    {formatDay(trip.departure)}
                  </AppText>
                </View>
                <AvatarStack members={trip.members} size={32} />
              </View>
            </Pressable>
          ))}
        </View>
      </ScrollView>

      <View style={[styles.actions, { paddingBottom: insets.bottom + space.l }]}>
        {/* Creating and joining for real arrive in step 4 of plan.md. */}
        <Button label={t('trips.create')} onPress={() => {}} />
        <Button label={t('trips.join')} variant="link" onPress={() => router.push('/rejoindre')} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.white },
  content: { paddingHorizontal: space.xl, paddingBottom: space.xl },
  top: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  hello: { marginTop: space.l },
  title: { marginTop: space.xs },
  list: { marginTop: space.xl, gap: space.l },
  card: {
    borderRadius: radius.l,
    backgroundColor: colors.surface,
    overflow: 'hidden',
  },
  pressed: { transform: [{ scale: 0.98 }] },
  cardPhoto: { height: 160 },
  sticker: { position: 'absolute', top: space.m, right: space.m },
  cardBody: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: space.l,
    gap: space.m,
  },
  cardText: { flexShrink: 1, gap: 2 },
  actions: { paddingHorizontal: space.xl, paddingTop: space.m, gap: space.s, backgroundColor: colors.white },
});
