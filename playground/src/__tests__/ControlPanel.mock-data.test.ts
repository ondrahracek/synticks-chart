import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import App from '../App.vue'

const loadCandles = vi.fn()
const resetData = vi.fn()
const appendCandle = vi.fn()

vi.mock('synticks-chart/vue', () => ({
  SynticksChart: {
    name: 'SynticksChart',
    props: ['symbol', 'timeframe'],
    template: '<div></div>',
    setup() {
      return {
        loadCandles,
        resetData,
        appendCandle
      }
    }
  }
}))

describe('ControlPanel - Mock Data', () => {
  beforeEach(() => {
    loadCandles.mockClear()
    resetData.mockClear()
    appendCandle.mockClear()
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
})

