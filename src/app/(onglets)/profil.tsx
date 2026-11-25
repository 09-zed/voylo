import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppText } from '@/components/AppText';
import { Sticker } from '@/components/Sticker';
import { t } from '@/i18n';
import { useAuth } from '@/lib/auth';
import { toIso } from '@/lib/dates';
import { fetchTrips, isPastTrip, useLoad } from '@/lib/trips';
import { colors, fonts, radius, space } from '@/theme';

export default function ProfileTab() {
  const insets = useSafeAreaInsets();
  const { session, profile, signOut } = useAuth();
  const me = session?.user.id ?? '';
  const { data: trips } = useLoad(fetchTrips);

  const today = toIso(new Date());
  const friends = new Set(trips?.flatMap((trip) => trip.members.map((m) => m.userId)).filter((id) => id !== me));
  const stats = [
    { value: trips?.length ?? 0, label: t('me.tripsStat') },
    { value: friends.size, label: t('me.friendsStat') },
    { value: trips?.filter((trip) => !isPastTrip(trip, today)).length ?? 0, label: t('me.upcomingStat') },
  ];
  const name = profile?.first_name ?? '';

  return (
    <ScrollView style={styles.screen} contentContainerStyle={[styles.content, { paddingTop: insets.top + space.xl }]}>
      <View style={styles.header}>
        <View style={styles.avatar}>
          <AppText style={styles.initial}>{name.charAt(0).toUpperCase()}</AppText>
        </View>
        <View style={styles.identity}>
          <View style={styles.nameRow}>
            <AppText style={styles.name} accessibilityRole="header" numberOfLines={1}>
              {name}
            </AppText>
            <Sticker name="peace" width={32} tilt={12} />
          </View>
          <AppText variant="caption" color={colors.textMuted} numberOfLines={1}>
            {session?.user.email ?? ''}
          </AppText>
        </View>
      </View>

      <View style={styles.stats}>
        {stats.map((stat) => (
          <View key={stat.label} style={styles.stat}>
            <AppText style={styles.statValue}>{stat.value}</AppText>
            <AppText variant="caption" color={colors.textMuted}>
              {stat.label}
            </AppText>
          </View>
        ))}
      </View>

      <View style={styles.wrapped}>
        <AppText variant="caption">{t('me.wrappedSoon')}</AppText>
        <AppText style={styles.wrappedTitle}>{t('me.wrappedTitle', { year: new Date().getFullYear() })}</AppText>
        <AppText style={styles.wrappedText}>{t('me.wrappedText')}</AppText>
        <Sticker name="billet" width={116} tilt={-14} style={styles.ticket} />
      </View>

      <View>
        <AppText variant="title" style={styles.settingsTitle}>
          {t('me.settings')}
        </AppText>
        <View style={styles.row}>
          <AppText>{t('me.language')}</AppText>
          <AppText color={colors.textMuted}>{t('me.languageValue')}</AppText>
        </View>
        <Pressable accessibilityRole="button" onPress={signOut} style={styles.row}>
          <AppText variant="bodyStrong" color={colors.error}>
            {t('me.signOut')}
          </AppText>
        </Pressable>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.white },
  content: { paddingHorizontal: space.xl, paddingBottom: space.xxl, gap: space.xl },
  header: { flexDirection: 'row', alignItems: 'center', gap: space.l },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: radius.pill,
    backgroundColor: colors.sunset,
    alignItems: 'center',
    justifyContent: 'center',
  },
  initial: { fontFamily: fonts.display, fontSize: 34, lineHeight: 40 },
  identity: { flex: 1, gap: 2 },
  nameRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  name: { fontFamily: fonts.display, fontSize: 28, lineHeight: 34, flexShrink: 1 },
  stats: { flexDirection: 'row', gap: space.s },
  stat: { flex: 1, backgroundColor: colors.surface, borderRadius: radius.m, paddingVertical: 14, paddingHorizontal: space.m, gap: 2 },
  statValue: { fontFamily: fonts.display, fontSize: 26, lineHeight: 31, fontVariant: ['tabular-nums'] },
  wrapped: { backgroundColor: colors.lime, borderRadius: radius.l, padding: space.xl - 4, gap: space.xs, overflow: 'hidden' },
  wrappedTitle: { fontFamily: fonts.display, fontSize: 24, lineHeight: 27, maxWidth: 220 },
  wrappedText: { fontSize: 15, lineHeight: 21, maxWidth: 220, marginTop: space.xs },
  ticket: { position: 'absolute', right: -20, top: 16 },
  settingsTitle: { fontSize: 20, lineHeight: 25, marginBottom: space.xs },
  row: {
    minHeight: 56,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: '#E6EAEE',
  },
});
