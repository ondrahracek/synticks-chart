import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import App from '../App.vue'
import { vi } from 'vitest'

vi.mock('synticks-chart/vue', () => ({
  SynticksChart: {
    name: 'SynticksChart',
    template: '<div class="playground-chart-stub">Chart</div>'
  }
}))

describe('App Layout', () => {
  it('renders ControlPanel component', () => {
    const wrapper = mount(App)
    
    const controlPanel = wrapper.find('.control-panel')
    expect(controlPanel.exists()).toBe(true)
  })

  it('renders SynticksChart component', () => {
    const wrapper = mount(App)
    
    const chart = wrapper.find('.playground-chart-stub')
    expect(chart.exists()).toBe(true)
  })

  it('has app-root container with proper layout', () => {
    const wrapper = mount(App)
    
    const appRoot = wrapper.find('.app-root')
    expect(appRoot.exists()).toBe(true)
  })
})

