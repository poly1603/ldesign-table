/**
 * 虚拟滚动器
 */

export interface VirtualScrollerConfig {
  /** 容器元素 */
  container: HTMLElement
  /** 行高 */
  rowHeight: number
  /** 缓冲区大小 */
  bufferSize: number
  /** 范围变化回调 */
  onRangeChange?: (startIndex: number, endIndex: number) => void
}

export interface VisibleRange {
  startIndex: number
  endIndex: number
  offsetTop: number
}

export class VirtualScroller {
  private config: VirtualScrollerConfig
  private containerHeight = 0
  private scrollTop = 0
  private totalCount = 0
  private visibleRange: VisibleRange = {
    startIndex: 0,
    endIndex: 0,
    offsetTop: 0
  }

  constructor(config: VirtualScrollerConfig) {
    this.config = config
    this.updateContainerSize()
  }

  /**
   * 设置数据总数
   */
  setTotalCount(count: number): void {
    this.totalCount = count
  }

  /**
   * 获取总高度
   */
  getTotalHeight(): number {
    return this.totalCount * this.config.rowHeight
  }

  /**
   * 更新容器尺寸
   */
  updateContainerSize(): void {
    this.containerHeight = this.config.container.clientHeight
    this.calculateVisibleRange()
  }

  /**
   * 处理滚动
   */
  handleScroll(scrollTop: number): void {
    this.scrollTop = scrollTop
    this.calculateVisibleRange()
  }

  /**
   * 计算可见范围
   */
  private calculateVisibleRange(): void {
    const { rowHeight, bufferSize, onRangeChange } = this.config

    const visibleCount = Math.ceil(this.containerHeight / rowHeight)
    const startIndex = Math.max(0, Math.floor(this.scrollTop / rowHeight) - bufferSize)
    const endIndex = Math.min(
      this.totalCount,
      startIndex + visibleCount + bufferSize * 2
    )

    const newRange: VisibleRange = {
      startIndex,
      endIndex,
      offsetTop: startIndex * rowHeight
    }

    if (
      newRange.startIndex !== this.visibleRange.startIndex ||
      newRange.endIndex !== this.visibleRange.endIndex
    ) {
      this.visibleRange = newRange
      onRangeChange?.(startIndex, endIndex)
    }
  }

  /**
   * 获取可见范围
   */
  getVisibleRange(): VisibleRange {
    return { ...this.visibleRange }
  }

  /**
   * 滚动到指定索引
   */
  scrollToIndex(index: number): void {
    const scrollTop = index * this.config.rowHeight
    this.config.container.scrollTop = scrollTop
  }

  /**
   * 销毁
   */
  destroy(): void {
    // 清理
  }
}
