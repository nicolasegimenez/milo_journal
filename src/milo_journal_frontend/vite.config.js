import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  define: {
    global: 'globalThis',
    'process.env': {},
    'process.env.DFX_NETWORK': JSON.stringify(process.env.DFX_NETWORK || 'local'),
    'process.env.CANISTER_ID_MILO_JOURNAL_BACKEND': JSON.stringify(process.env.CANISTER_ID_MILO_JOURNAL_BACKEND || 'vb2j2-fp777-77774-qaafq-cai'),
  },
  server: {
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:8000',
        changeOrigin: true,
      },
    },
  },
  optimizeDeps: {
    esbuildOptions: {
      define: {
        global: 'globalThis',
      },
    },
  },
})
