// ============================================================================
// 核心类型定义
// ============================================================================

/**
 * 表格列定义
 */
export interface ColumnDef<T = any> {
  /** 列唯一标识 */
  key: string
  /** 列标题 */
  title: string
  /** 数据字段名 */
  field?: string
  /** 列宽度 */
  width?: number | string
  /** 最小宽度 */
  minWidth?: number
  /** 最大宽度 */
  maxWidth?: number
  /** 是否固定 */
  fixed?: 'left' | 'right' | false
  /** 对齐方式 */
  align?: 'left' | 'center' | 'right'
  /** 是否可排序 */
  sortable?: boolean
  /** 自定义排序函数 */
  sorter?: (a: T, b: T) => number
  /** 是否可筛选 */
  filterable?: boolean
  /** 筛选选项 */
  filterOptions?: FilterOption[]
  /** 自定义筛选函数 */
  filterFn?: (value: any, record: T, filterValue: any) => boolean
  /** 是否可调整列宽 */
  resizable?: boolean
  /** 单元格渲染函数 */
  render?: (value: any, record: T, rowIndex: number) => string | HTMLElement
  /** 表头渲染函数 */
  headerRender?: (column: ColumnDef<T>) => string | HTMLElement
  /** 单元格类名 */
  cellClass?: string | ((record: T, rowIndex: number) => string)
  /** 表头类名 */
  headerClass?: string
  /** 是否显示 */
  visible?: boolean
  /** 子列（用于分组表头） */
  children?: ColumnDef<T>[]
  /** 列合并 */
  colSpan?: number | ((record: T, rowIndex: number) => number)
  /** 行合并 */
  rowSpan?: number | ((record: T, rowIndex: number) => number)
  /** 省略显示 */
  ellipsis?: boolean
  /** 工具提示 */
  tooltip?: boolean | ((value: any, record: T) => string)
  /** 是否可复制 */
  copyable?: boolean
  /** 可编辑配置 */
  editable?: boolean | EditableConfig<T>
}

/**
 * 可编辑配置
 */
export interface EditableConfig<T = any> {
  /** 编辑类型 */
  type?: 'input' | 'select' | 'number' | 'date' | 'textarea' | 'custom'
  /** 选项（用于select） */
  options?: { label: string; value: any }[]
  /** 验证规则 */
  rules?: ValidationRule[]
  /** 保存回调 */
  onSave?: (value: any, record: T, column: ColumnDef<T>) => Promise<boolean> | boolean
}

/**
 * 验证规则
 */
export interface ValidationRule {
  required?: boolean
  message?: string
  pattern?: RegExp
  validator?: (value: any) => boolean | string | Promise<boolean | string>
  min?: number
  max?: number
}

/**
 * 筛选选项
 */
export interface FilterOption {
  label: string
  value: any
}

/**
 * 排序状态
 */
export interface SortState {
  key: string
  order: 'asc' | 'desc' | null
}

/**
 * 筛选状态
 */
export interface FilterState {
  [key: string]: any
}

/**
 * 分页配置
 */
export interface PaginationConfig {
  /** 是否启用 */
  enabled?: boolean
  /** 当前页 */
  current?: number
  /** 每页条数 */
  pageSize?: number
  /** 总条数 */
  total?: number
  /** 可选的每页条数 */
  pageSizeOptions?: number[]
  /** 是否显示快速跳转 */
  showQuickJumper?: boolean
  /** 是否显示每页条数选择器 */
  showSizeChanger?: boolean
  /** 是否显示总数 */
  showTotal?: boolean | ((total: number, range: [number, number]) => string)
  /** 简洁模式 */
  simple?: boolean
}

/**
 * 选择配置
 */
export interface SelectionConfig<T = any> {
  /** 选择类型 */
  type?: 'checkbox' | 'radio'
  /** 选中的行key */
  selectedKeys?: string[]
  /** 选择变化回调 */
  onChange?: (selectedKeys: string[], selectedRows: T[]) => void
  /** 行是否可选 */
  getCheckboxProps?: (record: T) => { disabled?: boolean; indeterminate?: boolean }
  /** 是否固定选择列 */
  fixed?: boolean
  /** 列宽 */
  columnWidth?: number
  /** 表头选择框 */
  hideSelectAll?: boolean
  /** 保留选择 */
  preserveSelectedRowKeys?: boolean
}

/**
 * 展开配置
 */
export interface ExpandConfig<T = any> {
  /** 展开的行key */
  expandedKeys?: string[]
  /** 展开行渲染函数 */
  expandedRowRender?: (record: T, index: number) => string | HTMLElement
  /** 是否允许展开 */
  rowExpandable?: (record: T) => boolean
  /** 展开变化回调 */
  onExpandChange?: (expandedKeys: string[], record: T) => void
  /** 默认展开所有行 */
  defaultExpandAllRows?: boolean
  /** 展开列宽度 */
  columnWidth?: number
  /** 是否固定展开列 */
  fixed?: boolean
  /** 手风琴模式 */
  accordion?: boolean
}

