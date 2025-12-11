import { ref, computed, watch } from 'vue'
import type { Ref, ComputedRef } from 'vue'
import type { TableInstance, SortState } from '@ldesign/table-core'

export interface UseTableSortOptions {
  /** 表格实例 */
  instance: Ref<TableInstance | null>
  /** 初始排序状态 */
  defaultSortState?: SortState | null
  /** 排序变化回调 */
  onChange?: (sortState: SortState | null) => void
}

export interface UseTableSortReturn {
  /** 排序状态 */
  sortState: Ref<SortState | null>
  /** 当前排序列 */
  sortKey: ComputedRef<string | null>
  /** 当前排序方向 */
  sortOrder: ComputedRef<'asc' | 'desc' | null>
  /** 是否有排序 */
  isSorted: ComputedRef<boolean>
  /** 排序 */
  sort: (key: string, order?: 'asc' | 'desc' | null) => void
  /** 切换排序 */
  toggleSort: (key: string) => void
  /** 清除排序 */
  clearSort: () => void
  /** 判断指定列是否正在排序 */
  isSortedBy: (key: string) => boolean
  /** 获取指定列的排序方向 */
  getSortOrder: (key: string) => 'asc' | 'desc' | null
}

/**
 * 表格排序组合式函数
 */
export function useTableSort(options: UseTableSortOptions): UseTableSortReturn {
  const { instance, defaultSortState = null, onChange } = options

  const sortState = ref<SortState | null>(defaultSortState)

  // 计算属性
  const sortKey = computed(() => sortState.value?.key ?? null)
  const sortOrder = computed(() => sortState.value?.order ?? null)
  const isSorted = computed(() => sortState.value !== null && sortState.value.order !== null)

  // 方法
  const sort = (key: string, order?: 'asc' | 'desc' | null) => {
    // 如果没有指定 order，则根据当前状态切换
    let newOrder: 'asc' | 'desc' | null = order ?? null

    if (order === undefined) {
      if (sortState.value?.key === key) {
        // 同一列，循环切换：无 -> 升序 -> 降序 -> 无
        if (sortState.value.order === null) {
          newOrder = 'asc'
        } else if (sortState.value.order === 'asc') {
          newOrder = 'desc'
        } else {
          newOrder = null
        }
      } else {
        // 不同列，默认升序
        newOrder = 'asc'
      }
    }

    sortState.value = newOrder ? { key, order: newOrder } : null
    instance.value?.sort(key, newOrder)
    onChange?.(sortState.value)
  }

  const toggleSort = (key: string) => {
    sort(key)
  }

  const clearSort = () => {
    sortState.value = null
    instance.value?.clearSort()
    onChange?.(null)
  }

  const isSortedBy = (key: string): boolean => {
    return sortState.value?.key === key && sortState.value?.order !== null
  }

  const getSortOrder = (key: string): 'asc' | 'desc' | null => {
    if (sortState.value?.key === key) {
      return sortState.value.order
    }
    return null
  }

  // 监听实例的排序变化
  watch(
    () => instance.value,
    (inst) => {
      if (inst) {
        inst.on('sort:change', (state: SortState | null) => {
          sortState.value = state
        })

        // 同步初始状态
        sortState.value = inst.getSortState()
      }
    },
    { immediate: true }
  )

  return {
    sortState,
    sortKey,
    sortOrder,
    isSorted,
    sort,
    toggleSort,
    clearSort,
    isSortedBy,
    getSortOrder
  }
}
