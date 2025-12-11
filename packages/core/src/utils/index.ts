/**
 * 工具函数集
 */

/**
 * 生成唯一ID
 */
export function generateId(prefix = 'lt'): string {
  return `${prefix}_${Math.random().toString(36).slice(2, 9)}`
}

/**
 * 防抖函数
 */
export function debounce<T extends (...args: any[]) => any>(
  fn: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timer: ReturnType<typeof setTimeout> | null = null
  return function (this: any, ...args: Parameters<T>) {
    if (timer) clearTimeout(timer)
    timer = setTimeout(() => {
      fn.apply(this, args)
      timer = null
    }, delay)
  }
}

/**
 * 节流函数
 */
export function throttle<T extends (...args: any[]) => any>(
  fn: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle = false
  return function (this: any, ...args: Parameters<T>) {
    if (!inThrottle) {
      fn.apply(this, args)
      inThrottle = true
      setTimeout(() => {
        inThrottle = false
      }, limit)
    }
  }
}

/**
 * 深拷贝
 */
export function deepClone<T>(obj: T): T {
  if (obj === null || typeof obj !== 'object') {
    return obj
  }
  if (Array.isArray(obj)) {
    return obj.map((item) => deepClone(item)) as unknown as T
  }
  const result = {} as T
  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      result[key] = deepClone(obj[key])
    }
  }
  return result
}

/**
 * 深度合并对象
 */
export function deepMerge<T extends object>(target: T, ...sources: Partial<T>[]): T {
  if (!sources.length) return target
  const source = sources.shift()

  if (isObject(target) && isObject(source)) {
    for (const key in source) {
      if (isObject(source[key])) {
        if (!target[key]) Object.assign(target, { [key]: {} })
        deepMerge(target[key] as object, source[key] as object)
      } else {
        Object.assign(target, { [key]: source[key] })
      }
    }
  }

  return deepMerge(target, ...sources)
}

/**
 * 判断是否为对象
 */
export function isObject(item: any): item is object {
  return item && typeof item === 'object' && !Array.isArray(item)
}

/**
 * 获取对象嵌套属性值
 */
export function getNestedValue<T = any>(obj: any, path: string): T | undefined {
  if (!path) return obj
  const keys = path.split('.')
  let result = obj
  for (const key of keys) {
    if (result === null || result === undefined) return undefined
    result = result[key]
  }
  return result
}

/**
 * 设置对象嵌套属性值
 */
export function setNestedValue(obj: any, path: string, value: any): void {
  const keys = path.split('.')
  let current = obj
  for (let i = 0; i < keys.length - 1; i++) {
    const key = keys[i]
    if (!(key in current)) {
      current[key] = {}
    }
    current = current[key]
  }
  current[keys[keys.length - 1]] = value
}

/**
 * 解析像素值
 */
export function parsePixelValue(value: number | string | undefined): string {
  if (value === undefined) return ''
  if (typeof value === 'number') return `${value}px`
  return value
}

/**
 * 获取元素实际宽高
 */
export function getElementSize(el: HTMLElement): { width: number; height: number } {
  const rect = el.getBoundingClientRect()
  return {
    width: rect.width,
    height: rect.height
  }
}

/**
 * 创建DOM元素
 */
export function createElement<K extends keyof HTMLElementTagNameMap>(
  tag: K,
  attrs?: Record<string, any>,
  children?: (string | HTMLElement)[]
): HTMLElementTagNameMap[K] {
  const el = document.createElement(tag)

  if (attrs) {
    for (const [key, value] of Object.entries(attrs)) {
      if (key === 'className') {
        el.className = value
      } else if (key === 'style' && typeof value === 'object') {
        Object.assign(el.style, value)
      } else if (key.startsWith('on') && typeof value === 'function') {
        const eventName = key.slice(2).toLowerCase()
        el.addEventListener(eventName, value)
      } else if (key === 'data' && typeof value === 'object') {
        for (const [dataKey, dataValue] of Object.entries(value)) {
          el.dataset[dataKey] = String(dataValue)
        }
      } else {
        el.setAttribute(key, String(value))
      }
    }
  }

  if (children) {
    for (const child of children) {
      if (typeof child === 'string') {
        el.appendChild(document.createTextNode(child))
      } else {
        el.appendChild(child)
      }
    }
  }

  return el
}

/**
 * 添加类名
 */
