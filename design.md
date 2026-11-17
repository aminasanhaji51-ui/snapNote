# Design — SnapNote

> Référence du design. À lire avant de créer ou modifier un écran. Tout le style est dans
> [src/styles.css](src/styles.css) et passe par des **variables** : on change une couleur à un seul endroit.
> La maquette complète est dans [design/maquette/index.html](design/maquette/index.html) (à ouvrir dans un navigateur) : couleurs, typographie, formes, composants, icônes, mouvement et tous les écrans (intro, connexion, accueil, filtre, scan, lecture IA, justificatif) en téléphone et en ordinateur, sur une seule page.

## 1. Intention

Une application de notes de frais **sombre, chaleureuse et rapide**, pensée pour le téléphone : on photographie un justificatif, on vérifie, c'est parti. Le style s'inspire des applications bancaires mobiles : fond noir, halo orange qui monte du bas, chiffre géant en graisse légère, tuiles de transaction sur une surface sombre uniforme.

## 2. Cinq principes

1. **Le chiffre d'abord.** Le total du mois est l'élément le plus grand de l'écran (graisse 300, jusqu'à 72 px).
2. **Une seule couleur d'action : l'orange.** Il sert aux actions principales et à ce que l'IA a lu. Pas d'autre couleur vive.
3. **Une surface uniforme, un statut lisible.** Toutes les tuiles ont le même fond sombre. L'état se lit dans le libellé et l'icône (la coche et « Envoyée » sont en vert) ; un fin liseré à gauche (orange = envoi en cours, rouge = non envoyée) n'apparaît que lorsque la note demande de l'attention.
4. **Des formes douces.** Grands arrondis (16 à 32 px), boutons en forme de pilule, cercles pour les icônes.
5. **L'humain garde la main.** Ce que l'IA remplit est marqué (teinte orange) mais reste modifiable.

## 3. Couleurs

| Variable | Valeur | Usage |
|---|---|---|
| `--bg` | `#0a0a0a` | Fond de page |
| `--sheet` / `--sheet-2` / `--sheet-3` | `#121212` / `#1b1b1b` / `#242424` | Feuilles, champs, boutons ronds |
| `--line` | `#2a2a2a` | Bordures fines |
| `--text` / `--muted` / `--dim` | `#f6f2ec` / `#9a938b` / `#6f6963` | Texte principal, secondaire, discret |
| `--orange` → `--orange-2` | `#ee7a3f` → `#c9531f` | Actions (dégradé vertical) |
| `--orange-soft` | `#ff9a62` | Texte orange, brouillon, lecture IA |
| `--ok` | `#5ee0a0` | Uniquement la coche et le libellé « Envoyée » (jamais de fond vert) |
| `--danger` | `#ff8d85` | Erreurs, « Non envoyée » |
| `--c-resto` `--c-trans` `--c-fuel` `--c-fourn` `--c-heb` `--c-other` | `#d9602b` `#2f6fd0` `#1a9aa6` `#7e9a2e` `#b24c6b` `#5f5a55` | Catégories (restaurant, transport, carburant, fournitures, hébergement, autre) |

**Règle : aucune couleur écrite en dur dans un composant.** On utilise toujours une variable.

## 4. Typographie

