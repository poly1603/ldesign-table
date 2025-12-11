import { ref, shallowRef, onMounted, onUnmounted, watch, toRaw } from 'vue'
import type { Ref, ShallowRef } from 'vue'
import {
  Table,
  type TableConfig,
  type TableInstance,
  type ColumnDef,
  type SortState,
  type FilterState
} from '@ldesign/table-core'

export interface UseTableOptions<T = any> extends Omit<TableConfig<T>, 'container'> {
  /** 是否自动挂载 */
  autoMount?: boolean
}

export interface UseTableReturn<T = any> {
  /** 容器引用 */
  containerRef: Ref<HTMLElement | undefined>
  /** 表格实例 */
  instance: ShallowRef<TableInstance<T> | null>
  /** 是否已挂载 */
  mounted: Ref<boolean>
  /** 数据 */
  data: Ref<T[]>
  /** 列配置 */
  columns: Ref<ColumnDef<T>[]>
  /** 加载状态 */
  loading: Ref<boolean>
  /** 排序状态 */
  sortState: Ref<SortState | null>
  /** 筛选状态 */
  filterState: Ref<FilterState>
  /** 选中的keys */
  selectedKeys: Ref<string[]>
  /** 展开的keys */
  expandedKeys: Ref<string[]>
  /** 分页信息 */
  pagination: Ref<{ current: number; pageSize: number; total: number }>
  /** 挂载表格 */
  mount: (container: HTMLElement) => void
  /** 销毁表格 */
  destroy: () => void
  /** 刷新 */
  refresh: () => void
  /** 设置数据 */
  setData: (data: T[]) => void
  /** 设置列 */
  setColumns: (columns: ColumnDef<T>[]) => void
  /** 排序 */
  sort: (key: string, order: 'asc' | 'desc' | null) => void
  /** 清除排序 */
  clearSort: () => void
  /** 筛选 */
  filter: (filterState: FilterState) => void
  /** 清除筛选 */
  clearFilter: (key?: string) => void
  /** 选中行 */
  selectRow: (key: string | string[]) => void
  /** 取消选中 */
  deselectRow: (key: string | string[]) => void
  /** 全选 */
  selectAll: () => void
  /** 取消全选 */
  deselectAll: () => void
  /** 展开行 */
  expandRow: (key: string | string[]) => void
  /** 收起行 */
  collapseRow: (key: string | string[]) => void
  /** 跳转页码 */
  gotoPage: (page: number) => void
  /** 设置每页条数 */
  setPageSize: (pageSize: number) => void
  /** 滚动到指定位置 */
  scrollTo: (options: { left?: number; top?: number; rowIndex?: number; rowKey?: string }) => void
}

/**
 * 表格组合式函数
 */
export function useTable<T = any>(options: UseTableOptions<T>): UseTableReturn<T> {
  const { autoMount = true, ...tableOptions } = options

  // 状态
  const containerRef = ref<HTMLElement>()
  const instance = shallowRef<TableInstance<T> | null>(null)
  const mounted = ref(false)
  const data = ref<T[]>([...options.data]) as Ref<T[]>
  const columns = ref<ColumnDef<T>[]>([...options.columns]) as Ref<ColumnDef<T>[]>
  const loading = ref(options.loading || false)
  const sortState = ref<SortState | null>(null)
  const filterState = ref<FilterState>({})
  const selectedKeys = ref<string[]>([])
  const expandedKeys = ref<string[]>([])
  const pagination = ref({
    current: 1,
    pageSize: 10,
    total: options.data.length
  })

  // 挂载表格
  const mount = (container: HTMLElement) => {
    if (instance.value) {
      console.warn('Table already mounted')
      return
    }

    instance.value = new Table({
      ...tableOptions,
      container,
      data: toRaw(data.value),
      columns: toRaw(columns.value),
      loading: loading.value,
      onSortChange: (state) => {
        sortState.value = state
        tableOptions.onSortChange?.(state)
      },
      onFilterChange: (state) => {
        filterState.value = state
        tableOptions.onFilterChange?.(state)
      },
      onPageChange: (page, pageSize) => {
        pagination.value.current = page
        pagination.value.pageSize = pageSize
        tableOptions.onPageChange?.(page, pageSize)
      }
    })

    // 监听选择变化
    instance.value.on('selection:change', (keys: string[]) => {
      selectedKeys.value = keys
    })

    // 监听展开变化
    instance.value.on('expand:change', (keys: string[]) => {
      expandedKeys.value = keys
    })

    mounted.value = true
  }

  // 销毁表格
  const destroy = () => {
    instance.value?.destroy()
    instance.value = null
    mounted.value = false
  }

  // 方法包装
  const refresh = () => instance.value?.refresh()
  const setData = (newData: T[]) => {
    data.value = newData
    instance.value?.setData(toRaw(newData))
  }
  const setColumns = (newColumns: ColumnDef<T>[]) => {
    columns.value = newColumns
    instance.value?.setColumns(toRaw(newColumns))
  }
  const sort = (key: string, order: 'asc' | 'desc' | null) => instance.value?.sort(key, order)
  const clearSort = () => instance.value?.clearSort()
  const filter = (state: FilterState) => instance.value?.filter(state)
  const clearFilter = (key?: string) => instance.value?.clearFilter(key)
  const selectRow = (key: string | string[]) => instance.value?.selectRow(key)
  const deselectRow = (key: string | string[]) => instance.value?.deselectRow(key)
  const selectAll = () => instance.value?.selectAll()
  const deselectAll = () => instance.value?.deselectAll()
  const expandRow = (key: string | string[]) => instance.value?.expandRow(key)
  const collapseRow = (key: string | string[]) => instance.value?.collapseRow(key)
  const gotoPage = (page: number) => instance.value?.gotoPage(page)
  const setPageSize = (pageSize: number) => instance.value?.setPageSize(pageSize)
  const scrollTo = (options: { left?: number; top?: number; rowIndex?: number; rowKey?: string }) =>
    instance.value?.scrollTo(options)

  // 生命周期
  onMounted(() => {
    if (autoMount && containerRef.value) {
      mount(containerRef.value)
    }
  })

  onUnmounted(() => {
    destroy()
  })

  // 监听数据变化
  watch(data, (newData) => {
    instance.value?.setData(toRaw(newData))
    pagination.value.total = newData.length
  }, { deep: true })

  // 监听列变化
  watch(columns, (newColumns) => {
    instance.value?.setColumns(toRaw(newColumns))
  }, { deep: true })

  // 监听加载状态
  watch(loading, (newLoading) => {
    instance.value?.setLoading(newLoading)
  })

  return {
    containerRef,
    instance,
    mounted,
    data,
    columns,
    loading,
    sortState,
    filterState,
    selectedKeys,
    expandedKeys,
    pagination,
    mount,
    destroy,
    refresh,
    setData,
    setColumns,
    sort,
    clearSort,
    filter,
    clearFilter,
    selectRow,
    deselectRow,
    selectAll,
    deselectAll,
    expandRow,
    collapseRow,
    gotoPage,
    setPageSize,
    scrollTo
  }
}
