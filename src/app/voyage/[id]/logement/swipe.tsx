import * as Haptics from 'expo-haptics';
import * as Linking from 'expo-linking';
import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useImperativeHandle, useRef, useState, type ReactNode, type Ref } from 'react';
import { Pressable, StyleSheet, useWindowDimensions, View } from 'react-native';
import { GestureDetector, usePanGesture } from 'react-native-gesture-handler';
import Animated, {
  Extrapolation,
  interpolate,
  useAnimatedReaction,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
  type SharedValue,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Path } from 'react-native-svg';
import { scheduleOnRN } from 'react-native-worklets';

import { AppText } from '@/components/AppText';
import { BackButton } from '@/components/BackButton';
import { Button } from '@/components/Button';
import { ListingPhoto, priceLine } from '@/components/lodging/ListingParts';
import { Sticker } from '@/components/Sticker';
import { t } from '@/i18n';
import { useAuth } from '@/lib/auth';
import { fetchListings, swipeListing, toSwipe, tripNights, undoSwipe, type Listing } from '@/lib/listings';
import { reportError } from '@/lib/report';
import { fetchTrip, useLoad, type Trip } from '@/lib/trips';
import { colors, fonts, radius, space } from '@/theme';

export default function SwipeScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const insets = useSafeAreaInsets();
  const { session } = useAuth();
  const me = session?.user.id ?? '';
  const { data, error, refresh } = useLoad(async () => {
    const [trip, listings] = await Promise.all([fetchTrip(id), fetchListings(id)]);
    return { trip, listings };
  });

  return (
    <View style={[styles.screen, { paddingTop: insets.top + space.s, paddingBottom: insets.bottom + space.m }]}>
      {data?.trip ? (
        // Mounted once the data is in: the deck keeps its own order while you swipe.
        <Deck trip={data.trip} listings={data.listings} me={me} />
      ) : error ? (
        <View style={styles.center}>
          <AppText>{t('errors.generic')}</AppText>
          <Button label={t('common.retry')} variant="small" onPress={refresh} />
        </View>
      ) : null}
    </View>
  );
}

type Choice = { id: string; liked: boolean };

function Deck({ trip, listings, me }: { trip: Trip; listings: Listing[]; me: string }) {
  const { width } = useWindowDimensions();
  const [queue] = useState(() => toSwipe(listings, me));
  const [index, setIndex] = useState(0);
  const [history, setHistory] = useState<Choice[]>([]);
  const [enterFrom, setEnterFrom] = useState(0);
  const [failed, setFailed] = useState(false);
  const progress = useSharedValue(0);
  const card = useRef<CardHandle>(null);

  const nights = tripNights(trip);
  const top = queue[index];
  const next = queue[index + 1];

  const onSwiped = (liked: boolean) => {
    if (!top) return;
    Haptics.impactAsync(liked ? Haptics.ImpactFeedbackStyle.Medium : Haptics.ImpactFeedbackStyle.Light);
    setHistory((h) => [...h, { id: top.id, liked }]);
    setEnterFrom(0);
    setIndex((i) => i + 1);
    swipeListing(top.id, me, liked).catch((e) => {
      reportError('swipeListing', e);
      setFailed(true);
    });
  };

  const undo = () => {
    const last = history.at(-1);
    if (!last) return;
    setHistory((h) => h.slice(0, -1));
    setEnterFrom(last.liked ? width * 1.2 : -width * 1.2);
    setIndex((i) => i - 1);
    undoSwipe(last.id, me).catch((e) => {
      reportError('undoSwipe', e);
      setFailed(true);
    });
  };

  const openVerdict = () => router.replace({ pathname: '/voyage/[id]/logement/verdict', params: { id: trip.id } });

  if (!top) {
    return (
      <View style={styles.flex}>
        <BackButton />
        <View style={styles.done}>
          <Sticker name="coeur" width={150} tilt={-8} />
          <AppText variant="display" accessibilityRole="header" style={styles.doneTitle}>
            {t('lodging.doneTitle')}
          </AppText>
          <AppText color={colors.textMuted} style={styles.doneText}>
            {t('lodging.doneText')}
          </AppText>
        </View>
        <View style={styles.footer}>
          <Button label={t('lodging.seeVerdict')} onPress={openVerdict} />
          {history.length > 0 && <Button label={t('lodging.undo')} variant="link" onPress={undo} />}
        </View>
      </View>
    );
  }

  return (
    <View style={styles.flex}>
      <View style={styles.header}>
        <BackButton />
        <View style={styles.headerText}>
          <AppText variant="bodyStrong">{t('lodging.sectionTitle')}</AppText>
          <AppText variant="caption" color={colors.textMuted}>
            {t('lodging.progress', { current: index + 1, total: queue.length })}
          </AppText>
        </View>
      </View>

      <View style={styles.deck}>
        {next && <BackCard listing={next} trip={trip} nights={nights} progress={progress} />}
        <SwipeCard
          key={top.id}
          ref={card}
          listing={top}
          trip={trip}
          nights={nights}
          me={me}
          progress={progress}
          enterFrom={enterFrom}
          onSwiped={onSwiped}
        />
      </View>

      <AppText variant="caption" color={failed ? colors.error : colors.textMuted} style={styles.hint}>
        {failed ? t('errors.generic') : t('lodging.swipeHint')}
      </AppText>
      <View style={styles.actions}>
        <RoundAction label={t('lodging.pass')} size={68} background={colors.white} border onPress={() => card.current?.fling(false)}>
          <Path d="M18 6 6 18" />
          <Path d="m6 6 12 12" />
        </RoundAction>
        <RoundAction label={t('lodging.undo')} size={48} background={colors.surface} onPress={undo} disabled={history.length === 0}>
          <Path d="M3 7v6h6" />
          <Path d="M21 17a9 9 0 0 0-15-6.7L3 13" />
        </RoundAction>
        <RoundAction label={t('lodging.like')} size={68} background={colors.lime} onPress={() => card.current?.fling(true)}>
          <Path d="M19 14c1.5-1.5 3-3.2 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.8 0-3 .5-4.5 2-1.5-1.5-2.7-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4 3 5.5l7 7Z" />
        </RoundAction>
      </View>
    </View>
  );
}

