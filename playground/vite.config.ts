import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      // resolve 'synticks-chart' imports to your source folder
      'synticks-chart': resolve(__dirname, '../src'),
      // handle subpath exports
      'synticks-chart/vue': resolve(__dirname, '../src/vue.ts')
    }
  }
})

