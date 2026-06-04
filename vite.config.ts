import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// GitHub Pages serves project sites at https://<user>.github.io/<repo-name>/
// Set VITE_BASE_PATH=/<repo-name>/ when building for Pages (see .github/workflows/deploy-pages.yml)
export default defineConfig({
  base: process.env.VITE_BASE_PATH || '/',
  plugins: [react(), tailwindcss()],
})