type CardHandle = { fling: (liked: boolean) => void };

const THRESHOLD = 110;

function SwipeCard({
  ref,
  listing,
  trip,
  nights,
  me,
  progress,
  enterFrom,
  onSwiped,
}: {
  ref: Ref<CardHandle>;
  listing: Listing;
  trip: Trip;
  nights: number | null;
  me: string;
  progress: SharedValue<number>;
  enterFrom: number;
  onSwiped: (liked: boolean) => void;
}) {
  const { width } = useWindowDimensions();
  const x = useSharedValue(enterFrom);
  const out = width * 1.4;

  // A card coming back from an undo slides in from the side it left by.
  useEffect(() => {
    progress.set(0);
    if (x.get() !== 0) x.set(withSpring(0, { damping: 18, stiffness: 160 }));
  }, [progress, x]);

  // The card behind grows as this one moves away.
  useAnimatedReaction(
    () => Math.min(1, Math.abs(x.get()) / (THRESHOLD * 1.5)),
    (value) => {
      progress.set(value);
    },
  );

  const fling = (liked: boolean) => {
    x.set(
      withTiming(liked ? out : -out, { duration: 240 }, (finished) => {
        'worklet';
        if (finished) scheduleOnRN(onSwiped, liked);
      }),
    );
  };

  useImperativeHandle(ref, () => ({ fling }));

  const pan = usePanGesture({
    activeOffsetX: [-12, 12],
    failOffsetY: [-24, 24],
    onUpdate: (event) => {
      'worklet';
      x.set(event.translationX);
    },
    onDeactivate: (event) => {
      'worklet';
      const fast = Math.abs(event.velocityX) > 900;
      if (Math.abs(x.get()) > THRESHOLD || fast) {
        const liked = (fast ? event.velocityX : x.get()) > 0;
        x.set(
          withTiming(liked ? out : -out, { duration: 200 }, (finished) => {
            'worklet';
            if (finished) scheduleOnRN(onSwiped, liked);
          }),
        );
      } else {
        x.set(withSpring(0, { damping: 16, stiffness: 180 }));
      }
    },
  });

  const cardStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: x.get() },
      { translateY: Math.abs(x.get()) * 0.06 },
      { rotate: `${interpolate(x.get(), [-width, 0, width], [-14, 0, 14])}deg` },
    ],
  }));
  const likeStamp = useAnimatedStyle(() => ({ opacity: interpolate(x.get(), [20, THRESHOLD], [0, 1], Extrapolation.CLAMP) }));
  const passStamp = useAnimatedStyle(() => ({ opacity: interpolate(x.get(), [-THRESHOLD, -20], [1, 0], Extrapolation.CLAMP) }));

  return (
    <GestureDetector gesture={pan}>
      <Animated.View style={[styles.card, cardStyle]}>
        <CardContent listing={listing} trip={trip} nights={nights} me={me} />
        <Animated.View style={[styles.stamp, styles.stampLike, likeStamp]} pointerEvents="none">
          <AppText style={styles.stampText}>{t('lodging.like')}</AppText>
        </Animated.View>
        <Animated.View style={[styles.stamp, styles.stampPass, passStamp]} pointerEvents="none">
          <AppText style={styles.stampText}>{t('lodging.pass')}</AppText>
        </Animated.View>
      </Animated.View>
    </GestureDetector>
  );
}

