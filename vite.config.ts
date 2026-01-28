import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import basicSsl from '@vitejs/plugin-basic-ssl'
import path from 'path'

export default defineConfig(({ command }) => ({
  plugins: [react(), basicSsl()],
  base: command === 'build' ? '/ralphgui/' : '/', // GitHub Pages repo name
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    https: true,
    host: true,
  },
  build: {
    outDir: 'dist',
    sourcemap: false,
  },
}))
