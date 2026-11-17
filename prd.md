# PRD — SnapNote

> Source de vérité du produit. Toute fonctionnalité doit pouvoir être reliée à une section de ce document.
> Quand le produit évolue, on met à jour le PRD **avant** de coder.

## Comment lire ce PRD

Ce document décrit **le produit final** : c'est la destination. Le starter que tu as entre les mains n'en réalise qu'une partie, tu construis le reste pendant la démo.

- **[x]** : déjà fourni par le starter, rien à faire.
- **[ ]** : à construire pendant la démo, étape par étape (l'étape est indiquée dans le titre de chaque user story).

| | Starter (point de départ) | Produit final (cible) |
|---|---|---|
| Connexion | aucune : l'app s'ouvre directement | page de connexion, comptes créés par l'administrateur |
| Données | en mémoire, perdues au rechargement | table Supabase protégée par RLS, photos dans un bucket privé |
| Lecture du ticket | saisie à la main | lecture automatique par une IA de vision |
| Envoi au comptable | non | email automatique avec la photo, via n8n |
| Qualité et mise en ligne | non | CI (5 contrôles) et déploiement Vercel |

## 1. Vision

SnapNote permet à un employé de **photographier un ticket ou une facture** (restaurant, train, fournitures…), d'en extraire automatiquement les informations (enseigne, date, HT, TVA, TTC) et de **l'envoyer instantanément au comptable**. Chaque scan est rattaché à son auteur : on sait toujours qui a scanné quoi, et quand.

## 2. Utilisateurs

- **Employés** : se connectent avec le compte créé pour eux par l'administrateur. **Il n'y a pas d'inscription publique.**
- **Comptable** : n'a pas de compte. Il reçoit les justificatifs par email.

## 3. Objectifs

| Objectif | Métrique |
|---|---|
| Saisir une note de frais en moins de 10 secondes | Photo → enregistrement en 3 actions maximum |
| Zéro justificatif perdu | Chaque photo est stockée et rattachée à son auteur |
| Transmission immédiate | Le comptable reçoit l'email dans la minute suivant l'envoi |

## 4. User stories et critères d'acceptation

### US1 — Prendre un justificatif en photo *(étape 2 : starter)*
- [x] Le bouton ouvre l'appareil photo du téléphone (ou le sélecteur de fichier sur ordinateur)
- [x] La photo s'affiche en aperçu avant enregistrement
- [x] Les champs sont : enseigne, date, montant HT, montant TTC, catégorie
- [x] La TVA est calculée (TTC − HT) et affichée
- [x] Impossible d'enregistrer sans enseigne, date et TTC

### US2 — Consulter mes notes *(étape 2 : starter)*
- [x] La liste est triée de la plus récente à la plus ancienne
- [x] Chaque ligne affiche une icône de catégorie, l'enseigne, la date et le TTC
- [x] Le total du mois est affiché : il compte les notes **enregistrées** ce mois-ci, quelle que soit la date imprimée sur le ticket
- [x] Je peux supprimer une note
- [x] Je peux filtrer la liste en cliquant sur une catégorie (pastilles du total du mois), et retirer le filtre d'un clic
- [x] Un bouton ouvre le justificatif dans une fenêtre, sur la même page (fermeture par Échap, clic à l'extérieur ou bouton)

### US3 — Se connecter *(étape 3)*
- [ ] La page de connexion ne propose **aucune** création de compte
- [ ] La création de compte est aussi désactivée côté Supabase (pas seulement masquée dans l'UI)
- [ ] Sans session, seule la page de connexion est affichée (pas de routeur : l'app bascule selon la session)
- [ ] L'email de l'employé connecté est affiché, avec un bouton de déconnexion
- [ ] Les erreurs de connexion sont expliquées en français (identifiants incorrects, compte inactif, réseau…)
- [ ] Si les variables d'environnement manquent, un message de configuration s'affiche au lieu d'une page blanche

### US4 — Tracer qui a scanné quoi *(étape 4)*
- [ ] Chaque note est enregistrée dans Supabase avec l'identifiant et l'email de son auteur
- [ ] La date et l'heure du scan sont conservées
- [ ] Un employé ne voit que ses propres notes (RLS), et ne peut modifier ou supprimer que celles qui sont encore en brouillon
- [ ] Les photos sont dans un bucket privé, accessibles uniquement à leur auteur
- [ ] Le champ `user_id` est rempli par la base (`auth.uid()`), jamais par le navigateur

### US5 — Lecture automatique par IA *(étape 5)*
- [ ] Après la photo, une IA de vision lit enseigne, date, HT, TVA, TTC et propose une catégorie
- [ ] Les champs sont pré-remplis et restent modifiables
- [ ] Si la lecture échoue, l'utilisateur peut saisir à la main (l'app reste utilisable)
- [ ] La clé de l'IA n'est jamais exposée au navigateur (appel via le backend)
- [ ] La note indique si elle a été remplie par l'IA ou à la main
- [ ] Le backend refuse toute requête sans session valide (la clé IA n'est pas consommable par n'importe qui)
- [ ] Les réponses de l'IA sont validées (format, date, montants) et les incohérences sont signalées à l'utilisateur

### US6 — Envoyer au comptable *(étape 6)*
- [ ] **Dès qu'une note est enregistrée**, n8n est prévenu automatiquement (webhook de base de données Supabase, évènement Insert)
- [ ] Le comptable reçoit un email avec un tableau récapitulatif (enseigne, date, HT, TVA, TTC, catégorie, auteur, date de scan) et la photo en pièce jointe
- [ ] Si la note n'a pas de photo, l'email part quand même, avec la mention « Aucune photo jointe »
- [ ] Juste après l'enregistrement, la note affiche « Envoi en cours », puis passe à « Envoyée » toute seule, sans recharger la page (temps réel)
- [ ] Si l'envoi n'est pas confirmé au bout de 2 minutes, la note est « Non envoyée » et peut être supprimée
- [ ] Une fois l'email parti, la note passe au statut « envoyée » et ne peut plus être modifiée ni supprimée
- [ ] Si l'envoi échoue, la note reste « brouillon » (aucune fausse confirmation)
- [ ] Le webhook n'accepte que les appels portant le bon secret

### US7 (bonus) — Récapitulatif mensuel et vue administrateur
- [ ] Le 1er du mois, n8n envoie le récapitulatif du mois précédent
- [ ] Un administrateur voit les scans de tous les employés

## 5. Hors périmètre

Inscription publique, comptabilité complète, remboursement, application mobile native, multi-devises.

## 6. Architecture cible

```
Navigateur (React + Vite)
  ├─ Supabase Auth ........ connexion de l'employé
  ├─ Supabase DB .......... table receipts (RLS)
  ├─ Supabase Storage ..... bucket privé des photos
  ├─ POST /api/extract .... backend Vercel → IA de vision (clé secrète)
  └─ INSERT dans receipts
          └─ webhook de base de données Supabase (secret dans un en-tête)

n8n
  ├─ Webhook « nouvelle note » → photo (Storage) → email + pièce jointe → statut « envoyée »
  └─ Cron mensuel → récapitulatif (bonus)
```

## 7. Modèle de données

Table `receipts`

| Colonne | Type | Remarque |
|---|---|---|
| id | uuid | clé primaire |
| user_id | uuid | `auth.users.id`, défaut `auth.uid()` : **qui a scanné** |
| user_email | text | email de l'auteur, pour la traçabilité |
| merchant | text | enseigne, obligatoire |
| receipt_date | date | date du ticket, obligatoire |
| amount_ht | numeric(10,2) | |
| amount_vat | numeric(10,2) | |
| amount_ttc | numeric(10,2) | obligatoire |
| category | text | Restaurant, Transport, Carburant, Fournitures, Hébergement, Autre |
| image_path | text | chemin dans le bucket privé |
| source | text | `manual` ou `ai` |
| status | text | `draft` ou `sent` |
| created_at | timestamptz | **quand** : défaut `now()` |
| sent_at | timestamptz | date d'envoi au comptable |

**RLS :** un employé ne peut lire et créer que les lignes où `user_id = auth.uid()`. Il ne peut modifier ou supprimer que ses notes encore en `draft` : une note `sent` est figée.

## 8. Contraintes techniques

- Front : React + Vite, JavaScript
- Auth, base et fichiers : Supabase
- Backend : fonctions serverless Vercel (`/api`)
- IA : modèle de vision appelé uniquement depuis le backend
- Automatisation : n8n
- CI : GitHub Actions (lint, tests, build) · CD : Vercel (preview par PR, production sur `main`)
- La caméra exige le HTTPS (OK en `localhost` et sur Vercel)
- **Aucun secret dans le front** : seules les variables `VITE_*` publiques y figurent
- Démo : utiliser des tickets fictifs, pas de vraies données personnelles

## 9. Exigences non fonctionnelles

| Domaine | Exigence |
|---|---|
| Mobile d'abord | L'app est utilisable à une main sur téléphone (dès 360 px de large) |
| Accessibilité | Éléments cliquables au clavier, libellés pour les lecteurs d'écran, contrastes lisibles |
| Mouvement | Animations discrètes (intro, scan, apparition des notes), désactivées si l'utilisateur demande moins de mouvement (`prefers-reduced-motion`) |
| Sécurité | Aucun secret dans le front, RLS sur toutes les tables, bucket privé, backend qui refuse les requêtes sans session |
| Fiabilité | Si l'IA ou l'envoi échoue, l'app reste utilisable et ne ment jamais sur l'état d'une note |
| Langue | Interface et messages d'erreur en français |
| Design | Voir `design.md` : variables CSS uniquement, orange réservé aux actions et à la lecture IA |

## 10. Plan de livraison

| Étape | Contenu |
|---|---|
| 1 | Dépôt GitHub, déploiement Vercel de base, branche de travail et CI |
| 2 | Découvrir le starter : photo, saisie, liste (état local) |
| 3 | Authentification Supabase |
| 4 | Table de traçabilité et Storage |
| 5 | IA de lecture (backend) |
| 6 | n8n : envoi au comptable |
| 7 | Fusion de la pull request et mise en ligne |
| 8 | Bonus |

Le détail de chaque étape est dans `GUIDE_APP.html`.
