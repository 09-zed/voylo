import { Image } from 'expo-image';
import { router } from 'expo-router';
import { Pressable, RefreshControl, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Path } from 'react-native-svg';

import { AppText } from '@/components/AppText';
import { Button } from '@/components/Button';
import { CoverImage } from '@/components/CoverImage';
import { Logo } from '@/components/Logo';
import { TripHeroCard } from '@/components/TripHeroCard';
import { t } from '@/i18n';
import { useAuth } from '@/lib/auth';
import { toIso } from '@/lib/dates';
import { photos } from '@/lib/photos';
import { fetchMyAnsweredTripIds } from '@/lib/planning';
import { fetchTrips, isPastTrip, useLoad, type Trip } from '@/lib/trips';
import { colors, fonts, radius, space } from '@/theme';

type Todo = { key: string; title: string; trip: Trip; tint: string; onPress: () => void };

export default function HomeTab() {
  const insets = useSafeAreaInsets();
  const { session, profile } = useAuth();
  const me = session?.user.id ?? '';
  const { data, error, refresh } = useLoad(async () => {
    const [trips, answered] = await Promise.all([fetchTrips(), fetchMyAnsweredTripIds(me)]);
    return { trips, answered };
  });

  const today = toIso(new Date());
  const upcoming = data?.trips.filter((trip) => !isPastTrip(trip, today)) ?? [];
  const next = upcoming[0] ?? null;

  const todos: Todo[] = [];
  for (const trip of upcoming) {
    if (!data?.answered.has(trip.id)) {
      todos.push({
        key: `answers-${trip.id}`,
        title: t('home.todoAnswers'),
        trip,
        tint: colors.sunsetTint,
        onPress: () => router.push({ pathname: '/voyage/[id]/dispos', params: { id: trip.id } }),
      });
    }
    if (trip.members.length === 1) {
      todos.push({
        key: `invite-${trip.id}`,
        title: t('home.todoInvite'),
        trip,
        tint: colors.skyTint,
        onPress: () => router.push({ pathname: '/voyage/[id]/inviter', params: { id: trip.id } }),
      });
    }
  }
  const shownTodos = todos.slice(0, 4);

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={[styles.content, { paddingTop: insets.top + space.m }]}
      refreshControl={<RefreshControl refreshing={false} onRefresh={refresh} />}
    >
      <View style={styles.header}>
        <Logo width={92} />
      </View>

      <View style={styles.greeting}>
        <AppText style={styles.hello} accessibilityRole="header">
          {t('home.hello', { name: profile?.first_name ?? '' })}
        </AppText>
        <AppText color={colors.textMuted}>{next ? t('home.subtitleNext') : t('home.subtitleNone')}</AppText>
      </View>

      {error && !data ? (
        <View style={styles.message}>
          <AppText>{t('errors.loadTrips')}</AppText>
          <Button label={t('common.retry')} variant="small" onPress={refresh} style={styles.alignStart} />
        </View>
      ) : !data ? (
        <View style={styles.skeleton} />
      ) : next ? (
        <>
          <TripHeroCard trip={next} onPress={() => router.push({ pathname: '/voyage/[id]', params: { id: next.id } })} />

          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <AppText variant="title" style={styles.sectionTitle}>
                {t('home.todoTitle')}
              </AppText>
              {shownTodos.length > 0 && (
                <AppText variant="caption" color={colors.textMuted}>
                  {shownTodos.length === 1 ? t('home.todoOne') : t('home.todoCount', { count: shownTodos.length })}
                </AppText>
              )}
            </View>
            {shownTodos.length === 0 ? (
              <AppText color={colors.textMuted}>{t('home.todoNone')}</AppText>
            ) : (
              shownTodos.map((todo) => (
                <Pressable
                  key={todo.key}
                  accessibilityRole="button"
                  accessibilityLabel={`${todo.title}, ${todo.trip.name}`}
                  onPress={todo.onPress}
                  style={({ pressed }) => [styles.todo, { backgroundColor: todo.tint }, pressed && styles.pressed]}
                >
                  <CoverImage cover={todo.trip.cover} style={styles.todoThumb} />
                  <View style={styles.todoText}>
                    <AppText variant="bodyStrong" style={styles.todoTitle}>
                      {todo.title}
                    </AppText>
                    <AppText variant="caption" color={colors.textMuted}>
                      {todo.trip.name}
                    </AppText>
                  </View>
                  <Svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke={colors.black} strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round">
                    <Path d="m9 18 6-6-6-6" />
                  </Svg>
                </Pressable>
              ))
            )}
          </View>
        </>
      ) : (
        <View style={styles.empty}>
          <Image source={photos.noTrips} style={styles.emptyPhoto} contentFit="cover" accessible={false} />
          <AppText variant="title" style={styles.emptyTitle}>
            {t('home.emptyTitle')}
          </AppText>
          <AppText color={colors.textMuted}>{t('home.emptyText')}</AppText>
          <View style={styles.emptyActions}>
            <Button label={t('trips.create')} onPress={() => router.push('/nouveau-voyage')} />
            <Button label={t('trips.join')} variant="link" onPress={() => router.push('/rejoindre')} />
          </View>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.white },
  content: { paddingHorizontal: space.xl, paddingBottom: space.xxl, gap: space.xl },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginLeft: -6 },
  greeting: { gap: 4, marginTop: -space.s },
  hello: { fontFamily: fonts.display, fontSize: 32, lineHeight: 36, letterSpacing: -0.6 },
  message: { gap: space.m },
  alignStart: { alignSelf: 'flex-start' },
  skeleton: { height: 220, borderRadius: radius.l, backgroundColor: colors.surface },
  section: { gap: space.m },
  sectionHeader: { flexDirection: 'row', alignItems: 'baseline', justifyContent: 'space-between' },
  sectionTitle: { fontSize: 20, lineHeight: 25 },
  todo: { flexDirection: 'row', alignItems: 'center', gap: space.m, padding: space.m, borderRadius: radius.m },
  pressed: { transform: [{ scale: 0.98 }] },
  todoThumb: { width: 48, height: 48, borderRadius: 14, overflow: 'hidden' },
  todoText: { flex: 1, gap: 2 },
  todoTitle: { fontSize: 16, lineHeight: 21 },
  empty: { gap: space.s },
  emptyPhoto: { height: 240, borderRadius: radius.l, backgroundColor: colors.sky, marginBottom: space.m },
  emptyTitle: { fontSize: 22, lineHeight: 27 },
  emptyActions: { marginTop: space.l, gap: space.s },
});
