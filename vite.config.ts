import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { defineConfig, type Plugin } from 'vite'
import { VitePWA } from 'vite-plugin-pwa'

const MANIFEST_ID = '/pdf-ippatsu/'

function assertManifestId(): Plugin {
  return {
    name: 'assert-manifest-id',
    apply: 'build',
    enforce: 'post',
    closeBundle() {
      const file = resolve('dist/manifest.webmanifest')
      const manifest = JSON.parse(readFileSync(file, 'utf8')) as { id?: string }
      if (manifest.id !== MANIFEST_ID) {
        throw new Error(
          `manifest id must be ${MANIFEST_ID} (never './'), got ${String(manifest.id)}`,
        )
      }
    },
  }
}

export default defineConfig({
  base: './',
  plugins: [
    VitePWA({
      registerType: 'autoUpdate',
      manifest: {
        id: MANIFEST_ID,
        name: 'PDF一発',
        short_name: 'PDF一発',
        description: '写真を1つのPDFに。PDFを選んだ順に1つに。',
        lang: 'ja',
        dir: 'ltr',
        start_url: './',
        scope: './',
        display: 'standalone',
        background_color: '#f3efe6',
        theme_color: '#1c3d32',
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,svg,webmanifest,woff2}'],
        navigateFallback: 'index.html',
        cleanupOutdatedCaches: true,
      },
    }),
    assertManifestId(),
  ],
})
