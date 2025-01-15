import { defineConfig } from 'tsup'

export default defineConfig([
  {
    clean: true,
    dts: true,
    entry: ['src'],
    format: ['esm'],
    outDir: 'dist/esm',
  },
  {
    clean: true,
    dts: true,
    entry: ['src'],
    format: ['cjs'],
    outDir: 'dist/cjs',
  },
])
