import { useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { StyleSheet } from 'react-native';

import { AppText } from '@/components/AppText';
import { Button } from '@/components/Button';
import { FormScreen } from '@/components/FormScreen';
import { TextField } from '@/components/TextField';
import { t } from '@/i18n';
import { useAuth } from '@/lib/auth';
import { friendlyAuthError } from '@/lib/authErrors';
import { colors, fonts } from '@/theme';

const CODE_LENGTH = 6;
const RESEND_DELAY = 60;

export default function VerifyScreen() {
  const { email = '' } = useLocalSearchParams<{ email: string }>();
  const { sendCode, verifyCode } = useAuth();
  const [code, setCode] = useState('');
  const [checking, setChecking] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [wait, setWait] = useState(RESEND_DELAY);

  useEffect(() => {
    if (wait <= 0) return;
    const timer = setTimeout(() => setWait((s) => s - 1), 1000);
    return () => clearTimeout(timer);
  }, [wait]);

  const check = async (value: string) => {
    if (value.length !== CODE_LENGTH || checking) return;
    setChecking(true);
    setError(null);
    const failure = await verifyCode(email, value);
    setChecking(false);
    // On success the navigator moves on by itself (see _layout.tsx).
    if (failure) setError(friendlyAuthError(failure));
  };

  const resend = async () => {
    setError(null);
    setInfo(null);
    setWait(RESEND_DELAY);
    const failure = await sendCode(email);
    if (failure) {
      setError(friendlyAuthError(failure));
    } else {
      setInfo(t('verify.resent'));
    }
  };

  return (
    <FormScreen
      title={t('verify.title')}
      subtitle={t('verify.subtitle', { email })}
      footer={
        <>
          <Button label={t('verify.submit')} disabled={code.length !== CODE_LENGTH} loading={checking} onPress={() => check(code)} />
          <Button
            label={wait > 0 ? t('verify.resendIn', { seconds: wait }) : t('verify.resend')}
            variant="link"
            disabled={wait > 0}
            onPress={resend}
          />
        </>
      }
    >
      <TextField
        label={t('verify.codeLabel')}
        value={code}
        onChangeText={(value) => {
          const digits = value.replace(/\D/g, '').slice(0, CODE_LENGTH);
          setCode(digits);
          setError(null);
          if (digits.length === CODE_LENGTH) check(digits);
        }}
        keyboardType="number-pad"
        textContentType="oneTimeCode"
        autoComplete="one-time-code"
        autoFocus
        maxLength={CODE_LENGTH}
        error={error}
        style={styles.code}
      />
      {info ? (
        <AppText variant="caption" color={colors.textMuted} accessibilityLiveRegion="polite">
          {info}
        </AppText>
      ) : null}
    </FormScreen>
  );
}

const styles = StyleSheet.create({
  code: { fontSize: 28, letterSpacing: 12, textAlign: 'center', fontFamily: fonts.bodyStrong },
});
