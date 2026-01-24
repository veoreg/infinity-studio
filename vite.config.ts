import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api/video': {
        target: 'https://n8n.develotex.io/webhook/wan_context_safeMode_3_SB',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/video/, ''),
        secure: false,
        timeout: 900000,
      },
      '/api/avatar': {
        target: 'https://n8n.develotex.io',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/avatar/, '/webhook/Flux_Image_Generator_Advanced_Upscl_3+SB'),
        secure: false,
        timeout: 900000,
      },
      '/api/edit': {
        target: 'https://n8n.develotex.io',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/edit/, '/webhook/Flux_Image_Generator_Advanced_Upscl_3+SB'),
        secure: false,
        timeout: 900000,
      },
      '/api/cancel-generation': {
        target: 'https://n8n.develotex.io',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/cancel-generation/, '/webhook/cancel-generation'),
        secure: false,
      }
    }
  }
})
