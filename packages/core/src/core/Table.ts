import type {
  TableConfig,
  TableInstance,
  TableState,
  ColumnDef,
  SortState,
  FilterState,
  PaginationConfig,
  SelectionConfig,
  ExpandConfig,
  VirtualScrollConfig,
  ThemeConfig
} from '../types'
import { EventEmitter } from '../utils/EventEmitter'
import { ThemeManager } from '../theme/ThemeManager'
import {
  generateId,
  getNestedValue,
  parsePixelValue,
  createElement,
  addClass,
  debounce,
  throttle
} from '../utils'
import { VirtualScroller } from './VirtualScroller'
import { ColumnResizer } from './ColumnResizer'

/**
 * 默认配置
 */
const defaultConfig: Partial<TableConfig> = {
  rowKey: 'id',
  bordered: false,
  striped: false,
  showHeader: true,
  rowHover: true,
  stickyHeader: false,
  emptyText: '暂无数据',
  loadingText: '加载中...',
  theme: 'light',
  locale: {
    emptyText: '暂无数据',
    loadingText: '加载中...',
    filterConfirm: '确定',
    filterReset: '重置',
    filterEmpty: '无筛选项',
    selectAll: '全选',
    selectInvert: '反选',
    sortAsc: '升序',
    sortDesc: '降序',
    expand: '展开',
    collapse: '收起',
    page: {
      prev: '上一页',
      next: '下一页',
      jump: '跳至',
      pageSize: '条/页',
      total: '共 {total} 条'
    }
  }
}

/**
 * 表格类
 */
export class Table<T = any> extends EventEmitter<Record<string, (...args: any[]) => void>> implements TableInstance<T> {
  private config: TableConfig<T>
  private state: TableState<T>
  private container: HTMLElement
  private rootElement!: HTMLElement
  private headerElement!: HTMLElement
  private bodyElement!: HTMLElement
  private paginationElement: HTMLElement | null = null
  private loadingElement: HTMLElement | null = null
  private themeManager: ThemeManager
  private virtualScroller: VirtualScroller | null = null
  private columnResizer: ColumnResizer | null = null
  private resizeObserver: ResizeObserver | null = null
  private tableId: string
  private isDestroyed = false
  private processedData: T[] = []
  private flattenedColumns: ColumnDef<T>[] = []

  constructor(config: TableConfig<T>) {
    super()
    this.tableId = generateId('lt-table')
    this.config = { ...defaultConfig, ...config } as TableConfig<T>
    this.container = this.resolveContainer(config.container)
    this.themeManager = new ThemeManager(this.config.theme)

    // 初始化状态
    this.state = {
      data: [...this.config.data],
      columns: [...this.config.columns],
      sortState: null,
      filterState: {},
      selectedKeys: new Set(
        (this.config.selection !== false && this.config.selection?.selectedKeys) || []
      ),
      expandedKeys: new Set(
        (this.config.expand !== false && this.config.expand?.expandedKeys) || []
      ),
      treeExpandedKeys: new Set(
        (this.config.tree !== false && this.config.tree?.expandedKeys) || []
      ),
      pagination: {
        current: (this.config.pagination !== false && this.config.pagination?.current) || 1,
        pageSize: (this.config.pagination !== false && this.config.pagination?.pageSize) || 10,
        total: (this.config.pagination !== false && this.config.pagination?.total) || this.config.data.length
      },
      scroll: { left: 0, top: 0 },
      loading: this.config.loading || false,
      columnWidths: new Map()
    }

    this.init()
  }

  /**
   * 解析容器
   */
  private resolveContainer(container: HTMLElement | string): HTMLElement {
    if (typeof container === 'string') {
      const el = document.querySelector<HTMLElement>(container)
      if (!el) {
        throw new Error(`Container "${container}" not found`)
      }
      return el
    }
    return container
  }

  /**
   * 初始化
   */
  private init(): void {
    this.flattenColumns()
    this.processData()
    this.createStructure()
    this.themeManager.mount(this.rootElement)
    this.bindEvents()
    this.setupResizeObserver()
    this.render()
    this.emit('ready')
  }

  /**
   * 扁平化列配置
   */
  private flattenColumns(): void {
    const flatten = (cols: ColumnDef<T>[]): ColumnDef<T>[] => {
      const result: ColumnDef<T>[] = []
      for (const col of cols) {
        if (col.children && col.children.length > 0) {
          result.push(...flatten(col.children))
        } else {
          result.push(col)
        }
      }
      return result
    }
    this.flattenedColumns = flatten(this.state.columns)
  }

  /**
   * 处理数据（排序、筛选、分页）
   */
  private processData(): void {
    let data = [...this.state.data]

    // 筛选
    data = this.applyFilter(data)

    // 排序
    data = this.applySort(data)

    // 更新总数
    this.state.pagination.total = data.length

    // 分页
    if (this.config.pagination !== false) {
      data = this.applyPagination(data)
    }

    this.processedData = data
  }

  /**
   * 应用筛选
   */
  private applyFilter(data: T[]): T[] {
    const filterState = this.state.filterState
    if (Object.keys(filterState).length === 0) {
      return data
    }

    return data.filter((record) => {
      return Object.entries(filterState).every(([key, filterValue]) => {
        if (filterValue === undefined || filterValue === null) {
          return true
        }

        const column = this.flattenedColumns.find((col) => col.key === key)
        if (!column) return true

        const value = getNestedValue(record, column.field || column.key)

        if (column.filterFn) {
          return column.filterFn(value, record, filterValue)
        }

        // 默认筛选逻辑
        if (Array.isArray(filterValue)) {
          return filterValue.includes(value)
        }
        return value === filterValue
      })
    })
  }

  /**
   * 应用排序
   */
  private applySort(data: T[]): T[] {
    const sortState = this.state.sortState
    if (!sortState || !sortState.order) {
      return data
    }

    const column = this.flattenedColumns.find((col) => col.key === sortState.key)
    if (!column) return data

    const sorted = [...data]
    const field = column.field || column.key
    const order = sortState.order === 'asc' ? 1 : -1

    sorted.sort((a, b) => {
      if (column.sorter) {
        return column.sorter(a, b) * order
      }

      const aVal = getNestedValue(a, field)
      const bVal = getNestedValue(b, field)

      if (aVal === bVal) return 0
      if (aVal === null || aVal === undefined) return 1
      if (bVal === null || bVal === undefined) return -1

      if (typeof aVal === 'number' && typeof bVal === 'number') {
        return (aVal - bVal) * order
      }

      return String(aVal).localeCompare(String(bVal)) * order
    })

    return sorted
  }

