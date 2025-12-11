<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch, inject, type Ref } from 'vue'
import { LTable, Table } from '@ldesign/table-vue'
import { Sun, Moon, Minimize2 } from 'lucide-vue-next'
import { users50, basicColumns, type User } from '@/data/mockData'

const isDark = inject<Ref<boolean>>('isDark', ref(false))
const currentTheme = ref<string>('light')

const themes = [
  { name: 'light', label: '亮色', icon: Sun },
  { name: 'dark', label: '暗色', icon: Moon },
  { name: 'compact', label: '紧凑', icon: Minimize2 }
]

const jsTableRef = ref<HTMLDivElement>()
let jsTable: InstanceType<typeof Table> | null = null

const setTheme = (theme: string) => {
  currentTheme.value = theme
  // 同时更新原生JS表格的主题
  jsTable?.setTheme(theme)
}

onMounted(() => {
  if (jsTableRef.value) {
    jsTable = new Table({
      container: jsTableRef.value,
      columns: basicColumns,
      data: users50.slice(0, 8) as User[],
      rowKey: 'id',
      bordered: true,
      pagination: false,
      theme: currentTheme.value
    })
  }
})

onUnmounted(() => {
  jsTable?.destroy()
})
</script>

<template>
  <div class="space-y-6">
    <!-- 说明 -->
    <div :class="['rounded-xl p-6 border transition-colors', isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200']">
      <h2 :class="['text-xl font-bold mb-2', isDark ? 'text-white' : 'text-gray-900']">主题切换</h2>
      <p :class="isDark ? 'text-gray-400' : 'text-gray-600'">
        内置亮色、暗色和紧凑三种主题，也支持自定义主题配置。
      </p>
    </div>

    <!-- 主题切换 -->
    <div :class="['rounded-xl p-6 border transition-colors', isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200']">
      <h3 :class="['text-lg font-semibold mb-4', isDark ? 'text-white' : 'text-gray-800']">选择主题</h3>
      <div class="flex flex-wrap gap-3 mb-6">
        <button
          v-for="theme in themes"
          :key="theme.name"
          @click="setTheme(theme.name)"
          :class="[
            'flex items-center gap-2 px-4 py-2 rounded-lg border transition-colors',
            currentTheme === theme.name
              ? 'bg-blue-50 border-blue-500 text-blue-600'
              : isDark ? 'border-gray-600 text-gray-300 hover:bg-gray-700' : 'border-gray-200 hover:bg-gray-50'
          ]"
        >
          <component :is="theme.icon" class="w-4 h-4" />
          {{ theme.label }}
        </button>
      </div>
      
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <!-- 原生JS -->
        <div>
          <h4 :class="['text-sm font-medium mb-2 flex items-center gap-2', isDark ? 'text-gray-400' : 'text-gray-500']">
            <span class="px-2 py-0.5 bg-yellow-100 text-yellow-800 rounded text-xs">原生 JS</span>
          </h4>
          <div :class="currentTheme === 'dark' ? 'bg-gray-900 p-4 rounded-lg' : ''">
            <div ref="jsTableRef"></div>
          </div>
        </div>
        
        <!-- Vue -->
        <div>
          <h4 :class="['text-sm font-medium mb-2 flex items-center gap-2', isDark ? 'text-gray-400' : 'text-gray-500']">
            <span class="px-2 py-0.5 bg-green-100 text-green-800 rounded text-xs">Vue 组件</span>
          </h4>
          <div :class="currentTheme === 'dark' ? 'bg-gray-900 p-4 rounded-lg' : ''">
            <LTable
              :columns="basicColumns"
              :data="users50.slice(0, 8)"
              :pagination="false"
              :theme="currentTheme"
              bordered
              row-key="id"
            />
          </div>
        </div>
      </div>
    </div>

    <!-- 代码示例 -->
    <div :class="['rounded-xl p-6 border transition-colors', isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200']">
      <h3 :class="['text-lg font-semibold mb-4', isDark ? 'text-white' : 'text-gray-800']">代码示例</h3>
      
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div>
          <h4 :class="['text-sm font-medium mb-2', isDark ? 'text-gray-400' : 'text-gray-500']">原生 JS</h4>
          <pre :class="['text-sm p-4 rounded-lg overflow-auto', isDark ? 'bg-gray-900 text-gray-300' : 'bg-gray-50']">const table = new Table({
  container: '#table',
  columns,
  data,
  theme: 'dark' // 'light' | 'dark' | 'compact'
})

// 动态切换主题
table.setTheme('dark')</pre>
        </div>
        
        <div>
          <h4 :class="['text-sm font-medium mb-2', isDark ? 'text-gray-400' : 'text-gray-500']">Vue</h4>
          <pre :class="['text-sm p-4 rounded-lg overflow-auto', isDark ? 'bg-gray-900 text-gray-300' : 'bg-gray-50']">&lt;LTable
  :columns="columns"
  :data="data"
  :theme="currentTheme"
/&gt;

&lt;!-- 自定义主题 --&gt;
&lt;LTable
  :theme="{
    name: 'custom',
    colors: {
      primary: '#8b5cf6',
      headerBackground: '#f5f3ff'
    }
  }"
/&gt;</pre>
        </div>
      </div>
    </div>
  </div>
</template>
