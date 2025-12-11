<script setup lang="ts">
import { ref, onMounted, onUnmounted, inject, watch, type Ref } from 'vue'
import { LTable, Table, type ColumnDef } from '@ldesign/table-vue'

const isDark = inject<Ref<boolean>>('isDark', ref(false))

// 可编辑数据
const editableData = ref([
  { id: 1, name: '张三', age: 28, email: 'zhangsan@example.com', status: 'active' },
  { id: 2, name: '李四', age: 32, email: 'lisi@example.com', status: 'inactive' },
  { id: 3, name: '王五', age: 25, email: 'wangwu@example.com', status: 'pending' },
  { id: 4, name: '赵六', age: 35, email: 'zhaoliu@example.com', status: 'active' },
  { id: 5, name: '钱七', age: 29, email: 'qianqi@example.com', status: 'active' }
])

// 列配置 - 可编辑
const columns: ColumnDef[] = [
  { key: 'id', title: 'ID', width: 80, align: 'center' },
  { 
    key: 'name', 
    title: '姓名', 
    width: 120,
    editable: true 
  },
  { 
    key: 'age', 
    title: '年龄', 
    width: 100, 
    align: 'center',
    editable: { type: 'number' }
  },
  { 
    key: 'email', 
    title: '邮箱', 
    width: 220,
    editable: true
  },
  { 
    key: 'status', 
    title: '状态', 
    width: 120, 
    align: 'center',
    editable: {
      type: 'select',
      options: [
        { label: '活跃', value: 'active' },
        { label: '未活跃', value: 'inactive' },
        { label: '待定', value: 'pending' }
      ]
    }
  }
]

const jsTableRef = ref<HTMLDivElement>()
let jsTable: InstanceType<typeof Table> | null = null
const editLogs = ref<string[]>([])

const addLog = (msg: string) => {
  const time = new Date().toLocaleTimeString()
  editLogs.value.unshift(`[${time}] ${msg}`)
  if (editLogs.value.length > 5) editLogs.value.pop()
}

onMounted(() => {
  if (jsTableRef.value) {
    jsTable = new Table({
      container: jsTableRef.value,
      columns,
      data: editableData.value,
      rowKey: 'id',
      bordered: true,
      pagination: false,
      theme: isDark?.value ? 'dark' : 'light'
    })
    
    jsTable.on('cell:edit', (record: any, column: any, rowIndex: number, newValue: any, oldValue: any) => {
      addLog(`编辑 [${record.name}] 的 [${column.title}]: ${oldValue} → ${newValue}`)
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
      <h2 :class="['text-xl font-bold mb-2', isDark ? 'text-white' : 'text-gray-900']">可编辑表格</h2>
      <p :class="isDark ? 'text-gray-400' : 'text-gray-600'">
        双击单元格即可编辑。支持文本、数字、下拉选择等多种编辑类型。按 Enter 保存，按 Escape 取消。
      </p>
    </div>

    <!-- 演示 -->
    <div :class="['rounded-xl p-6 border transition-colors', isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200']">
      <h3 :class="['text-lg font-semibold mb-4', isDark ? 'text-white' : 'text-gray-800']">双击编辑</h3>
      
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
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
            :data="editableData"
            :pagination="false"
            :theme="isDark ? 'dark' : 'light'"
            bordered
            row-key="id"
          />
        </div>
      </div>

      <!-- 编辑日志 -->
      <div :class="['mt-4 p-4 rounded-lg', isDark ? 'bg-gray-700' : 'bg-gray-50']">
        <h4 :class="['text-sm font-medium mb-2', isDark ? 'text-gray-300' : 'text-gray-700']">编辑日志</h4>
        <div :class="['text-sm space-y-1 font-mono', isDark ? 'text-gray-400' : 'text-gray-600']">
          <div v-for="(log, index) in editLogs" :key="index">{{ log }}</div>
          <div v-if="editLogs.length === 0" :class="isDark ? 'text-gray-500' : 'text-gray-400'">暂无编辑记录，双击单元格开始编辑</div>
        </div>
      </div>
    </div>

    <!-- 代码示例 -->
    <div :class="['rounded-xl p-6 border transition-colors', isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200']">
      <h3 :class="['text-lg font-semibold mb-4', isDark ? 'text-white' : 'text-gray-800']">代码示例</h3>
      
      <pre :class="['text-sm p-4 rounded-lg overflow-auto', isDark ? 'bg-gray-900 text-gray-300' : 'bg-gray-50']">const columns = [
  { key: 'name', title: '姓名', editable: true },
  { key: 'age', title: '年龄', editable: { type: 'number' } },
  { 
    key: 'status', 
    title: '状态',
    editable: {
      type: 'select',
      options: [
        { label: '活跃', value: 'active' },
        { label: '未活跃', value: 'inactive' }
      ]
    }
  }
]

// 监听编辑事件
table.on('cell:edit', (record, column, rowIndex, newValue, oldValue) => {
  console.log(`${column.title}: ${oldValue} → ${newValue}`)
})</pre>
    </div>
  </div>
</template>
