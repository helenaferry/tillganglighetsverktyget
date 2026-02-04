import { reactRouter } from '@react-router/dev/vite';
import tailwindcss from '@tailwindcss/vite';
import { defineConfig } from 'vite';
import tsconfigPaths from 'vite-tsconfig-paths';

export default defineConfig({
  plugins: [tailwindcss(), reactRouter(), tsconfigPaths()],
  server: {
    host: '0.0.0.0', // Allow connections from outside the container
    port: 5173,
    watch: {
      usePolling: true, // Required for file watching in Docker/Podman
    },
    hmr: {
      host: 'localhost', // Browser connects to localhost, not container hostname
      port: 5173,
    },
  },
});
