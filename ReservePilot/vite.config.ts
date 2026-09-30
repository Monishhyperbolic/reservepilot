import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
	const env = loadEnv(mode, process.cwd(), '');
	return {
		plugins: [react()],
		build: {
			rollupOptions: {
				output: {
					manualChunks: {
						react: ['react', 'react-dom', 'react-router-dom'],
						charts: ['recharts'],
						supabase: ['@supabase/supabase-js'],
						icons: ['lucide-react'],
					},
				},
			},
		},
		server: {
			proxy: {
				'/api/coinmarketcap': {
					target: 'https://pro-api.coinmarketcap.com',
					changeOrigin: true,
					rewrite: path => path.replace(/^\/api\/coinmarketcap/, ''),
					headers: { 'X-CMC_PRO_API_KEY': env.VITE_CMC_API_KEY || '' },
				},
			},
		},
	};
});
