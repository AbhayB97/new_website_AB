// vite.config.js
import { defineConfig } from 'vite'

export default defineConfig({
  base: './',
  server: { host: true, port: 3000, open: true },
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: true,
    // minify: 'esbuild' // default; you can omit this line entirely
    rollupOptions: {
      input: { main: './index.html' },
      output: {
        manualChunks: {
          three: ['three'],
          anime: ['animejs']
        }
      }
    }
  },
  assetsInclude: ['**/*.glb', '**/*.gltf'],
  optimizeDeps: { include: ['three', 'animejs'], exclude: [] },
  plugins: [],
  css: { devSourcemap: true }
})
