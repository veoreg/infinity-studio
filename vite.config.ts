import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const n8nEnv = env.VITE_N8N_ENV === 'test' ? 'webhook-test' : 'webhook';

  return {
    plugins: [react()],
    server: {
      proxy: {
        '/api/video': {
          target: `https://n8n.develotex.io/${n8nEnv}/wan_context_safeMode_3_SB`,
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api\/video/, ''),
          secure: false,
          timeout: 900000,
        },
        '/api/avatar': {
          target: 'https://n8n.develotex.io',
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api\/avatar/, `/${n8nEnv}/Flux_Image_Generator_Advanced_Upscl_3+SB`),
          secure: false,
          timeout: 900000,
        },
        '/api/edit': {
          target: 'https://n8n.develotex.io',
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api\/edit/, `/${n8nEnv}/Flux_Image_Generator_Advanced_Upscl_3+SB`),
          secure: false,
          timeout: 900000,
        },
        '/api/cancel-generation': {
          target: 'https://n8n.develotex.io',
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api\/cancel-generation/, `/${n8nEnv}/cancel-generation`),
          secure: false,
        }
      }
    }
  };
});
