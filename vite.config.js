import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// En développement, `npm run dev` ne sert pas le dossier api/ (c'est Vercel qui le fait en production).
// Ce petit plugin exécute api/extract.js dans le serveur Vite, avec les variables du fichier .env
// (chargées côté serveur uniquement : elles n'arrivent jamais dans le code du navigateur).
function localApi(mode) {
  return {
    name: 'snapnote-local-api',
    configureServer(server) {
      Object.assign(process.env, loadEnv(mode, process.cwd(), ''))
      server.middlewares.use('/api/extract', async (req, res) => {
        const chunks = []
        for await (const chunk of req) chunks.push(chunk)
        try {
          req.body = chunks.length ? JSON.parse(Buffer.concat(chunks).toString('utf8')) : {}
        } catch {
          req.body = {}
        }
        // Mêmes méthodes que Vercel : res.status(...).json(...)
        res.status = (code) => ((res.statusCode = code), res)
        res.json = (body) => {
          res.setHeader('Content-Type', 'application/json')
          res.end(JSON.stringify(body))
        }
        try {
          const { default: handler } = await server.ssrLoadModule('/api/extract.js')
          await handler(req, res)
        } catch (error) {
          console.error('[api/extract]', error)
          res.status(500).json({ error: 'Erreur serveur locale.' })
        }
      })
    },
  }
}

export default defineConfig(({ mode }) => ({
  plugins: [react(), localApi(mode)],
}))
