import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

// https://vite.dev/config/
export default defineConfig({
    plugins: [react()],
    build: {
        chunkSizeWarningLimit: 750,
        rollupOptions: {
            output: {
                manualChunks(id) {
                    if (!id.includes('node_modules')) return undefined;
                    if (id.includes('recharts')) return 'charts';
                    if (id.includes('@tanstack')) return 'query';
                    if (
                        id.includes('@mui') ||
                        id.includes('@emotion') ||
                        id.includes('react')
                    ) {
                        return 'framework';
                    }
                    return undefined;
                },
            },
        },
    },
    test: {
        environment: 'jsdom',
        setupFiles: './src/test/setup.ts',
        exclude: ['e2e/**', 'node_modules/**', 'dist/**'],
    },
    server: {
        host: '0.0.0.0',
        port: 5173,
        watch: {
            usePolling: true, // Necesario para que funcione hot-reload en Docker
        },
        hmr: {
            clientPort: 3000, // Puerto expuesto externamente
        },
    },
});
