/**
 * 事件发射器
 */
export class EventEmitter<Events extends Record<string, (...args: any[]) => void>> {
  private listeners = new Map<keyof Events, Set<Function>>()

  /**
   * 监听事件
   */
  on<K extends keyof Events>(event: K, handler: Events[K]): () => void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set())
    }
    this.listeners.get(event)!.add(handler)

    return () => this.off(event, handler)
  }

  /**
   * 监听事件（只触发一次）
   */
  once<K extends keyof Events>(event: K, handler: Events[K]): () => void {
    const wrapper = ((...args: any[]) => {
      this.off(event, wrapper as Events[K])
        ; (handler as Function).apply(this, args)
    }) as Events[K]

    return this.on(event, wrapper)
  }

  /**
   * 取消监听事件
   */
  off<K extends keyof Events>(event: K, handler?: Events[K]): void {
    if (!handler) {
      this.listeners.delete(event)
    } else {
      this.listeners.get(event)?.delete(handler)
    }
  }

  /**
   * 触发事件
   */
  emit<K extends keyof Events>(event: K, ...args: Parameters<Events[K]>): void {
    const handlers = this.listeners.get(event)
    if (handlers) {
      handlers.forEach((handler) => {
        try {
          handler(...args)
        } catch (e) {
          console.error(`Error in event handler for ${String(event)}:`, e)
        }
      })
    }
  }

  /**
   * 检查是否有监听器
   */
  hasListeners<K extends keyof Events>(event: K): boolean {
    return (this.listeners.get(event)?.size ?? 0) > 0
  }

  /**
   * 清除所有监听器
   */
  removeAllListeners(): void {
    this.listeners.clear()
  }
}
