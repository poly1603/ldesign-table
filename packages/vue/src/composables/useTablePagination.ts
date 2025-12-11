import { ref, computed, watch } from 'vue'
import type { Ref, ComputedRef } from 'vue'
import type { TableInstance } from '@ldesign/table-core'

export interface UseTablePaginationOptions {
  /** 表格实例 */
  instance: Ref<TableInstance | null>
  /** 初始页码 */
  defaultCurrent?: number
  /** 初始每页条数 */
  defaultPageSize?: number
  /** 总数 */
  total?: number
  /** 页码变化回调 */
  onChange?: (current: number, pageSize: number) => void
}

export interface UseTablePaginationReturn {
  /** 当前页 */
  current: Ref<number>
  /** 每页条数 */
  pageSize: Ref<number>
  /** 总数 */
  total: Ref<number>
  /** 总页数 */
  totalPages: ComputedRef<number>
  /** 是否有上一页 */
  hasPrev: ComputedRef<boolean>
  /** 是否有下一页 */
  hasNext: ComputedRef<boolean>
  /** 是否是第一页 */
  isFirst: ComputedRef<boolean>
  /** 是否是最后一页 */
  isLast: ComputedRef<boolean>
  /** 跳转到指定页 */
  gotoPage: (page: number) => void
  /** 上一页 */
  prev: () => void
  /** 下一页 */
  next: () => void
  /** 跳转到第一页 */
  first: () => void
  /** 跳转到最后一页 */
  last: () => void
  /** 设置每页条数 */
  setPageSize: (size: number) => void
  /** 设置总数 */
  setTotal: (total: number) => void
}

/**
 * 表格分页组合式函数
 */
export function useTablePagination(options: UseTablePaginationOptions): UseTablePaginationReturn {
  const { instance, defaultCurrent = 1, defaultPageSize = 10, total: initialTotal = 0, onChange } = options

  const current = ref(defaultCurrent)
  const pageSize = ref(defaultPageSize)
  const total = ref(initialTotal)

  // 计算属性
  const totalPages = computed(() => Math.ceil(total.value / pageSize.value) || 1)
  const hasPrev = computed(() => current.value > 1)
  const hasNext = computed(() => current.value < totalPages.value)
  const isFirst = computed(() => current.value === 1)
  const isLast = computed(() => current.value === totalPages.value)

  // 方法
  const gotoPage = (page: number) => {
    const validPage = Math.max(1, Math.min(page, totalPages.value))
    if (validPage !== current.value) {
      current.value = validPage
      instance.value?.gotoPage(validPage)
      onChange?.(validPage, pageSize.value)
    }
  }

  const prev = () => {
    if (hasPrev.value) {
      gotoPage(current.value - 1)
    }
  }

  const next = () => {
    if (hasNext.value) {
      gotoPage(current.value + 1)
    }
  }

  const first = () => {
    gotoPage(1)
  }

  const last = () => {
    gotoPage(totalPages.value)
  }

  const setPageSize = (size: number) => {
    if (size !== pageSize.value) {
      pageSize.value = size
      current.value = 1
      instance.value?.setPageSize(size)
      onChange?.(1, size)
    }
  }

  const setTotal = (newTotal: number) => {
    total.value = newTotal
  }

  // 监听实例的分页变化
  watch(
    () => instance.value,
    (inst) => {
      if (inst) {
        inst.on('page:change', (page: number, size: number) => {
          current.value = page
          pageSize.value = size
        })

        // 同步初始状态
        const paginationInfo = inst.getPagination()
        current.value = paginationInfo.current
        pageSize.value = paginationInfo.pageSize
        total.value = paginationInfo.total
      }
    },
    { immediate: true }
  )

  return {
    current,
    pageSize,
    total,
    totalPages,
    hasPrev,
    hasNext,
    isFirst,
    isLast,
    gotoPage,
    prev,
    next,
    first,
    last,
    setPageSize,
    setTotal
  }
}
