import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'

export default defineConfig({
  plugins: [vue()],
  build: {
    lib: {
      entry: resolve(__dirname, 'src/vue-entry.ts'),
      name: 'SynticksChartVue',
      // This will produce dist/vue.es.js and dist/vue.cjs.js
      fileName: (format) => `vue.${format}.js`,
      formats: ['es', 'cjs'],
    },
    rollupOptions: {
      external: ['vue', 'synticks-chart'], // core engine external
      output: {
        globals: {
          vue: 'Vue',
        },
      },
    },
    outDir: 'dist/vue',
    emptyOutDir: false, // Don't clear dist/vue if it has other files
  },
})

