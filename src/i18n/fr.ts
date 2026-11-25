const fr = {
  common: {
    back: 'Retour',
    continue: 'Continuer',
  },
  welcome: {
    signatureLine1: 'Moins de blabla.',
    signatureLine2: 'Plus de voyages.',
    pitch: 'Organise ton voyage entre potes, sans 400 messages sur WhatsApp.',
    start: 'C’est parti',
    haveCode: 'J’ai un code d’invitation',
    photoLabel: 'Photo : ta bande de potes',
  },
  login: {
    title: 'Connecte-toi',
    subtitle: 'Pas de mot de passe à retenir : on t’envoie de quoi te connecter par e-mail.',
    emailLabel: 'Ton e-mail',
    emailPlaceholder: 'prenom@exemple.fr',
    submit: 'Continuer',
    socialSoon: 'Connexion avec Apple et Google : bientôt.',
  },
  join: {
    title: 'Rejoins le voyage',
    subtitle: 'Tape le code que ton pote t’a envoyé.',
    codeLabel: 'Code du voyage',
    codePlaceholder: 'VOY-4K7P',
    submit: 'Rejoindre',
  },
  trips: {
    title: 'Mes voyages',
    create: 'Créer un voyage',
    join: 'Rejoindre avec un code',
    countdownSuffix: 'avant le départ',
  },
  trip: {
    photoLabel: 'Photo : les canaux d’Amsterdam',
    departure: 'Départ le {{date}}',
    countdownSuffix: 'avant le départ',
    and: 'et',
    invite: 'Inviter des amis',
    remind: 'Relancer',
    missingBudget: '{{name}} n’a pas encore donné son budget.',
    votes: '{{count}} votes sur {{total}}',
    youOwe: 'Tu dois à {{name}}',
  },
} as const;

export default fr;
