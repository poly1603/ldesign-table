<script setup lang="ts">
import { ref, onMounted, onUnmounted, inject, watch, type Ref } from 'vue'
import { LTable, Table } from '@ldesign/table-vue'
import { users50, basicColumns, type User } from '@/data/mockData'

const isDark = inject<Ref<boolean>>('isDark', ref(false))

// 原生JS表格容器引用
const jsTableRef1 = ref<HTMLDivElement>()
const jsTableRef2 = ref<HTMLDivElement>()
const jsTableRef3 = ref<HTMLDivElement>()

// 原生JS表格实例
let jsTable1: InstanceType<typeof Table> | null = null
let jsTable2: InstanceType<typeof Table> | null = null
let jsTable3: InstanceType<typeof Table> | null = null

// 状态渲染函数
const statusRender = (value: string) => {
  const colors: Record<string, string> = {
    active: 'background:#dcfce7;color:#166534',
    inactive: 'background:#f3f4f6;color:#374151',
    pending: 'background:#fef3c7;color:#92400e'
  }
  const labels: Record<string, string> = {
    active: '活跃',
    inactive: '未活跃',
    pending: '待定'
  }
  return `<span style="display:inline-block;padding:2px 8px;border-radius:9999px;font-size:12px;${colors[value]}">${labels[value]}</span>`
}

// 列配置
const columns = basicColumns.map(col => {
  if (col.key === 'status') {
    return { ...col, render: statusRender }
  }
  return col
})

onMounted(() => {
  const theme = isDark?.value ? 'dark' : 'light'
  
  // 初始化原生JS表格1 - 带边框
  if (jsTableRef1.value) {
    jsTable1 = new Table({
      container: jsTableRef1.value,
      columns,
      data: users50.slice(0, 5) as User[],
      rowKey: 'id',
      bordered: true,
      pagination: false,
      theme
    })
  }

  // 初始化原生JS表格2 - 斑马纹
  if (jsTableRef2.value) {
    jsTable2 = new Table({
      container: jsTableRef2.value,
      columns,
      data: users50.slice(0, 5) as User[],
      rowKey: 'id',
      striped: true,
      pagination: false,
      theme
    })
  }

  // 初始化原生JS表格3 - 固定高度
  if (jsTableRef3.value) {
    jsTable3 = new Table({
      container: jsTableRef3.value,
      columns,
      data: users50 as User[],
      rowKey: 'id',
      bordered: true,
      height: 300,
      pagination: false,
      theme
    })
  }
})

watch(() => isDark?.value, (dark) => {
  const theme = dark ? 'dark' : 'light'
  jsTable1?.setTheme(theme)
  jsTable2?.setTheme(theme)
  jsTable3?.setTheme(theme)
})

onUnmounted(() => {
  jsTable1?.destroy()
  jsTable2?.destroy()
  jsTable3?.destroy()
})
</script>

