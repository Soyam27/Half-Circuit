import { defineConfig } from 'vite'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [
    tailwindcss(),
    react()
  ],
  server: {
    // Handle client-side routing - serve index.html for all routes
    historyApiFallback: {
      index: '/index.html'
    },
  },
  preview: {
    // Also handle routing in preview mode
    historyApiFallback: {
      index: '/index.html'
    },
  }
})