  /**
   * 应用分页
   */
  private applyPagination(data: T[]): T[] {
    const { current, pageSize } = this.state.pagination
    const start = (current - 1) * pageSize
    return data.slice(start, start + pageSize)
  }

  /**
   * 创建DOM结构
   */
  private createStructure(): void {
    this.rootElement = createElement('div', {
      id: this.tableId,
      className: this.getRootClassName()
    })

    // 主体包装器
    const wrapper = createElement('div', { className: 'lt-table__wrapper' })

    // 表格
    const table = createElement('table', { className: 'lt-table__main' })

    // 表头
    this.headerElement = createElement('thead', {
      className: `lt-table__header${this.config.stickyHeader ? ' lt-table__header--sticky' : ''}`
    })

    // 表体
    this.bodyElement = createElement('tbody', { className: 'lt-table__body' })

    table.appendChild(this.headerElement)
    table.appendChild(this.bodyElement)
    wrapper.appendChild(table)
    this.rootElement.appendChild(wrapper)

    // 设置尺寸
    if (this.config.height) {
      wrapper.style.height = parsePixelValue(this.config.height)
      wrapper.style.overflowY = 'auto'
    }
    if (this.config.maxHeight) {
      wrapper.style.maxHeight = parsePixelValue(this.config.maxHeight)
      wrapper.style.overflowY = 'auto'
    }
    if (this.config.width) {
      this.rootElement.style.width = parsePixelValue(this.config.width)
    }

    // 挂载到容器
    this.container.innerHTML = ''
    this.container.appendChild(this.rootElement)

    // 初始化虚拟滚动
    if (this.config.virtualScroll !== false && this.config.virtualScroll?.enabled) {
      this.initVirtualScroll()
    }

    // 初始化列调整
    this.columnResizer = new ColumnResizer(this.rootElement, {
      onResize: (key: string, width: number) => {
        this.state.columnWidths.set(key, width)
        this.config.onColumnResize?.(
          this.flattenedColumns.find((c) => c.key === key)!,
          width
        )
        this.emit('column:resize', this.flattenedColumns.find((c) => c.key === key)!, width)
      }
    })
  }

  /**
   * 获取根元素类名
   */
  private getRootClassName(): string {
    const classes = ['lt-table']
    if (this.config.bordered) classes.push('lt-table--bordered')
    if (this.config.striped) classes.push('lt-table--striped')
    return classes.join(' ')
  }

  /**
   * 初始化虚拟滚动
   */
  private initVirtualScroll(): void {
    const vsConfig = this.config.virtualScroll as VirtualScrollConfig
    this.virtualScroller = new VirtualScroller({
      container: this.bodyElement.parentElement!.parentElement!,
      rowHeight: vsConfig.rowHeight || 52,
      bufferSize: vsConfig.bufferSize || 5,
      onRangeChange: () => this.renderBody()
    })
  }

  /**
   * 绑定事件
   */
  private bindEvents(): void {
    const wrapper = this.rootElement.querySelector('.lt-table__wrapper')
    if (wrapper) {
      wrapper.addEventListener(
        'scroll',
        throttle((e: Event) => {
          const target = e.target as HTMLElement
          this.state.scroll.left = target.scrollLeft
          this.state.scroll.top = target.scrollTop
          this.config.onScroll?.(target.scrollLeft, target.scrollTop)
          this.emit('scroll', target.scrollLeft, target.scrollTop)

          if (this.virtualScroller) {
            this.virtualScroller.handleScroll(target.scrollTop)
          }

          // 更新固定列阴影状态
          this.updateFixedColumnShadow(target)
        }, 16) as EventListener
      )

      // 初始化时检查一次
      requestAnimationFrame(() => {
        this.updateFixedColumnShadow(wrapper as HTMLElement)
      })
    }
  }

  /**
   * 更新固定列阴影状态
   */
  private updateFixedColumnShadow(wrapper: HTMLElement): void {
    const { scrollLeft, scrollWidth, clientWidth } = wrapper
    const maxScroll = scrollWidth - clientWidth

    // 左侧固定列：当有向右滚动时显示阴影
    if (scrollLeft > 0) {
      this.rootElement.classList.add('lt-table--scroll-left')
    } else {
      this.rootElement.classList.remove('lt-table--scroll-left')
    }

    // 右侧固定列：当未滚动到最右时显示阴影
    if (scrollLeft < maxScroll - 1) {
      this.rootElement.classList.add('lt-table--scroll-right')
    } else {
      this.rootElement.classList.remove('lt-table--scroll-right')
    }
  }

  /**
   * 设置ResizeObserver
   */
  private setupResizeObserver(): void {
    if (typeof ResizeObserver === 'undefined') return

    this.resizeObserver = new ResizeObserver(
      debounce(() => {
        if (this.virtualScroller) {
          this.virtualScroller.updateContainerSize()
        }
      }, 100)
    )

    this.resizeObserver.observe(this.container)
  }

  /**
   * 渲染表格
   */
  private render(): void {
    if (this.isDestroyed) return

    this.renderHeader()
    this.renderBody()
    this.renderPagination()
    this.renderLoading()
  }

  /**
   * 渲染表头
   */
  private renderHeader(): void {
    if (!this.config.showHeader) {
      this.headerElement.style.display = 'none'
      return
    }

    this.headerElement.innerHTML = ''

    // 检查是否有多级表头
    const maxDepth = this.getHeaderDepth(this.state.columns)

    if (maxDepth > 1) {
      // 多级表头
      this.renderMultiLevelHeader(maxDepth)
    } else {
      // 单级表头
      this.renderSingleLevelHeader()
    }
  }

  /**
   * 获取表头深度
   */
  private getHeaderDepth(columns: ColumnDef<T>[]): number {
    let maxDepth = 1
    for (const col of columns) {
      if (col.children && col.children.length > 0) {
        const childDepth = this.getHeaderDepth(col.children) + 1
        maxDepth = Math.max(maxDepth, childDepth)
      }
    }
    return maxDepth
  }

  /**
   * 渲染单级表头
   */
  private renderSingleLevelHeader(): void {
    const row = createElement('tr', { className: 'lt-table__header-row' })

    // 选择列
    if (this.config.selection !== false && this.config.selection) {
      const selectionCell = this.renderSelectionHeader()
      row.appendChild(selectionCell)
    }

    // 展开列
    if (this.config.expand !== false && this.config.expand) {
      const expandCell = createElement('th', {
        className: 'lt-table__header-cell lt-table__expand-cell'
      })
      row.appendChild(expandCell)
    }

    // 数据列
    this.flattenedColumns.forEach((column) => {
      if (column.visible === false) return

      const cell = this.renderHeaderCell(column)
      row.appendChild(cell)
    })

    this.headerElement.appendChild(row)
  }

