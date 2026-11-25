# Voylo — Plan du projet

> **Voylo — Moins de blabla. Plus de voyages.**
> Transformer les voyages dont on parle depuis des mois en voyages que l'on réalise vraiment.

Ce document est notre référence pour tout le projet. On le met à jour à chaque décision importante.

- **Statut** : étapes 0 à 3 terminées, étape 4 (voyages et invitations) codée, en test
- **Dernière mise à jour** : 25 novembre 2026

---

## 1. Vision

### Le problème
Organiser un voyage en groupe est compliqué :
- des conversations WhatsApp interminables ;
- des désaccords sur les dates et les destinations ;
- des budgets différents ;
- des liens de réservation éparpillés ;
- des dépenses difficiles à répartir.

Au final, une seule personne gère toute l'organisation.

### La solution
Voylo centralise toute l'organisation du voyage dans un espace collaboratif, intuitif et ludique.

### Pour qui
Les 18–30 ans (étudiants, jeunes actifs, groupes d'amis) qui organisent ensemble des week-ends, des vacances ou des road trips.

### Positionnement
Voylo est une **application sociale et lifestyle qui donne envie de voyager**, pas un outil de productivité. L'expérience doit être fluide, spontanée, chaleureuse et engageante.

### Contexte
Projet perso, destiné à devenir public. Pas d'échéance fixe : on avance étape par étape, en testant avec de vrais utilisateurs sur iPhone. Le premier groupe de test : 4 amis qui préparent un week-end à Amsterdam (destination déjà choisie, date à préciser).

---

## 2. Décisions prises

| Sujet | Décision |
|---|---|
| Plateformes | iOS et Android avec un seul code. Tests et finitions d'abord sur iPhone. |
| Stack | React Native + Expo (SDK 58) + TypeScript + Supabase |
| Connexion | Code à 6 chiffres reçu par e-mail (fonctionne dans Expo Go), puis Se connecter avec Apple et Google à l'étape 8 |
| Rejoindre un voyage | Installation de l'app obligatoire. Invitation par lien, avec un code de voyage court en secours (ex. `VOY-4K7P`). |
| Rôles | Un ou plusieurs organisateurs avec plus de droits. Les autres sont participants. |
| Dépenses | Calcul de « qui doit combien à qui » uniquement, sans paiement dans l'app. Euros seulement en V1. |
| Budget par personne | Tout compris : transport, logement, activités, repas et dépenses sur place |
| Groupe de test | 4 amis, week-end à Amsterdam, tous sur iPhone. Ils recevront l'app via TestFlight (étape 8). |
| Langues | Français d'abord, anglais ensuite. Code prévu pour les deux dès le départ. |
| Hors connexion | Consultation du planning hors ligne en V1. Ajout hors ligne plus tard. |
| Données | Supabase hébergé en Europe (RGPD) |
| IA | Utile pour des recommandations, jamais indispensable au fonctionnement |
| Identité visuelle | Validée : stickers et scrapbook, lime / ciel / sunset / noir, Montserrat + Inter (voir section 7) |
| Photos | Images libres de droits pour l'onboarding et les écrans vides, photos des utilisateurs ensuite |
| Monétisation | Freemium + pass premium à 9,99 € par voyage pour tout le groupe. **Pas en V1.** |

---

## 3. Périmètre

### V1.0 — « On se met d'accord »
- Créer un voyage (nom, photo de couverture, période envisagée)
- Inviter ses amis (lien de partage + code de voyage)
- Renseigner ses disponibilités, son budget et ses préférences
- Voir les dates compatibles avec tout le groupe
- Créer des sondages et voter (destination, dates, logement, transport, activité)
- Compte à rebours avant le départ, une fois les dates fixées

### V1.1 — « On organise »
- Planning collaboratif jour par jour
- Liens et informations de réservation rattachés au planning
- Budget prévisionnel du voyage

### V1.2 — « On paie »
- Enregistrer les dépenses
- Répartir les dépenses entre participants
- Soldes et remboursements simplifiés (le moins de virements possible)

### Plus tard
- Photos et souvenirs du séjour
- Rétrospective du voyage, dans l'esprit de Spotify Wrapped
- Suggestions de destinations compatibles (budget, préférences, éventuellement IA)
- Pass premium
- Plusieurs devises
- Ajout de dépenses hors ligne
- Version anglaise complète
- Partenariats et affiliation sur les réservations
- Publication sur le Google Play Store

---

## 4. Fonctionnalités en détail (V1)

### Voyage
- Créé par un utilisateur, qui en devient organisateur.
- Contient : nom, photo de couverture, période envisagée (ex. « été 2027 »), puis les dates et la destination une fois choisies.
- Statuts : **En discussion** → **Dates fixées** → **En cours** → **Terminé**.

### Invitation
- L'organisateur partage un lien (via WhatsApp, iMessage…).
- Le lien ouvre l'app si elle est installée, sinon il mène à l'App Store.
- Le code de voyage reste visible dans le lien et dans l'app, en secours si le lien se perd pendant l'installation.
- Objectif : **moins de 30 secondes** entre l'ouverture de l'invitation et l'arrivée dans le voyage (hors installation).

### Disponibilités, budget, préférences
- Chaque participant indique ses plages de dates disponibles dans la période du voyage.
- Budget : une fourchette par personne, tout compris (ex. 300–500 € pour transport, logement, activités, repas et dépenses sur place).
- Préférences : quelques choix rapides et visuels (plage, ville, nature, fête, détente, culture…), pas de formulaire long.

### Dates compatibles
- Un calendrier coloré montre, jour par jour, combien de participants sont disponibles.
- Les meilleures plages sont mises en avant (ex. « 5/6 dispo du 12 au 16 juillet »).
- L'organisateur peut transformer une plage en sondage ou la fixer directement.

### Sondages
- Types : destination, dates, logement, transport, activité, ou libre.
- Une option peut contenir un titre, un lien, un prix, une photo et une note.
- Vote simple ou choix multiple, au choix du créateur.
- L'organisateur clôture le sondage. Le résultat peut alimenter le voyage (destination, dates) ou le planning.

### Compte à rebours
- S'affiche dès que les dates sont fixées.
- Mis en avant en haut du voyage. C'est le moment « on part vraiment ».

### Planning (V1.1)
- Une vue par jour, avec des éléments : activité, transport, logement, repas, libre.
- Chaque élément peut avoir une heure, un lieu, un lien de réservation, un prix et une personne responsable.

### Dépenses (V1.2)
- Qui a payé, combien, pour quoi, et pour qui.
- Répartition égale, par parts, ou par montants précis.
- Écran « Soldes » : qui doit combien à qui, avec le moins de remboursements possible.
- Un remboursement est marqué comme réglé à la main.

---

## 5. Rôles et droits

| Action | Organisateur | Participant |
|---|:-:|:-:|
| Modifier les infos du voyage | ✅ | — |
| Inviter des amis | ✅ | ✅ |
| Retirer un participant | ✅ | — |
| Nommer un autre organisateur | ✅ | — |
| Fixer les dates et la destination | ✅ | — |
| Créer un sondage | ✅ | ✅ |
| Clôturer un sondage | ✅ | Seulement le sien |
| Ajouter au planning | ✅ | ✅ |
| Ajouter une dépense | ✅ | ✅ |
| Supprimer le voyage | ✅ | — |
| Quitter le voyage | ✅ (s'il reste un autre organisateur) | ✅ |

---

## 6. Écrans et parcours (V1.0)

### Parcours principal
1. **Accueil (non connecté)** : on présente Voylo et sa promesse.
2. **Connexion** : e-mail puis code à 6 chiffres. Apple et Google s'ajoutent à l'étape 8.
3. **Profil express** : prénom et photo, c'est tout.
4. **Mes voyages** : la liste des voyages en cours et à venir, plus un bouton « Créer un voyage » et une option « Rejoindre avec un code ».
5. **Créer un voyage** : nom, photo de couverture, période envisagée.
6. **Inviter** : lien et code à partager.
7. **Accueil du voyage** : participants, compte à rebours ou état d'avancement, prochaines actions (« 3 amis n'ont pas encore indiqué leurs dispos »), sondages en cours.
8. **Mes dispos et mon budget** : sélection des plages de dates, fourchette de budget, préférences.
9. **Dates compatibles** : calendrier du groupe et meilleures plages.
10. **Sondages** : liste, création, vote, résultats.
11. **Réglages du voyage** (organisateur) : infos, participants, rôles.

### Parcours de l'invité
Le lien d'invitation mène à l'App Store, puis à l'installation et à la connexion. L'invité arrive directement dans le voyage, ou y entre avec le code. Il renseigne alors ses dispos et son budget.

---

## 7. Direction artistique

### Ambition
Une identité **moderne, premium, jeune et reconnaissable**.

### L'esprit à retrouver
On s'inspire de l'esprit de ces références, sans copier leurs écrans :
- **Airbnb** : l'immersion par la photo, l'envie d'ailleurs.
- **Locket** : l'intimité et la spontanéité entre amis.
- **Revolut** : la clarté des chiffres et de l'argent.
- **Spotify Wrapped** : l'audace graphique, le fun, l'envie de partager.

### Principes
- Mobile-first, pensé pour le pouce.
- Typographie expressive, avec du caractère.
- Couleurs affirmées.
- Photographies authentiques, pas de photos de stock trop lisses.
- Illustrations originales.
- Micro-interactions et animations soignées : vote, validation, compte à rebours, célébrations.
- Ton chaleureux, direct, un peu joueur. On tutoie.

### À éviter
- Les interfaces génériques qui ressemblent à des apps générées par IA : dégradés violets par défaut, cartes toutes identiques, icônes génériques.
- Le look « outil de gestion de projet » : tableaux, listes austères.
- Le jargon.

### Identité validée (étape 1)
Maquettes de référence : tableau « Voylo — Pistes typo », section « Direction Voylo ».

- **Style** : énergique, stickers et scrapbook. Photos scotchées façon polaroid, surlignages lime légèrement inclinés, doodles dessinés à la main (avion, cœur, traits d'énergie).
- **Logo** : « voylo. » en minuscules, avec le point, en Montserrat ExtraBold noir, avec un contour blanc façon sticker.
- **Icône de l'app** : « v. » noir sur fond lime, coins arrondis.
- **Palette** :

| Nom | Valeur | Usage |
|---|---|---|
| Lime | `#C7FF00` | Actions, mises en avant, surlignage |
| Ciel | `#6EC6FF` | Évasion, grands fonds |
| Sunset | `#FF7A00` | Stickers, rappels, doodles |
| Noir | `#000000` | Texte, boutons principaux |
| Blanc | `#FFFFFF` | Fonds d'écran, cadres photo |

- **Typographie** : Montserrat ExtraBold pour les titres, Inter pour les textes et l'interface.
- **Règles** :
  - Texte toujours noir sur le lime, le bleu et l'orange. Le lime n'est jamais une couleur de texte sur fond blanc.
  - Une seule touche « sticker » par écran : compte à rebours, photo scotchée ou surlignage, pas les trois.
  - Les vraies photos du groupe passent avant tout le reste.
- **Photos** : générées par toi à partir des prompts de `docs/prompts-photos.md`, puis rangées dans `assets/photos/`.

---

## 8. Technique

### Stack
| Besoin | Choix |
|---|---|
| App | Expo SDK 58, React Native, TypeScript |
| Navigation | Expo Router (écrans dans `src/app/`) |
| Backend | Supabase : base Postgres, authentification, temps réel, stockage des fichiers |
| Sécurité des données | Règles d'accès Supabase (RLS) : on ne voit que les voyages dont on est membre |
| Données côté app | TanStack Query, avec un cache conservé pour la consultation hors ligne |
| Animations | React Native Reanimated |
| Traductions | Système de traduction FR/EN dès le départ, avec tous les textes dans des fichiers dédiés |
| Notifications | Expo Notifications (nécessite une development build) |
| Builds et distribution | EAS Build, puis TestFlight pour les testeurs iPhone |

### Modèle de données (première esquisse)
- `profiles` : prénom, photo, langue
- `trips` : nom, couverture, période, dates, destination, statut, code d'invitation
- `trip_members` : voyage, utilisateur, rôle (organisateur ou participant)
- `availabilities` : membre, plages de dates
- `member_preferences` : membre, budget min et max, préférences
- `polls`, `poll_options`, `poll_votes` : les sondages
- `itinerary_items` : les éléments du planning (V1.1)
- `expenses`, `expense_shares` : les dépenses et leur répartition (V1.2)

### Points d'attention
- **Expo Go a ses limites.** Les notifications push, les liens qui ouvrent l'app et Se connecter avec Apple demandent une **development build**. Sur iPhone, ça nécessite le **compte Apple Developer (99 $ par an)**. Prévu vers la fin de la V1.0.
- **Se connecter avec Apple** est exigé par Apple dès qu'une connexion Google est proposée.
- **E-mails de connexion** : le service d'e-mail fourni par Supabase n'envoie qu'aux membres de l'équipe du projet, avec une limite très basse. Avant d'inviter les amis (étape 8), il faudra brancher un vrai service d'envoi d'e-mails (ex. Resend, gratuit pour démarrer).
- **Les achats premium** passeront par Apple et Google, qui prennent 15 à 30 % de commission. À intégrer dans le calcul du prix le moment venu.
- **Expo évolue vite.** On vérifie chaque fonctionnalité dans la documentation officielle d'Expo 58 avant de la coder (voir `AGENTS.md`).

---

## 9. Étapes

Chaque étape se termine par quelque chose que tu peux tester sur ton iPhone.

| # | Étape | Ce que tu testes |
|---|---|---|
| 0 | ✅ **Fondations** : projet Expo, GitHub, Expo Go | L'écran « Voylo — Ça marche ! » |
| 1 | ✅ **Identité et maquettes** : direction artistique, logo, couleurs, typos, maquettes des écrans clés | Les maquettes en images ou en prototype cliquable |
| 2 | ✅ **Socle de l'app** : navigation, composants de base, traductions, thème | Une navigation entre écrans vides, avec le vrai style Voylo |
| 3 | ✅ **Comptes** : projet Supabase, connexion par code e-mail, profil express | Créer ton compte et te connecter |
| 4 | **Voyages et invitations** : créer, lister, rejoindre avec un code | Créer un voyage, le rejoindre depuis un autre compte |
| 5 | **Dispos, budget et dates compatibles** | Renseigner tes dispos et voir le calendrier du groupe |
| 6 | **Sondages** | Créer un sondage, voter, clôturer |
| 7 | **Compte à rebours et finitions de la V1.0** : animations, états vides, erreurs | La V1.0 complète |
| 8 | **Passage en vrai** : compte Apple Developer, development build, connexion Apple et Google, liens d'invitation, notifications, TestFlight | L'app installée « pour de vrai », envoyée à tes amis |
| 9 | **V1.1 — Planning** | Construire le programme d'un voyage |
| 10 | **V1.2 — Dépenses** | Ajouter des dépenses et voir les soldes |
| 11 | **Préparation du lancement public** : App Store, page de présentation, politique de confidentialité | — |

---

## 10. Comptes et coûts

| Service | Usage | Coût | Quand |
|---|---|---|---|
| GitHub | Code | Gratuit | ✅ Fait |
| Expo | Expo Go, builds | Gratuit pour démarrer | ✅ Fait |
| Supabase | Base de données, connexion (projet « voylo », Francfort) | Gratuit pour démarrer | ✅ Fait |
| Resend | Envoi des e-mails de connexion | Gratuit jusqu'à 3 000 e-mails par mois | ✅ Fait (n'envoie qu'à ton adresse tant qu'il n'y a pas de domaine) |
| Apple Developer | Development build, TestFlight, App Store | 99 $ par an | Étape 8 |
| Google Cloud | Se connecter avec Google | Gratuit | Étape 8 |
| Nom de domaine | Liens d'invitation, site vitrine | Environ 10 à 15 € par an | Étape 8 |
| Google Play | Publication Android | 25 $ une fois | Plus tard |

---

## 11. Méthode de travail

### Ta routine pour tester
Dans PowerShell, dans le dossier `voylo` :
```bash
git pull
npx expo start --tunnel
```
Lance `npm install` en plus quand je te le signale.

### Nos règles
- Ce plan est la référence. Si une décision change, on le met à jour.
- Une étape à la fois, testée sur iPhone avant de passer à la suite.
- Toute fonctionnalité Expo est vérifiée dans la documentation officielle avant d'être codée.
- Vérification du code (lint et types) avant chaque envoi.
- Les textes de l'app ne sont jamais écrits en dur : ils passent par les fichiers de traduction.

---

## 12. Questions ouvertes
- La date du week-end à Amsterdam : elle fixera la date cible de la V1.0 et dira si le périmètre doit être resserré.
- Le nom de domaine (voylo.app, getvoylo.com…) : on décide plus tard, au plus tard à l'étape 8.
