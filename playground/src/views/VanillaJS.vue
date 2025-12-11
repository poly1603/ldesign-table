<script setup lang="ts">
import { ref, onMounted, onUnmounted, inject, watch, type Ref } from 'vue'
import { Table, type TableInstance } from '@ldesign/table-core'
import { users50 } from '@/data/mockData'
import { Play, RotateCcw } from 'lucide-vue-next'

const isDark = inject<Ref<boolean>>('isDark', ref(false))

const containerRef = ref<HTMLDivElement>()
const tableInstance = ref<TableInstance | null>(null)
const logs = ref<string[]>([])

const addLog = (message: string) => {
  const time = new Date().toLocaleTimeString()
  logs.value.unshift(`[${time}] ${message}`)
  if (logs.value.length > 10) {
    logs.value.pop()
  }
}

const initTable = () => {
  if (!containerRef.value) return

  // 销毁已存在的实例
  if (tableInstance.value) {
    tableInstance.value.destroy()
  }

  // 创建新实例
  tableInstance.value = new Table({
    container: containerRef.value,
    columns: [
      { key: 'id', title: 'ID', width: 80, align: 'center' },
      { key: 'name', title: '姓名', width: 120, sortable: true },
      { key: 'age', title: '年龄', width: 80, sortable: true, align: 'center' },
      { key: 'email', title: '邮箱', width: 200, ellipsis: true },
      { key: 'phone', title: '电话', width: 150 },
      { key: 'city', title: '城市', width: 100 },
      {
        key: 'status',
        title: '状态',
        width: 100,
        align: 'center',
        render: (value: string) => {
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
      }
    ],
    data: users50,
    rowKey: 'id',
    bordered: true,
    striped: true,
    pagination: {
      pageSize: 10,
      showTotal: true,
      showSizeChanger: true
    },
    selection: {
      type: 'checkbox'
    },
    theme: isDark?.value ? 'dark' : 'light',
    onRowClick: (record) => {
      addLog(`点击行: ${record.name}`)
    },
    onSortChange: (state) => {
      if (state) {
        addLog(`排序: ${state.key} ${state.order}`)
      } else {
        addLog('清除排序')
      }
    },
    onPageChange: (page, pageSize) => {
      addLog(`分页: 第${page}页, 每页${pageSize}条`)
    }
  })

  // 监听选择变化
  tableInstance.value.on('selection:change', (keys: string[]) => {
    addLog(`选择变化: ${keys.length}项`)
  })

  addLog('表格初始化完成')
}

watch(() => isDark?.value, (dark) => {
  tableInstance.value?.setTheme(dark ? 'dark' : 'light')
  addLog(`切换主题: ${dark ? '暗色' : '亮色'}`)
})

const resetTable = () => {
  tableInstance.value?.clearSort()
  tableInstance.value?.deselectAll()
  tableInstance.value?.gotoPage(1)
  addLog('重置表格')
}

onMounted(() => {
  initTable()
})

onUnmounted(() => {
  tableInstance.value?.destroy()
})
</script>

<template>
  <div class="space-y-6">
    <!-- 说明 -->
    <div :class="['rounded-xl p-6 border transition-colors', isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200']">
      <h2 :class="['text-xl font-bold mb-2', isDark ? 'text-white' : 'text-gray-900']">原生 JavaScript 使用</h2>
      <p :class="isDark ? 'text-gray-400' : 'text-gray-600'">
        @ldesign/table-core 是框架无关的，可以在任何 JavaScript 项目中使用。
        这里展示如何使用原生 JS API 来操作表格。
      </p>
    </div>

    <!-- 操作按钮 -->
    <div :class="['rounded-xl p-6 border transition-colors', isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200']">
      <h3 :class="['text-lg font-semibold mb-4', isDark ? 'text-white' : 'text-gray-800']">API 操作</h3>
      <div class="flex flex-wrap gap-3">
        <button
          @click="initTable"
          class="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Play class="w-4 h-4" />
          重新初始化
        </button>
        <button
          @click="resetTable"
          :class="['inline-flex items-center gap-2 px-4 py-2 border rounded-lg transition-colors', isDark ? 'border-gray-600 text-gray-300 hover:bg-gray-700' : 'border-gray-300 hover:bg-gray-50']"
        >
          <RotateCcw class="w-4 h-4" />
          重置状态
        </button>
      </div>
    </div>

    <!-- 表格容器 -->
    <div :class="['rounded-xl overflow-hidden border', isDark ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200']">
      <div ref="containerRef" class="min-h-[400px]"></div>
    </div>

    <!-- 日志 -->
    <div :class="['rounded-xl p-6 border transition-colors', isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200']">
      <h3 :class="['text-lg font-semibold mb-4', isDark ? 'text-white' : 'text-gray-800']">事件日志</h3>
      <div class="bg-gray-900 rounded-lg p-4 h-48 overflow-y-auto font-mono text-sm">
        <div v-for="(log, index) in logs" :key="index" class="text-green-400">
          {{ log }}
        </div>
        <div v-if="!logs.length" class="text-gray-500">暂无日志...</div>
      </div>
    </div>

    <!-- 代码示例 -->
    <div :class="['rounded-xl p-6 border transition-colors', isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200']">
      <h3 :class="['text-lg font-semibold mb-4', isDark ? 'text-white' : 'text-gray-800']">代码示例</h3>
      <pre :class="['p-4 rounded-lg overflow-auto', isDark ? 'bg-gray-900 text-gray-300' : 'bg-gray-50']">import { Table } from '@ldesign/table-core'
import '@ldesign/table-core/style.css'

// 创建表格实例
const table = new Table({
  container: '#table-container',
  columns: [
    { key: 'name', title: '姓名', sortable: true },
    { key: 'age', title: '年龄' }
  ],
  data: [
    { id: 1, name: '张三', age: 28 },
    { id: 2, name: '李四', age: 32 }
  ],
  rowKey: 'id',
  bordered: true,
  pagination: { pageSize: 10 }
})

// 监听事件
table.on('row:click', (record, index) => {
  console.log('点击行:', record)
})

// 调用方法
table.setData(newData)
table.sort('name', 'asc')
table.gotoPage(2)
table.setTheme('dark')

// 销毁
table.destroy()</pre>
    </div>
  </div>
</template>
