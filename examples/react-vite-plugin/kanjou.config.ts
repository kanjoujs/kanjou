import { defineConfig } from '@kanjou/cli'

export default defineConfig({
  sourceLocale: './src/assets/locales/en.ts',
  dts: { outDir: './generated' },
  format: {
    singleQuote: true,
    printWidth: 100,
    semi: false,
  },
})
