import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Which half of the product this build is for.
//   site → tilad.org      (landing only)
//   app  → app.tilad.org  (everything behind sign-in)
//   unset → combined, for `npm run dev` and staging
const target = process.env.BUILD_TARGET

const roots = {
  site: './src/roots/SiteRoot.tsx',
  app: './src/roots/AppRoot.tsx',
} as const

const outDirs = { site: 'dist-site', app: 'dist-app' } as const

// A static alias, not a dynamic import: the unselected root never enters the
// module graph, so its pages are not merely un-routed but absent from the
// output entirely. That is the whole point — a landing visitor must not be
// able to download the app.
const rootFile = target === 'site' || target === 'app' ? roots[target] : './src/App.tsx'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@root': fileURLToPath(new URL(rootFile, import.meta.url)),
    },
  },
  build: {
    outDir: target === 'site' || target === 'app' ? outDirs[target] : 'dist',
  },
})
