import { router, useLocalSearchParams } from 'expo-router';
import type { ReactNode } from 'react';
import { Pressable, RefreshControl, ScrollView, Share, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Circle, Path } from 'react-native-svg';

import { AppText } from '@/components/AppText';
import { AvatarStack } from '@/components/AvatarStack';
import { Button } from '@/components/Button';
import { CountdownSticker } from '@/components/CountdownSticker';
import { CoverImage } from '@/components/CoverImage';
import { InviteCard } from '@/components/InviteCard';
import { ComingSoon } from '@/components/trip/ComingSoon';
import { GroupDates } from '@/components/trip/GroupDates';
import { isTripTab, TripTabs, type TripTab } from '@/components/trip/TripTabs';
import { t } from '@/i18n';
import { useAuth } from '@/lib/auth';
import { coverFor } from '@/lib/covers';
import { daysUntil, formatDay, formatEuros, formatRange } from '@/lib/dates';
import { fetchPlanning, groupBudget, hasAnswered, type Planning } from '@/lib/planning';
import { fetchTrip, useLoad, type Trip } from '@/lib/trips';
import { colors, fonts, radius, space, touchTarget } from '@/theme';

export default function TripScreen() {
  const params = useLocalSearchParams<{ id: string; onglet?: string }>();
  const id = params.id;
  const tab: TripTab = isTripTab(params.onglet) ? params.onglet : 'apercu';
  const insets = useSafeAreaInsets();
  const { session } = useAuth();
  const me = session?.user.id ?? '';
  const { data, error, loading, refresh } = useLoad(async () => {
    const [trip, planning] = await Promise.all([fetchTrip(id), fetchPlanning(id)]);
    return { trip, planning };
  });

  const goBack = () => (router.canGoBack() ? router.back() : router.replace('/voyages'));
  const setTab = (next: TripTab) => router.setParams({ onglet: next });

  if (loading && !data) {
    return <View style={[styles.screen, styles.placeholder]} />;
  }

  const trip = data?.trip;
  if (!trip || !data) {
    return (
      <View style={[styles.screen, styles.missing, { paddingTop: insets.top + space.xxl }]}>
        <AppText>{error ? t('errors.generic') : t('errors.tripNotFound')}</AppText>
        <Button label={error ? t('common.retry') : t('common.back')} variant="small" onPress={error ? refresh : goBack} />
      </View>
    );
  }

  const { planning } = data;
  const cover = coverFor(trip.cover);
  const days = trip.startDate ? daysUntil(trip.startDate) : null;
  const solo = trip.members.length === 1;
  const isOrganizer = trip.members.some((m) => m.userId === me && m.role === 'organisateur');
  const share = () => Share.share({ message: t('trip.shareMessage', { name: trip.name, code: trip.inviteCode }) });

  const when = trip.startDate
    ? days === 0
      ? t('trip.today')
      : trip.endDate && trip.endDate !== trip.startDate
        ? formatRange(trip.startDate, trip.endDate)
        : t('trip.departure', { date: formatDay(trip.startDate) })
    : (trip.periodLabel ?? t('trips.noDate'));

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={{ paddingBottom: insets.bottom + space.xxl }}
      refreshControl={<RefreshControl refreshing={false} onRefresh={refresh} />}
    >
      <View style={[styles.hero, { paddingTop: insets.top + space.s }]}>
        <CoverImage cover={trip.cover} fade style={styles.heroCover} />
        <View style={styles.heroBar}>
          <RoundButton label={t('common.back')} onPress={goBack}>
            <Path d="m15 18-6-6 6-6" />
          </RoundButton>
          <RoundButton label={t('trip.invite')} onPress={share}>
            <Path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
            <Circle cx={9} cy={7} r={4} />
            <Path d="M19 8v6" />
            <Path d="M22 11h-6" />
          </RoundButton>
        </View>
        <AppText variant="display" color={cover.textColor} accessibilityRole="header" style={styles.heroTitle}>
          {trip.name}
        </AppText>
        <AppText variant="bodyStrong" color={cover.textColor} style={styles.when}>
          {when}
        </AppText>
        {days !== null && days > 0 && (
          <View style={styles.countdown}>
            <CountdownSticker days={days} caption={t('trip.countdownSuffix')} />
          </View>
        )}
      </View>

      <Members trip={trip} />
      <TripTabs active={tab} onChange={setTab} />

      <View style={styles.body}>
        {tab === 'apercu' && (
          <Overview trip={trip} planning={planning} me={me} solo={solo} onOpen={setTab} />
        )}
        {tab === 'dates' && <GroupDates trip={trip} planning={planning} isOrganizer={isOrganizer} onChanged={refresh} />}
        {tab === 'sondages' && <ComingSoon title={t('soon.sondagesTitle')} text={t('soon.sondagesText')} sticker="coeur" />}
        {tab === 'planning' && <ComingSoon title={t('soon.planningTitle')} text={t('soon.planningText')} sticker="pin" />}
        {tab === 'depenses' && <ComingSoon title={t('soon.depensesTitle')} text={t('soon.depensesText')} sticker="billet" />}
      </View>
    </ScrollView>
  );
}

