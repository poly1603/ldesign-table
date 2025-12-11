<script setup lang="ts">
import { ref, watch, onMounted, provide } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import {
  Table2,
  CheckSquare,
  ArrowUpDown,
  Filter,
  ChevronRight,
  Expand,
  Pin,
  Menu,
  X,
  Github,
  Layers,
  Edit3,
  Grid3X3,
  Lock,
  Sun,
  Moon,
  Palette
} from 'lucide-vue-next'

const router = useRouter()
const route = useRoute()
const sidebarOpen = ref(true)
const isDark = ref(false)
const showColorPicker = ref(false)
const primaryColor = ref('#1677ff')

// 主题色预设
const colorPresets = [
  { name: '默认蓝', value: '#1677ff' },
  { name: '拂晓蓝', value: '#1890ff' },
  { name: '薄暮', value: '#722ed1' },
  { name: '火山', value: '#fa541c' },
  { name: '日暮', value: '#faad14' },
  { name: '明青', value: '#13c2c2' },
  { name: '极光绿', value: '#52c41a' },
  { name: '酱紫', value: '#eb2f96' }
]

const menuItems = [
  { path: '/', name: '首页', icon: Table2 },
  { path: '/basic', name: '基础表格', icon: Table2 },
  { path: '/selection', name: '行选择', icon: CheckSquare },
  { path: '/sorting', name: '排序', icon: ArrowUpDown },
  { path: '/filtering', name: '筛选', icon: Filter },
  { path: '/pagination', name: '分页', icon: ChevronRight },
  { path: '/expand', name: '展开行', icon: Expand },
  { path: '/fixed', name: '固定列', icon: Pin },
  { path: '/sticky', name: '固定表头+列', icon: Lock },
  { path: '/multi-header', name: '多级表头', icon: Layers },
  { path: '/editable', name: '可编辑', icon: Edit3 },
  { path: '/merge', name: '单元格合并', icon: Grid3X3 }
]

const toggleSidebar = () => {
  sidebarOpen.value = !sidebarOpen.value
}

const toggleTheme = () => {
  isDark.value = !isDark.value
}

const setColor = (color: string) => {
  primaryColor.value = color
  // 同时设置 Tailwind 和表格的主题色
  document.documentElement.style.setProperty('--primary-color', color)
  document.documentElement.style.setProperty('--lt-color-primary', color)
  // 计算 hover 色（稍微变暗）
  const hoverColor = adjustColor(color, -10)
  document.documentElement.style.setProperty('--lt-color-primary-hover', hoverColor)
  showColorPicker.value = false
}

