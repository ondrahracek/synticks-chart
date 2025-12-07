import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import PlaygroundChart from '../../src/vue/PlaygroundChart.vue'
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

describe('PlaygroundChart', () => {
  it('creates a canvas element', () => {
    const wrapper = mount(PlaygroundChart, {
      props: {
        symbol: 'BTCUSDT',
        timeframe: '1m'
      }
    })

    const canvas = wrapper.find('canvas')
    expect(canvas.exists()).toBe(true)
  })

  it('constructs ChartEngine on mount', () => {
    mount(PlaygroundChart, {
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

    const wrapper = mount(PlaygroundChart, {
      props: {
        symbol: 'BTCUSDT',
        timeframe: '1m'
      }
    })

    wrapper.unmount()

    expect(destroySpy).toHaveBeenCalled()
  })
})