function BackCard({ listing, trip, nights, progress }: { listing: Listing; trip: Trip; nights: number | null; progress: SharedValue<number> }) {
  const style = useAnimatedStyle(() => ({
    transform: [{ translateY: interpolate(progress.get(), [0, 1], [16, 0]) }, { scale: interpolate(progress.get(), [0, 1], [0.94, 1]) }],
  }));
  return (
    <Animated.View style={[styles.card, style]} accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
      <CardContent listing={listing} trip={trip} nights={nights} me="" />
    </Animated.View>
  );
}

function CardContent({ listing, trip, nights, me }: { listing: Listing; trip: Trip; nights: number | null; me: string }) {
  const author = listing.addedBy === me ? t('lodging.byYou') : trip.members.find((m) => m.userId === listing.addedBy)?.firstName ?? '?';
  const price = priceLine(listing, nights, trip.members.length);

  return (
    <>
      <ListingPhoto listing={listing} big style={styles.cardPhoto} />
      <View style={styles.by}>
        <AppText variant="caption">{listing.addedBy === me ? author : t('lodging.addedBy', { name: author })}</AppText>
      </View>
      <View style={styles.cardBody}>
        <AppText style={styles.cardTitle} numberOfLines={2}>
          {listing.title}
        </AppText>
        {price ? <AppText variant="bodyStrong">{price}</AppText> : null}
        {listing.details ? (
          <AppText variant="caption" color={colors.textMuted} numberOfLines={2}>
            {listing.details}
          </AppText>
        ) : null}
        {listing.note ? (
          <AppText style={styles.note} numberOfLines={2}>
            {`« ${listing.note} »`}
          </AppText>
        ) : null}
        <Pressable accessibilityRole="link" onPress={() => Linking.openURL(listing.url)} hitSlop={8} style={styles.link}>
          <AppText variant="caption" style={styles.underline}>
            {t('lodging.seeListing')}
          </AppText>
        </Pressable>
      </View>
    </>
  );
}

function RoundAction({
  label,
  size,
  background,
  border = false,
  disabled = false,
  onPress,
  children,
}: {
  label: string;
  size: number;
  background: string;
  border?: boolean;
  disabled?: boolean;
  onPress: () => void;
  children: ReactNode;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled }}
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.round,
        { width: size, height: size, backgroundColor: background },
        border && styles.roundBorder,
        pressed && styles.pressed,
        disabled && styles.disabled,
      ]}
    >
      <Svg width={size * 0.4} height={size * 0.4} viewBox="0 0 24 24" fill="none" stroke={colors.black} strokeWidth={2.4} strokeLinecap="round" strokeLinejoin="round">
        {children}
      </Svg>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.white, paddingHorizontal: space.l },
  flex: { flex: 1 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: space.l },
  header: { flexDirection: 'row', alignItems: 'center', gap: space.s },
  headerText: { flex: 1 },
  deck: { flex: 1, marginTop: space.m },
  card: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    borderRadius: radius.l,
    backgroundColor: colors.white,
    overflow: 'hidden',
    boxShadow: '0 1px 2px rgba(0,0,0,0.08), 0 12px 28px rgba(0,0,0,0.14)',
  },
  cardPhoto: { flex: 1 },
  by: {
    position: 'absolute',
    top: space.m,
    left: space.m,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: radius.pill,
    backgroundColor: colors.white,
  },
  cardBody: { padding: space.l, gap: 4 },
  cardTitle: { fontFamily: fonts.display, fontSize: 22, lineHeight: 27, letterSpacing: -0.3 },
  note: { fontSize: 15, lineHeight: 21, fontStyle: 'italic' },
  link: { alignSelf: 'flex-start', marginTop: 4, minHeight: 24, justifyContent: 'center' },
  underline: { textDecorationLine: 'underline' },
  stamp: {
    position: 'absolute',
    top: 56,
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: radius.s,
    borderWidth: 3,
    borderColor: colors.black,
  },
  stampLike: { left: 20, backgroundColor: colors.lime, transform: [{ rotate: '-12deg' }] },
  stampPass: { right: 20, backgroundColor: colors.sunset, transform: [{ rotate: '12deg' }] },
  stampText: { fontFamily: fonts.display, fontSize: 26, lineHeight: 32, textTransform: 'uppercase' },
  hint: { textAlign: 'center', marginTop: space.l },
  actions: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: space.xl, marginTop: space.m },
  round: { borderRadius: radius.pill, alignItems: 'center', justifyContent: 'center' },
  roundBorder: { borderWidth: 2, borderColor: colors.border },
  pressed: { transform: [{ scale: 0.94 }] },
  disabled: { opacity: 0.35 },
  done: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: space.m, paddingHorizontal: space.l },
  doneTitle: { textAlign: 'center', marginTop: space.l },
  doneText: { textAlign: 'center' },
  footer: { gap: space.s },
});
