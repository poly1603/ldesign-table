import type { ThemeConfig } from '../types'
import { deepMerge } from '../utils'

/**
 * 默认主题配置
 */
export const defaultTheme: Required<ThemeConfig> = {
  name: 'light',
  cssVars: {},
  colors: {
    primary: '#1677ff',
    primaryHover: '#4096ff',
    primaryActive: '#0958d9',
    success: '#52c41a',
    warning: '#faad14',
    danger: '#ff4d4f',
    info: '#1677ff',
    textPrimary: '#1f2937',
    textSecondary: '#6b7280',
    textDisabled: '#9ca3af',
    border: '#e5e7eb',
    borderLight: '#f3f4f6',
    background: '#ffffff',
    backgroundHover: '#f9fafb',
    backgroundActive: '#f3f4f6',
    headerBackground: '#fafafa',
    headerText: '#374151',
    stripedBackground: '#fafafa'
  },
  sizes: {
    fontSize: '14px',
    fontSizeSmall: '12px',
    fontSizeLarge: '16px',
    borderRadius: '6px',
    rowHeight: '52px',
    rowHeightSmall: '40px',
    rowHeightLarge: '64px',
    headerHeight: '52px',
    cellPadding: '12px 16px',
    cellPaddingSmall: '8px 12px',
    cellPaddingLarge: '16px 20px'
  },
  shadows: {
    fixedColumn: '0 0 10px rgba(0, 0, 0, 0.08)',
    dropdown: '0 6px 16px rgba(0, 0, 0, 0.08)',
    tooltip: '0 4px 12px rgba(0, 0, 0, 0.12)'
  }
}

/**
 * 暗黑主题
 */
export const darkTheme: ThemeConfig = {
  name: 'dark',
  colors: {
    primary: '#1668dc',
    primaryHover: '#3c89e8',
    primaryActive: '#1554ad',
    success: '#49aa19',
    warning: '#d89614',
    danger: '#dc4446',
    info: '#1668dc',
    textPrimary: '#f3f4f6',
    textSecondary: '#9ca3af',
    textDisabled: '#6b7280',
    border: '#374151',
    borderLight: '#4b5563',
    background: '#1f2937',
    backgroundHover: '#374151',
    backgroundActive: '#4b5563',
    headerBackground: '#111827',
    headerText: '#e5e7eb',
    stripedBackground: '#111827'
  }
}

/**
 * 紧凑主题
 */
export const compactTheme: ThemeConfig = {
  name: 'compact',
  sizes: {
    fontSize: '12px',
    fontSizeSmall: '11px',
    fontSizeLarge: '14px',
    borderRadius: '4px',
    rowHeight: '36px',
    rowHeightSmall: '28px',
    rowHeightLarge: '44px',
    headerHeight: '36px',
    cellPadding: '6px 10px',
    cellPaddingSmall: '4px 8px',
    cellPaddingLarge: '8px 12px'
  }
}

/**
 * 预设主题集合
 */
export const presetThemes: Record<string, ThemeConfig> = {
  light: defaultTheme,
  dark: darkTheme,
  compact: compactTheme
}

/**
 * 主题管理器
 */
export class ThemeManager {
  private currentTheme: Required<ThemeConfig>
  private styleElement: HTMLStyleElement | null = null
  private container: HTMLElement | null = null

  constructor(theme?: string | ThemeConfig) {
    this.currentTheme = this.resolveTheme(theme)
  }

  /**
   * 解析主题配置
   */
  private resolveTheme(theme?: string | ThemeConfig): Required<ThemeConfig> {
    if (!theme) {
      return deepMerge({ ...defaultTheme }, {})
    }

    if (typeof theme === 'string') {
      const preset = presetThemes[theme]
      if (preset) {
        return deepMerge({ ...defaultTheme }, preset)
      }
      console.warn(`Theme "${theme}" not found, using default theme.`)
      return deepMerge({ ...defaultTheme }, {})
    }

    return deepMerge({ ...defaultTheme }, theme)
  }

  /**
   * 设置主题
   */
  setTheme(theme: string | ThemeConfig): void {
    this.currentTheme = this.resolveTheme(theme)
    this.applyTheme()
  }

  /**
   * 获取当前主题
   */
  getTheme(): Required<ThemeConfig> {
    return this.currentTheme
  }

  /**
   * 挂载主题到容器
   */
  mount(container: HTMLElement): void {
    this.container = container
    this.applyTheme()
  }

  /**
   * 应用主题
   */
  private applyTheme(): void {
    if (!this.container) return

    // 先移除所有主题相关的 inline styles
    this.resetThemeStyles()

    // 应用CSS变量
    const cssVars = this.generateCSSVariables()
    for (const [key, value] of Object.entries(cssVars)) {
      this.container.style.setProperty(key, value)
    }

    // 应用自定义CSS变量
    if (this.currentTheme.cssVars) {
      for (const [key, value] of Object.entries(this.currentTheme.cssVars)) {
        this.container.style.setProperty(key, value)
      }
    }

    // 添加主题类名
    this.container.setAttribute('data-theme', this.currentTheme.name || 'custom')

    // 添加紧凑模式类名
    if (this.currentTheme.name === 'compact') {
      this.container.classList.add('lt-table--compact')
    } else {
      this.container.classList.remove('lt-table--compact')
    }
  }

  /**
   * 重置主题样式
   */
  private resetThemeStyles(): void {
    if (!this.container) return

    // 移除所有 --lt- 开头的CSS变量
    const style = this.container.style
    const keysToRemove: string[] = []
    for (let i = 0; i < style.length; i++) {
      const prop = style[i]
      if (prop.startsWith('--lt-')) {
        keysToRemove.push(prop)
      }
    }
    keysToRemove.forEach(key => {
      this.container!.style.removeProperty(key)
    })
  }

  /**
   * 生成CSS变量
   */
  private generateCSSVariables(): Record<string, string> {
    const { colors, sizes, shadows } = this.currentTheme
    const vars: Record<string, string> = {}

    // 颜色变量
    if (colors) {
      Object.entries(colors).forEach(([key, value]) => {
        if (value) {
          vars[`--lt-color-${this.kebabCase(key)}`] = value
        }
      })
    }

    // 尺寸变量
    if (sizes) {
      Object.entries(sizes).forEach(([key, value]) => {
        if (value) {
          vars[`--lt-${this.kebabCase(key)}`] = value
        }
      })
    }

    // 阴影变量
    if (shadows) {
      Object.entries(shadows).forEach(([key, value]) => {
        if (value) {
          vars[`--lt-shadow-${this.kebabCase(key)}`] = value
        }
      })
    }

    return vars
  }

  /**
   * 转换为 kebab-case
   */
  private kebabCase(str: string): string {
    return str.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase()
  }

  /**
   * 销毁
   */
  destroy(): void {
    if (this.styleElement) {
      this.styleElement.remove()
      this.styleElement = null
    }
    this.container = null
  }
}

/**
 * 注册自定义主题
 */
export function registerTheme(name: string, theme: ThemeConfig): void {
  presetThemes[name] = theme
}

/**
 * 获取预设主题
 */
export function getPresetTheme(name: string): ThemeConfig | undefined {
  return presetThemes[name]
}