/**
 * 虚拟滚动配置
 */
export interface VirtualScrollConfig {
  /** 是否启用 */
  enabled?: boolean
  /** 预估行高 */
  rowHeight?: number
  /** 缓冲区大小 */
  bufferSize?: number
  /** 是否启用水平虚拟滚动 */
  horizontal?: boolean
}

/**
 * 行拖拽配置
 */
export interface RowDragConfig<T = any> {
  /** 是否启用 */
  enabled?: boolean
  /** 拖拽句柄选择器 */
  handleSelector?: string
  /** 拖拽结束回调 */
  onDragEnd?: (data: T[], fromIndex: number, toIndex: number) => void
}

/**
 * 列拖拽配置
 */
export interface ColumnDragConfig {
  /** 是否启用 */
  enabled?: boolean
  /** 拖拽结束回调 */
  onDragEnd?: (columns: ColumnDef[]) => void
}

/**
 * 树形数据配置
 */
export interface TreeConfig {
  /** 子节点字段名 */
  childrenField?: string
  /** 缩进宽度 */
  indentSize?: number
  /** 默认展开所有节点 */
  defaultExpandAll?: boolean
  /** 展开的节点key */
  expandedKeys?: string[]
  /** 展开变化回调 */
  onExpandChange?: (expandedKeys: string[]) => void
  /** 是否显示连接线 */
  showLine?: boolean
}

/**
 * 表格配置
 */
export interface TableConfig<T = any> {
  /** 容器元素或选择器 */
  container: HTMLElement | string
  /** 列定义 */
  columns: ColumnDef<T>[]
  /** 数据源 */
  data: T[]
  /** 行唯一标识字段 */
  rowKey?: string | ((record: T) => string)
  /** 表格高度 */
  height?: number | string
  /** 表格最大高度 */
  maxHeight?: number | string
  /** 表格宽度 */
  width?: number | string
  /** 是否显示边框 */
  bordered?: boolean
  /** 是否显示斑马纹 */
  striped?: boolean
  /** 是否显示表头 */
  showHeader?: boolean
  /** 行悬停高亮 */
  rowHover?: boolean
  /** 表头吸顶 */
  stickyHeader?: boolean
  /** 空数据展示 */
  emptyText?: string | (() => string | HTMLElement)
  /** 加载状态 */
  loading?: boolean
  /** 加载文本 */
  loadingText?: string
  /** 主题 */
  theme?: string | ThemeConfig
  /** 分页配置 */
  pagination?: PaginationConfig | false
  /** 选择配置 */
  selection?: SelectionConfig<T> | false
  /** 展开配置 */
  expand?: ExpandConfig<T> | false
  /** 虚拟滚动配置 */
  virtualScroll?: VirtualScrollConfig | false
  /** 行拖拽配置 */
  rowDrag?: RowDragConfig<T> | false
  /** 列拖拽配置 */
  columnDrag?: ColumnDragConfig | false
  /** 树形数据配置 */
  tree?: TreeConfig | false
  /** 行类名 */
  rowClass?: string | ((record: T, index: number) => string)
  /** 行样式 */
  rowStyle?: Partial<CSSStyleDeclaration> | ((record: T, index: number) => Partial<CSSStyleDeclaration>)
  /** 行点击事件 */
  onRowClick?: (record: T, index: number, event: MouseEvent) => void
  /** 行双击事件 */
  onRowDoubleClick?: (record: T, index: number, event: MouseEvent) => void
  /** 行右键事件 */
  onRowContextMenu?: (record: T, index: number, event: MouseEvent) => void
  /** 单元格点击事件 */
  onCellClick?: (record: T, column: ColumnDef<T>, index: number, event: MouseEvent) => void
  /** 排序变化事件 */
  onSortChange?: (sortState: SortState | null) => void
  /** 筛选变化事件 */
  onFilterChange?: (filterState: FilterState) => void
  /** 分页变化事件 */
  onPageChange?: (page: number, pageSize: number) => void
  /** 滚动事件 */
  onScroll?: (scrollLeft: number, scrollTop: number) => void
  /** 列调整大小事件 */
  onColumnResize?: (column: ColumnDef<T>, width: number) => void
  /** 语言配置 */
  locale?: LocaleConfig
}

/**
 * 语言配置
 */
export interface LocaleConfig {
  emptyText?: string
  loadingText?: string
  filterConfirm?: string
  filterReset?: string
  filterEmpty?: string
  selectAll?: string
  selectInvert?: string
  sortAsc?: string
  sortDesc?: string
  expand?: string
  collapse?: string
  page?: {
    prev?: string
    next?: string
    jump?: string
    pageSize?: string
    total?: string
  }
}

/**
 * 主题配置
 */
