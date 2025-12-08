import { defineConfig } from 'tsup'

export default defineConfig({
    entry: {
        index: 'src/index.ts',
    },
    format: ['esm', 'cjs'],
    dts: true,
    sourcemap: true,
    clean: true,
    target: 'es2020',
    external: ['vue'], // Vue is a peer dependency, do not bundle it
    outExtension({ format }) {
        return {
            js: format === 'esm' ? '.mjs' : '.cjs',
        }
    },
})
