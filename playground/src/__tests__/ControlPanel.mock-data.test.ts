import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import App from '../App.vue'

const loadCandles = vi.fn()
const resetData = vi.fn()
const appendCandle = vi.fn()
const getState = vi.fn()

vi.mock('synticks-chart/vue', () => ({
  SynticksChart: {
    name: 'SynticksChart',
    props: ['symbol', 'timeframe'],
    template: '<div></div>',
    setup() {
      return {
        loadCandles,
        resetData,
        appendCandle,
        getState
      }
    }
  }
}))

describe('ControlPanel - Mock Data', () => {
  beforeEach(() => {
    loadCandles.mockClear()
    resetData.mockClear()
    appendCandle.mockClear()
    getState.mockClear()
    getState.mockReturnValue(null)
  })

  it('calls loadCandles when Load sample data button is clicked', async () => {
    const wrapper = mount(App)
    
    const loadButton = wrapper.find('[data-test="btn-load-sample"]')
    expect(loadButton.exists()).toBe(true)
    
    await loadButton.trigger('click')
    
    expect(loadCandles).toHaveBeenCalledTimes(1)
    expect(loadCandles).toHaveBeenCalledWith(expect.arrayContaining([
      expect.objectContaining({
        timestamp: expect.any(Number),
        open: expect.any(Number),
        high: expect.any(Number),
        low: expect.any(Number),
        close: expect.any(Number),
        volume: expect.any(Number)
      })
    ]))
  })

  it('calls resetData when Reset button is clicked', async () => {
    const wrapper = mount(App)
    
    const resetButton = wrapper.find('[data-test="btn-reset"]')
    expect(resetButton.exists()).toBe(true)
    
    await resetButton.trigger('click')
    
    expect(resetData).toHaveBeenCalledTimes(1)
  })

  it('calls appendCandle when Add random candle button is clicked', async () => {
    const wrapper = mount(App)
    
    const addButton = wrapper.find('[data-test="btn-add-candle"]')
    expect(addButton.exists()).toBe(true)
    
    await addButton.trigger('click')
    
    expect(appendCandle).toHaveBeenCalledTimes(1)
    expect(appendCandle).toHaveBeenCalledWith(expect.objectContaining({
      timestamp: expect.any(Number),
      open: expect.any(Number),
      high: expect.any(Number),
      low: expect.any(Number),
      close: expect.any(Number),
      volume: expect.any(Number)
    }))
  })

  it('adds candles sequentially after the latest candle timestamp based on timeframe', async () => {
    const baseTime = Date.now() - 100000
    
    getState.mockReturnValue({
      candles: [
        { timestamp: baseTime, open: 50000, high: 50100, low: 49900, close: 50050, volume: 1000 },
        { timestamp: baseTime + 60000, open: 50050, high: 50150, low: 50000, close: 50100, volume: 1100 }
      ],
      timeframe: '1m'
    })

    const wrapper = mount(App)
    const addButton = wrapper.find('[data-test="btn-add-candle"]')
    
    await addButton.trigger('click')
    
    expect(appendCandle).toHaveBeenCalledTimes(1)
    const firstCall = appendCandle.mock.calls[0][0]
    expect(firstCall.timestamp).toBe(baseTime + 120000)
    
    getState.mockReturnValue({
      candles: [
        { timestamp: baseTime, open: 50000, high: 50100, low: 49900, close: 50050, volume: 1000 },
        { timestamp: baseTime + 60000, open: 50050, high: 50150, low: 50000, close: 50100, volume: 1100 },
        { timestamp: baseTime + 120000, open: 50100, high: 50200, low: 50050, close: 50150, volume: 1200 }
      ],
      timeframe: '1m'
    })
    
    await addButton.trigger('click')
    
    expect(appendCandle).toHaveBeenCalledTimes(2)
    const secondCall = appendCandle.mock.calls[1][0]
    expect(secondCall.timestamp).toBe(baseTime + 180000)
  })
})