<template>
  <div class="space-y-6">
    <!-- 说明 -->
    <div :class="['rounded-xl p-6 border transition-colors', isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200']">
      <h2 :class="['text-xl font-bold mb-2', isDark ? 'text-white' : 'text-gray-900']">基础表格</h2>
      <p :class="isDark ? 'text-gray-400' : 'text-gray-600'">
        展示基本的表格功能，包括边框、斑马纹、行悬停效果等。每个示例同时展示原生JS和Vue两种实现方式。
      </p>
    </div>

    <!-- 带边框 -->
    <div :class="['rounded-xl p-6 border transition-colors', isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200']">
      <h3 :class="['text-lg font-semibold mb-4', isDark ? 'text-white' : 'text-gray-800']">带边框</h3>
      
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <!-- 原生JS -->
        <div>
          <h4 :class="['text-sm font-medium mb-2 flex items-center gap-2', isDark ? 'text-gray-400' : 'text-gray-500']">
            <span class="px-2 py-0.5 bg-yellow-100 text-yellow-800 rounded text-xs">原生 JS</span>
          </h4>
          <div ref="jsTableRef1"></div>
        </div>
        
        <!-- Vue -->
        <div>
          <h4 :class="['text-sm font-medium mb-2 flex items-center gap-2', isDark ? 'text-gray-400' : 'text-gray-500']">
            <span class="px-2 py-0.5 bg-green-100 text-green-800 rounded text-xs">Vue 组件</span>
          </h4>
          <LTable
            :columns="columns"
            :data="users50.slice(0, 5)"
            :pagination="false"
            :theme="isDark ? 'dark' : 'light'"
            bordered
            row-key="id"
          />
        </div>
      </div>
    </div>

    <!-- 斑马纹 -->
    <div :class="['rounded-xl p-6 border transition-colors', isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200']">
      <h3 :class="['text-lg font-semibold mb-4', isDark ? 'text-white' : 'text-gray-800']">斑马纹</h3>
      
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <!-- 原生JS -->
        <div>
          <h4 :class="['text-sm font-medium mb-2 flex items-center gap-2', isDark ? 'text-gray-400' : 'text-gray-500']">
            <span class="px-2 py-0.5 bg-yellow-100 text-yellow-800 rounded text-xs">原生 JS</span>
          </h4>
          <div ref="jsTableRef2"></div>
        </div>
        
        <!-- Vue -->
        <div>
          <h4 :class="['text-sm font-medium mb-2 flex items-center gap-2', isDark ? 'text-gray-400' : 'text-gray-500']">
            <span class="px-2 py-0.5 bg-green-100 text-green-800 rounded text-xs">Vue 组件</span>
          </h4>
          <LTable
            :columns="columns"
            :data="users50.slice(0, 5)"
            :pagination="false"
            :theme="isDark ? 'dark' : 'light'"
            striped
            row-key="id"
          />
        </div>
      </div>
    </div>

    <!-- 固定高度 -->
    <div :class="['rounded-xl p-6 border transition-colors', isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200']">
      <h3 :class="['text-lg font-semibold mb-4', isDark ? 'text-white' : 'text-gray-800']">固定高度</h3>
      
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <!-- 原生JS -->
        <div>
          <h4 :class="['text-sm font-medium mb-2 flex items-center gap-2', isDark ? 'text-gray-400' : 'text-gray-500']">
            <span class="px-2 py-0.5 bg-yellow-100 text-yellow-800 rounded text-xs">原生 JS</span>
          </h4>
          <div ref="jsTableRef3"></div>
        </div>
        
        <!-- Vue -->
        <div>
          <h4 :class="['text-sm font-medium mb-2 flex items-center gap-2', isDark ? 'text-gray-400' : 'text-gray-500']">
            <span class="px-2 py-0.5 bg-green-100 text-green-800 rounded text-xs">Vue 组件</span>
          </h4>
          <LTable
            :columns="columns"
            :data="users50"
            :pagination="false"
            :height="300"
            :theme="isDark ? 'dark' : 'light'"
            bordered
            row-key="id"
          />
        </div>
      </div>
    </div>

    <!-- 代码示例 -->
    <div :class="['rounded-xl p-6 border transition-colors', isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200']">
      <h3 :class="['text-lg font-semibold mb-4', isDark ? 'text-white' : 'text-gray-800']">代码示例</h3>
      
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div>
          <h4 :class="['text-sm font-medium mb-2', isDark ? 'text-gray-400' : 'text-gray-500']">原生 JS</h4>
          <pre :class="['text-sm p-4 rounded-lg overflow-auto', isDark ? 'bg-gray-900 text-gray-300' : 'bg-gray-50']">import { Table } from '@ldesign/table-core'

const table = new Table({
  container: '#table',
  columns: [...],
  data: [...],
  rowKey: 'id',
  bordered: true,
  striped: true,
  height: 300
})</pre>
        </div>
        
        <div>
          <h4 :class="['text-sm font-medium mb-2', isDark ? 'text-gray-400' : 'text-gray-500']">Vue</h4>
          <pre :class="['text-sm p-4 rounded-lg overflow-auto', isDark ? 'bg-gray-900 text-gray-300' : 'bg-gray-50']">&lt;LTable
  :columns="columns"
  :data="data"
  row-key="id"
  bordered
  striped
  :height="300"
/&gt;</pre>
        </div>
      </div>
    </div>
  </div>
</template>
