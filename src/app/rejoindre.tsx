import { router } from 'expo-router';
import { useState } from 'react';

import { Button } from '@/components/Button';
import { FormScreen } from '@/components/FormScreen';
import { TextField } from '@/components/TextField';
import { t } from '@/i18n';
import { reportError } from '@/lib/report';
import { joinTrip } from '@/lib/trips';

/** Normalises what people type into the "VOY-XXXX" format. */
function formatCode(input: string) {
  const raw = input.toUpperCase().replace(/[^A-Z0-9]/g, '').replace(/^VOY/, '').slice(0, 4);
  return raw.length > 0 ? `VOY-${raw}` : '';
}

export default function JoinScreen() {
  const [code, setCode] = useState('');
  const [joining, setJoining] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const complete = /^VOY-[A-Z0-9]{4}$/.test(code);

  const submit = async () => {
    if (!complete || joining) return;
    setJoining(true);
    setError(null);
    try {
      const id = await joinTrip(code);
      router.replace({ pathname: '/voyage/[id]', params: { id } });
    } catch (e) {
      reportError('join trip', e);
      const unknown = (e as Error).message?.includes('unknown_code');
      setError(unknown ? t('join.unknownCode') : t('errors.generic'));
      setJoining(false);
    }
  };

  return (
    <FormScreen
      title={t('join.title')}
      subtitle={t('join.subtitle')}
      footer={<Button label={t('join.submit')} disabled={!complete} loading={joining} onPress={submit} />}
    >
      <TextField
        label={t('join.codeLabel')}
        placeholder={t('join.codePlaceholder')}
        value={code}
        onChangeText={(value) => {
          setCode(formatCode(value));
          setError(null);
        }}
        autoCapitalize="characters"
        autoCorrect={false}
        autoComplete="off"
        autoFocus
        maxLength={8}
        returnKeyType="go"
        onSubmitEditing={submit}
        error={error}
        style={{ fontSize: 24, letterSpacing: 2 }}
      />
    </FormScreen>
  );
}