function Overview({ trip, planning, me, solo, onOpen }: { trip: Trip; planning: Planning; me: string; solo: boolean; onOpen: (tab: TripTab) => void }) {
  const done = hasAnswered(planning.get(me));
  const budget = groupBudget(planning);
  const budgetText = budget
    ? !Number.isFinite(budget.max)
      ? `${formatEuros(budget.min)} +`
      : budget.min === budget.max
        ? formatEuros(budget.min)
        : `${formatEuros(budget.min)} – ${formatEuros(budget.max)}`
    : null;

  return (
    <View style={styles.overview}>
      {solo && <InviteCard tripName={trip.name} code={trip.inviteCode} solo />}

      <View style={[styles.card, { backgroundColor: done ? colors.surface : colors.sunsetTint }]}>
        <View style={styles.cardBody}>
          <AppText variant="bodyStrong">{t('planning.answersTitle')}</AppText>
          <AppText style={styles.cardText}>{done ? t('planning.answersDone') : t('planning.answersTodo')}</AppText>
        </View>
        <Button
          label={done ? t('planning.edit') : t('planning.fill')}
          variant="small"
          onPress={() => router.push({ pathname: '/voyage/[id]/dispos', params: { id: trip.id } })}
        />
      </View>

      <View style={styles.tiles}>
        <Tile
          label={t('overview.datesTile')}
          value={trip.startDate ? formatRange(trip.startDate, trip.endDate ?? trip.startDate) : t('overview.datesTodo')}
          foot={trip.startDate ? t('overview.datesFixed') : ''}
          background={colors.skyTint}
          onPress={() => onOpen('dates')}
        />
        <Tile
          label={t('overview.budgetTile')}
          value={budgetText ?? t('overview.budgetNone')}
          foot={budget ? t('overview.answered', { count: budget.answered, total: trip.members.length }) : ''}
          background={colors.black}
          dark
          onPress={() => onOpen('dates')}
        />
        <Tile label={t('overview.pollsTile')} value={t('overview.soon')} background={colors.surface} onPress={() => onOpen('sondages')} />
        <Tile label={t('overview.expensesTile')} value={t('overview.soon')} background={colors.lime} onPress={() => onOpen('depenses')} />
      </View>

      {!solo && <Waiting trip={trip} planning={planning} me={me} />}
    </View>
  );
}

