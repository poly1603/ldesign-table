<script setup lang="ts">
import { ref, onMounted, onUnmounted, inject, watch, type Ref } from 'vue'
import { LTable, Table } from '@ldesign/table-vue'
import { users100, basicColumns, type User } from '@/data/mockData'

const isDark = inject<Ref<boolean>>('isDark', ref(false))

// Vue状态
const currentPage = ref(1)
const pageSize = ref(10)

// 原生JS状态
const jsCurrentPage = ref(1)
const jsPageSize = ref(10)

const jsTableRef = ref<HTMLDivElement>()
let jsTable: InstanceType<typeof Table> | null = null

const handlePageChange = (page: number, size: number) => {
  currentPage.value = page
  pageSize.value = size
}

onMounted(() => {
  if (jsTableRef.value) {
    jsTable = new Table({
      container: jsTableRef.value,
      columns: basicColumns,
      data: users100 as User[],
      rowKey: 'id',
      bordered: true,
      theme: isDark?.value ? 'dark' : 'light',
      pagination: {
        pageSize: 10,
        showTotal: true,
        showSizeChanger: true
      },
      onPageChange: (page: number, size: number) => {
        jsCurrentPage.value = page
        jsPageSize.value = size
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
      <h2 :class="['text-xl font-bold mb-2', isDark ? 'text-white' : 'text-gray-900']">分页</h2>
      <p :class="isDark ? 'text-gray-400' : 'text-gray-600'">
        支持分页功能，可以配置每页条数、显示总数、快速跳转等。
      </p>
    </div>

    <!-- 分页表格 -->
    <div :class="['rounded-xl p-6 border transition-colors', isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200']">
      <h3 :class="['text-lg font-semibold mb-4', isDark ? 'text-white' : 'text-gray-800']">分页功能</h3>
      
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <!-- 原生JS -->
        <div>
          <h4 :class="['text-sm font-medium mb-2 flex items-center gap-2', isDark ? 'text-gray-400' : 'text-gray-500']">
            <span class="px-2 py-0.5 bg-yellow-100 text-yellow-800 rounded text-xs">原生 JS</span>
          </h4>
          <div :class="['mb-3 p-3 rounded-lg text-sm', isDark ? 'bg-gray-700 text-gray-300' : 'bg-gray-50']">
            第 <span class="font-semibold text-blue-500">{{ jsCurrentPage }}</span> 页,
            每页 <span class="font-semibold text-blue-500">{{ jsPageSize }}</span> 条
          </div>
          <div ref="jsTableRef"></div>
        </div>
        
        <!-- Vue -->
        <div>
          <h4 :class="['text-sm font-medium mb-2 flex items-center gap-2', isDark ? 'text-gray-400' : 'text-gray-500']">
            <span class="px-2 py-0.5 bg-green-100 text-green-800 rounded text-xs">Vue 组件</span>
          </h4>
          <div :class="['mb-3 p-3 rounded-lg text-sm', isDark ? 'bg-gray-700 text-gray-300' : 'bg-gray-50']">
            第 <span class="font-semibold text-blue-500">{{ currentPage }}</span> 页,
            每页 <span class="font-semibold text-blue-500">{{ pageSize }}</span> 条
          </div>
          <LTable
            :columns="basicColumns"
            :data="users100"
            :pagination="{
              pageSize: 10,
              showTotal: true,
              showSizeChanger: true
            }"
            :theme="isDark ? 'dark' : 'light'"
            bordered
            row-key="id"
            @page-change="handlePageChange"
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
  pagination: {
    pageSize: 10,
    showTotal: true,
    showSizeChanger: true
  },
  onPageChange: (page, size) => {
    console.log('分页:', page, size)
  }
})</pre>
        </div>
        
        <div>
          <h4 :class="['text-sm font-medium mb-2', isDark ? 'text-gray-400' : 'text-gray-500']">Vue</h4>
          <pre :class="['text-sm p-4 rounded-lg overflow-auto', isDark ? 'bg-gray-900 text-gray-300' : 'bg-gray-50']">&lt;LTable
  :columns="columns"
  :data="data"
  :pagination="{
    pageSize: 10,
    showTotal: true,
    showSizeChanger: true
  }"
  @page-change="handlePage"
/&gt;</pre>
        </div>
      </div>
    </div>
  </div>
</template>
