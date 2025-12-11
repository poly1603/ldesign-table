<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch, toRaw } from 'vue'
import type { PropType } from 'vue'
import {
  Table,
  type TableConfig,
  type TableInstance,
  type ColumnDef,
  type SortState,
  type FilterState,
  type PaginationConfig,
  type SelectionConfig,
  type ExpandConfig,
  type VirtualScrollConfig,
  type TreeConfig,
  type ThemeConfig,
  type LocaleConfig
} from '@ldesign/table-core'
// 样式由用户在入口文件导入

// Props 定义
const props = defineProps({
  /** 列定义 */
  columns: {
    type: Array as PropType<ColumnDef[]>,
    required: true
  },
  /** 数据源 */
  data: {
    type: Array as PropType<any[]>,
    required: true
  },
  /** 行唯一标识字段 */
  rowKey: {
    type: [String, Function] as PropType<string | ((record: any) => string)>,
    default: 'id'
  },
  /** 表格高度 */
  height: {
    type: [Number, String] as PropType<number | string>
  },
  /** 表格最大高度 */
  maxHeight: {
    type: [Number, String] as PropType<number | string>
  },
  /** 表格宽度 */
  width: {
    type: [Number, String] as PropType<number | string>
  },
  /** 是否显示边框 */
  bordered: {
    type: Boolean,
    default: false
  },
  /** 是否显示斑马纹 */
  striped: {
    type: Boolean,
    default: false
  },
  /** 是否显示表头 */
  showHeader: {
    type: Boolean,
    default: true
  },
  /** 行悬停高亮 */
  rowHover: {
    type: Boolean,
    default: true
  },
  /** 表头吸顶 */
  stickyHeader: {
    type: Boolean,
    default: false
  },
  /** 空数据展示文本 */
  emptyText: {
    type: [String, Function] as PropType<string | (() => string | HTMLElement)>
  },
  /** 加载状态 */
  loading: {
    type: Boolean,
    default: false
  },
  /** 加载文本 */
  loadingText: {
    type: String
  },
  /** 主题 */
  theme: {
    type: [String, Object] as PropType<string | ThemeConfig>,
    default: 'light'
  },
  /** 分页配置 */
  pagination: {
    type: [Object, Boolean] as PropType<PaginationConfig | false>,
    default: undefined
  },
  /** 选择配置 */
  selection: {
    type: [Object, Boolean] as PropType<SelectionConfig | false>,
    default: undefined
  },
  /** 展开配置 */
  expand: {
    type: [Object, Boolean] as PropType<ExpandConfig | false>,
    default: undefined
  },
  /** 虚拟滚动配置 */
  virtualScroll: {
    type: [Object, Boolean] as PropType<VirtualScrollConfig | false>,
    default: undefined
  },
  /** 树形数据配置 */
  tree: {
    type: [Object, Boolean] as PropType<TreeConfig | false>,
    default: undefined
  },
  /** 行类名 */
  rowClass: {
    type: [String, Function] as PropType<string | ((record: any, index: number) => string)>
  },
  /** 行样式 */
  rowStyle: {
    type: [Object, Function] as PropType<
      Partial<CSSStyleDeclaration> | ((record: any, index: number) => Partial<CSSStyleDeclaration>)
    >
  },
  /** 语言配置 */
  locale: {
    type: Object as PropType<LocaleConfig>
  }
})

// 事件定义
const emit = defineEmits<{
  (e: 'row-click', record: any, index: number, event: MouseEvent): void
  (e: 'row-dblclick', record: any, index: number, event: MouseEvent): void
  (e: 'row-contextmenu', record: any, index: number, event: MouseEvent): void
  (e: 'cell-click', record: any, column: ColumnDef, index: number, event: MouseEvent): void
  (e: 'sort-change', sortState: SortState | null): void
  (e: 'filter-change', filterState: FilterState): void
  (e: 'page-change', page: number, pageSize: number): void
  (e: 'selection-change', selectedKeys: string[], selectedRows: any[]): void
  (e: 'expand-change', expandedKeys: string[]): void
  (e: 'scroll', scrollLeft: number, scrollTop: number): void
  (e: 'column-resize', column: ColumnDef, width: number): void
  (e: 'ready'): void
}>()

// DOM 引用
const containerRef = ref<HTMLDivElement>()

// 表格实例
const tableInstance = ref<TableInstance | null>(null)

// 创建表格配置
const createConfig = (): TableConfig => ({
  container: containerRef.value!,
  columns: toRaw(props.columns),
  data: toRaw(props.data),
  rowKey: props.rowKey,
  height: props.height,
  maxHeight: props.maxHeight,
  width: props.width,
  bordered: props.bordered,
  striped: props.striped,
  showHeader: props.showHeader,
  rowHover: props.rowHover,
  stickyHeader: props.stickyHeader,
  emptyText: props.emptyText,
  loading: props.loading,
  loadingText: props.loadingText,
  theme: props.theme,
  pagination: props.pagination,
  selection: props.selection,
  expand: props.expand,
  virtualScroll: props.virtualScroll,
  tree: props.tree,
  rowClass: props.rowClass,
  rowStyle: props.rowStyle,
  locale: props.locale,
  // 事件绑定
  onRowClick: (record, index, event) => emit('row-click', record, index, event),
  onRowDoubleClick: (record, index, event) => emit('row-dblclick', record, index, event),
  onRowContextMenu: (record, index, event) => emit('row-contextmenu', record, index, event),
  onCellClick: (record, column, index, event) => emit('cell-click', record, column, index, event),
  onSortChange: (sortState) => emit('sort-change', sortState),
  onFilterChange: (filterState) => emit('filter-change', filterState),
  onPageChange: (page, pageSize) => emit('page-change', page, pageSize),
  onScroll: (scrollLeft, scrollTop) => emit('scroll', scrollLeft, scrollTop),
  onColumnResize: (column, width) => emit('column-resize', column, width)
})

