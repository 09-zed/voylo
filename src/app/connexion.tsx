import { router } from 'expo-router';
import { useState } from 'react';

import { AppText } from '@/components/AppText';
import { Button } from '@/components/Button';
import { FormScreen } from '@/components/FormScreen';
import { TextField } from '@/components/TextField';
import { t } from '@/i18n';
import { colors } from '@/theme';

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const valid = EMAIL.test(email.trim());

  return (
    <FormScreen
      title={t('login.title')}
      subtitle={t('login.subtitle')}
      footer={
        <>
          {/* Step 3 of plan.md connects this to Supabase. For now it opens the demo. */}
          <Button label={t('login.submit')} disabled={!valid} onPress={() => router.replace('/voyages')} />
          <AppText variant="caption" color={colors.textMuted} style={{ textAlign: 'center' }}>
            {t('login.socialSoon')}
          </AppText>
        </>
      }
    >
      <TextField
        label={t('login.emailLabel')}
        placeholder={t('login.emailPlaceholder')}
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
        autoComplete="email"
        textContentType="emailAddress"
        autoCorrect={false}
        returnKeyType="go"
        onSubmitEditing={() => valid && router.replace('/voyages')}
      />
    </FormScreen>
  );
}