export interface ThemeConfig {
  name?: string
  cssVars?: Record<string, string>
  colors?: {
    primary?: string
    primaryHover?: string
    primaryActive?: string
    success?: string
    warning?: string
    danger?: string
    info?: string
    textPrimary?: string
    textSecondary?: string
    textDisabled?: string
    border?: string
    borderLight?: string
    background?: string
    backgroundHover?: string
    backgroundActive?: string
    headerBackground?: string
    headerText?: string
    stripedBackground?: string
  }
  sizes?: {
    fontSize?: string
    fontSizeSmall?: string
    fontSizeLarge?: string
    borderRadius?: string
    rowHeight?: string
    rowHeightSmall?: string
    rowHeightLarge?: string
    headerHeight?: string
    cellPadding?: string
    cellPaddingSmall?: string
    cellPaddingLarge?: string
  }
  shadows?: {
    fixedColumn?: string
    dropdown?: string
    tooltip?: string
  }
}

/**
 * 表格实例方法
 */
export interface TableInstance<T = any> {
  /** 刷新表格 */
  refresh: () => void
  /** 重新渲染 */
  rerender: () => void
  /** 设置数据 */
  setData: (data: T[]) => void
  /** 获取数据 */
  getData: () => T[]
  /** 设置列 */
  setColumns: (columns: ColumnDef<T>[]) => void
  /** 获取列 */
  getColumns: () => ColumnDef<T>[]
  /** 设置加载状态 */
  setLoading: (loading: boolean) => void
  /** 排序 */
  sort: (key: string, order: 'asc' | 'desc' | null) => void
  /** 清除排序 */
  clearSort: () => void
  /** 获取排序状态 */
  getSortState: () => SortState | null
  /** 筛选 */
  filter: (filterState: FilterState) => void
  /** 清除筛选 */
  clearFilter: (key?: string) => void
  /** 获取筛选状态 */
  getFilterState: () => FilterState
  /** 选中行 */
  selectRow: (key: string | string[]) => void
  /** 取消选中 */
  deselectRow: (key: string | string[]) => void
  /** 选中所有行 */
  selectAll: () => void
  /** 取消选中所有行 */
  deselectAll: () => void
  /** 获取选中的行 */
  getSelectedRows: () => T[]
  /** 获取选中的行key */
  getSelectedKeys: () => string[]
  /** 展开行 */
  expandRow: (key: string | string[]) => void
  /** 收起行 */
  collapseRow: (key: string | string[]) => void
  /** 展开所有行 */
  expandAll: () => void
  /** 收起所有行 */
  collapseAll: () => void
  /** 跳转到指定页 */
  gotoPage: (page: number) => void
  /** 设置每页条数 */
  setPageSize: (pageSize: number) => void
  /** 获取分页信息 */
  getPagination: () => { current: number; pageSize: number; total: number }
  /** 滚动到指定位置 */
  scrollTo: (options: { left?: number; top?: number; rowIndex?: number; rowKey?: string }) => void
  /** 更新配置 */
  updateConfig: (config: Partial<TableConfig<T>>) => void
  /** 设置主题 */
  setTheme: (theme: string | ThemeConfig) => void
  /** 获取容器元素 */
  getContainer: () => HTMLElement
  /** 销毁表格 */
  destroy: () => void
  /** 监听事件 */
  on: <K extends keyof TableEvents<T>>(event: K, handler: TableEvents<T>[K]) => void
  /** 取消监听事件 */
  off: <K extends keyof TableEvents<T>>(event: K, handler?: TableEvents<T>[K]) => void
}

/**
 * 表格事件
 */
export interface TableEvents<T = any> {
  'row:click': (record: T, index: number, event: MouseEvent) => void
  'row:dblclick': (record: T, index: number, event: MouseEvent) => void
  'row:contextmenu': (record: T, index: number, event: MouseEvent) => void
  'cell:click': (record: T, column: ColumnDef<T>, index: number, event: MouseEvent) => void
  'sort:change': (sortState: SortState | null) => void
  'filter:change': (filterState: FilterState) => void
  'page:change': (page: number, pageSize: number) => void
  'selection:change': (selectedKeys: string[], selectedRows: T[]) => void
  'expand:change': (expandedKeys: string[]) => void
  'scroll': (scrollLeft: number, scrollTop: number) => void
  'column:resize': (column: ColumnDef<T>, width: number) => void
  'data:change': (data: T[]) => void
  'ready': () => void
  'destroy': () => void
}

/**
 * 内部状态
 */
export interface TableState<T = any> {
  data: T[]
  columns: ColumnDef<T>[]
  sortState: SortState | null
  filterState: FilterState
  selectedKeys: Set<string>
  expandedKeys: Set<string>
  treeExpandedKeys: Set<string>
  pagination: {
    current: number
    pageSize: number
    total: number
  }
  scroll: {
    left: number
    top: number
  }
  loading: boolean
  columnWidths: Map<string, number>
}
