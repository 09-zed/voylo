# Voylo — Plan du projet

> **Voylo — Moins de blabla. Plus de voyages.**
> Transformer les voyages dont on parle depuis des mois en voyages que l'on réalise vraiment.

Ce document est notre référence pour tout le projet. On le met à jour à chaque décision importante.

- **Statut** : étapes 0 à 5 terminées. Maquettes de toute l'app validées (nouvelle navigation, onglets du voyage, swipe logement). Prochaine étape : la nouvelle navigation.
- **Maquettes de référence** : tableau « Voylo — Maquettes de l'app » (https://claude.ai/artifact/3Rrk1EXcxvN3G4TWPgsg1N)
- **Dernière mise à jour** : 25 novembre 2026 (maquettes de toute l'app, swipe logement)

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
Projet perso, destiné à devenir public. Pas d'échéance fixe : on avance étape par étape, en testant avec de vrais utilisateurs sur iPhone. Le premier groupe de test : 4 amis qui partent en week-end à Amsterdam le 30 décembre 2026.

---

## 2. Décisions prises

| Sujet | Décision |
|---|---|
| Plateformes | iOS et Android avec un seul code. Tests et finitions d'abord sur iPhone. |
| Stack | React Native + Expo (SDK 58) + TypeScript + Supabase |
| Connexion | Code à 6 chiffres reçu par e-mail (fonctionne dans Expo Go), puis Se connecter avec Apple et Google à l'étape 12 |
| Rejoindre un voyage | Installation de l'app obligatoire. Invitation par lien, avec un code de voyage court en secours (ex. `VOY-4K7P`). |
| Rôles | Un ou plusieurs organisateurs avec plus de droits. Les autres sont participants. |
| Dépenses | Calcul de « qui doit combien à qui » uniquement, sans paiement dans l'app. Euros seulement en V1. |
| Budget par personne | Tout compris : transport, logement, activités, repas et dépenses sur place |
| Groupe de test | 4 amis, week-end à Amsterdam, tous sur iPhone. Ils recevront l'app via TestFlight (étape 12). |
| Navigation | 3 onglets en bas : Accueil, Voyages, Profil. Dans un voyage, la barre du bas laisse la place aux 5 onglets du voyage : Aperçu, Dates, Sondages, Planning, Dépenses. |
| Choix du logement | Par swipe, comme une app de rencontre : à droite j'aime, à gauche non. L'annonce la plus likée gagne. |
| Prix des annonces | On tape le prix par nuit vu sur l'annonce (ou le total). L'app calcule le séjour et le prix par personne, toujours affichés comme une estimation. |
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
- Créer des sondages et voter (destination, dates, transport, activité)
- Choisir le logement en swipant les annonces proposées par le groupe
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
- Le swipe pour les activités et les restos, pas seulement le logement
- Partager une annonce depuis l'app Airbnb ou Booking directement vers Voylo
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

### Navigation
- **Accueil** : le prochain voyage en grand avec son compte à rebours, « À faire » (ce qui attend une action de ta part), « Ça bouge chez tes potes » (activité récente du groupe).
- **Voyages** : à venir et passés, bouton + pour créer, « Rejoindre avec un code ».
- **Profil** : photo, prénom, chiffres (voyages, jours ensemble, potes), annonce de la rétro façon Wrapped, réglages.
- **Dans un voyage** : grande photo, compte à rebours, membres, puis 5 onglets : Aperçu (tuiles dates, budget commun, sondages, dépenses, prochain rendez-vous), Dates, Sondages, Planning, Dépenses.

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

### Swipe logement
- **Ajouter une annonce** : n'importe quel membre colle un lien (Airbnb, Booking ou autre). L'app récupère tout ce qu'elle peut : photo, nom, note, chambres et lits. Pour Booking, qui bloque la lecture de ses pages, le nom est tiré du lien lui-même.
- **Ce qu'on remplit** : un seul champ obligatoire, le prix vu sur l'annonce, avec un interrupteur « par nuit / total ». Facultatif : une photo (si l'app n'en a pas trouvé) et un petit mot.
- **Calcul** : prix par nuit × nombre de nuits du voyage ÷ nombre de participants. Affiché « ≈ » avec ce qui n'est pas compris (frais de ménage et de service, taxe de séjour). Sans dates fixées, seul le prix par nuit s'affiche ; le reste se calcule dès que les dates sont fixées.
- **Swiper** : chacun passe les annonces une par une, à droite j'aime, à gauche non, avec un bouton pour annuler le dernier choix.
- **Verdict** : quand tout le monde a swipé (ou quand l'organisateur clôt), classement par nombre de likes. En cas d'égalité, l'organisateur tranche. Si tout le monde a liké la même annonce : écran « C'est un match ! ».
- **Après** : l'organisateur valide le logement ; le bouton mène à l'annonce pour réserver. Les doublons (même lien collé deux fois) sont repérés.

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

## 6. Écrans et parcours

Les maquettes de tous ces écrans sont sur le tableau « Voylo — Maquettes de l'app ».

### Entrée dans l'app
1. **Accueil (non connecté)** : la promesse de Voylo.
2. **Connexion** : e-mail puis code à 6 chiffres. Apple et Google s'ajoutent à l'étape 12.
3. **Profil express** : prénom (la photo viendra avec l'onglet Profil).

### Les 3 onglets
4. **Accueil** : prochain voyage, À faire, Ça bouge chez tes potes.
5. **Voyages** : à venir / passés, créer, rejoindre.
6. **Profil** : toi, tes chiffres, tes réglages.

### Dans un voyage
7. **Aperçu**, 8. **Dates**, 9. **Sondages**, 10. **Planning**, 11. **Dépenses**.
12. **Mes dispos et mon budget** (depuis l'Aperçu ou les Dates).
13. **Swipe logement** : les annonces, ajouter une annonce, swiper, le verdict, « C'est un match ».
14. **Réglages du voyage** (organisateur) : infos, participants, rôles.

### Créer et inviter
15. **Créer un voyage** : nom, ambiance, date de départ ou période.
16. **Inviter** : « C'est créé ! Invite ta bande », le code en sticker, partager.

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
- **Logo** : dessiné par toi (`assets/logo/voylo-logo.svg`) : « voylo. » en lettres noires très grasses, une ellipse lime en « orbite » et trois éclats bleu ciel. Sur fond lime, on utilise la variante avec l'ellipse blanche (`voylo-logo-sur-lime.svg`).
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
  - Un sticker « vedette » par écran, plus un ou deux petits au maximum. Jamais de sticker sur les écrans de chiffres (dépenses) ni dans les formulaires.
  - Les vraies photos du groupe passent avant tout le reste.
- **Stickers** : vrais stickers découpés (gros contour blanc, couleurs de la palette), générés par toi avec GPT à partir des prompts donnés le 25 novembre 2026 : avion, globe, cœur, valise, billet, polaroid, pin, soleil, palmier, montagne, éclat, peace, et 3 stickers texte (« C'est parti ! », « Entre potes », « On part ! »). Les 15 sont reçus, recadrés et rangés dans `assets/stickers/`, et placés sur les maquettes (Accueil, Voyages, Profil, Dates, Planning, Inviter, Swipe, Match). Emplacements visés : moments forts (accueil, invitation, dates fixées, match, rétro), écrans vides, en débordement sur les grandes photos.
- **Photos** : générées par toi à partir des prompts de `docs/prompts-photos.md`, puis rangées dans `assets/photos/`. Toutes intégrées : accueil, écran vide, et les 5 ambiances (Ville, Ville en hiver avec les canaux d'Amsterdam, Plage, Montagne, Road trip).

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
- `availability_days` : les jours où chaque membre est dispo ✅
- `member_preferences` : budget min et max, envies ✅
- `polls`, `poll_options`, `poll_votes` : les sondages
- `listings` : les annonces de logement (voyage, ajoutée par, lien, site, nom, photo, détails, prix, prix par nuit ou total, petit mot)
- `listing_swipes` : qui a liké ou non quelle annonce
- `itinerary_items` : les éléments du planning (V1.1)
- `expenses`, `expense_shares` : les dépenses et leur répartition (V1.2)

### Points d'attention
- **Expo Go a ses limites.** Les notifications push, les liens qui ouvrent l'app et Se connecter avec Apple demandent une **development build**. Sur iPhone, ça nécessite le **compte Apple Developer (99 $ par an)**. Prévu à l'étape 12.
- **Se connecter avec Apple** est exigé par Apple dès qu'une connexion Google est proposée.
- **E-mails de connexion** : envoyés par Resend. Tant qu'il n'y a pas de nom de domaine vérifié, Resend n'envoie qu'à ton adresse : à régler avant d'inviter les amis (étape 12).
- **Lire les annonces à partir d'un lien** (testé le 25 novembre 2026 depuis un serveur) : Airbnb donne la photo, le nom, la note, les chambres et lits ; Booking bloque la page (contrôle anti-robots), seul le nom tiré du lien est disponible ; aucun site ne donne le prix (il dépend des dates). On lit une seule page, uniquement quand quelqu'un colle un lien, comme un aperçu WhatsApp. Airbnb pourrait bloquer ça un jour : le remplissage à la main reste toujours possible.
- **Liens « Partager » des apps Airbnb et Booking** : souvent des liens courts sans le nom dedans. À tester avant de coder le swipe.
- **Les achats premium** passeront par Apple et Google, qui prennent 15 à 30 % de commission. À intégrer dans le calcul du prix le moment venu.
- **Expo évolue vite.** On vérifie chaque fonctionnalité dans la documentation officielle d'Expo 58 avant de la coder (voir `AGENTS.md`).

---

## 9. Étapes

Chaque étape se termine par quelque chose que tu peux tester sur ton iPhone.

| # | Étape | Ce que tu testes |
|---|---|---|
| 0 | ✅ **Fondations** : projet Expo, GitHub, Expo Go | L'écran « Voylo — Ça marche ! » |
| 1 | ✅ **Identité** : direction artistique, logo, couleurs, typos, photos | Les maquettes |
| 2 | ✅ **Socle de l'app** : navigation, composants de base, traductions, thème | Une navigation avec le vrai style Voylo |
| 3 | ✅ **Comptes** : projet Supabase, connexion par code e-mail, prénom | Créer ton compte et te connecter |
| 4 | ✅ **Voyages et invitations** : créer, lister, rejoindre avec un code | Créer un voyage, le rejoindre |
| 5 | ✅ **Dispos, budget et dates compatibles** | Tes dispos, le calendrier du groupe, le budget commun |
| 6 | **Nouvelle navigation** : onglets Accueil, Voyages, Profil ; onglets du voyage ; Accueil social | L'app avec sa vraie structure |
| 7 | **Dépenses** : ajouter, répartir, soldes, « pour être quittes » | Ajouter des dépenses et voir qui doit quoi |
| 8 | **Sondages et swipe logement** | Ajouter des annonces, swiper, voir le verdict |
| 9 | **Planning** jour par jour | Construire le programme d'un voyage |
| 10 | **Gérer son voyage** : modifier, quitter, retirer quelqu'un, photo de profil, mises à jour en direct | Changer les infos d'un voyage |
| 11 | **Finitions et stickers** : animations, célébrations, états vides | La V1 complète |
| 12 | **Passage en vrai** : compte Apple Developer, version TestFlight, connexion Apple et Google, nom de domaine, liens d'invitation, notifications | L'app installée « pour de vrai », envoyée à tes amis |
| 13 | **Lancement public** : App Store, page de présentation, politique de confidentialité | — |

L'ordre des étapes 7 à 12 peut bouger. Pour que tes amis utilisent Voylo pendant le week-end du 30 décembre, il faudra faire l'étape 12 avant, et l'inscription Apple Developer peut prendre quelques jours : mieux vaut la lancer tôt.

---|---|---|
| 0 | ✅ **Fondations** : projet Expo, GitHub, Expo Go | L'écran « Voylo — Ça marche ! » |
| 1 | ✅ **Identité et maquettes** : direction artistique, logo, couleurs, typos, maquettes des écrans clés | Les maquettes en images ou en prototype cliquable |
| 2 | ✅ **Socle de l'app** : navigation, composants de base, traductions, thème | Une navigation entre écrans vides, avec le vrai style Voylo |
| 3 | ✅ **Comptes** : projet Supabase, connexion par code e-mail, profil express | Créer ton compte et te connecter |
| 4 | ✅ **Voyages et invitations** : créer, lister, rejoindre avec un code | Créer un voyage, le rejoindre depuis un autre compte |
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
| Apple Developer | Development build, TestFlight, App Store | 99 $ par an | Étape 12 |
| Google Cloud | Se connecter avec Google | Gratuit | Étape 12 |
| Nom de domaine | Liens d'invitation, e-mails aux amis, site vitrine | Environ 10 à 15 € par an | Étape 12 |
| Google Play | Publication Android | 25 $ une fois | Plus tard |

---

## 11. Méthode de travail

### Ta routine pour tester
Dans PowerShell, dans le dossier `voylo` :
```bash
git pull
npx expo start --tunnel
```
Lance `npm install` en plus quand `git pull` affiche `package.json` dans les fichiers modifiés.

### Nos règles
- Ce plan est la référence. Si une décision change, on le met à jour.
- Une étape à la fois, testée sur iPhone avant de passer à la suite.
- Toute fonctionnalité Expo est vérifiée dans la documentation officielle avant d'être codée.
- Vérification du code (lint et types) avant chaque envoi.
- Les textes de l'app ne sont jamais écrits en dur : ils passent par les fichiers de traduction.

---

## 12. Questions ouvertes
- L'ordre des étapes 7 à 12, selon ce qui doit être prêt pour le week-end à Amsterdam du 30 décembre.
- Le nom de domaine (voylo.app, getvoylo.com…) : au plus tard à l'étape 12.
- Étendre le swipe aux activités et aux restos ?
