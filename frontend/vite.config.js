import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import consoleMonitor from './vite-plugin-console-monitor.js'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    consoleMonitor(), // Browser console logs forwarded to terminal
  ],

  // QUAN TRỌNG: Base path cho Vercel
  base: '/',

  // Production optimizations
  build: {
    // Output directory
    outDir: 'dist',

    // Generate sourcemaps for debugging (disable in production for security)
    sourcemap: false,

    // Minification options
    minify: 'esbuild',

    // Chunk size warning limit (500kb)
    chunkSizeWarningLimit: 500,

    // Rollup options for code splitting
    rollupOptions: {
      output: {
        // Manual chunk splitting for better caching
        manualChunks: {
          // React core
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],

          // UI libraries
          'ui-vendor': ['framer-motion', 'lucide-react', 'react-hot-toast', 'react-toastify'],

          // Chart libraries
          'chart-vendor': ['lightweight-charts', 'recharts'],

          // Supabase
          'supabase-vendor': ['@supabase/supabase-js'],

          // Utilities
          'utils-vendor': ['axios', 'zustand', 'html2canvas', 'jspdf']
        },

        // Asset file naming
        assetFileNames: (assetInfo) => {
          const info = assetInfo.name.split('.')
          const ext = info[info.length - 1]

          if (/png|jpe?g|svg|gif|tiff|bmp|ico/i.test(ext)) {
            return `assets/images/[name]-[hash][extname]`
          } else if (/woff|woff2|eot|ttf|otf/i.test(ext)) {
            return `assets/fonts/[name]-[hash][extname]`
          }

          return `assets/[name]-[hash][extname]`
        },

        // Chunk file naming
        chunkFileNames: 'assets/js/[name]-[hash].js',

        // Entry file naming
        entryFileNames: 'assets/js/[name]-[hash].js'
      }
    },

    // CSS code splitting
    cssCodeSplit: true,

    // Report compressed size
    reportCompressedSize: true,

    // Optimize dependencies
    commonjsOptions: {
      transformMixedEsModules: true
    }
  },

  // Server configuration for development
  server: {
    port: 5173,
    strictPort: false,
    host: true,
    open: false
  },

  // Preview server configuration
  preview: {
    port: 4173,
    strictPort: false,
    host: true,
    open: false
  },

  // Dependency optimization
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'react-router-dom',
      '@supabase/supabase-js'
    ]
  }
})
