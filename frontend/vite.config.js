import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// GitHub Pages serve site tại https://<user>.github.io/<repo>/
// → base phải khớp với tên repo. Đổi VITE_BASE nếu repo của bạn tên khác.
const base = process.env.VITE_BASE || '/webcuaban/';

export default defineConfig({
  base,
  plugins: [react()],
  server: {
    port: 5500,
    host: true,
    strictPort: false,
  },
  build: {
    outDir: 'dist',
    sourcemap: false,
  },
});
