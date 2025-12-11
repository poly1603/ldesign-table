<script setup lang="ts">
import { ref, onMounted, onUnmounted, inject, watch, type Ref } from 'vue'
import { LTable, Table, type ColumnDef } from '@ldesign/table-vue'
import { users50, type User } from '@/data/mockData'

const isDark = inject<Ref<boolean>>('isDark', ref(false))

const columns: ColumnDef[] = [
  { key: 'name', title: '姓名', width: 120, fixed: 'left' },
  { key: 'age', title: '年龄', width: 100 },
  { key: 'email', title: '邮箱', width: 250 },
  { key: 'phone', title: '电话', width: 150 },
  { key: 'address', title: '地址', width: 300 },
  { key: 'city', title: '城市', width: 120 },
  { key: 'createdAt', title: '创建时间', width: 120, fixed: 'right' }
]

const jsTableRef = ref<HTMLDivElement>()
let jsTable: InstanceType<typeof Table> | null = null

onMounted(() => {
  if (jsTableRef.value) {
    jsTable = new Table({
      container: jsTableRef.value,
      columns,
      data: users50.slice(0, 8) as User[],
      rowKey: 'id',
      bordered: true,
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
      <h2 :class="['text-xl font-bold mb-2', isDark ? 'text-white' : 'text-gray-900']">固定列</h2>
      <p :class="isDark ? 'text-gray-400' : 'text-gray-600'">
        当表格内容过宽时，可以固定左右两侧的列。横向滚动时固定列保持不动。
      </p>
    </div>

    <!-- 固定列表格 -->
    <div :class="['rounded-xl p-6 border transition-colors', isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200']">
      <h3 :class="['text-lg font-semibold mb-4', isDark ? 'text-white' : 'text-gray-800']">固定列</h3>
      
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
            :data="users50.slice(0, 8)"
            :pagination="false"
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
          <pre :class="['text-sm p-4 rounded-lg overflow-auto', isDark ? 'bg-gray-900 text-gray-300' : 'bg-gray-50']">const table = new Table({
  container: '#table',
  columns: [
    { key: 'name', fixed: 'left' },
    // ...
    { key: 'createdAt', fixed: 'right' }
  ],
  data
})</pre>
        </div>
        
        <div>
          <h4 :class="['text-sm font-medium mb-2', isDark ? 'text-gray-400' : 'text-gray-500']">Vue</h4>
          <pre :class="['text-sm p-4 rounded-lg overflow-auto', isDark ? 'bg-gray-900 text-gray-300' : 'bg-gray-50']">&lt;LTable
  :columns="[
    { key: 'name', fixed: 'left' },
    { key: 'createdAt', fixed: 'right' }
  ]"
  :data="data"
/&gt;</pre>
        </div>
      </div>
    </div>
  </div>
</template>
