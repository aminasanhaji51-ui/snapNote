# SnapNote — starter

Application de notes de frais : on photographie un ticket, une IA lit les montants, la note est enregistrée et le comptable la reçoit par email. Ce dossier est le **point de départ** : l'application marche déjà en saisie manuelle, le reste se construit étape par étape avec Claude Code.

## Marche à suivre

1. **Ouvre [`GUIDE_APP.html`](GUIDE_APP.html)** dans ton navigateur. C'est le guide : suis les étapes dans l'ordre, chacune a ses actions, la demande à copier pour Claude et ses vérifications.
2. Installe et lance l'application :
   ```bash
   npm install
   npm run dev
   ```
3. Travaille avec Claude Code (`claude`) dans ce dossier, sur ta propre branche.

## Les fichiers à connaître

| Fichier | Rôle |
|---|---|
| `GUIDE_APP.html` | Le guide pas à pas |
| `prd.md` | **Quoi** construire (fonctionnalités, étapes) |
| `design.md` | **À quoi ça ressemble** (couleurs, composants, règles) |
| `CLAUDE.md` | **Les règles** de l'IA (secrets, sécurité, conventions) |
| `.claude/settings.json` | Les permissions de l'IA |
| `design/maquette/index.html` | La maquette : l'application terminée, à ouvrir dans un navigateur |
| `n8n/snapnote-workflow.json` | Le workflow n8n à importer (étape 6) |
| `public/samples/` | Tickets **fictifs** pour tester |
| `.env.example` | Les variables d'environnement à copier dans `.env` |

## À retenir

- Ne mets jamais de secret dans le code, et ne partage pas ton fichier `.env`.
- N'utilise que des tickets fictifs.
