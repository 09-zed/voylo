import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';

import { AppText } from '@/components/AppText';
import { Button } from '@/components/Button';
import { Chip } from '@/components/Chip';
import { FormScreen } from '@/components/FormScreen';
import { ListingPhoto, sourceName } from '@/components/lodging/ListingParts';
import { TextField } from '@/components/TextField';
import { t } from '@/i18n';
import { useAuth } from '@/lib/auth';
import { formatEuros } from '@/lib/dates';
import { normalizeUrl, readListingLink, type LinkPreview } from '@/lib/linkPreview';
import { addListing, findListingByKey, isDuplicateError, listingPrices, tripNights, type PriceUnit } from '@/lib/listings';
import { reportError } from '@/lib/report';
import { fetchTrip, useLoad } from '@/lib/trips';
import { colors, fonts, radius, space } from '@/theme';

type ReadResult = { for: string; preview: LinkPreview | null; duplicate: boolean };

/** "112,50" → 112.5; null when it isn't a usable price. */
function parsePrice(input: string) {
  const value = Number(input.replace(/\s/g, '').replace(',', '.'));
  return Number.isFinite(value) && value > 0 && value < 100_000 ? Math.round(value * 100) / 100 : null;
}

/** Paste a link, the app fills in what it can, you add the price. */
export default function AddListingScreen() {
  const { id, lien } = useLocalSearchParams<{ id: string; lien: string }>();
  const { session } = useAuth();
  const { data: trip } = useLoad(() => fetchTrip(id));

  const [link, setLink] = useState(lien ?? '');
  const [target, setTarget] = useState(lien ?? '');
  const [linkError, setLinkError] = useState<string | null>(null);
  const [result, setResult] = useState<ReadResult | null>(null);
  const [title, setTitle] = useState('');
  const [price, setPrice] = useState('');
  const [unit, setUnit] = useState<PriceUnit>('night');
  const [note, setNote] = useState('');
  const [tried, setTried] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  // Read the page once per link: photo, name, details, and whether it's already proposed.
  useEffect(() => {
    if (!target) return;
    let alive = true;
    (async () => {
      const preview = await readListingLink(target);
      let duplicate = false;
      if (preview) {
        try {
          duplicate = !!(await findListingByKey(id, preview.urlKey));
        } catch (e) {
          reportError('findListingByKey', e);
        }
      }
      if (!alive) return;
      setResult({ for: target, preview, duplicate });
      if (preview?.title) setTitle((current) => (current.trim() ? current : preview.title!));
    })();
    return () => {
      alive = false;
    };
  }, [id, target]);

  const reading = !!target && result?.for !== target;
  const preview = reading ? null : (result?.preview ?? null);
  const duplicate = !reading && !!result?.duplicate;
  const amount = parsePrice(price);
  const nights = trip ? tripNights(trip) : null;
  const people = trip?.members.length ?? 0;

  const changeLink = () => {
    const url = normalizeUrl(link);
    if (!url) {
      setLinkError(t('lodging.invalidLink'));
      return;
    }
    setLinkError(null);
    if (url !== target) {
      setTitle('');
      setTarget(url);
    }
  };

  const submit = async () => {
    setTried(true);
    setSaveError(null);
    if (!preview || !session || amount === null || !title.trim() || duplicate) return;
    setSaving(true);
    try {
      await addListing({
        tripId: id,
        addedBy: session.user.id,
        url: preview.url,
        urlKey: preview.urlKey,
        source: preview.source,
        title: title.trim().slice(0, 120),
        imageUrl: preview.imageUrl,
        details: preview.details,
        priceAmount: amount,
        priceUnit: unit,
        note: note.trim() ? note.trim().slice(0, 140) : null,
      });
      router.back();
    } catch (e) {
      if (isDuplicateError(e)) {
        setResult((current) => (current ? { ...current, duplicate: true } : current));
      } else {
        reportError('addListing', e);
        setSaveError(t('errors.generic'));
      }
      setSaving(false);
    }
  };

  const readStatus = reading
    ? t('lodging.reading')
    : !preview?.title
      ? t('lodging.readNothing')
      : preview.imageUrl
        ? t('lodging.readOk')
        : t('lodging.readPartial');

  return (
    <FormScreen
      title={t('lodging.newTitle')}
      subtitle={t('lodging.addHint')}
      footer={
        <>
          {saveError ? (
            <AppText variant="caption" color={colors.error} accessibilityRole="alert">
              {saveError}
            </AppText>
          ) : null}
          <Button label={t('lodging.submit')} onPress={submit} loading={saving} disabled={reading || duplicate} />
        </>
      }
    >
      <TextField
        label={t('lodging.linkLabel')}
        value={link}
        onChangeText={(text) => {
          setLink(text);
          if (linkError) setLinkError(null);
        }}
        onEndEditing={changeLink}
        onSubmitEditing={changeLink}
        autoCapitalize="none"
        autoCorrect={false}
        keyboardType="url"
        returnKeyType="done"
        error={linkError ?? (duplicate ? t('lodging.duplicate') : null)}
      />

      <View style={styles.status} accessibilityLiveRegion="polite">
        {reading ? <ActivityIndicator color={colors.black} /> : <View style={[styles.dot, { backgroundColor: preview?.title ? colors.lime : colors.sunset }]} />}
        <AppText variant="caption" color={colors.textMuted}>
          {readStatus}
        </AppText>
      </View>

      {preview && (
        <View style={styles.preview}>
          <ListingPhoto listing={preview} big style={styles.photo} />
          <View style={styles.previewText}>
            <View style={styles.source}>
              <AppText variant="caption">{sourceName(preview)}</AppText>
            </View>
            {preview.details ? (
              <AppText variant="caption" color={colors.textMuted} numberOfLines={2}>
                {preview.details}
              </AppText>
            ) : null}
          </View>
        </View>
      )}

      <TextField
        label={t('lodging.nameLabel')}
        value={title}
        onChangeText={setTitle}
        maxLength={120}
        error={tried && !title.trim() ? t('lodging.nameLabel') : null}
      />

      <View style={styles.priceBlock}>
        <TextField
          label={t('lodging.priceLabel')}
          value={price}
          onChangeText={(text) => setPrice(text.replace(/[^\d,.\s]/g, ''))}
          keyboardType="decimal-pad"
          placeholder="112"
          error={tried && amount === null ? t('lodging.invalidPrice') : null}
        />
        <AppText variant="caption">{t('lodging.priceUnitLabel')}</AppText>
        <View style={styles.units} accessibilityRole="radiogroup">
          <Chip kind="radio" label={t('lodging.unitNight')} selected={unit === 'night'} onPress={() => setUnit('night')} />
          <Chip kind="radio" label={t('lodging.unitTotal')} selected={unit === 'total'} onPress={() => setUnit('total')} />
        </View>
        {amount !== null && <Estimate amount={amount} unit={unit} nights={nights} people={people} />}
      </View>

      <TextField
        label={t('lodging.noteLabel')}
        placeholder={t('lodging.notePlaceholder')}
        value={note}
        onChangeText={setNote}
        maxLength={140}
      />
    </FormScreen>
  );
}

