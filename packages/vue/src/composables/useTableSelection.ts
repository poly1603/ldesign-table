import { ref, computed, watch } from 'vue'
import type { Ref, ComputedRef } from 'vue'
import type { TableInstance } from '@ldesign/table-core'

export interface UseTableSelectionOptions {
  /** 表格实例 */
  instance: Ref<TableInstance | null>
  /** 初始选中的keys */
  defaultSelectedKeys?: string[]
  /** 选择变化回调 */
  onChange?: (selectedKeys: string[], selectedRows: any[]) => void
}

export interface UseTableSelectionReturn {
  /** 选中的keys */
  selectedKeys: Ref<string[]>
  /** 选中的行数据 */
  selectedRows: ComputedRef<any[]>
  /** 是否全选 */
  isAllSelected: ComputedRef<boolean>
  /** 是否有选中 */
  hasSelected: ComputedRef<boolean>
  /** 选中数量 */
  selectedCount: ComputedRef<number>
  /** 选中行 */
  select: (key: string | string[]) => void
  /** 取消选中 */
  deselect: (key: string | string[]) => void
  /** 切换选中状态 */
  toggle: (key: string) => void
  /** 全选 */
  selectAll: () => void
  /** 取消全选 */
  deselectAll: () => void
  /** 反选 */
  invertSelection: () => void
  /** 清空选择 */
  clearSelection: () => void
}

/**
 * 表格选择组合式函数
 */
export function useTableSelection(options: UseTableSelectionOptions): UseTableSelectionReturn {
  const { instance, defaultSelectedKeys = [], onChange } = options

  const selectedKeys = ref<string[]>([...defaultSelectedKeys])

  // 计算属性
  const selectedRows = computed(() => {
    if (!instance.value) return []
    const data = instance.value.getData()
    const keys = new Set(selectedKeys.value)
    return data.filter((_, index) => {
      const key = String(index) // 简化处理，实际应该根据 rowKey 获取
      return keys.has(key)
    })
  })

  const isAllSelected = computed(() => {
    if (!instance.value) return false
    const data = instance.value.getData()
    return data.length > 0 && selectedKeys.value.length === data.length
  })

  const hasSelected = computed(() => selectedKeys.value.length > 0)
  const selectedCount = computed(() => selectedKeys.value.length)

  // 方法
  const select = (key: string | string[]) => {
    const keys = Array.isArray(key) ? key : [key]
    const set = new Set(selectedKeys.value)
    keys.forEach((k) => set.add(k))
    selectedKeys.value = [...set]
    instance.value?.selectRow(key)
  }

  const deselect = (key: string | string[]) => {
    const keys = Array.isArray(key) ? key : [key]
    const set = new Set(selectedKeys.value)
    keys.forEach((k) => set.delete(k))
    selectedKeys.value = [...set]
    instance.value?.deselectRow(key)
  }

  const toggle = (key: string) => {
    if (selectedKeys.value.includes(key)) {
      deselect(key)
    } else {
      select(key)
    }
  }

  const selectAll = () => {
    instance.value?.selectAll()
    selectedKeys.value = instance.value?.getSelectedKeys() || []
  }

  const deselectAll = () => {
    instance.value?.deselectAll()
    selectedKeys.value = []
  }

  const invertSelection = () => {
    if (!instance.value) return
    const allKeys = instance.value.getSelectedKeys()
    const currentSet = new Set(selectedKeys.value)
    const newKeys = allKeys.filter((k) => !currentSet.has(k))
    selectedKeys.value = newKeys
  }

  const clearSelection = () => {
    deselectAll()
  }

  // 监听实例的选择变化
  watch(
    () => instance.value,
    (inst) => {
      if (inst) {
        inst.on('selection:change', (keys: string[], rows: any[]) => {
          selectedKeys.value = keys
          onChange?.(keys, rows)
        })
      }
    },
    { immediate: true }
  )

  return {
    selectedKeys,
    selectedRows,
    isAllSelected,
    hasSelected,
    selectedCount,
    select,
    deselect,
    toggle,
    selectAll,
    deselectAll,
    invertSelection,
    clearSelection
  }
}