  /**
   * 渲染多级表头
   */
  private renderMultiLevelHeader(maxDepth: number): void {
    const rows: HTMLElement[] = []
    for (let i = 0; i < maxDepth; i++) {
      rows.push(createElement('tr', { className: 'lt-table__header-row' }))
    }

    // 选择列 - 跨所有行
    if (this.config.selection !== false && this.config.selection) {
      const selectionCell = this.renderSelectionHeader()
      selectionCell.setAttribute('rowspan', String(maxDepth))
      rows[0].appendChild(selectionCell)
    }

    // 展开列 - 跨所有行
    if (this.config.expand !== false && this.config.expand) {
      const expandCell = createElement('th', {
        className: 'lt-table__header-cell lt-table__expand-cell'
      })
      expandCell.setAttribute('rowspan', String(maxDepth))
      rows[0].appendChild(expandCell)
    }

    // 递归渲染列
    this.renderHeaderColumns(this.state.columns, rows, 0, maxDepth)

    rows.forEach(row => this.headerElement.appendChild(row))
  }

  /**
   * 递归渲染表头列
   */
  private renderHeaderColumns(
    columns: ColumnDef<T>[],
    rows: HTMLElement[],
    level: number,
    maxDepth: number
  ): void {
    columns.forEach(column => {
      if (column.visible === false) return

      const cell = this.renderHeaderCell(column)

      if (column.children && column.children.length > 0) {
        // 父列：设置 colspan
        const leafCount = this.getLeafColumnCount(column)
        cell.setAttribute('colspan', String(leafCount))
        rows[level].appendChild(cell)
        // 递归渲染子列
        this.renderHeaderColumns(column.children, rows, level + 1, maxDepth)
      } else {
        // 叶子列：设置 rowspan
        const rowspan = maxDepth - level
        if (rowspan > 1) {
          cell.setAttribute('rowspan', String(rowspan))
        }
        rows[level].appendChild(cell)
      }
    })
  }

  /**
   * 获取叶子列数量
   */
  private getLeafColumnCount(column: ColumnDef<T>): number {
    if (!column.children || column.children.length === 0) {
      return column.visible === false ? 0 : 1
    }
    return column.children.reduce((sum, child) => sum + this.getLeafColumnCount(child), 0)
  }

  /**
   * 渲染选择列表头
   */
  private renderSelectionHeader(): HTMLElement {
    const selection = this.config.selection as SelectionConfig
    const cell = createElement('th', {
      className: 'lt-table__header-cell lt-table__selection-cell',
      style: { width: `${selection.columnWidth || 50}px` }
    })

    if (selection.type === 'checkbox' && !selection.hideSelectAll) {
      const allKeys = this.getAllRowKeys()
      const selectedCount = [...this.state.selectedKeys].filter((k) =>
        allKeys.includes(k)
      ).length
      const isAllSelected = allKeys.length > 0 && selectedCount === allKeys.length
      const isIndeterminate = selectedCount > 0 && selectedCount < allKeys.length

      const checkbox = this.createCheckbox(isAllSelected, isIndeterminate, () => {
        if (isAllSelected) {
          this.deselectAll()
        } else {
          this.selectAll()
        }
      })
      cell.appendChild(checkbox)
    }

    if (selection.fixed) {
      addClass(cell, 'lt-table__header-cell--fixed-left')
    }

    return cell
  }

  /**
   * 创建复选框
   */
  private createCheckbox(
    checked: boolean,
    indeterminate: boolean,
    onChange: () => void,
    disabled = false
  ): HTMLElement {
    const wrapper = createElement('label', {
      className: `lt-table__selection lt-table__checkbox${disabled ? ' lt-table__checkbox--disabled' : ''}`
    })

    const input = document.createElement('input')
    input.type = 'checkbox'
    input.className = 'lt-table__checkbox-input'
    input.checked = checked
    input.disabled = disabled

    if (indeterminate) {
      input.indeterminate = true
    }

    input.addEventListener('click', (e) => {
      e.stopPropagation()
    })

    input.addEventListener('change', (e) => {
      e.stopPropagation()
      onChange()
    })

    const inner = createElement('span', { className: 'lt-table__checkbox-inner' })

    wrapper.appendChild(input)
    wrapper.appendChild(inner)

    return wrapper
  }

  /**
   * 创建单选框
   */
  private createRadio(
    checked: boolean,
    onChange: () => void,
    disabled = false
  ): HTMLElement {
    const wrapper = createElement('label', {
      className: `lt-table__selection lt-table__radio${disabled ? ' lt-table__radio--disabled' : ''}`
    })

    const input = document.createElement('input')
    input.type = 'radio'
    input.name = `${this.tableId}-radio`
    input.className = 'lt-table__radio-input'
    input.checked = checked
    input.disabled = disabled

    input.addEventListener('click', (e) => {
      e.stopPropagation()
    })

    input.addEventListener('change', (e) => {
      e.stopPropagation()
      onChange()
    })

    const inner = createElement('span', { className: 'lt-table__radio-inner' })

    wrapper.appendChild(input)
    wrapper.appendChild(inner)

    return wrapper
  }

  /**
   * 渲染表头单元格
   */
  private renderHeaderCell(column: ColumnDef<T>): HTMLElement {
    const classes = ['lt-table__header-cell']
    if (column.sortable) classes.push('lt-table__header-cell--sortable')
    if (column.align) classes.push(`lt-table__header-cell--align-${column.align}`)
    if (column.headerClass) classes.push(column.headerClass)
    if (column.fixed) {
      classes.push(`lt-table__header-cell--fixed-${column.fixed}`)
    }

    const width = this.state.columnWidths.get(column.key) || column.width
    const cell = createElement('th', {
      className: classes.join(' '),
      style: width ? { width: parsePixelValue(width) } : undefined,
      data: { key: column.key }
    })

    // 内容容器
    const content = createElement('div', { className: 'lt-table__header-cell-content' })

    // 标题
    if (column.headerRender) {
      const rendered = column.headerRender(column)
      if (typeof rendered === 'string') {
        content.innerHTML = rendered
      } else {
        content.appendChild(rendered)
      }
    } else {
      content.appendChild(document.createTextNode(column.title))
    }

    // 排序图标
    if (column.sortable) {
      const sorter = this.renderSorter(column)
      content.appendChild(sorter)

      cell.addEventListener('click', () => {
        this.handleSort(column)
      })
    }

    // 筛选图标
    if (column.filterable) {
      const filter = this.renderFilterTrigger(column)
      content.appendChild(filter)
    }

    cell.appendChild(content)

    // 列调整手柄
    if (column.resizable !== false) {
      const handle = createElement('div', {
        className: 'lt-table__resize-handle',
        data: { key: column.key }
      })
      cell.appendChild(handle)
    }

    return cell
  }