export function addClass(el: HTMLElement, ...classNames: string[]): void {
  el.classList.add(...classNames.filter(Boolean))
}

/**
 * 移除类名
 */
export function removeClass(el: HTMLElement, ...classNames: string[]): void {
  el.classList.remove(...classNames.filter(Boolean))
}

/**
 * 切换类名
 */
export function toggleClass(el: HTMLElement, className: string, force?: boolean): void {
  el.classList.toggle(className, force)
}

/**
 * 判断是否包含类名
 */
export function hasClass(el: HTMLElement, className: string): boolean {
  return el.classList.contains(className)
}

/**
 * 获取滚动条宽度
 */
let scrollbarWidth: number | null = null
export function getScrollbarWidth(): number {
  if (scrollbarWidth !== null) return scrollbarWidth

  const outer = document.createElement('div')
  outer.style.visibility = 'hidden'
  outer.style.overflow = 'scroll'
  document.body.appendChild(outer)

  const inner = document.createElement('div')
  outer.appendChild(inner)

  scrollbarWidth = outer.offsetWidth - inner.offsetWidth
  outer.parentNode?.removeChild(outer)

  return scrollbarWidth
}

/**
 * requestAnimationFrame 封装
 */
export const raf =
  typeof window !== 'undefined'
    ? window.requestAnimationFrame || ((fn: FrameRequestCallback) => setTimeout(fn, 16))
    : (fn: FrameRequestCallback) => setTimeout(fn, 16)

/**
 * cancelAnimationFrame 封装
 */
export const cancelRaf =
  typeof window !== 'undefined'
    ? window.cancelAnimationFrame || clearTimeout
    : clearTimeout

/**
 * 二分查找
 */
export function binarySearch<T>(
  arr: T[],
  target: number,
  getValue: (item: T) => number
): number {
  let left = 0
  let right = arr.length - 1

  while (left <= right) {
    const mid = Math.floor((left + right) / 2)
    const value = getValue(arr[mid])

    if (value === target) {
      return mid
    } else if (value < target) {
      left = mid + 1
    } else {
      right = mid - 1
    }
  }

  return left
}

/**
 * 数组移动元素
 */
export function arrayMove<T>(arr: T[], fromIndex: number, toIndex: number): T[] {
  const result = [...arr]
  const [item] = result.splice(fromIndex, 1)
  result.splice(toIndex, 0, item)
  return result
}

/**
 * 格式化数字
 */
export function formatNumber(num: number, options?: Intl.NumberFormatOptions): string {
  return new Intl.NumberFormat(undefined, options).format(num)
}

/**
 * 转义HTML
 */
export function escapeHtml(str: string): string {
  const div = document.createElement('div')
  div.textContent = str
  return div.innerHTML
}

/**
 * 复制文本到剪贴板
 */
export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text)
    return true
  } catch {
    // 降级方案
    const textarea = document.createElement('textarea')
    textarea.value = text
    textarea.style.position = 'fixed'
    textarea.style.opacity = '0'
    document.body.appendChild(textarea)
    textarea.select()
    try {
      document.execCommand('copy')
      return true
    } catch {
      return false
    } finally {
      document.body.removeChild(textarea)
    }
  }
}

/**
 * 类型保护：检查值是否为函数
 */
export function isFunction<T>(value: T | ((...args: any[]) => any)): value is (...args: any[]) => any {
  return typeof value === 'function'
}

/**
 * 检查是否支持 ResizeObserver
 */
export function supportsResizeObserver(): boolean {
  return typeof window !== 'undefined' && 'ResizeObserver' in window
}

/**
 * 平铺树形数据
 */
export function flattenTree<T extends { children?: T[] }>(
  data: T[],
  childrenField = 'children',
  level = 0,
  parent: T | null = null
): Array<T & { _level: number; _parent: T | null; _isLeaf: boolean }> {
  const result: Array<T & { _level: number; _parent: T | null; _isLeaf: boolean }> = []

  for (const item of data) {
    const children = (item as any)[childrenField] as T[] | undefined
    const flatItem = {
      ...item,
      _level: level,
      _parent: parent,
      _isLeaf: !children || children.length === 0
    }
    result.push(flatItem)

    if (children && children.length > 0) {
      result.push(...flattenTree(children, childrenField, level + 1, item))
    }
  }

  return result
}