// 挂载
onMounted(() => {
  if (containerRef.value) {
    tableInstance.value = new Table(createConfig())
    
    // 监听选择变化
    tableInstance.value.on('selection:change', (keys: string[], rows: any[]) => {
      emit('selection-change', keys, rows)
    })
    
    // 监听展开变化
    tableInstance.value.on('expand:change', (keys: string[]) => {
      emit('expand-change', keys)
    })
    
    // 监听就绪
    tableInstance.value.on('ready', () => {
      emit('ready')
    })
  }
})

// 卸载
onUnmounted(() => {
  tableInstance.value?.destroy()
})

// 监听数据变化
watch(
  () => props.data,
  (newData) => {
    tableInstance.value?.setData(toRaw(newData))
  },
  { deep: true }
)

// 监听列变化
watch(
  () => props.columns,
  (newColumns) => {
    tableInstance.value?.setColumns(toRaw(newColumns))
  },
  { deep: true }
)

// 监听加载状态
watch(
  () => props.loading,
  (loading) => {
    tableInstance.value?.setLoading(loading)
  }
)

// 监听主题变化
watch(
  () => props.theme,
  (theme) => {
    tableInstance.value?.setTheme(theme)
  }
)

// 暴露方法
defineExpose({
  /** 获取表格实例 */
  getInstance: () => tableInstance.value,
  /** 刷新表格 */
  refresh: () => tableInstance.value?.refresh(),
  /** 重新渲染 */
  rerender: () => tableInstance.value?.rerender(),
  /** 设置数据 */
  setData: (data: any[]) => tableInstance.value?.setData(data),
  /** 获取数据 */
  getData: () => tableInstance.value?.getData(),
  /** 设置列 */
  setColumns: (columns: ColumnDef[]) => tableInstance.value?.setColumns(columns),
  /** 获取列 */
  getColumns: () => tableInstance.value?.getColumns(),
  /** 设置加载状态 */
  setLoading: (loading: boolean) => tableInstance.value?.setLoading(loading),
  /** 排序 */
  sort: (key: string, order: 'asc' | 'desc' | null) => tableInstance.value?.sort(key, order),
  /** 清除排序 */
  clearSort: () => tableInstance.value?.clearSort(),
  /** 获取排序状态 */
  getSortState: () => tableInstance.value?.getSortState(),
  /** 筛选 */
  filter: (filterState: FilterState) => tableInstance.value?.filter(filterState),
  /** 清除筛选 */
  clearFilter: (key?: string) => tableInstance.value?.clearFilter(key),
  /** 获取筛选状态 */
  getFilterState: () => tableInstance.value?.getFilterState(),
  /** 选中行 */
  selectRow: (key: string | string[]) => tableInstance.value?.selectRow(key),
  /** 取消选中 */
  deselectRow: (key: string | string[]) => tableInstance.value?.deselectRow(key),
  /** 选中所有行 */
  selectAll: () => tableInstance.value?.selectAll(),
  /** 取消选中所有行 */
  deselectAll: () => tableInstance.value?.deselectAll(),
  /** 获取选中的行 */
  getSelectedRows: () => tableInstance.value?.getSelectedRows(),
  /** 获取选中的行key */
  getSelectedKeys: () => tableInstance.value?.getSelectedKeys(),
  /** 展开行 */
  expandRow: (key: string | string[]) => tableInstance.value?.expandRow(key),
  /** 收起行 */
  collapseRow: (key: string | string[]) => tableInstance.value?.collapseRow(key),
  /** 展开所有行 */
  expandAll: () => tableInstance.value?.expandAll(),
  /** 收起所有行 */
  collapseAll: () => tableInstance.value?.collapseAll(),
  /** 跳转到指定页 */
  gotoPage: (page: number) => tableInstance.value?.gotoPage(page),
  /** 设置每页条数 */
  setPageSize: (pageSize: number) => tableInstance.value?.setPageSize(pageSize),
  /** 获取分页信息 */
  getPagination: () => tableInstance.value?.getPagination(),
  /** 滚动到指定位置 */
  scrollTo: (options: { left?: number; top?: number; rowIndex?: number; rowKey?: string }) =>
    tableInstance.value?.scrollTo(options),
  /** 设置主题 */
  setTheme: (theme: string | ThemeConfig) => tableInstance.value?.setTheme(theme)
})
</script>

<template>
  <div ref="containerRef" class="lt-table-container"></div>
</template>

<style scoped>
.lt-table-container {
  width: 100%;
}
</style>