  /**
   * 渲染排序图标
   */
  private renderSorter(column: ColumnDef<T>): HTMLElement {
    const isActive = this.state.sortState?.key === column.key
    const order = isActive ? this.state.sortState?.order : null

    const sorter = createElement('span', {
      className: `lt-table__sorter${isActive ? ' lt-table__sorter--active' : ''}`
    })

    // 使用小三角箭头图标 - 纵向排列
    const ascIcon = createElement('span', {
      className: `lt-table__sorter-icon lt-table__sorter-icon--asc${order === 'asc' ? ' lt-table__sorter--active' : ''}`
    })
    // ChevronUp - 向上小三角
    ascIcon.innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m18 15-6-6-6 6"/></svg>`

    const descIcon = createElement('span', {
      className: `lt-table__sorter-icon lt-table__sorter-icon--desc${order === 'desc' ? ' lt-table__sorter--active' : ''}`
    })
    // ChevronDown - 向下小三角
    descIcon.innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m6 9 6 6 6-6"/></svg>`

    sorter.appendChild(ascIcon)
    sorter.appendChild(descIcon)

    return sorter
  }

  /**
   * 渲染筛选触发器
   */
  private renderFilterTrigger(column: ColumnDef<T>): HTMLElement {
    const isActive = column.key in this.state.filterState
    const trigger = createElement('button', {
      className: `lt-table__filter-trigger${isActive ? ' lt-table__filter-trigger--active' : ''}`
    })

    trigger.innerHTML = `<svg class="lt-table__filter-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
      <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"></polygon>
    </svg>`

    trigger.addEventListener('click', (e) => {
      e.stopPropagation()
      this.showFilterDropdown(column, trigger)
    })

    return trigger
  }

  /**
   * 显示筛选下拉菜单
   */
  private showFilterDropdown(column: ColumnDef<T>, trigger: HTMLElement): void {
    // 移除已存在的下拉菜单
    const existing = document.querySelector('.lt-table__filter-dropdown')
    if (existing) existing.remove()

    const options = column.filterOptions || []
    const currentValue = this.state.filterState[column.key]

    const dropdown = createElement('div', { className: 'lt-table__filter-dropdown' })

    // 筛选选项
    options.forEach((option) => {
      const isSelected = Array.isArray(currentValue)
        ? currentValue.includes(option.value)
        : currentValue === option.value

      const optionEl = createElement('div', {
        className: `lt-table__filter-option${isSelected ? ' lt-table__filter-option--selected' : ''}`
      })
      optionEl.textContent = option.label

      optionEl.addEventListener('click', () => {
        this.filter({ ...this.state.filterState, [column.key]: option.value })
        dropdown.remove()
      })

      dropdown.appendChild(optionEl)
    })

    // 操作按钮
    const actions = createElement('div', { className: 'lt-table__filter-actions' })

    const resetBtn = createElement('button', { className: 'lt-table__filter-btn' })
    resetBtn.textContent = this.config.locale?.filterReset || '重置'
    resetBtn.addEventListener('click', () => {
      this.clearFilter(column.key)
      dropdown.remove()
    })

    const confirmBtn = createElement('button', {
      className: 'lt-table__filter-btn lt-table__filter-btn--primary'
    })
    confirmBtn.textContent = this.config.locale?.filterConfirm || '确定'
    confirmBtn.addEventListener('click', () => {
      dropdown.remove()
    })

    actions.appendChild(resetBtn)
    actions.appendChild(confirmBtn)
    dropdown.appendChild(actions)

    // 定位
    const rect = trigger.getBoundingClientRect()
    dropdown.style.position = 'fixed'
    dropdown.style.top = `${rect.bottom + 4}px`
    dropdown.style.left = `${rect.left}px`

    document.body.appendChild(dropdown)

    // 点击外部关闭
    const closeHandler = (e: MouseEvent) => {
      if (!dropdown.contains(e.target as Node) && e.target !== trigger) {
        dropdown.remove()
        document.removeEventListener('click', closeHandler)
      }
    }
    setTimeout(() => document.addEventListener('click', closeHandler), 0)
  }

  /**
   * 处理排序
   */
  private handleSort(column: ColumnDef<T>): void {
    const currentState = this.state.sortState
    let newOrder: 'asc' | 'desc' | null = 'asc'

    if (currentState?.key === column.key) {
      if (currentState.order === 'asc') {
        newOrder = 'desc'
      } else if (currentState.order === 'desc') {
        newOrder = null
      }
    }

    this.sort(column.key, newOrder)
  }

  /**
   * 渲染表体
   */
  private renderBody(): void {
    this.bodyElement.innerHTML = ''

    if (this.processedData.length === 0) {
      this.renderEmpty()
      return
    }

    const fragment = document.createDocumentFragment()

    this.processedData.forEach((record, index) => {
      const row = this.renderRow(record, index)
      fragment.appendChild(row)

      // 展开行
      if (this.isRowExpanded(record)) {
        const expandRow = this.renderExpandedRow(record, index)
        if (expandRow) {
          fragment.appendChild(expandRow)
        }
      }
    })

    this.bodyElement.appendChild(fragment)
  }

