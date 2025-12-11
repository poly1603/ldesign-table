<script setup lang="ts">
import { ref, onMounted, onUnmounted, inject, watch, type Ref } from 'vue'
import { LTable, Table, type SortState } from '@ldesign/table-vue'
import { users50, sortableColumns, type User } from '@/data/mockData'

const isDark = inject<Ref<boolean>>('isDark', ref(false))

// Vue状态
const sortState = ref<SortState | null>(null)

// 原生JS状态
const jsSortState = ref<SortState | null>(null)

const jsTableRef = ref<HTMLDivElement>()
let jsTable: InstanceType<typeof Table> | null = null

const handleSortChange = (state: SortState | null) => {
  sortState.value = state
}

onMounted(() => {
  if (jsTableRef.value) {
    jsTable = new Table({
      container: jsTableRef.value,
      columns: sortableColumns,
      data: users50 as User[],
      rowKey: 'id',
      bordered: true,
      pagination: { pageSize: 10 },
      theme: isDark?.value ? 'dark' : 'light',
      onSortChange: (state: SortState | null) => {
        jsSortState.value = state
      }
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
      <h2 :class="['text-xl font-bold mb-2', isDark ? 'text-white' : 'text-gray-900']">排序</h2>
      <p :class="isDark ? 'text-gray-400' : 'text-gray-600'">
        点击表头可以对列进行排序，支持升序、降序和取消排序。
      </p>
    </div>

    <!-- 排序表格 -->
    <div :class="['rounded-xl p-6 border transition-colors', isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200']">
      <h3 :class="['text-lg font-semibold mb-4', isDark ? 'text-white' : 'text-gray-800']">可排序列</h3>
      
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <!-- 原生JS -->
        <div>
          <h4 :class="['text-sm font-medium mb-2 flex items-center gap-2', isDark ? 'text-gray-400' : 'text-gray-500']">
            <span class="px-2 py-0.5 bg-yellow-100 text-yellow-800 rounded text-xs">原生 JS</span>
          </h4>
          <div :class="['mb-3 p-3 rounded-lg text-sm', isDark ? 'bg-gray-700' : 'bg-gray-50']">
            <span :class="isDark ? 'text-gray-300' : ''">当前排序:</span>
            <span v-if="jsSortState" class="font-semibold text-blue-500 ml-1">
              {{ jsSortState.key }} - {{ jsSortState.order === 'asc' ? '升序' : '降序' }}
            </span>
            <span v-else :class="['ml-1', isDark ? 'text-gray-500' : 'text-gray-400']">无</span>
          </div>
          <div ref="jsTableRef"></div>
        </div>
        
        <!-- Vue -->
        <div>
          <h4 :class="['text-sm font-medium mb-2 flex items-center gap-2', isDark ? 'text-gray-400' : 'text-gray-500']">
            <span class="px-2 py-0.5 bg-green-100 text-green-800 rounded text-xs">Vue 组件</span>
          </h4>
          <div :class="['mb-3 p-3 rounded-lg text-sm', isDark ? 'bg-gray-700' : 'bg-gray-50']">
            <span :class="isDark ? 'text-gray-300' : ''">当前排序:</span>
            <span v-if="sortState" class="font-semibold text-blue-500 ml-1">
              {{ sortState.key }} - {{ sortState.order === 'asc' ? '升序' : '降序' }}
            </span>
            <span v-else :class="['ml-1', isDark ? 'text-gray-500' : 'text-gray-400']">无</span>
          </div>
          <LTable
            :columns="sortableColumns"
            :data="users50"
            :pagination="{ pageSize: 10 }"
            :theme="isDark ? 'dark' : 'light'"
            bordered
            row-key="id"
            @sort-change="handleSortChange"
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
    { key: 'name', sortable: true },
    { key: 'age', sortable: true }
  ],
  data,
  onSortChange: (state) => {
    console.log('排序:', state)
  }
})</pre>
        </div>
        
        <div>
          <h4 :class="['text-sm font-medium mb-2', isDark ? 'text-gray-400' : 'text-gray-500']">Vue</h4>
          <pre :class="['text-sm p-4 rounded-lg overflow-auto', isDark ? 'bg-gray-900 text-gray-300' : 'bg-gray-50']">&lt;LTable
  :columns="sortableColumns"
  :data="data"
  @sort-change="handleSort"
/&gt;</pre>
        </div>
      </div>
    </div>
  </div>
</template>
