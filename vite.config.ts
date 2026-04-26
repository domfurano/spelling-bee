import { defineConfig } from 'vite'

export default defineConfig({
  base: '/spelling-bee/',
  root: 'src',
  build: {
    outDir: '../dist',
  },
  server: {
    port: 3000
  }
})