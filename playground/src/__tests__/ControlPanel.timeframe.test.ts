import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import App from '../App.vue'
import { vi } from 'vitest'

vi.mock('synticks-chart/vue', () => ({
  PlaygroundChart: {
    name: 'PlaygroundChart',
    props: ['symbol', 'timeframe'],
    template: '<div class="playground-chart-stub">Chart</div>'
  }
}))

describe('ControlPanel - Timeframe', () => {
  it('changes timeframe when button is clicked', async () => {
    const wrapper = mount(App)
    
    const button = wrapper.find('[data-tf="5m"]')
    expect(button.exists()).toBe(true)
    
    await button.trigger('click')
    
    const chart = wrapper.findComponent({ name: 'PlaygroundChart' })
    expect(chart.props('timeframe')).toBe('5m')
  })
})

