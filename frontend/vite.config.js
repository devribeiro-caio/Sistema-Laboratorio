import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// O proxy mantém front e API na mesma origem, então o cookie httpOnly funciona sem CORS.
export default defineConfig({
  plugins: [react()],
  server: { port: 5173, proxy: { '/api': 'http://localhost:3000' } },
});
