import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')

  return {
    plugins: [react()],
    server: {
      port: 3000,
      open: false,
      proxy: {
        '/api': {
          target: env.VITE_API_URL || 'http://localhost:5000',
          changeOrigin: true,
        },
      },
    },
    build: {
      outDir: 'build',
      sourcemap: false,
      chunkSizeWarningLimit: 600,
      rollupOptions: {
        output: {
          manualChunks(id) {
            if (!id.includes('node_modules')) return

            if (id.includes('firebase')) return 'firebase'
            if (id.includes('hls.js')) return 'hls'
            if (id.includes('react-player')) return 'player'
            if (id.includes('@mui') || id.includes('@emotion')) return 'mui'
            if (
              id.includes('@reduxjs') ||
              id.includes('redux-persist') ||
              id.includes('react-redux')
            ) {
              return 'redux'
            }
            if (
              id.includes('react-dom') ||
              id.includes('react-router') ||
              id.includes('/react/')
            ) {
              return 'vendor'
            }
          },
        },
      },
    },
  }
})
