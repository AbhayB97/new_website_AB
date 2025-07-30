import { defineConfig } from 'vite'

export default defineConfig({
  // Base public path
  base: './',
  
  // Development server configuration
  server: {
    host: true,
    port: 3000,
    open: true
  },
  
  // Build configuration
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: true,
    minify: 'terser',
    rollupOptions: {
      input: {
        main: './index.html'
      },
      output: {
        manualChunks: {
          three: ['three'],
          anime: ['animejs']
        }
      }
    }
  },
  
  // Asset handling
  assetsInclude: ['**/*.glb', '**/*.gltf'],
  
  // Optimization
  optimizeDeps: {
    include: ['three', 'animejs'],
    exclude: []
  },
  
  // Plugin configuration
  plugins: [],
  
  // CSS configuration
  css: {
    devSourcemap: true
  }
})
