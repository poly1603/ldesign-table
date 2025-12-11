import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
      // 使用源码进行开发调试
      '@ldesign/table-core': resolve(__dirname, '../packages/core/src/index.ts'),
      '@ldesign/table-vue': resolve(__dirname, '../packages/vue/src/index.ts'),
      // 样式别名
      '@table-styles': resolve(__dirname, '../packages/core/src/styles/base.css')
    }
  },
  server: {
    port: 5173,
    open: true
  }
})
