<script setup lang="ts">
import { ref, onMounted, onUnmounted, inject, watch, type Ref } from 'vue'
import { LTable, Table } from '@ldesign/table-vue'
import { users50, basicColumns, type User } from '@/data/mockData'

const isDark = inject<Ref<boolean>>('isDark', ref(false))

const jsTableRef = ref<HTMLDivElement>()
let jsTable: InstanceType<typeof Table> | null = null

const expandRender = (record: User) => `
  <div style="padding:16px">
    <p><strong>邮箱:</strong> ${record.email}</p>
    <p><strong>电话:</strong> ${record.phone}</p>
    <p><strong>地址:</strong> ${record.address}</p>
  </div>
`

onMounted(() => {
  if (jsTableRef.value) {
    jsTable = new Table({
      container: jsTableRef.value,
      columns: basicColumns,
      data: users50.slice(0, 8) as User[],
      rowKey: 'id',
      bordered: true,
      pagination: false,
      theme: isDark?.value ? 'dark' : 'light',
      expand: {
        expandedRowRender: expandRender
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
      <h2 :class="['text-xl font-bold mb-2', isDark ? 'text-white' : 'text-gray-900']">展开行</h2>
      <p :class="isDark ? 'text-gray-400' : 'text-gray-600'">
        点击展开图标可以显示行的详细信息。
      </p>
    </div>

    <!-- 展开行 -->
    <div :class="['rounded-xl p-6 border transition-colors', isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200']">
      <h3 :class="['text-lg font-semibold mb-4', isDark ? 'text-white' : 'text-gray-800']">展开行</h3>
      
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
            :columns="basicColumns"
            :data="users50.slice(0, 8)"
            :pagination="false"
            :theme="isDark ? 'dark' : 'light'"
            bordered
            :expand="{
              expandedRowRender: (record) => `
                <div style='padding:16px'>
                  <p><strong>邮箱:</strong> ${record.email}</p>
                  <p><strong>电话:</strong> ${record.phone}</p>
                  <p><strong>地址:</strong> ${record.address}</p>
                </div>
              `
            }"
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
  expand: {
    accordion: true,
    expandedRowRender: (record) => `
      &lt;div&gt;${record.name}&lt;/div&gt;
    `
  }
})</pre>
        </div>
        
        <div>
          <h4 :class="['text-sm font-medium mb-2', isDark ? 'text-gray-400' : 'text-gray-500']">Vue</h4>
          <pre :class="['text-sm p-4 rounded-lg overflow-auto', isDark ? 'bg-gray-900 text-gray-300' : 'bg-gray-50']">&lt;LTable
  :columns="columns"
  :data="data"
  :expand="{
    accordion: true,
    expandedRowRender: (record) => `...`
  }"
/&gt;</pre>
        </div>
      </div>
    </div>
  </div>
</template>
