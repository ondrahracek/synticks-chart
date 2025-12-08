import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import App from '../App.vue'

const addIndicator = vi.fn()
const removeIndicator = vi.fn()

vi.mock('synticks-chart/vue', () => ({
  SynticksChart: {
    name: 'SynticksChart',
    props: ['symbol', 'timeframe'],
    template: '<div></div>',
    setup() {
      return {
        addIndicator,
        removeIndicator
      }
    }
  }
}))

describe('ControlPanel - Indicators', () => {
  beforeEach(() => {
    addIndicator.mockClear()
    removeIndicator.mockClear()
  })

  it('calls addIndicator when SMA 20 checkbox is checked', async () => {
    const wrapper = mount(App)
    
    const sma20Checkbox = wrapper.find('[data-test="indicator-sma-20"]')
    expect(sma20Checkbox.exists()).toBe(true)
    
    await sma20Checkbox.setValue(true)
    
    expect(addIndicator).toHaveBeenCalledTimes(1)
    expect(addIndicator).toHaveBeenCalledWith('sma', { period: 20 })
  })

  it('calls removeIndicator when SMA 20 checkbox is unchecked', async () => {
    const wrapper = mount(App)
    
    const sma20Checkbox = wrapper.find('[data-test="indicator-sma-20"]')
    
    await sma20Checkbox.setValue(true)
    await sma20Checkbox.setValue(false)
    
    expect(removeIndicator).toHaveBeenCalledTimes(1)
    expect(removeIndicator).toHaveBeenCalledWith('sma:20')
  })

  it('calls addIndicator when SMA 50 checkbox is checked', async () => {
    const wrapper = mount(App)
    
    const sma50Checkbox = wrapper.find('[data-test="indicator-sma-50"]')
    expect(sma50Checkbox.exists()).toBe(true)
    
    await sma50Checkbox.setValue(true)
    
    expect(addIndicator).toHaveBeenCalledTimes(1)
    expect(addIndicator).toHaveBeenCalledWith('sma', { period: 50 })
  })

  it('calls addIndicator when SMA 200 checkbox is checked', async () => {
    const wrapper = mount(App)
    
    const sma200Checkbox = wrapper.find('[data-test="indicator-sma-200"]')
    expect(sma200Checkbox.exists()).toBe(true)
    
    await sma200Checkbox.setValue(true)
    
    expect(addIndicator).toHaveBeenCalledTimes(1)
    expect(addIndicator).toHaveBeenCalledWith('sma', { period: 200 })
  })

  it('maintains checkbox state in sync with indicators map', async () => {
    const wrapper = mount(App)
    
    const sma20Checkbox = wrapper.find('[data-test="indicator-sma-20"]')
    
    expect(sma20Checkbox.element.checked).toBe(false)
    
    await sma20Checkbox.setValue(true)
    await wrapper.vm.$nextTick()
    
    expect(sma20Checkbox.element.checked).toBe(true)
  })
})

