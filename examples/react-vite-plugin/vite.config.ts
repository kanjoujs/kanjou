import { kanjou } from '@kanjou/vite'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

export default defineConfig({
  resolve: { tsconfigPaths: true },
  plugins: [
    kanjou({
      sourceLocalePath: './src/assets/locales/en.json',
      dts: { outputDirectory: './generated' },
    }),
    react(),
  ],
})
