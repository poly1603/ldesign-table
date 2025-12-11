/**
 * @ldesign/table-vue
 * Vue 3 组件封装 for @ldesign/table-core
 */

import type { App, Plugin } from 'vue'

// 组件
import LTable from './components/LTable.vue'

// 组合式函数
export * from './composables'

// 从 core 重新导出类型
export type {
  ColumnDef,
  EditableConfig,
  ValidationRule,
  FilterOption,
  SortState,
  FilterState,
  TableState,
  TableConfig,
  PaginationConfig,
  SelectionConfig,
  ExpandConfig,
  VirtualScrollConfig,
  RowDragConfig,
  ColumnDragConfig,
  TreeConfig,
  ThemeConfig,
  LocaleConfig,
  TableInstance,
  TableEvents
} from '@ldesign/table-core'

// 从 core 重新导出工具
export {
  Table,
  ThemeManager,
  registerTheme,
  getPresetTheme,
  defaultTheme,
  darkTheme,
  compactTheme
} from '@ldesign/table-core'

// 导出组件
export { LTable }

// Vue 插件
const LDesignTablePlugin: Plugin = {
  install(app: App) {
    app.component('LTable', LTable)
  }
}

export default LDesignTablePlugin

// 声明全局组件类型
declare module 'vue' {
  export interface GlobalComponents {
    LTable: typeof LTable
  }
}
