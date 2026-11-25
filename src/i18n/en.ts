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
    subtitle: 'We’ll email you a 6-digit code. No password to remember.',
    emailLabel: 'Your email',
    emailPlaceholder: 'name@example.com',
    submit: 'Send my code',
    demoNote: 'Demo mode: sign-in isn’t connected yet.',
    socialSoon: 'Sign in with Apple and Google: coming soon.',
  },
  verify: {
    title: 'Enter your code',
    subtitle: 'We just sent it to {{email}}. Check your spam folder too.',
    codeLabel: '6-digit code',
    submit: 'Confirm',
    resend: 'Resend the code',
    resendIn: 'Resend the code in {{seconds}} s',
    resent: 'Done, a new code is on its way.',
  },
  profile: {
    title: 'What should we call you?',
    subtitle: 'Your first name is shown to friends on your trips.',
    firstNameLabel: 'Your first name',
    firstNamePlaceholder: 'Jamie',
    submit: 'That’s me',
  },
  errors: {
    generic: 'Oops, that didn’t work. Try again in a moment.',
    invalidCode: 'This code is wrong or has expired. Check it or ask for a new one.',
    tooMany: 'Too many attempts. Wait a minute before trying again.',
    network: 'No internet connection. Check your network and try again.',
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
    hello: 'Hi {{name}}!',
    signOut: 'Sign out',
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
