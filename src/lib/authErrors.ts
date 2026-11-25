import { t } from '@/i18n';
import { reportError } from './report';

/** Turns Supabase auth error messages into something a person can act on. */
export function friendlyAuthError(message: string) {
  reportError('auth', { message });
  const m = message.toLowerCase();
  if (m.includes('expired') || m.includes('invalid') || m.includes('token')) {
    return t('errors.invalidCode');
  }
  if (m.includes('rate limit') || m.includes('security purposes') || m.includes('too many')) {
    return t('errors.tooMany');
  }
  if (m.includes('network') || m.includes('fetch')) {
    return t('errors.network');
  }
  return t('errors.generic');
}
