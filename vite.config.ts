/// <reference types="vitest/config" />
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { viteSingleFile } from 'vite-plugin-singlefile'

// base './' + HashRouter: el build abre con doble clic (file://) y en GitHub Pages.
// Con VITE_SINGLEFILE=0 se genera un build normal por chunks.
const singlefile = process.env.VITE_SINGLEFILE !== '0'

export default defineConfig({
  base: './',
  plugins: [react(), ...(singlefile ? [viteSingleFile()] : [])],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/test-setup.ts'],
    include: ['src/**/*.test.{ts,tsx}'],
  },
})
