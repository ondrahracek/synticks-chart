import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import App from '../App.vue'

const getState = vi.fn()

vi.mock('synticks-chart/vue', () => ({
  PlaygroundChart: {
    name: 'PlaygroundChart',
    props: ['symbol', 'timeframe', 'theme'],
    template: '<div></div>',
    setup() {
      return {
        getState
      }
    }
  }
}))

describe('StatusPanel', () => {
  beforeEach(() => {
    getState.mockClear()
  })

  it('displays candle count when state is available', async () => {
    const mockCandles = Array(100).fill(null).map(() => ({
      timestamp: Date.now(),
      open: 100,
      high: 110,
      low: 90,
      close: 105,
      volume: 1000
    }))
    
    getState.mockReturnValue({
      playback: 'live',
      candles: mockCandles,
      symbol: 'BTCUSDT',
      timeframe: '1m',
      drawings: [{ kind: 'trendline', points: [], isComplete: true }, { kind: 'trendline', points: [], isComplete: true }],
      indicatorsCount: 1
    })

    const wrapper = mount(App)
    await wrapper.vm.$nextTick()
    await wrapper.vm.$nextTick()
    await new Promise(resolve => setTimeout(resolve, 200))

    const statusPanel = wrapper.find('[data-test="status-panel"]')
    expect(statusPanel.exists()).toBe(true)
    expect(getState).toHaveBeenCalled()
    expect(statusPanel.text()).toContain('100')
    expect(statusPanel.text()).toContain('Candles')
  })

  it('displays playback mode', async () => {
    getState.mockReturnValue({
      playback: 'live',
      candles: [],
      symbol: 'BTCUSDT',
      timeframe: '1m',
      drawings: [],
      indicatorsCount: 0
    })

    const wrapper = mount(App)
    await wrapper.vm.$nextTick()
    await new Promise(resolve => setTimeout(resolve, 150))

    const statusPanel = wrapper.find('[data-test="status-panel"]')
    expect(statusPanel.text()).toContain('LIVE')
  })

  it('displays symbol and timeframe', async () => {
    getState.mockReturnValue({
      playback: 'live',
      candles: [],
      symbol: 'ETHUSDT',
      timeframe: '5m',
      drawings: [],
      indicatorsCount: 0
    })

    const wrapper = mount(App)
    await wrapper.vm.$nextTick()
    await new Promise(resolve => setTimeout(resolve, 150))

    const statusPanel = wrapper.find('[data-test="status-panel"]')
    expect(statusPanel.text()).toContain('ETHUSDT')
    expect(statusPanel.text()).toContain('5m')
  })

  it('displays drawings and indicators count', async () => {
    getState.mockReturnValue({
      playback: 'live',
      candles: [],
      symbol: 'BTCUSDT',
      timeframe: '1m',
      drawings: [
        { kind: 'trendline', points: [], isComplete: true },
        { kind: 'trendline', points: [], isComplete: true },
        { kind: 'trendline', points: [], isComplete: true }
      ],
      indicatorsCount: 2
    })

    const wrapper = mount(App)
    await wrapper.vm.$nextTick()
    await new Promise(resolve => setTimeout(resolve, 150))

    const statusPanel = wrapper.find('[data-test="status-panel"]')
    expect(statusPanel.text()).toContain('3')
    expect(statusPanel.text()).toContain('Drawings')
    expect(statusPanel.text()).toContain('2')
    expect(statusPanel.text()).toContain('Indicators')
  })
})

