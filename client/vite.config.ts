import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()], // Remove custom babel config
  server: {
    port: 3000
  }
})