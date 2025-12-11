<script setup lang="ts">
import { ref, onMounted, onUnmounted, inject, watch, type Ref } from 'vue'
import { LTable, Table, type ColumnDef } from '@ldesign/table-vue'

const isDark = inject<Ref<boolean>>('isDark', ref(false))

// 合并单元格数据
const mergeData = [
  { id: 1, department: '技术部', team: '前端组', name: '张三', role: '开发' },
  { id: 2, department: '技术部', team: '前端组', name: '李四', role: '开发' },
  { id: 3, department: '技术部', team: '前端组', name: '王五', role: '组长' },
  { id: 4, department: '技术部', team: '后端组', name: '赵六', role: '开发' },
  { id: 5, department: '技术部', team: '后端组', name: '钱七', role: '组长' },
  { id: 6, department: '产品部', team: '产品组', name: '孙八', role: '产品经理' },
  { id: 7, department: '产品部', team: '产品组', name: '周九', role: '产品经理' },
  { id: 8, department: '产品部', team: '设计组', name: '吴十', role: '设计师' }
]

// 计算行合并
const getDepartmentRowSpan = (record: any, rowIndex: number) => {
  const currentDept = record.department
  // 找到同部门的第一行
  const firstIndex = mergeData.findIndex(r => r.department === currentDept)
  if (rowIndex === firstIndex) {
    // 计算该部门有多少行
    return mergeData.filter(r => r.department === currentDept).length
  }
  return 0 // 0 表示不渲染此单元格
}

const getTeamRowSpan = (record: any, rowIndex: number) => {
  const currentTeam = record.team
  const currentDept = record.department
  // 找到同team的第一行
  const firstIndex = mergeData.findIndex(r => r.team === currentTeam && r.department === currentDept)
  if (rowIndex === firstIndex) {
    return mergeData.filter(r => r.team === currentTeam && r.department === currentDept).length
  }
  return 0
}

// 列配置 - 单元格合并
const columns: ColumnDef[] = [
  { key: 'id', title: 'ID', width: 60, align: 'center' },
  { 
    key: 'department', 
    title: '部门', 
    width: 120,
    rowSpan: getDepartmentRowSpan
  },
  { 
    key: 'team', 
    title: '小组', 
    width: 120,
    rowSpan: getTeamRowSpan
  },
  { key: 'name', title: '姓名', width: 120 },
  { key: 'role', title: '角色', width: 120 }
]

const jsTableRef = ref<HTMLDivElement>()
let jsTable: InstanceType<typeof Table> | null = null

onMounted(() => {
  if (jsTableRef.value) {
    jsTable = new Table({
      container: jsTableRef.value,
      columns,
      data: mergeData,
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
      <h2 :class="['text-xl font-bold mb-2', isDark ? 'text-white' : 'text-gray-900']">单元格合并</h2>
      <p :class="isDark ? 'text-gray-400' : 'text-gray-600'">
        通过 rowSpan 和 colSpan 属性实现单元格的行合并和列合并。支持函数形式动态计算合并范围。
      </p>
    </div>

    <!-- 演示 -->
    <div :class="['rounded-xl p-6 border transition-colors', isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200']">
      <h3 :class="['text-lg font-semibold mb-4', isDark ? 'text-white' : 'text-gray-800']">行合并示例</h3>
      
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
            :data="mergeData"
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
  { 
    key: 'department', 
    title: '部门',
    // rowSpan 函数返回合并的行数
    // 返回 0 表示该单元格被合并，不渲染
    rowSpan: (record, rowIndex) => {
      const dept = record.department
      const firstIndex = data.findIndex(r => r.department === dept)
      if (rowIndex === firstIndex) {
        return data.filter(r => r.department === dept).length
      }
      return 0
    }
  },
  // colSpan 同理，用于列合并
  {
    key: 'info',
    title: '信息',
    colSpan: (record, rowIndex) => rowIndex === 0 ? 2 : 1
  }
]</pre>
    </div>
  </div>
</template>