function Tile({ label, value, foot = '', background, dark = false, onPress }: { label: string; value: string; foot?: string; background: string; dark?: boolean; onPress: () => void }) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${label}, ${value}${foot ? `, ${foot}` : ''}`}
      onPress={onPress}
      style={({ pressed }) => [styles.tile, { backgroundColor: background }, pressed && styles.pressed]}
    >
      <AppText variant="caption" color={dark ? colors.lime : colors.textMuted}>
        {label}
      </AppText>
      <AppText style={styles.tileValue} color={dark ? colors.white : colors.black}>
        {value}
      </AppText>
      {foot ? (
        <AppText variant="caption" color={dark ? colors.white : colors.black} style={styles.tileFoot}>
          {foot}
        </AppText>
      ) : null}
    </Pressable>
  );
}

function Waiting({ trip, planning, me }: { trip: Trip; planning: Planning; me: string }) {
  const waiting = trip.members.filter((m) => m.userId !== me && !hasAnswered(planning.get(m.userId)));
  const remind = () => Share.share({ message: t('planning.remindMessage', { name: trip.name }) });

  if (waiting.length === 0) {
    return (
      <View style={[styles.card, { backgroundColor: colors.limeTint }]}>
        <AppText variant="bodyStrong">{t('planning.allAnswered')}</AppText>
      </View>
    );
  }

  return (
    <View style={[styles.card, { backgroundColor: colors.surface }]}>
      <View style={styles.cardBody}>
        <AppText variant="bodyStrong">{t('planning.waitingTitle')}</AppText>
        <AppText style={styles.cardText}>{waiting.map((m) => m.firstName).join(', ')}</AppText>
      </View>
      <Button label={t('planning.remind')} variant="small" onPress={remind} />
    </View>
  );
}

function Members({ trip }: { trip: Trip }) {
  const names = trip.members.map((m) => m.firstName);
  const label = names.length > 1 ? `${names.slice(0, -1).join(', ')} ${t('common.and')} ${names.at(-1)}` : (names[0] ?? '');
  const organizers = trip.members.filter((m) => m.role === 'organisateur').map((m) => m.firstName);

  return (
    <View style={styles.group}>
      <AvatarStack members={trip.members.map((m) => ({ id: m.userId, name: m.firstName, color: m.color }))} />
      <View style={styles.groupText}>
        <AppText variant="bodyStrong" style={styles.groupNames}>
          {label}
        </AppText>
        <AppText variant="caption" color={colors.textMuted}>
          {`${t('trip.organizer')} : ${organizers.join(', ')}`}
        </AppText>
      </View>
    </View>
  );
}

function RoundButton({ label, onPress, children }: { label: string; onPress: () => void; children: ReactNode }) {
  return (
    <Pressable accessibilityRole="button" accessibilityLabel={label} onPress={onPress} style={({ pressed }) => [styles.round, pressed && styles.pressed]}>
      <Svg width={22} height={22} viewBox="0 0 24 24" fill="none" stroke={colors.black} strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round">
        {children}
      </Svg>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.white },
  placeholder: { backgroundColor: colors.surface },
  missing: { paddingHorizontal: space.xl, gap: space.l, alignItems: 'flex-start' },
  hero: { minHeight: 300, paddingHorizontal: space.xl - 4, paddingBottom: 28 },
  heroCover: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
    overflow: 'hidden',
  },
  heroBar: { flexDirection: 'row', justifyContent: 'space-between' },
  round: { width: touchTarget, height: touchTarget, borderRadius: radius.pill, backgroundColor: colors.white, alignItems: 'center', justifyContent: 'center' },
  pressed: { transform: [{ scale: 0.97 }] },
  heroTitle: { marginTop: 'auto', paddingTop: space.xxl, fontSize: 36, lineHeight: 40, maxWidth: 260 },
  when: { maxWidth: 190, marginTop: space.xs },
  countdown: { position: 'absolute', right: 18, bottom: -34 },
  group: { flexDirection: 'row', alignItems: 'center', gap: space.m, paddingHorizontal: space.xl - 4, paddingTop: space.xl, paddingRight: 130 },
  groupText: { flexShrink: 1 },
  groupNames: { fontSize: 15, lineHeight: 21 },
  body: { paddingHorizontal: space.xl - 4 },
  overview: { gap: space.m },
  card: { borderRadius: radius.m, padding: space.l, flexDirection: 'row', alignItems: 'center', gap: space.m },
  cardBody: { flex: 1, gap: 2 },
  cardText: { fontSize: 15, lineHeight: 21 },
  tiles: { flexDirection: 'row', flexWrap: 'wrap', gap: space.m },
  tile: { width: '47.5%', flexGrow: 1, minHeight: 120, borderRadius: radius.m, padding: space.l, gap: 6 },
  tileValue: { fontFamily: fonts.display, fontSize: 18, lineHeight: 22 },
  tileFoot: { marginTop: 'auto' },
});
