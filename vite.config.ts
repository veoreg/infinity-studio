import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api/webhook': {
        target: 'https://n8n.develotex.io/webhook/wan_context_safeMode_3_enhanced-v3',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/webhook/, ''),
        secure: false, // If the SSL is self-signed or has issues
        timeout: 900000, // 15 minutes
        proxyTimeout: 900000, // 15 minutes
      },
      '/api/avatar': {
        target: 'https://n8n.develotex.io/webhook/generate-flux-image',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/avatar/, ''),
        secure: false,
        timeout: 900000,
        proxyTimeout: 900000,
      }
    }
  }
})