- **Geist**, hébergée dans le projet (`public/fonts/`) : aucune requête externe, le design fonctionne hors ligne.
- Graisses : **300** pour les très grands chiffres et titres d'accueil, **400** texte, **500** titres et libellés.
- Montants : classe `.num` (chiffres tabulaires, ils s'alignent).
- Tailles : texte 15 px, légendes 12 à 13 px, titres de section 17 à 20 px, total du mois 48 à 72 px (`clamp`).

## 5. Formes et espacements

| Élément | Rayon |
|---|---|
| Grandes feuilles (carte principale, panneau) | 32 px (`--r-xl`) |
| Tuiles de liste, zones | 22 px (`--r-lg`) |
| Champs de saisie | 16 px (`--r-md`) |
| Boutons | 999 px (pilule) |
| Icônes | cercles |

Pas de grandes ombres : la profondeur vient des dégradés et de l'empilement (la carte principale chevauche le bandeau orange).

## 6. Composants

| Composant | Fichier | Rôle |
|---|---|---|
| `Select` | `components/Select.jsx` | Menu déroulant au design de l'app (remplace le `<select>` natif). Clavier : flèches, Entrée, Échap. |
| `Icon` | `components/Icons.jsx` | Icônes SVG au trait fin. Ajouter une icône = ajouter une entrée dans `PATHS`. |
| `Logo` | `components/Logo.jsx` | Pastille blanche + nom |
| `Topbar` | `components/Topbar.jsx` | Logo, et (connecté) nom, email, initiales et bouton de déconnexion |
| `Hero` | `components/Hero.jsx` | Total du mois (qui compte jusqu'à sa valeur), pastilles de catégories cliquables (filtre), bandeau « Scanner un justificatif » (icône + à gauche du texte) |
| `ReceiptList` | `components/ReceiptList.jsx` | Tuiles des notes (icône de catégorie, montant, statut), puce de filtre, ouverture du justificatif |
| `ReceiptViewer` | `components/ReceiptViewer.jsx` | Fenêtre du justificatif sur la même page (photo, montant, traçabilité) |
| `Splash` | `components/Splash.jsx` | Intro du premier chargement (logo, onde orange, barre) |
| `ReceiptForm` | `components/ReceiptForm.jsx` | Panneau « Nouvelle note » : viseur photo avec séquence de scan + champs |
| `Login` | `components/Login.jsx` | Connexion avec image en fond *(ajouté à l'étape 3)* |

Classes réutilisables : `.circle` (bouton rond), `.btn` + `.btn-white` / `.btn-orange`, `.field`, `.alert`, `.tone-resto|trans|fuel|fourn|heb|other`, `.filter-chip` (puce de filtre), `.ai-note` (messages de lecture IA).

Le hook `lib/useCountUp.js` anime le total ; `public/favicon.svg` et `apple-touch-icon.png` reprennent le logo.

## 7. États de l'interface

| Situation | Rendu |
|---|---|
| Chargement de la liste | Trois tuiles « squelette » qui scintillent |
| Liste vide | Cadre en pointillés avec un message (« Aucune note « Carburant » » quand un filtre est actif) |
| Lecture IA en cours | Photo assombrie, quadrillage et faisceau orange qui balaye avec une traîne, coins orange qui respirent, bouton « Reprendre » masqué ; message qui change d'étape (« Analyse de l'image… », « Lecture du texte… », « Repérage des montants… », « Vérification… ») avec une fine barre lumineuse |
| Lecture IA terminée | Coins qui se verrouillent, coche verte qui apparaît puis s'efface, champs lus illuminés un par un |
| Champ lu par l'IA | Bordure et dégradé orange à gauche, disparaissent dès que l'employé corrige |
| Avertissement de l'IA | Liste sous le message (ex. « HT + TVA ne donne pas le TTC ») |
| Erreur | Bandeau rouge doux (`.alert`) |
| Envoi en cours | Liseré orange à gauche qui « respire », icône qui tourne, libellé orange « Envoi en cours ». Pas de bouton de suppression. |
| Note envoyée | Tuile neutre, coche et libellé « Envoyée » en vert (apparaît en fondu, sans recharger la page), pas de bouton de suppression |
| Envoi non confirmé après 2 minutes | Liseré rouge à gauche, libellé rouge « Non envoyée », suppression possible |
| Filtre actif | Pastille choisie devant, cerclée d'orange, autres estompées ; puce « Carburant ✕ » à côté du titre de la liste, compteur filtré |
| Focus clavier | Contour orange clair (`:focus-visible`) |

## 7 bis. Mouvement

Le mouvement donne de la vie à l'interface sans la distraire. Il suit trois règles : **discret** (moins d'une demi-seconde), **utile** (il explique un changement) et **désactivable**.

| Où | Effet |
|---|---|
| Carte du total | Apparition en glissant ; le montant **compte jusqu'à sa nouvelle valeur** quand une note s'ajoute (`useCountUp`) |
| Tuiles de la liste | Apparition en cascade (60 ms de décalage par rang) ; une nouvelle note glisse à sa place |
| Statut « Envoyée » | Fondu à l'apparition quand l'envoi se confirme, sans recharger la page |
| Envoi en cours | Liseré orange qui respire, icône qui tourne |
| Premier chargement | Écran d'intro unique (≈1,5 s) : logo qui apparaît, onde orange, barre de chargement, fondu de sortie. Joué une seule fois par chargement de page, ignoré en mouvement réduit |
| Pastilles de catégories | Cliquables : filtrent la liste (la pastille choisie passe devant, cerclée d'orange, les autres s'estompent) ; nouveau clic ou puce « ✕ » pour retirer le filtre |
| Fenêtre du justificatif | Le bouton image ouvre une fenêtre sur la même page : fond flouté, carte qui monte, photo avec les coins de cadrage ; fermeture par la croix, Échap ou un clic à côté |
| Boutons | Léger enfoncement au toucher, léger éclaircissement au survol |
| Scan | Séquence en trois temps : analyse (faisceau, quadrillage, étapes), confirmation (coins verrouillés, coche), remplissage des champs |
| Tuiles (souris) | Légère élévation au survol |

**Respect de l'utilisateur** : si le système demande moins de mouvement (`prefers-reduced-motion`), toutes ces animations sont coupées et les valeurs changent instantanément.

## 8. Adaptation mobile

- **Le panneau « Nouvelle note » est toujours masqué** tant qu'on n'a pas appuyé sur « Scanner ». La page reste **centrée** (868 px au maximum), même sur un très grand écran.
- **Largeur ≥ 900 px** : le panneau glisse depuis la **droite** (440 px, à 16 px du bord), avec un voile sombre derrière (`.scrim`). « Scanner » ouvre d'abord le panneau : on y choisit la photo ou on saisit à la main.
- **Largeur < 900 px** : le panneau remonte du **bas** (feuille). « Scanner » ouvre directement l'appareil photo, puis la feuille.
- Dans les deux cas, il se ferme avec la croix, la touche **Échap** ou en touchant le voile.
- Le bandeau orange « Scanner un justificatif » (icône + à gauche du texte) est l'unique point d'entrée pour ajouter une note.
- **Connexion, grand écran** : la photo occupe un **grand cadre arrondi à gauche** (le téléphone et le ticket restent entièrement visibles, le slogan se pose sur le bas qui s'estompe) ; le formulaire a **son propre panneau à droite**, centré en hauteur (400 px de large). Rien ne se chevauche. La composition est limitée à 1680 px de large et la hauteur du cadre à 780 px.
- **Connexion, écran étroit** : une **zone photo dégagée en haut** (44 % de la hauteur de l'écran, entre 340 et 460 px) où le téléphone et le ticket se voient bien ; le slogan est centré en bas de la photo ; puis la carte de connexion **flotte au centre** (440 px de large au maximum, 16 px de marge de chaque côté, tous les coins arrondis). Elle ne s'étire jamais sur toute la largeur.

## 9. Image de la connexion

Fichier : `public/images/login-bg.jpg` (1920 px de large, environ 270 Ko). Un dégradé sombre est superposé dans le CSS pour garder le texte lisible. Le cadrage est réglé sur le téléphone et le ticket : sur mobile, `background-position: 56% top` dans `.login-bg` ; si tu changes l'image, ajuste cette valeur.

**Pour la remplacer** :
- Format paysage 16:9, **au moins 1600 px** de large, moins de 400 Ko.
- Zone **sombre en bas** (le titre et le formulaire s'y posent).
- Dominante chaude (orange, ambre) pour rester cohérente avec la marque.
- **Aucun visage identifiable, aucun logo, aucun texte lisible.**
- Source : photo libre de droits ou image générée par IA.

Prompt utilisé pour l'image actuelle : *photographie cinématographique d'une table de restaurant la nuit, vue légèrement de dessus, une main tient un smartphone à l'écran sombre pour photographier un ticket de caisse posé sur une table en bois sombre, à côté d'un café et d'un verre de vin rouge ; lumière orange terracotta venant de la gauche, ombres profondes, faible profondeur de champ, grain léger ; sans texte lisible, sans logo, sans visage.*

## 10. Accessibilité

- Contraste du texte principal sur fond noir supérieur à 15:1 ; le texte secondaire reste au-dessus de 4,5:1.
- Tout bouton qui n'a qu'une icône a un `aria-label`.
- Les statuts ne reposent pas que sur la couleur : ils portent une icône et un mot.
- Les messages d'état utilisent `role="status"` ou `role="alert"`.
- Les animations (intro, balayage, scintillement, compteur) s'arrêtent si l'utilisateur a demandé moins de mouvement (`prefers-reduced-motion`).

## 11. Règles pour l'IA (à respecter à chaque modification)

**À faire**
- Utiliser les variables CSS et les classes existantes avant d'en créer de nouvelles.
- Garder l'orange pour les actions et la lecture IA.
- Ajouter une icône dans `Icons.jsx` plutôt que d'installer une bibliothèque.
- Tester sur un écran de 390 px de large **et** sur un écran de bureau.
- Régénérer la maquette après un changement d'interface : `node design/build-maquette.mjs`.

**À ne pas faire**
- Pas de couleur écrite en dur dans un composant.
- Pas de mode clair, de nouvelle police ou de bibliothèque de composants sans le décider d'abord dans le PRD.
- Pas de dégradé violet ou bleu : ce n'est pas l'identité de SnapNote. Pas de fond vert : le vert ne sert qu'à la coche et au libellé « Envoyée ».
- Pas d'émoji dans l'interface.
- Ne pas retirer les `aria-label` ni les états de chargement, vide et erreur.

## 12. Étendre le design

- **Nouvelle animation** : la décrire dans la section « Mouvement », prévoir sa version `prefers-reduced-motion`, et la garder sous une demi-seconde.
- **Nouvelle catégorie** : ajouter une ligne dans `lib/categories.js`, une variable `--c-xxx` et une classe `.tone-xxx` dans `styles.css`, et l'icône dans `Icons.jsx`. Côté données : ajouter la valeur dans la contrainte de la base (voir `supabase/002_add_fuel_category.sql` comme modèle) et dans le prompt de l'IA (`api/_lib/extract.js`, `api/_lib/sanitize.js`).
- **Nouveau menu déroulant** : utiliser `<Select>` avec des `options` `{ value, label, icon?, tone? }`, jamais un `<select>` natif.
- **Nouvel écran** : repartir de `.board` (grille) et `.panel` (feuille) ; les titres de section utilisent `.sec`.
- **Mode clair** (non prévu) : il suffirait de redéfinir les variables de la section 3 dans un bloc `@media (prefers-color-scheme: light)` ; les composants n'ont pas à changer.
