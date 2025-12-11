/**
 * 列宽调整器
 */

export interface ColumnResizerConfig {
  /** 调整回调 */
  onResize?: (columnKey: string, width: number) => void
  /** 最小宽度 */
  minWidth?: number
  /** 最大宽度 */
  maxWidth?: number
}

export class ColumnResizer {
  private container: HTMLElement
  private config: ColumnResizerConfig
  private isResizing = false
  private currentHandle: HTMLElement | null = null
  private currentColumn: string | null = null
  private startX = 0
  private startWidth = 0

  constructor(container: HTMLElement, config: ColumnResizerConfig = {}) {
    this.container = container
    this.config = {
      minWidth: 50,
      maxWidth: 800,
      ...config
    }
    this.bindEvents()
  }

  /**
   * 绑定事件
   */
  private bindEvents(): void {
    this.container.addEventListener('mousedown', this.handleMouseDown)
    document.addEventListener('mousemove', this.handleMouseMove)
    document.addEventListener('mouseup', this.handleMouseUp)
  }

  /**
   * 鼠标按下事件
   */
  private handleMouseDown = (e: MouseEvent): void => {
    const target = e.target as HTMLElement
    if (!target.classList.contains('lt-table__resize-handle')) return

    e.preventDefault()
    e.stopPropagation()

    this.isResizing = true
    this.currentHandle = target
    this.currentColumn = target.dataset.key || null
    this.startX = e.clientX

    // 获取当前列宽
    const headerCell = target.parentElement as HTMLElement
    this.startWidth = headerCell.offsetWidth

    target.classList.add('lt-table__resize-handle--active')
    document.body.style.cursor = 'col-resize'
    document.body.style.userSelect = 'none'
  }

  /**
   * 鼠标移动事件
   */
  private handleMouseMove = (e: MouseEvent): void => {
    if (!this.isResizing || !this.currentColumn) return

    const diff = e.clientX - this.startX
    let newWidth = this.startWidth + diff

    // 限制宽度范围
    newWidth = Math.max(this.config.minWidth!, newWidth)
    newWidth = Math.min(this.config.maxWidth!, newWidth)

    // 更新列宽
    this.updateColumnWidth(this.currentColumn, newWidth)
    this.config.onResize?.(this.currentColumn, newWidth)
  }

  /**
   * 鼠标释放事件
   */
  private handleMouseUp = (): void => {
    if (!this.isResizing) return

    this.isResizing = false
    this.currentHandle?.classList.remove('lt-table__resize-handle--active')
    this.currentHandle = null
    this.currentColumn = null

    document.body.style.cursor = ''
    document.body.style.userSelect = ''
  }

  /**
   * 更新列宽
   */
  private updateColumnWidth(columnKey: string, width: number): void {
    // 更新表头
    const headerCell = this.container.querySelector(
      `th[data-key="${columnKey}"]`
    ) as HTMLElement
    if (headerCell) {
      headerCell.style.width = `${width}px`
    }

    // 更新表体单元格
    const bodyCells = this.container.querySelectorAll(
      `td[data-key="${columnKey}"]`
    ) as NodeListOf<HTMLElement>
    bodyCells.forEach((cell) => {
      cell.style.width = `${width}px`
    })
  }

  /**
   * 设置列宽
   */
  setColumnWidth(columnKey: string, width: number): void {
    this.updateColumnWidth(columnKey, width)
    this.config.onResize?.(columnKey, width)
  }

  /**
   * 销毁
   */
  destroy(): void {
    this.container.removeEventListener('mousedown', this.handleMouseDown)
    document.removeEventListener('mousemove', this.handleMouseMove)
    document.removeEventListener('mouseup', this.handleMouseUp)
  }
}
