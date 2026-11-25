import type { Translations } from './index';

const en: Translations = {
  common: {
    back: 'Back',
    continue: 'Continue',
  },
  welcome: {
    signatureLine1: 'Less talk.',
    signatureLine2: 'More trips.',
    pitch: 'Plan your trip with friends, without 400 WhatsApp messages.',
    start: 'Let’s go',
    haveCode: 'I have an invite code',
    photoLabel: 'Photo: your crew',
  },
  login: {
    title: 'Sign in',
    subtitle: 'No password to remember: we’ll email you a way to sign in.',
    emailLabel: 'Your email',
    emailPlaceholder: 'name@example.com',
    submit: 'Continue',
    socialSoon: 'Sign in with Apple and Google: coming soon.',
  },
  join: {
    title: 'Join the trip',
    subtitle: 'Enter the code your friend sent you.',
    codeLabel: 'Trip code',
    codePlaceholder: 'VOY-4K7P',
    submit: 'Join',
  },
  trips: {
    title: 'My trips',
    create: 'Create a trip',
    join: 'Join with a code',
    countdownSuffix: 'to go',
  },
  trip: {
    photoLabel: 'Photo: Amsterdam canals',
    departure: 'Leaving on {{date}}',
    countdownSuffix: 'to go',
    and: 'and',
    invite: 'Invite friends',
    remind: 'Nudge',
    missingBudget: '{{name}} hasn’t shared a budget yet.',
    votes: '{{count}} of {{total}} voted',
    youOwe: 'You owe {{name}}',
  },
};

export default en;
