import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    setupFiles: ['./test/setup.ts'],
    globals: true,
    css: true,
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@/components': path.resolve(__dirname, './src/components'),
      '@/lib': path.resolve(__dirname, './src/lib'),
      '@/hooks': path.resolve(__dirname, './src/hooks'),
      '@/types': path.resolve(__dirname, './src/types'),
      '@cpm/shared-types': path.resolve(__dirname, './packages/shared-types/src'),
      '@cpm/shared-utils': path.resolve(__dirname, './packages/shared-utils/src'),
      '@cpm/ui-components': path.resolve(__dirname, './packages/ui-components/src'),
    },
  },
})