  /**
   * 渲染行
   */
  private renderRow(record: T, index: number): HTMLElement {
    const rowKey = this.getRowKey(record)
    const isSelected = this.state.selectedKeys.has(rowKey)

    const classes = ['lt-table__row']
    if (this.config.striped) classes.push('lt-table__row--striped')
    if (isSelected) classes.push('lt-table__row--selected')
    if (this.isRowExpanded(record)) classes.push('lt-table__row--expanded')

    // 自定义行类名
    if (this.config.rowClass) {
      const customClass =
        typeof this.config.rowClass === 'function'
          ? this.config.rowClass(record, index)
          : this.config.rowClass
      if (customClass) classes.push(customClass)
    }

    const row = createElement('tr', {
      className: classes.join(' '),
      data: { key: rowKey }
    })

    // 自定义行样式
    if (this.config.rowStyle) {
      const style =
        typeof this.config.rowStyle === 'function'
          ? this.config.rowStyle(record, index)
          : this.config.rowStyle
      Object.assign(row.style, style)
    }

    // 选择列
    if (this.config.selection !== false && this.config.selection) {
      const selectionCell = this.renderSelectionCell(record, rowKey)
      row.appendChild(selectionCell)
    }

    // 展开列
    if (this.config.expand !== false && this.config.expand) {
      const expandCell = this.renderExpandCell(record)
      row.appendChild(expandCell)
    }

    // 数据列
    this.flattenedColumns.forEach((column) => {
      if (column.visible === false) return

      const cell = this.renderCell(record, column, index)
      row.appendChild(cell)
    })

    // 行事件
    row.addEventListener('click', (e) => {
      this.config.onRowClick?.(record, index, e)
      this.emit('row:click', record, index, e)
    })

    row.addEventListener('dblclick', (e) => {
      this.config.onRowDoubleClick?.(record, index, e)
      this.emit('row:dblclick', record, index, e)
    })

    row.addEventListener('contextmenu', (e) => {
      this.config.onRowContextMenu?.(record, index, e)
      this.emit('row:contextmenu', record, index, e)
    })

    return row
  }

  /**
   * 渲染选择列
   */
  private renderSelectionCell(record: T, rowKey: string): HTMLElement {
    const selection = this.config.selection as SelectionConfig
    const cell = createElement('td', {
      className: 'lt-table__cell lt-table__selection-cell'
    })

    const isSelected = this.state.selectedKeys.has(rowKey)
    const props = selection.getCheckboxProps?.(record) || {}

    if (selection.type === 'checkbox') {
      const checkbox = this.createCheckbox(
        isSelected,
        props.indeterminate || false,
        () => {
          if (isSelected) {
            this.deselectRow(rowKey)
          } else {
            this.selectRow(rowKey)
          }
        },
        props.disabled
      )
      cell.appendChild(checkbox)
    } else {
      const radio = this.createRadio(
        isSelected,
        () => {
          this.state.selectedKeys.clear()
          this.selectRow(rowKey)
        },
        props.disabled
      )
      cell.appendChild(radio)
    }

    if (selection.fixed) {
      addClass(cell, 'lt-table__cell--fixed-left')
    }

    return cell
  }

  /**
   * 渲染展开列
   */
  private renderExpandCell(record: T): HTMLElement {
    const expand = this.config.expand as ExpandConfig
    const cell = createElement('td', { className: 'lt-table__cell lt-table__expand-cell' })

    const rowExpandable = expand.rowExpandable?.(record) ?? true

    if (rowExpandable) {
      const isExpanded = this.isRowExpanded(record)
      const trigger = createElement('button', {
        className: `lt-table__expand-trigger${isExpanded ? ' lt-table__expand-trigger--expanded' : ''}`
      })

      // 使用 Lucide ChevronRight 图标
      const icon = createElement('span', { className: 'lt-table__expand-icon' })
      icon.innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m9 18 6-6-6-6"/></svg>`
      trigger.appendChild(icon)

      trigger.addEventListener('click', (e) => {
        e.stopPropagation()
        const key = this.getRowKey(record)
        if (isExpanded) {
          this.collapseRow(key)
        } else {
          this.expandRow(key)
        }
      })

      cell.appendChild(trigger)
    }

    if (expand.fixed) {
      addClass(cell, 'lt-table__cell--fixed-left')
    }

    return cell
  }

  /**
   * 渲染展开行内容
   */
  private renderExpandedRow(record: T, index: number): HTMLElement | null {
    const expand = this.config.expand as ExpandConfig
    if (!expand.expandedRowRender) return null

    const colSpan = this.getColSpan()
    const rowKey = this.getRowKey(record)
    const row = createElement('tr', {
      className: 'lt-table__row lt-table__row--expand-content',
      'data-expand-key': rowKey
    })
    const cell = createElement('td', {
      className: 'lt-table__expand-content',
      colSpan: String(colSpan)
    })

    const content = expand.expandedRowRender(record, index)
    if (typeof content === 'string') {
      cell.innerHTML = content
    } else {
      cell.appendChild(content)
    }

    row.appendChild(cell)
    return row
  }

  /**
   * 渲染单元格
   */
  private renderCell(record: T, column: ColumnDef<T>, rowIndex: number): HTMLElement {
    const classes = ['lt-table__cell']
    if (column.align) classes.push(`lt-table__cell--align-${column.align}`)
    if (column.ellipsis) classes.push('lt-table__cell--ellipsis')
    if (column.fixed) {
      classes.push(`lt-table__cell--fixed-${column.fixed}`)
    }
    if (column.editable) {
      classes.push('lt-table__cell--editable')
    }

    // 自定义单元格类名
    if (column.cellClass) {
      const customClass =
        typeof column.cellClass === 'function'
          ? column.cellClass(record, rowIndex)
          : column.cellClass
      if (customClass) classes.push(customClass)
    }

    // 处理单元格合并
    const colSpan = typeof column.colSpan === 'function'
      ? column.colSpan(record, rowIndex)
      : column.colSpan
    const rowSpan = typeof column.rowSpan === 'function'
      ? column.rowSpan(record, rowIndex)
      : column.rowSpan

    // 如果 colSpan 或 rowSpan 为 0，不渲染此单元格
    if (colSpan === 0 || rowSpan === 0) {
      const emptyCell = createElement('td', { style: { display: 'none' } })
      return emptyCell
    }

    const width = this.state.columnWidths.get(column.key) || column.width
    const cell = createElement('td', {
      className: classes.join(' '),
      style: width ? { width: parsePixelValue(width) } : undefined
    })

    if (colSpan && colSpan > 1) {
      cell.setAttribute('colspan', String(colSpan))
    }
    if (rowSpan && rowSpan > 1) {
      cell.setAttribute('rowspan', String(rowSpan))
    }

    // 获取值
    const value = getNestedValue(record, column.field || column.key)

    // 渲染内容
    this.renderCellContent(cell, value, record, column, rowIndex)

    // 单元格点击
    cell.addEventListener('click', (e) => {
      this.config.onCellClick?.(record, column, rowIndex, e)
      this.emit('cell:click', record, column, rowIndex, e)
    })

    // 双击编辑
    if (column.editable) {
      cell.addEventListener('dblclick', (e) => {
        e.stopPropagation()
        this.startCellEdit(cell, record, column, rowIndex)
      })
    }

    return cell
  }

