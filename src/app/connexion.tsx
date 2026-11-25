import { router } from 'expo-router';
import { useState } from 'react';
import { StyleSheet } from 'react-native';

import { AppText } from '@/components/AppText';
import { Button } from '@/components/Button';
import { FormScreen } from '@/components/FormScreen';
import { TextField } from '@/components/TextField';
import { t } from '@/i18n';
import { useAuth } from '@/lib/auth';
import { friendlyAuthError } from '@/lib/authErrors';
import { colors } from '@/theme';

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function LoginScreen() {
  const { sendCode } = useAuth();
  const [email, setEmail] = useState('');
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const cleanEmail = email.trim().toLowerCase();
  const valid = EMAIL.test(cleanEmail);

  const submit = async () => {
    if (!valid || sending) return;

    setSending(true);
    setError(null);
    const failure = await sendCode(cleanEmail);
    setSending(false);

    if (failure) {
      setError(friendlyAuthError(failure));
      return;
    }
    router.push({ pathname: '/verification', params: { email: cleanEmail } });
  };

  return (
    <FormScreen
      title={t('login.title')}
      subtitle={t('login.subtitle')}
      footer={
        <>
          <Button label={t('login.submit')} disabled={!valid} loading={sending} onPress={submit} />
          <AppText variant="caption" color={colors.textMuted} style={styles.note}>
            {t('login.socialSoon')}
          </AppText>
        </>
      }
    >
      <TextField
        label={t('login.emailLabel')}
        placeholder={t('login.emailPlaceholder')}
        value={email}
        onChangeText={(value) => {
          setEmail(value);
          setError(null);
        }}
        keyboardType="email-address"
        autoCapitalize="none"
        autoComplete="email"
        textContentType="emailAddress"
        autoCorrect={false}
        autoFocus
        returnKeyType="go"
        onSubmitEditing={submit}
        error={error}
      />
    </FormScreen>
  );
}

const styles = StyleSheet.create({
  note: { textAlign: 'center' },
});
