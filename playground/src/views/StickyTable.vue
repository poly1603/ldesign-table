<script setup lang="ts">
import { ref, onMounted, onUnmounted, inject, watch, type Ref } from 'vue'
import { LTable, Table, type ColumnDef } from '@ldesign/table-vue'
import { users100, type User } from '@/data/mockData'

const isDark = inject<Ref<boolean>>('isDark', ref(false))

// 列配置 - 左右固定 + 固定表头
const columns: ColumnDef[] = [
  { key: 'id', title: 'ID', width: 80, fixed: 'left', align: 'center' },
  { key: 'name', title: '姓名', width: 120, fixed: 'left' },
  { key: 'age', title: '年龄', width: 80, align: 'center' },
  { key: 'email', title: '邮箱', width: 220 },
  { key: 'phone', title: '电话', width: 150 },
  { key: 'address', title: '地址', width: 300 },
  { key: 'city', title: '城市', width: 100 },
  { key: 'country', title: '国家', width: 100 },
  { key: 'role', title: '角色', width: 100 },
  { key: 'status', title: '状态', width: 100, fixed: 'right', align: 'center' },
  { key: 'createdAt', title: '创建时间', width: 120, fixed: 'right' }
]

const jsTableRef = ref<HTMLDivElement>()
let jsTable: InstanceType<typeof Table> | null = null

onMounted(() => {
  if (jsTableRef.value) {
    jsTable = new Table({
      container: jsTableRef.value,
      columns,
      data: users100 as User[],
      rowKey: 'id',
      bordered: true,
      height: 400,
      stickyHeader: true,
      pagination: false,
      theme: isDark?.value ? 'dark' : 'light'
    })
  }
})

watch(() => isDark?.value, (dark) => {
  jsTable?.setTheme(dark ? 'dark' : 'light')
})

onUnmounted(() => {
  jsTable?.destroy()
})
</script>

<template>
  <div class="space-y-6">
    <!-- 说明 -->
    <div :class="['rounded-xl p-6 border transition-colors', isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200']">
      <h2 :class="['text-xl font-bold mb-2', isDark ? 'text-white' : 'text-gray-900']">固定表头 + 固定列</h2>
      <p :class="isDark ? 'text-gray-400' : 'text-gray-600'">
        同时支持表头固定和左右列固定，适用于数据量大且列数多的场景。滚动时表头和固定列保持可见。
      </p>
    </div>

    <!-- 演示 -->
    <div :class="['rounded-xl p-6 border transition-colors', isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200']">
      <h3 :class="['text-lg font-semibold mb-4', isDark ? 'text-white' : 'text-gray-800']">固定表头 + 左右固定列</h3>
      
      <div class="space-y-6">
        <!-- 原生JS -->
        <div>
          <h4 :class="['text-sm font-medium mb-2 flex items-center gap-2', isDark ? 'text-gray-400' : 'text-gray-500']">
            <span class="px-2 py-0.5 bg-yellow-100 text-yellow-800 rounded text-xs">原生 JS</span>
          </h4>
          <div ref="jsTableRef"></div>
        </div>
        
        <!-- Vue -->
        <div>
          <h4 :class="['text-sm font-medium mb-2 flex items-center gap-2', isDark ? 'text-gray-400' : 'text-gray-500']">
            <span class="px-2 py-0.5 bg-green-100 text-green-800 rounded text-xs">Vue 组件</span>
          </h4>
          <LTable
            :columns="columns"
            :data="users100"
            :height="400"
            :pagination="false"
            :theme="isDark ? 'dark' : 'light'"
            sticky-header
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
          <pre :class="['text-sm p-4 rounded-lg overflow-auto', isDark ? 'bg-gray-900 text-gray-300' : 'bg-gray-50']">const table = new Table({
  container: '#table',
  columns: [
    { key: 'id', fixed: 'left' },
    { key: 'name', fixed: 'left' },
    // ...中间列
    { key: 'status', fixed: 'right' }
  ],
  data,
  height: 400,
  stickyHeader: true
})</pre>
        </div>
        
        <div>
          <h4 :class="['text-sm font-medium mb-2', isDark ? 'text-gray-400' : 'text-gray-500']">Vue</h4>
          <pre :class="['text-sm p-4 rounded-lg overflow-auto', isDark ? 'bg-gray-900 text-gray-300' : 'bg-gray-50']">&lt;LTable
  :columns="columns"
  :data="data"
  :height="400"
  sticky-header
/&gt;</pre>
        </div>
      </div>
    </div>
  </div>
</template>