  /**
   * 渲染单元格内容
   */
  private renderCellContent(
    cell: HTMLElement,
    value: any,
    record: T,
    column: ColumnDef<T>,
    rowIndex: number
  ): void {
    cell.innerHTML = ''
    if (column.render) {
      const content = column.render(value, record, rowIndex)
      if (typeof content === 'string') {
        cell.innerHTML = content
      } else {
        cell.appendChild(content)
      }
    } else {
      cell.textContent = value !== undefined && value !== null ? String(value) : ''
    }
  }

  /**
   * 开始单元格编辑
   */
  private startCellEdit(
    cell: HTMLElement,
    record: T,
    column: ColumnDef<T>,
    rowIndex: number
  ): void {
    if (cell.classList.contains('lt-table__cell--editing')) return

    cell.classList.add('lt-table__cell--editing')
    const field = column.field || column.key
    const value = getNestedValue(record, field)
    const editConfig = typeof column.editable === 'object' ? column.editable : {}
    const type = editConfig.type || 'input'

    // 创建编辑输入框
    const inputWrapper = createElement('div', { className: 'lt-table__cell-editor' })
    let input: HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement

    if (type === 'select' && editConfig.options) {
      input = createElement('select', { className: 'lt-table__cell-input' }) as HTMLSelectElement
      editConfig.options.forEach(opt => {
        const option = createElement('option', { value: opt.value }) as HTMLOptionElement
        option.textContent = opt.label
        if (opt.value === value) option.selected = true
        input.appendChild(option)
      })
    } else if (type === 'textarea') {
      input = createElement('textarea', {
        className: 'lt-table__cell-input',
        value: value ?? ''
      }) as HTMLTextAreaElement
    } else {
      input = createElement('input', {
        type: type === 'number' ? 'number' : 'text',
        className: 'lt-table__cell-input',
        value: value ?? ''
      }) as HTMLInputElement
    }

    inputWrapper.appendChild(input)
    cell.innerHTML = ''
    cell.appendChild(inputWrapper)
    input.focus()
    if (input instanceof HTMLInputElement || input instanceof HTMLTextAreaElement) {
      input.select()
    }

    // 保存编辑
    const saveEdit = async () => {
      const newValue = type === 'number' ? Number(input.value) : input.value

      if (newValue !== value) {
        const success = editConfig.onSave
          ? await editConfig.onSave(newValue, record, column)
          : true

        if (success) {
          // 更新数据
          this.setNestedValue(record, field, newValue)
          this.emit('cell:edit', record, column, rowIndex, newValue, value)
        }
      }

      cell.classList.remove('lt-table__cell--editing')
      this.renderCellContent(cell, getNestedValue(record, field), record, column, rowIndex)
    }

    // 取消编辑
    const cancelEdit = () => {
      cell.classList.remove('lt-table__cell--editing')
      this.renderCellContent(cell, value, record, column, rowIndex)
    }

    input.addEventListener('blur', saveEdit)
    input.addEventListener('keydown', (evt) => {
      const e = evt as KeyboardEvent
      if (e.key === 'Enter' && type !== 'textarea') {
        e.preventDefault()
        saveEdit()
      } else if (e.key === 'Escape') {
        e.preventDefault()
        cancelEdit()
      }
    })
  }

  /**
   * 设置嵌套值
   */
  private setNestedValue(obj: any, path: string, value: any): void {
    const keys = path.split('.')
    let current = obj
    for (let i = 0; i < keys.length - 1; i++) {
      if (current[keys[i]] === undefined) {
        current[keys[i]] = {}
      }
      current = current[keys[i]]
    }
    current[keys[keys.length - 1]] = value
  }

  /**
   * 渲染空状态
   */
  private renderEmpty(): void {
    const colSpan = this.getColSpan()
    const row = createElement('tr')
    const cell = createElement('td', { colSpan: String(colSpan) })

    const empty = createElement('div', { className: 'lt-table__empty' })

    // 空状态图标
    const icon = createElement('div', { className: 'lt-table__empty-icon' })
    icon.innerHTML = `<svg viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="2">
      <rect x="8" y="8" width="48" height="48" rx="4" />
      <line x1="8" y1="20" x2="56" y2="20" />
      <line x1="20" y1="8" x2="20" y2="20" />
    </svg>`

    const text = createElement('div', { className: 'lt-table__empty-text' })
    if (typeof this.config.emptyText === 'function') {
      const content = this.config.emptyText()
      if (typeof content === 'string') {
        text.textContent = content
      } else {
        text.appendChild(content)
      }
    } else {
      text.textContent = this.config.emptyText || this.config.locale?.emptyText || '暂无数据'
    }

    empty.appendChild(icon)
    empty.appendChild(text)
    cell.appendChild(empty)
    row.appendChild(cell)
    this.bodyElement.appendChild(row)
  }

