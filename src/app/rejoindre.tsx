import { router } from 'expo-router';
import { useState } from 'react';

import { Button } from '@/components/Button';
import { FormScreen } from '@/components/FormScreen';
import { TextField } from '@/components/TextField';
import { t } from '@/i18n';

/** Normalises what people type into the "VOY-XXXX" format. */
function formatCode(input: string) {
  const raw = input.toUpperCase().replace(/[^A-Z0-9]/g, '').replace(/^VOY/, '').slice(0, 4);
  return raw.length > 0 ? `VOY-${raw}` : '';
}

export default function JoinScreen() {
  const [code, setCode] = useState('');
  const complete = /^VOY-[A-Z0-9]{4}$/.test(code);

  return (
    <FormScreen
      title={t('join.title')}
      subtitle={t('join.subtitle')}
      footer={
        // Step 4 of plan.md checks the code against Supabase. For now it opens the demo trip.
        <Button label={t('join.submit')} disabled={!complete} onPress={() => router.replace('/voyages/amsterdam')} />
      }
    >
      <TextField
        label={t('join.codeLabel')}
        placeholder={t('join.codePlaceholder')}
        value={code}
        onChangeText={(value) => setCode(formatCode(value))}
        autoCapitalize="characters"
        autoCorrect={false}
        autoComplete="off"
        maxLength={8}
        style={{ fontSize: 24, letterSpacing: 2 }}
      />
    </FormScreen>
  );
}
