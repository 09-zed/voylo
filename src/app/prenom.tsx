import { useState } from 'react';

import { Button } from '@/components/Button';
import { FormScreen } from '@/components/FormScreen';
import { TextField } from '@/components/TextField';
import { t } from '@/i18n';
import { useAuth } from '@/lib/auth';
import { friendlyAuthError } from '@/lib/authErrors';

export default function ProfileScreen() {
  const { saveFirstName } = useAuth();
  const [firstName, setFirstName] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const valid = firstName.trim().length > 0;

  const submit = async () => {
    if (!valid || saving) return;
    setSaving(true);
    setError(null);
    const failure = await saveFirstName(firstName);
    setSaving(false);
    // On success the navigator opens the home tab by itself (see _layout.tsx).
    if (failure) setError(friendlyAuthError(failure));
  };

  return (
    <FormScreen
      title={t('profile.title')}
      subtitle={t('profile.subtitle')}
      showBack={false}
      footer={<Button label={t('profile.submit')} disabled={!valid} loading={saving} onPress={submit} />}
    >
      <TextField
        label={t('profile.firstNameLabel')}
        placeholder={t('profile.firstNamePlaceholder')}
        value={firstName}
        onChangeText={(value) => {
          setFirstName(value);
          setError(null);
        }}
        autoCapitalize="words"
        autoComplete="given-name"
        textContentType="givenName"
        autoFocus
        maxLength={40}
        returnKeyType="done"
        onSubmitEditing={submit}
        error={error}
      />
    </FormScreen>
  );
}
