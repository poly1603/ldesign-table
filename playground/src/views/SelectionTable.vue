<script setup lang="ts">
import { ref, onMounted, onUnmounted, inject, watch, type Ref } from 'vue'
import { LTable, Table } from '@ldesign/table-vue'
import { users50, basicColumns, type User } from '@/data/mockData'

const isDark = inject<Ref<boolean>>('isDark', ref(false))

// Vue状态
const selectedKeys = ref<string[]>([])
const selectedRows = ref<any[]>([])

// 原生JS状态
const jsSelectedKeys = ref<string[]>([])
const jsSelectedRows = ref<any[]>([])

// 原生JS表格容器
const jsCheckboxRef = ref<HTMLDivElement>()
const jsRadioRef = ref<HTMLDivElement>()

let jsCheckboxTable: InstanceType<typeof Table> | null = null
let jsRadioTable: InstanceType<typeof Table> | null = null

const handleSelectionChange = (keys: string[], rows: any[]) => {
  selectedKeys.value = keys
  selectedRows.value = rows
}

onMounted(() => {
  // 多选表格
  if (jsCheckboxRef.value) {
    jsCheckboxTable = new Table({
      container: jsCheckboxRef.value,
      columns: basicColumns,
      data: users50.slice(0, 8) as User[],
      rowKey: 'id',
      bordered: true,
      pagination: false,
      theme: isDark?.value ? 'dark' : 'light',
      selection: { 
        type: 'checkbox',
        onChange: (keys: string[], rows: any[]) => {
          jsSelectedKeys.value = keys
          jsSelectedRows.value = rows
        }
      }
    })
  }

  // 单选表格
  if (jsRadioRef.value) {
    jsRadioTable = new Table({
      container: jsRadioRef.value,
      columns: basicColumns,
      data: users50.slice(0, 8) as User[],
      rowKey: 'id',
      bordered: true,
      pagination: false,
      theme: isDark?.value ? 'dark' : 'light',
      selection: { type: 'radio' }
    })
  }
})

watch(() => isDark?.value, (dark) => {
  jsCheckboxTable?.setTheme(dark ? 'dark' : 'light')
  jsRadioTable?.setTheme(dark ? 'dark' : 'light')
})

onUnmounted(() => {
  jsCheckboxTable?.destroy()
  jsRadioTable?.destroy()
})
</script>

<template>
  <div class="space-y-6">
    <!-- 说明 -->
    <div :class="['rounded-xl p-6 border transition-colors', isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200']">
      <h2 :class="['text-xl font-bold mb-2', isDark ? 'text-white' : 'text-gray-900']">行选择</h2>
      <p :class="isDark ? 'text-gray-400' : 'text-gray-600'">
        支持复选框和单选框两种选择模式，可以获取选中的行数据。
      </p>
    </div>

    <!-- 多选 -->
    <div :class="['rounded-xl p-6 border transition-colors', isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200']">
      <h3 :class="['text-lg font-semibold mb-4', isDark ? 'text-white' : 'text-gray-800']">多选</h3>
      
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <!-- 原生JS -->
        <div>
          <h4 :class="['text-sm font-medium mb-2 flex items-center gap-2', isDark ? 'text-gray-400' : 'text-gray-500']">
            <span class="px-2 py-0.5 bg-yellow-100 text-yellow-800 rounded text-xs">原生 JS</span>
          </h4>
          <div :class="['mb-3 p-3 rounded-lg text-sm', isDark ? 'bg-gray-700 text-gray-300' : 'bg-gray-50']">
            已选择 <span class="font-semibold text-blue-500">{{ jsSelectedKeys.length }}</span> 项
            <span v-if="jsSelectedRows.length" :class="['ml-2', isDark ? 'text-gray-400' : 'text-gray-500']">
              ({{ jsSelectedRows.map(r => r.name).join(', ') }})
            </span>
          </div>
          <div ref="jsCheckboxRef"></div>
        </div>
        
        <!-- Vue -->
        <div>
          <h4 :class="['text-sm font-medium mb-2 flex items-center gap-2', isDark ? 'text-gray-400' : 'text-gray-500']">
            <span class="px-2 py-0.5 bg-green-100 text-green-800 rounded text-xs">Vue 组件</span>
          </h4>
          <div :class="['mb-3 p-3 rounded-lg text-sm', isDark ? 'bg-gray-700 text-gray-300' : 'bg-gray-50']">
            已选择 <span class="font-semibold text-blue-500">{{ selectedKeys.length }}</span> 项
            <span v-if="selectedRows.length" :class="['ml-2', isDark ? 'text-gray-400' : 'text-gray-500']">
              ({{ selectedRows.map(r => r.name).join(', ') }})
            </span>
          </div>
          <LTable
            :columns="basicColumns"
            :data="users50.slice(0, 8)"
            :pagination="false"
            :theme="isDark ? 'dark' : 'light'"
            :selection="{ type: 'checkbox' }"
            bordered
            row-key="id"
            @selection-change="handleSelectionChange"
          />
        </div>
      </div>
    </div>

    <!-- 单选 -->
    <div :class="['rounded-xl p-6 border transition-colors', isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200']">
      <h3 :class="['text-lg font-semibold mb-4', isDark ? 'text-white' : 'text-gray-800']">单选</h3>
      
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <!-- 原生JS -->
        <div>
          <h4 :class="['text-sm font-medium mb-2 flex items-center gap-2', isDark ? 'text-gray-400' : 'text-gray-500']">
            <span class="px-2 py-0.5 bg-yellow-100 text-yellow-800 rounded text-xs">原生 JS</span>
          </h4>
          <div ref="jsRadioRef"></div>
        </div>
        
        <!-- Vue -->
        <div>
          <h4 :class="['text-sm font-medium mb-2 flex items-center gap-2', isDark ? 'text-gray-400' : 'text-gray-500']">
            <span class="px-2 py-0.5 bg-green-100 text-green-800 rounded text-xs">Vue 组件</span>
          </h4>
          <LTable
            :columns="basicColumns"
            :data="users50.slice(0, 8)"
            :pagination="false"
            :theme="isDark ? 'dark' : 'light'"
            :selection="{ type: 'radio' }"
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
  columns,
  data,
  selection: { type: 'checkbox' },
  onSelectionChange: (keys, rows) => {
    console.log('选中:', keys)
  }
})</pre>
        </div>
        
        <div>
          <h4 :class="['text-sm font-medium mb-2', isDark ? 'text-gray-400' : 'text-gray-500']">Vue</h4>
          <pre :class="['text-sm p-4 rounded-lg overflow-auto', isDark ? 'bg-gray-900 text-gray-300' : 'bg-gray-50']">&lt;LTable
  :columns="columns"
  :data="data"
  :selection="{ type: 'checkbox' }"
  @selection-change="handleChange"
/&gt;</pre>
        </div>
      </div>
    </div>
  </div>
</template>
