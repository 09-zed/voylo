import { Image } from 'expo-image';
import { router } from 'expo-router';
import { RefreshControl, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppText } from '@/components/AppText';
import { Button } from '@/components/Button';
import { Logo } from '@/components/Logo';
import { TripCard } from '@/components/TripCard';
import { t } from '@/i18n';
import { useAuth } from '@/lib/auth';
import { photos } from '@/lib/photos';
import { fetchTrips, useLoad } from '@/lib/trips';
import { colors, radius, space } from '@/theme';

export default function TripsScreen() {
  const insets = useSafeAreaInsets();
  const { profile, signOut } = useAuth();
  const { data: trips, error, loading, refresh } = useLoad(fetchTrips);

  return (
    <View style={styles.screen}>
      <ScrollView
        contentContainerStyle={[styles.content, { paddingTop: insets.top + space.s }]}
        refreshControl={<RefreshControl refreshing={false} onRefresh={refresh} />}
      >
        <View style={styles.top}>
          <Logo size={32} />
          <Button label={t('trips.signOut')} variant="link" onPress={signOut} />
        </View>
        {profile && (
          <AppText variant="bodyStrong" style={styles.hello}>
            {t('trips.hello', { name: profile.first_name })}
          </AppText>
        )}
        <AppText variant="display" accessibilityRole="header" style={styles.title}>
          {t('trips.title')}
        </AppText>

        {error && !trips ? (
          <View style={styles.message}>
            <AppText>{t('errors.loadTrips')}</AppText>
            <Button label={t('common.retry')} variant="small" onPress={refresh} style={styles.retry} />
          </View>
        ) : trips && trips.length === 0 ? (
          <View style={styles.empty}>
            <Image source={photos.noTrips} alt={t('trips.emptyPhotoLabel')} style={styles.emptyPhoto} contentFit="cover" />
            <AppText variant="title" style={styles.emptyTitle}>
              {t('trips.emptyTitle')}
            </AppText>
            <AppText color={colors.textMuted}>{t('trips.emptyText')}</AppText>
          </View>
        ) : (
          <View style={styles.list}>
            {loading && !trips
              ? [0, 1].map((i) => <View key={i} style={styles.skeleton} />)
              : trips?.map((trip) => (
                  <TripCard key={trip.id} trip={trip} onPress={() => router.push(`/voyages/${trip.id}`)} />
                ))}
          </View>
        )}
      </ScrollView>

      <View style={[styles.actions, { paddingBottom: insets.bottom + space.l }]}>
        <Button label={t('trips.create')} onPress={() => router.push('/voyages/nouveau')} />
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
  skeleton: { height: 196, borderRadius: radius.l, backgroundColor: colors.surface },
  message: { marginTop: space.xl, gap: space.m, alignItems: 'flex-start' },
  retry: { alignSelf: 'flex-start' },
  empty: { marginTop: space.xl },
  emptyPhoto: { height: 240, borderRadius: radius.l, backgroundColor: colors.sky },
  emptyTitle: { marginTop: space.xl, marginBottom: space.s },
  actions: { paddingHorizontal: space.xl, paddingTop: space.m, gap: space.s, backgroundColor: colors.white },
});
