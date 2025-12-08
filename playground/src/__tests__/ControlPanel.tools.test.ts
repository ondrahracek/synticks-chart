import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import App from '../App.vue'

const setDrawingMode = vi.fn()
const clearDrawings = vi.fn()

vi.mock('synticks-chart/vue', () => ({
  SynticksChart: {
    name: 'SynticksChart',
    props: ['symbol', 'timeframe'],
    template: '<div></div>',
    setup() {
      return {
        setDrawingMode,
        clearDrawings
      }
    }
  }
}))

describe('ControlPanel - Drawing Tools', () => {
  beforeEach(() => {
    setDrawingMode.mockClear()
    clearDrawings.mockClear()
  })

  it('calls setDrawingMode with "draw-trendline" when Trendline button is clicked', async () => {
    const wrapper = mount(App)
    
    const trendlineButton = wrapper.find('[data-test="btn-tool-trendline"]')
    expect(trendlineButton.exists()).toBe(true)
    
    await trendlineButton.trigger('click')
    
    expect(setDrawingMode).toHaveBeenCalledTimes(1)
    expect(setDrawingMode).toHaveBeenCalledWith('draw-trendline')
  })

  it('calls setDrawingMode with "draw-horizontal" when Horizontal line button is clicked', async () => {
    const wrapper = mount(App)
    
    const hlineButton = wrapper.find('[data-test="btn-tool-horizontal"]')
    expect(hlineButton.exists()).toBe(true)
    
    await hlineButton.trigger('click')
    
    expect(setDrawingMode).toHaveBeenCalledTimes(1)
    expect(setDrawingMode).toHaveBeenCalledWith('draw-horizontal')
  })

  it('calls setDrawingMode with "pan" when Cursor button is clicked', async () => {
    const wrapper = mount(App)
    
    const cursorButton = wrapper.find('[data-test="btn-tool-cursor"]')
    expect(cursorButton.exists()).toBe(true)
    
    await cursorButton.trigger('click')
    
    expect(setDrawingMode).toHaveBeenCalledTimes(1)
    expect(setDrawingMode).toHaveBeenCalledWith('pan')
  })

  it('calls clearDrawings when Clear drawings button is clicked', async () => {
    const wrapper = mount(App)
    
    const clearButton = wrapper.find('[data-test="btn-clear-drawings"]')
    expect(clearButton.exists()).toBe(true)
    
    await clearButton.trigger('click')
    
    expect(clearDrawings).toHaveBeenCalledTimes(1)
  })

  it('applies active class to selected tool button', async () => {
    const wrapper = mount(App)
    
    const trendlineButton = wrapper.find('[data-test="btn-tool-trendline"]')
    await trendlineButton.trigger('click')
    await wrapper.vm.$nextTick()
    
    expect(trendlineButton.classes()).toContain('active')
  })
})

