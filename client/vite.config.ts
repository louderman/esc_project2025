import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

// // https://vitejs.dev/config/
// export default defineConfig(({ mode }) => ({
//   plugins: [
//     react(),
//     mode === 'development' &&
//     componentTagger(),
//   ].filter(Boolean),
//   resolve: {
//     alias: {
//       "@": path.resolve(__dirname, "./src"),
//     },
//   },
  
// }));


// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src")
    }
  }, 
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:55510',
        changeOrigin: true,
        secure: false,
      },
    },
  },
});