/** "≈ 336 € le séjour · ≈ 84 € / pers." — always approximate, with what it leaves out. */
function Estimate({ amount, unit, nights, people }: { amount: number; unit: PriceUnit; nights: number | null; people: number }) {
  const { perNight, total, perPerson } = listingPrices({ priceAmount: amount, priceUnit: unit }, nights, people);
  if (nights === null) {
    return (
      <View style={styles.estimate}>
        <AppText variant="caption">{t('lodging.noDates')}</AppText>
      </View>
    );
  }
  const main = unit === 'night' && total !== null ? t('lodging.total', { price: formatEuros(total) }) : perNight !== null ? `≈ ${t('lodging.perNight', { price: formatEuros(perNight) })}` : '';
  return (
    <View style={styles.estimate}>
      <AppText style={styles.estimateMain}>
        {[main, perPerson !== null && people > 1 ? t('lodging.perPerson', { price: formatEuros(perPerson) }) : ''].filter(Boolean).join(' · ')}
      </AppText>
      <AppText variant="caption">
        {`${t('lodging.stayLine', { nights, people })} · ${t('lodging.excluded')}`}
      </AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  status: { flexDirection: 'row', alignItems: 'center', gap: space.s, marginTop: -space.s },
  dot: { width: 10, height: 10, borderRadius: 5 },
  preview: { borderRadius: radius.m, overflow: 'hidden', backgroundColor: colors.surface },
  photo: { height: 170 },
  previewText: { padding: space.m, gap: space.xs },
  source: { alignSelf: 'flex-start', paddingHorizontal: 10, paddingVertical: 3, borderRadius: radius.pill, backgroundColor: colors.white },
  priceBlock: { gap: space.s },
  units: { flexDirection: 'row', gap: space.s },
  estimate: { marginTop: space.xs, padding: space.m, borderRadius: radius.s, backgroundColor: colors.limeTint, gap: 2 },
  estimateMain: { fontFamily: fonts.display, fontSize: 17, lineHeight: 22 },
});
