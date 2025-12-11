import { createApp } from 'vue'
import { createRouter, createWebHistory } from 'vue-router'
import App from './App.vue'
import LDesignTablePlugin from '@ldesign/table-vue'
// 导入表格核心样式
import '@table-styles'
import './style.css'

// 路由配置
const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      name: 'home',
      component: () => import('./views/Home.vue')
    },
    {
      path: '/basic',
      name: 'basic',
      component: () => import('./views/BasicTable.vue')
    },
    {
      path: '/selection',
      name: 'selection',
      component: () => import('./views/SelectionTable.vue')
    },
    {
      path: '/sorting',
      name: 'sorting',
      component: () => import('./views/SortingTable.vue')
    },
    {
      path: '/filtering',
      name: 'filtering',
      component: () => import('./views/FilteringTable.vue')
    },
    {
      path: '/pagination',
      name: 'pagination',
      component: () => import('./views/PaginationTable.vue')
    },
    {
      path: '/expand',
      name: 'expand',
      component: () => import('./views/ExpandTable.vue')
    },
    {
      path: '/fixed',
      name: 'fixed',
      component: () => import('./views/FixedTable.vue')
    },
    {
      path: '/sticky',
      name: 'sticky',
      component: () => import('./views/StickyTable.vue')
    },
    {
      path: '/multi-header',
      name: 'multi-header',
      component: () => import('./views/MultiHeaderTable.vue')
    },
    {
      path: '/editable',
      name: 'editable',
      component: () => import('./views/EditableTable.vue')
    },
    {
      path: '/merge',
      name: 'merge',
      component: () => import('./views/MergeTable.vue')
    },
    {
      path: '/theme',
      name: 'theme',
      component: () => import('./views/ThemeTable.vue')
    }
  ]
})

const app = createApp(App)
app.use(router)
app.use(LDesignTablePlugin)
app.mount('#app')
