/**
 * @ldesign/table-core
 * 高性能框架无关表格核心引擎
 */

// 样式
import './styles/base.css'

// 核心类
export { Table } from './core/Table'
export { VirtualScroller } from './core/VirtualScroller'
export { ColumnResizer } from './core/ColumnResizer'

// 主题
export {
  ThemeManager,
  defaultTheme,
  darkTheme,
  compactTheme,
  presetThemes,
  registerTheme,
  getPresetTheme
} from './theme/ThemeManager'

// 工具函数
export {
  generateId,
  debounce,
  throttle,
  deepClone,
  deepMerge,
  getNestedValue,
  setNestedValue,
  parsePixelValue,
  createElement,
  addClass,
  removeClass,
  toggleClass,
  hasClass,
  copyToClipboard,
  flattenTree
} from './utils'

export { EventEmitter } from './utils/EventEmitter'

// 类型导出
export type {
  // 列定义
  ColumnDef,
  EditableConfig,
  ValidationRule,
  FilterOption,
  // 状态
  SortState,
  FilterState,
  TableState,
  // 配置
  TableConfig,
  PaginationConfig,
  SelectionConfig,
  ExpandConfig,
  VirtualScrollConfig,
  RowDragConfig,
  ColumnDragConfig,
  TreeConfig,
  // 主题
  ThemeConfig,
  LocaleConfig,
  // 实例
  TableInstance,
  TableEvents
} from './types'

// 创建表格的快捷方法
export function createTable<T = any>(
  config: import('./types').TableConfig<T>
): import('./types').TableInstance<T> {
  return new (require('./core/Table').Table)(config)
}
