# SnapNote — instructions pour l'IA

Le produit est décrit dans [prd.md](prd.md). **Lis-le avant toute fonctionnalité** et mets-le à jour si le périmètre change.

Le design est décrit dans [design.md](design.md). **Respecte-le pour tout écran ou composant** : variables CSS uniquement, orange réservé aux actions et à la lecture IA, aucune couleur écrite en dur, pas d'émoji dans l'interface.

La maquette visuelle est [design/maquette/index.html](design/maquette/index.html) : c'est une **illustration de la cible**, à ouvrir dans un navigateur (ou à comparer par capture d'écran). **`design.md` fait foi** en cas de différence. Ne pas lire ce fichier en entier : il embarque toute la feuille de style et les écrans.

## Stack
React + Vite (JavaScript), Supabase (auth, base, storage), fonctions serverless Vercel dans `api/`, n8n pour l'automatisation, une IA de vision appelée depuis le backend.

## Commandes
- `npm run dev` : serveur local
- `npm run build` : build de production
- `npm test`, `npm run lint`, `npm run typecheck` : tests, lint et vérification de types (créés à l'étape 1, avec la CI GitHub Actions)

## Règles absolues
1. **Aucun secret dans le code front.** Seules les variables `VITE_*` publiques y sont autorisées. Les secrets (clé IA, webhook n8n) vivent dans `api/` et dans les variables d'environnement Vercel.
2. **Ne jamais lire, afficher ni modifier `.env`.** Documenter les variables dans `.env.example`.
3. **Toute table Supabase a la RLS activée**, et le bucket de photos est privé.
4. **`user_id` est fourni par la base (`auth.uid()`)**, jamais envoyé par le navigateur : c'est ce qui garantit la traçabilité.
5. **Pas d'inscription publique**, ni dans l'UI ni dans Supabase.
6. Garder le code simple : pas de bibliothèque ajoutée sans raison écrite dans le PRD.

## Conventions
- Composants React dans `src/components/`, logique pure testable dans `src/lib/`.
- Messages utilisateur en français.
- Un commit par fonctionnalité, message à l'impératif.
- Utiliser uniquement des tickets fictifs pour les démonstrations.

## Avant de dire « c'est fini »
Lancer `npm run build` (et, une fois la CI en place, `npm run lint`, `npm run typecheck` et `npm test`). Ne pas affirmer que ça marche sans l'avoir exécuté.

## Harness (cadre de l'IA)
Voir `.claude/settings.json` : les permissions autorisent les commandes de développement courantes, demandent confirmation pour `git push` et l'installation de paquets, et interdisent l'accès à `.env` et les commandes destructrices.
