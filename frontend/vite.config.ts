import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vite.dev/config/
export default defineConfig({
    plugins: [react()],
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
