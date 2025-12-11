import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'

export default defineConfig({
  plugins: [vue()],
  build: {
    lib: {
      entry: resolve(__dirname, 'src/index.ts'),
      name: 'LDesignTableVue',
      fileName: (format) => `index.${format === 'es' ? 'js' : 'cjs'}`,
      formats: ['es', 'cjs']
    },
    rollupOptions: {
      external: ['vue', '@ldesign/table-core'],
      output: {
        globals: {
          vue: 'Vue',
          '@ldesign/table-core': 'LDesignTable'
        }
      }
    },
    sourcemap: true
  }
})
