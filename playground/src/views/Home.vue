<script setup lang="ts">
import { ref, inject, type Ref } from 'vue'
import { Table2, Zap, Palette, Layers, Code, Box } from 'lucide-vue-next'

const isDark = inject<Ref<boolean>>('isDark', ref(false))

const features = [
  {
    icon: Zap,
    title: '高性能',
    description: '支持虚拟滚动，轻松处理大数据量'
  },
  {
    icon: Palette,
    title: '主题系统',
    description: '内置亮色/暗色主题，支持自定义'
  },
  {
    icon: Layers,
    title: '丰富功能',
    description: '排序、筛选、分页、选择、展开等'
  },
  {
    icon: Code,
    title: '框架无关',
    description: '核心使用原生JS，支持任何框架'
  },
  {
    icon: Box,
    title: 'Vue 3 支持',
    description: '提供Vue 3组件和Hooks封装'
  },
  {
    icon: Table2,
    title: '使用简单',
    description: '简洁的API设计，快速上手'
  }
]
</script>

<template>
  <div class="max-w-4xl mx-auto">
    <!-- Hero -->
    <div class="text-center mb-12">
      <div class="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 mb-6">
        <Table2 class="w-10 h-10 text-white" />
      </div>
      <h1 :class="['text-4xl font-bold mb-4', isDark ? 'text-white' : 'text-gray-900']">LDesign Table</h1>
      <p :class="['text-xl mb-8', isDark ? 'text-gray-400' : 'text-gray-600']">
        高性能、框架无关的表格组件库
      </p>
      <div class="flex justify-center gap-4">
        <router-link
          to="/basic"
          class="px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
        >
          开始使用
        </router-link>
        <router-link
          to="/vanilla"
          :class="['px-6 py-3 border font-medium rounded-lg transition-colors', isDark ? 'border-gray-600 text-gray-300 hover:bg-gray-700' : 'border-gray-300 text-gray-700 hover:bg-gray-50']"
        >
          原生JS示例
        </router-link>
      </div>
    </div>

    <!-- Features -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
      <div
        v-for="feature in features"
        :key="feature.title"
        :class="['rounded-xl p-6 border transition-shadow', isDark ? 'bg-gray-800 border-gray-700 hover:shadow-xl' : 'bg-white border-gray-200 hover:shadow-lg']"
      >
        <div :class="['w-12 h-12 rounded-lg flex items-center justify-center mb-4', isDark ? 'bg-blue-900/50' : 'bg-blue-50']">
          <component :is="feature.icon" class="w-6 h-6 text-blue-500" />
        </div>
        <h3 :class="['text-lg font-semibold mb-2', isDark ? 'text-white' : 'text-gray-900']">{{ feature.title }}</h3>
        <p :class="isDark ? 'text-gray-400' : 'text-gray-600'">{{ feature.description }}</p>
      </div>
    </div>

    <!-- Quick Start -->
    <div :class="['rounded-xl p-6 border transition-colors', isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200']">
      <h2 :class="['text-2xl font-bold mb-4', isDark ? 'text-white' : 'text-gray-900']">快速开始</h2>
      
      <h3 :class="['text-lg font-semibold mb-3', isDark ? 'text-gray-200' : 'text-gray-800']">安装</h3>
      <pre :class="['mb-6 p-4 rounded-lg', isDark ? 'bg-gray-900 text-gray-300' : 'bg-gray-50']">npm install @ldesign/table-core @ldesign/table-vue</pre>

      <h3 :class="['text-lg font-semibold mb-3', isDark ? 'text-gray-200' : 'text-gray-800']">Vue 3 使用</h3>
      <pre :class="['mb-6 p-4 rounded-lg overflow-auto', isDark ? 'bg-gray-900 text-gray-300' : 'bg-gray-50']">&lt;script setup&gt;
import { LTable } from '@ldesign/table-vue'
import '@ldesign/table-vue/style.css'

const columns = [
  { key: 'name', title: '姓名' },
  { key: 'age', title: '年龄' },
  { key: 'email', title: '邮箱' }
]

const data = [
  { id: 1, name: '张三', age: 28, email: 'zhang@example.com' },
  { id: 2, name: '李四', age: 32, email: 'li@example.com' }
]
&lt;/script&gt;

&lt;template&gt;
  &lt;LTable :columns="columns" :data="data" /&gt;
&lt;/template&gt;</pre>

      <h3 :class="['text-lg font-semibold mb-3', isDark ? 'text-gray-200' : 'text-gray-800']">原生 JS 使用</h3>
      <pre :class="['p-4 rounded-lg overflow-auto', isDark ? 'bg-gray-900 text-gray-300' : 'bg-gray-50']">import { Table } from '@ldesign/table-core'
import '@ldesign/table-core/style.css'

const table = new Table({
  container: '#table-container',
  columns: [
    { key: 'name', title: '姓名' },
    { key: 'age', title: '年龄' }
  ],
  data: [
    { id: 1, name: '张三', age: 28 },
    { id: 2, name: '李四', age: 32 }
  ]
})</pre>
    </div>
  </div>
</template>
