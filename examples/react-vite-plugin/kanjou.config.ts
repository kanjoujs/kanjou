import { defineConfig } from '@kanjou/cli'

export default defineConfig({
  sourceLocale: './src/assets/locales/en.json',
  dts: { outDir: './generated' },
})
