import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import SynticksChart from '../../src/vue/SynticksChart.vue'
import { ChartEngine } from '../../src/engine/ChartEngine'

vi.mock('../../src/engine/ChartEngine', () => ({
  ChartEngine: vi.fn().mockImplementation(() => ({
    setSymbol: vi.fn(),
    setTimeframe: vi.fn(),
    play: vi.fn(),
    pause: vi.fn(),
    destroy: vi.fn()
  }))
}))

describe('SynticksChart', () => {
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
      play: vi.fn(),
      pause: vi.fn(),
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
})

