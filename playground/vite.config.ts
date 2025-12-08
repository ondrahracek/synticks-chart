import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      // resolve 'synticks-chart' imports to your source folder
      'synticks-chart': resolve(__dirname, '../src'),
      // handle subpath exports - point to vue-entry.ts for Vite build
      'synticks-chart/vue': resolve(__dirname, '../src/vue-entry.ts')
    }
  }
})

