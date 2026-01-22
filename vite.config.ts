import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig(({ mode }) => {
  // Load env vars
  const env = loadEnv(mode, process.cwd(), '');
  
  return {
    plugins: [react()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },
    server: {
      port: 5173,
      strictPort: true,
      proxy: {
        '/api/getaddress': {
          target: 'https://api.getAddress.io',
          changeOrigin: true,
          rewrite: (path) => {
            // Remove /api/getaddress prefix
            const newPath = path.replace(/^\/api\/getaddress/, '');
            // Load API key from environment
            const apiKey = env.VITE_GETADDRESS_API_KEY;
            if (!apiKey) {
              console.warn('[Vite Proxy] VITE_GETADDRESS_API_KEY not found in environment');
              console.warn('[Vite Proxy] Available env vars:', Object.keys(env).filter(k => k.includes('GETADDRESS')));
              return newPath;
            }
            // Determine parameter name based on token type
            const isDomainToken = apiKey.startsWith('dtoken_');
            const paramName = isDomainToken ? 'token' : 'api-key';
            // Add API key to the path
            const separator = newPath.includes('?') ? '&' : '?';
            const finalPath = `${newPath}${separator}${paramName}=${encodeURIComponent(apiKey)}`;
            console.log('[Vite Proxy] Rewriting path:', path, '->', finalPath);
            return finalPath;
          },
        },
      },
    },
  };
});

