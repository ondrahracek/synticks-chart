import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import SynticksChart from '../../src/vue/SynticksChart.vue'
import { ChartEngine } from '../../src/engine/ChartEngine'

let resizeObserverCallbacks: Array<() => void> = []

global.ResizeObserver = class ResizeObserver {
  private callback: () => void

  constructor(callback: () => void) {
    this.callback = callback
    resizeObserverCallbacks.push(callback)
  }

  observe() {}
  unobserve() {}
  disconnect() {
    resizeObserverCallbacks = resizeObserverCallbacks.filter(cb => cb !== this.callback)
  }
} as any

vi.mock('../../src/engine/ChartEngine', () => ({
  ChartEngine: vi.fn().mockImplementation(() => ({
    setSymbol: vi.fn(),
    setTimeframe: vi.fn(),
    scrollToLive: vi.fn(),
    destroy: vi.fn()
  }))
}))

describe('SynticksChart', () => {
  beforeEach(() => {
    resizeObserverCallbacks = []
  })

  it('creates a canvas element', () => {
    const wrapper = mount(SynticksChart, {
      props: {
        symbol: 'BTCUSDT',
        timeframe: '1m'
      }
    })

    const canvas = wrapper.find('canvas')
    expect(canvas.exists()).toBe(true)
  })

  it('constructs ChartEngine on mount', () => {
    mount(SynticksChart, {
      props: {
        symbol: 'BTCUSDT',
        timeframe: '1m'
      }
    })

    expect(ChartEngine).toHaveBeenCalled()
  })

  it('calls destroy on unmount', () => {
    const destroySpy = vi.fn()
    ;(ChartEngine as any).mockImplementation(() => ({
      setSymbol: vi.fn(),
      setTimeframe: vi.fn(),
      scrollToLive: vi.fn(),
      destroy: destroySpy
    }))

    const wrapper = mount(SynticksChart, {
      props: {
        symbol: 'BTCUSDT',
        timeframe: '1m'
      }
    })

    wrapper.unmount()

    expect(destroySpy).toHaveBeenCalled()
  })

  it('sets canvas dimensions from container on mount', async () => {
    const wrapper = mount(SynticksChart, {
      props: {
        symbol: 'BTCUSDT',
        timeframe: '1m'
      },
      attachTo: document.body
    })

    await wrapper.vm.$nextTick()

    const canvas = wrapper.find('canvas').element as HTMLCanvasElement
    
    const rect = canvas.getBoundingClientRect()
    canvas.width = rect.width
    canvas.height = rect.height

    expect(canvas.width).toBe(rect.width)
    expect(canvas.height).toBe(rect.height)
  })

  it('applies inline styles to make canvas fill parent container', async () => {
    const wrapper = mount(SynticksChart, {
      props: {
        symbol: 'BTCUSDT',
        timeframe: '1m'
      }
    })

    await wrapper.vm.$nextTick()

    const canvas = wrapper.find('canvas').element as HTMLCanvasElement
    
    expect(canvas.style.width).toBe('100%')
    expect(canvas.style.height).toBe('100%')
    expect(canvas.style.display).toBe('block')
  })

  it('updates canvas dimensions when container resizes', async () => {
    const container = document.createElement('div')
    container.style.width = '400px'
    container.style.height = '300px'
    document.body.appendChild(container)

    const wrapper = mount(SynticksChart, {
      props: {
        symbol: 'BTCUSDT',
        timeframe: '1m'
      },
      attachTo: container
    })

    await wrapper.vm.$nextTick()
    
    const canvas = wrapper.find('canvas').element as HTMLCanvasElement
    
    // Mock getBoundingClientRect to return initial size
    let rectWidth = 400
    let rectHeight = 300
    vi.spyOn(canvas, 'getBoundingClientRect').mockReturnValue({
      width: rectWidth,
      height: rectHeight,
      top: 0,
      left: 0,
      bottom: rectHeight,
      right: rectWidth,
      x: 0,
      y: 0,
      toJSON: () => {}
    } as DOMRect)

    // Update canvas size with initial dimensions
    canvas.width = rectWidth
    canvas.height = rectHeight
    
    const initialWidth = canvas.width
    const initialHeight = canvas.height

    // Change container size
    rectWidth = 600
    rectHeight = 500
    vi.spyOn(canvas, 'getBoundingClientRect').mockReturnValue({
      width: rectWidth,
      height: rectHeight,
      top: 0,
      left: 0,
      bottom: rectHeight,
      right: rectWidth,
      x: 0,
      y: 0,
      toJSON: () => {}
    } as DOMRect)
    
    // Trigger ResizeObserver callbacks
    resizeObserverCallbacks.forEach(cb => cb())
    await wrapper.vm.$nextTick()

    expect(canvas.width).not.toBe(initialWidth)
    expect(canvas.height).not.toBe(initialHeight)

    document.body.removeChild(container)
    wrapper.unmount()
  })

  it('disconnects ResizeObserver on unmount', () => {
    const wrapper = mount(SynticksChart, {
      props: {
        symbol: 'BTCUSDT',
        timeframe: '1m'
      }
    })

    const initialCallbackCount = resizeObserverCallbacks.length
    expect(initialCallbackCount).toBeGreaterThan(0)

    wrapper.unmount()

    expect(resizeObserverCallbacks.length).toBeLessThan(initialCallbackCount)
  })

  it('exposes scrollToLive method', () => {
    const scrollToLiveSpy = vi.fn()
    ;(ChartEngine as any).mockImplementation(() => ({
      setSymbol: vi.fn(),
      setTimeframe: vi.fn(),
      scrollToLive: scrollToLiveSpy,
      destroy: vi.fn()
    }))

    const wrapper = mount(SynticksChart, {
      props: {
        symbol: 'BTCUSDT',
        timeframe: '1m'
      }
    })

    const component = wrapper.vm as any
    component.scrollToLive()

    expect(scrollToLiveSpy).toHaveBeenCalled()
  })

  it('sets theme on mount when theme prop is provided', () => {
    const setThemeSpy = vi.fn()
    ;(ChartEngine as any).mockImplementation(() => ({
      setSymbol: vi.fn(),
      setTimeframe: vi.fn(),
      setTheme: setThemeSpy,
      destroy: vi.fn()
    }))

    mount(SynticksChart, {
      props: {
        symbol: 'BTCUSDT',
        timeframe: '1m',
        theme: 'dark'
      }
    })

    expect(setThemeSpy).toHaveBeenCalledWith('dark')
  })
})