// 简单的颜色调整函数
const adjustColor = (color: string, amount: number) => {
  const hex = color.replace('#', '')
  const r = Math.max(0, Math.min(255, parseInt(hex.substring(0, 2), 16) + amount))
  const g = Math.max(0, Math.min(255, parseInt(hex.substring(2, 4), 16) + amount))
  const b = Math.max(0, Math.min(255, parseInt(hex.substring(4, 6), 16) + amount))
  return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`
}

// 监听主题变化
watch(isDark, (dark) => {
  if (dark) {
    document.documentElement.classList.add('dark')
    document.documentElement.setAttribute('data-theme', 'dark')
  } else {
    document.documentElement.classList.remove('dark')
    document.documentElement.setAttribute('data-theme', 'light')
  }
})

// 提供全局主题状态
provide('isDark', isDark)
provide('primaryColor', primaryColor)

onMounted(() => {
  // 检测系统主题偏好
  if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
    isDark.value = true
    document.documentElement.setAttribute('data-theme', 'dark')
  }
  // 设置初始主题色
  document.documentElement.style.setProperty('--primary-color', primaryColor.value)
  document.documentElement.style.setProperty('--lt-color-primary', primaryColor.value)
  const hoverColor = adjustColor(primaryColor.value, -10)
  document.documentElement.style.setProperty('--lt-color-primary-hover', hoverColor)
})
</script>

<template>
  <div :class="['flex min-h-screen transition-colors duration-300', isDark ? 'dark bg-gray-900' : 'bg-gray-50']">
    <!-- 侧边栏 -->
    <aside
      :class="[
        'fixed lg:sticky top-0 left-0 z-40 h-screen transition-transform lg:translate-x-0',
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      ]"
      style="width: 260px"
    >
      <div :class="['h-full flex flex-col border-r transition-colors duration-300', isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200']">
        <!-- Logo -->
        <div :class="['flex items-center justify-between h-16 px-4 border-b', isDark ? 'border-gray-700' : 'border-gray-200']">
          <div class="flex items-center gap-3">
            <div
              class="w-8 h-8 rounded-lg flex items-center justify-center"
              :style="{ background: `linear-gradient(135deg, ${primaryColor}, ${primaryColor}dd)` }"
            >
              <Table2 class="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 :class="['text-lg font-bold', isDark ? 'text-white' : 'text-gray-900']">LDesign Table</h1>
              <p :class="['text-xs', isDark ? 'text-gray-400' : 'text-gray-500']">v0.1.0</p>
            </div>
          </div>
          <button @click="toggleSidebar" :class="['lg:hidden p-2', isDark ? 'text-gray-400 hover:text-white' : 'text-gray-500 hover:text-gray-700']">
            <X class="w-5 h-5" />
          </button>
        </div>

        <!-- 导航菜单 -->
        <nav class="flex-1 overflow-y-auto py-4 px-3">
          <ul class="space-y-1">
            <li v-for="item in menuItems" :key="item.path">
              <router-link
                :to="item.path"
                :class="[
                  'flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors',
                  route.path === item.path
                    ? isDark ? 'bg-blue-900/50 text-blue-400' : 'bg-blue-50 text-blue-600'
                    : isDark ? 'text-gray-300 hover:bg-gray-700 hover:text-white' : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                ]"
              >
                <component :is="item.icon" class="w-5 h-5" />
                <span class="font-medium">{{ item.name }}</span>
              </router-link>
            </li>
          </ul>
        </nav>

        <!-- 底部 -->
        <div :class="['p-4 border-t', isDark ? 'border-gray-700' : 'border-gray-200']">
          <a
            href="https://github.com"
            target="_blank"
            :class="['flex items-center gap-2 transition-colors', isDark ? 'text-gray-400 hover:text-white' : 'text-gray-500 hover:text-gray-700']"
          >
            <Github class="w-5 h-5" />
            <span class="text-sm">GitHub</span>
          </a>
        </div>
      </div>
    </aside>

    <!-- 遮罩层 -->
    <div
      v-if="sidebarOpen"
      class="fixed inset-0 bg-black/50 z-30 lg:hidden"
      @click="toggleSidebar"
    />

    <!-- 主内容区 -->
    <div class="flex-1 flex flex-col min-w-0">
      <!-- 顶部栏 -->
      <header :class="['sticky top-0 z-20 h-16 border-b flex items-center px-4 lg:px-6 transition-colors duration-300', isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200']">
        <button
          @click="toggleSidebar"
          :class="['lg:hidden p-2 -ml-2 mr-2', isDark ? 'text-gray-400 hover:text-white' : 'text-gray-500 hover:text-gray-700']"
        >
          <Menu class="w-5 h-5" />
        </button>
        <div class="flex-1">
          <h2 :class="['text-lg font-semibold', isDark ? 'text-white' : 'text-gray-900']">
            {{ menuItems.find(item => item.path === route.path)?.name || '表格演示' }}
          </h2>
        </div>
        
        <!-- 主题控制 -->
        <div class="flex items-center gap-2">
          <!-- 主题色选择器 -->
          <div class="relative">
            <button
              @click="showColorPicker = !showColorPicker"
              :class="['p-2 rounded-lg transition-colors', isDark ? 'hover:bg-gray-700 text-gray-400 hover:text-white' : 'hover:bg-gray-100 text-gray-500 hover:text-gray-700']"
              title="主题色"
            >
              <Palette class="w-5 h-5" />
            </button>
            
            <!-- 颜色选择器下拉 -->
            <div
              v-if="showColorPicker"
              :class="['absolute right-0 top-full mt-2 p-3 rounded-xl shadow-xl border z-50 w-48', isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200']"
            >
              <p :class="['text-xs font-medium mb-2', isDark ? 'text-gray-400' : 'text-gray-500']">主题色</p>
              <div class="grid grid-cols-4 gap-2">
                <button
                  v-for="color in colorPresets"
                  :key="color.value"
                  @click="setColor(color.value)"
                  class="w-8 h-8 rounded-lg transition-transform hover:scale-110 ring-2 ring-offset-2"
                  :class="primaryColor === color.value ? 'ring-gray-400' : 'ring-transparent'"
                  :style="{ backgroundColor: color.value }"
                  :title="color.name"
                />
              </div>
            </div>
          </div>
          
          <!-- 明暗模式切换 -->
          <button
            @click="toggleTheme"
            :class="['p-2 rounded-lg transition-colors', isDark ? 'hover:bg-gray-700 text-yellow-400' : 'hover:bg-gray-100 text-gray-500 hover:text-gray-700']"
            :title="isDark ? '切换到亮色模式' : '切换到暗色模式'"
          >
            <Sun v-if="isDark" class="w-5 h-5" />
            <Moon v-else class="w-5 h-5" />
          </button>
        </div>
      </header>

      <!-- 页面内容 -->
      <main class="flex-1 p-4 lg:p-6">
        <router-view :isDark="isDark" :primaryColor="primaryColor" />
      </main>
    </div>
    
    <!-- 点击外部关闭颜色选择器 -->
    <div v-if="showColorPicker" class="fixed inset-0 z-40" @click="showColorPicker = false" />
  </div>
</template>
