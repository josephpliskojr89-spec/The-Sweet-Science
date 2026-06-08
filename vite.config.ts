import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Relative base keeps the build portable — it can be served from any path,
// or wrapped in a desktop shell (Tauri/Electron) later without changes.
export default defineConfig({
  base: './',
  plugins: [react()],
  server: {
    port: 5173,
    host: true,
  },
});