  /**
   * 渲染分页
   */
  private renderPagination(): void {
    if (this.config.pagination === false) return

    const pagination = this.config.pagination as PaginationConfig
    if (pagination.enabled === false) return

    // 移除已存在的分页
    if (this.paginationElement) {
      this.paginationElement.remove()
    }

    const { current, pageSize, total } = this.state.pagination
    const totalPages = Math.ceil(total / pageSize)

    if (totalPages <= 1 && !pagination.showTotal) return

    this.paginationElement = createElement('div', { className: 'lt-table__pagination' })

    // 总数显示
    if (pagination.showTotal !== false) {
      const totalEl = createElement('span', { className: 'lt-table__pagination-total' })
      const start = (current - 1) * pageSize + 1
      const end = Math.min(current * pageSize, total)

      if (typeof pagination.showTotal === 'function') {
        totalEl.textContent = pagination.showTotal(total, [start, end])
      } else {
        const template = this.config.locale?.page?.total || '共 {total} 条'
        totalEl.textContent = template.replace('{total}', String(total))
      }
      this.paginationElement.appendChild(totalEl)
    }

    // 上一页
    const prevBtn = createElement('button', {
      className: `lt-table__pagination-item${current <= 1 ? ' lt-table__pagination-item--disabled' : ''}`
    })
    prevBtn.innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m15 18-6-6 6-6"/></svg>`
    prevBtn.addEventListener('click', () => {
      if (current > 1) this.gotoPage(current - 1)
    })
    this.paginationElement.appendChild(prevBtn)

    // 页码
    const pages = this.generatePageNumbers(current, totalPages)
    pages.forEach((page) => {
      if (page === '...') {
        const ellipsis = createElement('span', { className: 'lt-table__pagination-ellipsis' })
        ellipsis.textContent = '...'
        this.paginationElement!.appendChild(ellipsis)
      } else {
        const pageBtn = createElement('button', {
          className: `lt-table__pagination-item${page === current ? ' lt-table__pagination-item--active' : ''}`
        })
        pageBtn.textContent = String(page)
        pageBtn.addEventListener('click', () => this.gotoPage(page as number))
        this.paginationElement!.appendChild(pageBtn)
      }
    })

    // 下一页
    const nextBtn = createElement('button', {
      className: `lt-table__pagination-item${current >= totalPages ? ' lt-table__pagination-item--disabled' : ''}`
    })
    nextBtn.innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m9 18 6-6-6-6"/></svg>`
    nextBtn.addEventListener('click', () => {
      if (current < totalPages) this.gotoPage(current + 1)
    })
    this.paginationElement.appendChild(nextBtn)

    // 每页条数选择器 - 自定义下拉
    if (pagination.showSizeChanger !== false) {
      const sizer = createElement('div', { className: 'lt-table__pagination-sizer' })
      const options = pagination.pageSizeOptions || [10, 20, 50, 100]

      const sizerBtn = createElement('button', { className: 'lt-table__pagination-sizer-btn' })
      sizerBtn.innerHTML = `${pageSize} ${this.config.locale?.page?.pageSize || '条/页'} <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m6 9 6 6 6-6"/></svg>`

      const dropdown = createElement('div', { className: 'lt-table__pagination-sizer-dropdown' })
      dropdown.style.display = 'none'

      options.forEach((size) => {
        const opt = createElement('div', {
          className: `lt-table__pagination-sizer-option${size === pageSize ? ' lt-table__pagination-sizer-option--active' : ''}`
        })
        opt.textContent = `${size} ${this.config.locale?.page?.pageSize || '条/页'}`
        opt.addEventListener('click', () => {
          this.setPageSize(size)
          dropdown.style.display = 'none'
          sizer.classList.remove('lt-table__pagination-sizer--open')
        })
        dropdown.appendChild(opt)
      })

      sizerBtn.addEventListener('click', (e) => {
        e.stopPropagation()
        const isOpen = dropdown.style.display === 'block'
        dropdown.style.display = isOpen ? 'none' : 'block'
        sizer.classList.toggle('lt-table__pagination-sizer--open', !isOpen)
      })

      // 点击外部关闭
      document.addEventListener('click', () => {
        dropdown.style.display = 'none'
        sizer.classList.remove('lt-table__pagination-sizer--open')
      })

      sizer.appendChild(sizerBtn)
      sizer.appendChild(dropdown)
      this.paginationElement.appendChild(sizer)
    }

    // 快速跳转
    if (pagination.showQuickJumper) {
      const jumper = createElement('div', { className: 'lt-table__pagination-jumper' })
      jumper.appendChild(document.createTextNode(this.config.locale?.page?.jump || '跳至'))

      const input = createElement('input', {
        type: 'number',
        className: 'lt-table__pagination-jumper-input',
        min: '1',
        max: String(totalPages),
        value: String(current)
      }) as HTMLInputElement

      input.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
          const page = parseInt(input.value, 10)
          if (page >= 1 && page <= totalPages) {
            this.gotoPage(page)
          }
        }
      })

      jumper.appendChild(input)
      jumper.appendChild(document.createTextNode('页'))
      this.paginationElement.appendChild(jumper)
    }

    this.rootElement.appendChild(this.paginationElement)
  }

  /**
   * 生成页码数组
   */
  private generatePageNumbers(current: number, total: number): (number | string)[] {
    const pages: (number | string)[] = []
    const showPages = 7

    if (total <= showPages) {
      for (let i = 1; i <= total; i++) {
        pages.push(i)
      }
    } else {
      pages.push(1)

      if (current > 4) {
        pages.push('...')
      }

      const start = Math.max(2, current - 2)
      const end = Math.min(total - 1, current + 2)

      for (let i = start; i <= end; i++) {
        pages.push(i)
      }

      if (current < total - 3) {
        pages.push('...')
      }

      pages.push(total)
    }

    return pages
  }

  /**
   * 渲染加载状态
   */
  private renderLoading(): void {
    if (this.loadingElement) {
      this.loadingElement.remove()
      this.loadingElement = null
    }

    if (!this.state.loading) return

    this.loadingElement = createElement('div', { className: 'lt-table__loading' })

    const spinner = createElement('div', { className: 'lt-table__loading-spinner' })
    const text = createElement('div', { className: 'lt-table__loading-text' })
    text.textContent = this.config.loadingText || this.config.locale?.loadingText || '加载中...'

    this.loadingElement.appendChild(spinner)
    this.loadingElement.appendChild(text)
    this.rootElement.appendChild(this.loadingElement)
  }

  /**
   * 获取行key
   */
  private getRowKey(record: T): string {
    if (typeof this.config.rowKey === 'function') {
      return this.config.rowKey(record)
    }
    return String(getNestedValue(record, this.config.rowKey || 'id'))
  }

  /**
   * 获取所有行key
   */
  private getAllRowKeys(): string[] {
    return this.processedData.map((record) => this.getRowKey(record))
  }

  /**
   * 获取列跨度
   */
  private getColSpan(): number {
    let span = this.flattenedColumns.filter((c) => c.visible !== false).length
    if (this.config.selection !== false && this.config.selection) span++
    if (this.config.expand !== false && this.config.expand) span++
    return span
  }

  /**
   * 判断行是否展开
   */
  private isRowExpanded(record: T): boolean {
    const key = this.getRowKey(record)
    return this.state.expandedKeys.has(key)
  }

  // ============================================================================
  // 公共 API
  // ============================================================================

  refresh(): void {
    this.processData()
    this.render()
  }

  rerender(): void {
    this.render()
  }

  setData(data: T[]): void {
    this.state.data = [...data]
    this.state.pagination.total = data.length
    this.state.pagination.current = 1
    this.processData()
    this.render()
    this.emit('data:change', data)
  }

  getData(): T[] {
    return [...this.state.data]
  }

  setColumns(columns: ColumnDef<T>[]): void {
    this.state.columns = [...columns]
    this.flattenColumns()
    this.render()
  }

  getColumns(): ColumnDef<T>[] {
    return [...this.state.columns]
  }

  setLoading(loading: boolean): void {
    this.state.loading = loading
    this.renderLoading()
  }

  sort(key: string, order: 'asc' | 'desc' | null): void {
    this.state.sortState = order ? { key, order } : null
    this.processData()
    this.render()
    this.config.onSortChange?.(this.state.sortState)
    this.emit('sort:change', this.state.sortState)
  }

  clearSort(): void {
    this.sort('', null)
  }

  getSortState(): SortState | null {
    return this.state.sortState
  }

  filter(filterState: FilterState): void {
    this.state.filterState = { ...filterState }
    this.state.pagination.current = 1
    this.processData()
    this.render()
    this.config.onFilterChange?.(this.state.filterState)
    this.emit('filter:change', this.state.filterState)
  }

  clearFilter(key?: string): void {
    if (key) {
      const { [key]: _, ...rest } = this.state.filterState
      this.filter(rest)
    } else {
      this.filter({})
    }
  }

  getFilterState(): FilterState {
    return { ...this.state.filterState }
  }

  selectRow(key: string | string[]): void {
    const keys = Array.isArray(key) ? key : [key]
    keys.forEach((k) => this.state.selectedKeys.add(k))
    this.render()
    this.emitSelectionChange()
  }

  deselectRow(key: string | string[]): void {
    const keys = Array.isArray(key) ? key : [key]
    keys.forEach((k) => this.state.selectedKeys.delete(k))
    this.render()
    this.emitSelectionChange()
  }

  selectAll(): void {
    this.getAllRowKeys().forEach((k) => this.state.selectedKeys.add(k))
    this.render()
    this.emitSelectionChange()
  }

  deselectAll(): void {
    this.state.selectedKeys.clear()
    this.render()
    this.emitSelectionChange()
  }

  getSelectedRows(): T[] {
    return this.state.data.filter((record) =>
      this.state.selectedKeys.has(this.getRowKey(record))
    )
  }

  getSelectedKeys(): string[] {
    return [...this.state.selectedKeys]
  }

  private emitSelectionChange(): void {
    const keys = this.getSelectedKeys()
    const rows = this.getSelectedRows()
      ; (this.config.selection as SelectionConfig)?.onChange?.(keys, rows)
    this.emit('selection:change', keys, rows)
  }

  expandRow(key: string | string[]): void {
    const expand = this.config.expand as ExpandConfig
    const keys = Array.isArray(key) ? key : [key]

    if (expand?.accordion) {
      this.state.expandedKeys.clear()
      if (keys.length > 0) {
        this.state.expandedKeys.add(keys[0])
      }
    } else {
      keys.forEach((k) => this.state.expandedKeys.add(k))
    }

    this.render()
    expand?.onExpandChange?.([...this.state.expandedKeys],
      this.state.data.find(r => this.getRowKey(r) === keys[0])!)
    this.emit('expand:change', [...this.state.expandedKeys])
  }

  collapseRow(key: string | string[]): void {
    const keys = Array.isArray(key) ? key : [key]

    // 添加收起动画
    keys.forEach((k) => {
      const expandContent = this.container.querySelector(
        `.lt-table__row--expand-content[data-expand-key="${k}"] .lt-table__expand-content`
      )
      if (expandContent) {
        expandContent.classList.add('lt-table__expand-content--collapsing')
      }
    })

    // 动画结束后移除行
    setTimeout(() => {
      keys.forEach((k) => this.state.expandedKeys.delete(k))
      this.render()
      this.emit('expand:change', [...this.state.expandedKeys])
    }, 250)
  }

  expandAll(): void {
    this.state.data.forEach((record) => {
      this.state.expandedKeys.add(this.getRowKey(record))
    })
    this.render()
    this.emit('expand:change', [...this.state.expandedKeys])
  }

  collapseAll(): void {
    this.state.expandedKeys.clear()
    this.render()
    this.emit('expand:change', [...this.state.expandedKeys])
  }

  gotoPage(page: number): void {
    const totalPages = Math.ceil(this.state.pagination.total / this.state.pagination.pageSize)
    const newPage = Math.max(1, Math.min(page, totalPages))

    if (newPage !== this.state.pagination.current) {
      this.state.pagination.current = newPage
      this.processData()
      this.render()
      this.config.onPageChange?.(newPage, this.state.pagination.pageSize)
      this.emit('page:change', newPage, this.state.pagination.pageSize)
    }
  }

  setPageSize(pageSize: number): void {
    this.state.pagination.pageSize = pageSize
    this.state.pagination.current = 1
    this.processData()
    this.render()
    this.config.onPageChange?.(1, pageSize)
    this.emit('page:change', 1, pageSize)
  }

  getPagination(): { current: number; pageSize: number; total: number } {
    return { ...this.state.pagination }
  }

  scrollTo(options: { left?: number; top?: number; rowIndex?: number; rowKey?: string }): void {
    const wrapper = this.rootElement.querySelector('.lt-table__wrapper') as HTMLElement
    if (!wrapper) return

    if (options.left !== undefined) {
      wrapper.scrollLeft = options.left
    }

    if (options.top !== undefined) {
      wrapper.scrollTop = options.top
    }

    if (options.rowIndex !== undefined || options.rowKey !== undefined) {
      const index = options.rowIndex ?? this.processedData.findIndex(
        (r) => this.getRowKey(r) === options.rowKey
      )
      if (index >= 0) {
        const rowHeight = parseInt(
          getComputedStyle(this.rootElement).getPropertyValue('--lt-row-height') || '52'
        )
        wrapper.scrollTop = index * rowHeight
      }
    }
  }

  updateConfig(config: Partial<TableConfig<T>>): void {
    Object.assign(this.config, config)

    if (config.data) {
      this.state.data = [...config.data]
    }
    if (config.columns) {
      this.state.columns = [...config.columns]
      this.flattenColumns()
    }
    if (config.theme) {
      this.setTheme(config.theme)
    }

    this.processData()
    this.render()
  }

  setTheme(theme: string | ThemeConfig): void {
    this.config.theme = theme
    this.themeManager.setTheme(theme)
    this.themeManager.mount(this.rootElement)
    this.render()
  }

  getContainer(): HTMLElement {
    return this.rootElement
  }

  destroy(): void {
    this.isDestroyed = true
    this.resizeObserver?.disconnect()
    this.virtualScroller?.destroy()
    this.columnResizer?.destroy()
    this.themeManager.destroy()
    this.removeAllListeners()
    this.rootElement.remove()
    this.emit('destroy')
  }
}
