// vite.config.js
import { defineConfig } from 'vite'
import { resolve } from 'node:path'

export default defineConfig({
  // On Vercel use the root path. (If you deploy to GitHub Pages, switch to './')
  base: '/',

  server: { host: true, port: 3000, open: true },

  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: true,
    // Use Vite's default fast minifier
    minify: 'esbuild',
    rollupOptions: {
      input: { main: resolve(process.cwd(), 'index.html') },
      output: {
        manualChunks: {
          three: ['three'],
          anime: ['animejs']
        }
      }
    }
  },

  // 3D model assets
  assetsInclude: ['**/*.glb', '**/*.gltf'],

  // Pre-bundle deps (optional, harmless)
  optimizeDeps: { include: ['three', 'animejs'] },

  plugins: [],

  css: { devSourcemap: true }
})
