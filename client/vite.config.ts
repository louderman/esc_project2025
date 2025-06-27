import { defineConfig, type AliasOptions } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@types': path.resolve(__dirname, '../types'),
    } as AliasOptions,
  },
});

// npm install -D eslint-import-resolver-alias
// npx eslint --init
