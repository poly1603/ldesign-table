<script setup lang="ts">
import { ref, onMounted, onUnmounted, inject, watch, type Ref } from 'vue'
import { LTable, Table, type ColumnDef } from '@ldesign/table-vue'
import { users50, type User } from '@/data/mockData'

const isDark = inject<Ref<boolean>>('isDark', ref(false))

// 多级表头配置
const columns: ColumnDef[] = [
  { key: 'id', title: 'ID', width: 80, align: 'center' },
  { key: 'name', title: '姓名', width: 120 },
  {
    key: 'personal',
    title: '个人信息',
    children: [
      { key: 'age', title: '年龄', width: 80, align: 'center' },
      { key: 'phone', title: '电话', width: 150 }
    ]
  },
  {
    key: 'contact',
    title: '联系方式',
    children: [
      { key: 'email', title: '邮箱', width: 200 },
      {
        key: 'location',
        title: '位置',
        children: [
          { key: 'city', title: '城市', width: 100 },
          { key: 'address', title: '地址', width: 200 }
        ]
      }
    ]
  },
  { key: 'status', title: '状态', width: 100, align: 'center' }
]

const jsTableRef = ref<HTMLDivElement>()
let jsTable: InstanceType<typeof Table> | null = null

onMounted(() => {
  if (jsTableRef.value) {
    jsTable = new Table({
      container: jsTableRef.value,
      columns,
      data: users50 as User[],
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
      <h2 :class="['text-xl font-bold mb-2', isDark ? 'text-white' : 'text-gray-900']">多级表头</h2>
      <p :class="isDark ? 'text-gray-400' : 'text-gray-600'">
        支持复杂的多级分组表头，通过列配置的 children 属性实现嵌套层级。
      </p>
    </div>

    <!-- 演示 -->
    <div :class="['rounded-xl p-6 border transition-colors', isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200']">
      <h3 :class="['text-lg font-semibold mb-4', isDark ? 'text-white' : 'text-gray-800']">分组表头示例</h3>
      
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
            :data="users50"
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
      
      <pre :class="['text-sm p-4 rounded-lg overflow-auto', isDark ? 'bg-gray-900 text-gray-300' : 'bg-gray-50 text-gray-800']">const columns = [
  { key: 'id', title: 'ID' },
  { key: 'name', title: '姓名' },
  {
    key: 'personal',
    title: '个人信息',
    children: [
      { key: 'age', title: '年龄' },
      { key: 'phone', title: '电话' }
    ]
  },
  {
    key: 'contact',
    title: '联系方式',
    children: [
      { key: 'email', title: '邮箱' },
      {
        key: 'location',
        title: '位置',
        children: [
          { key: 'city', title: '城市' },
          { key: 'address', title: '地址' }
        ]
      }
    ]
  }
]</pre>
    </div>
  </div>
</template>
