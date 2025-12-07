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

describe('ControlPanel - Symbol', () => {
  it('changes symbol when input value changes', async () => {
    const wrapper = mount(App)
    
    const input = wrapper.find('[data-testid="symbol-input"]')
    expect(input.exists()).toBe(true)
    
    await input.setValue('ETHUSDT')
    
    const chart = wrapper.findComponent({ name: 'PlaygroundChart' })
    expect(chart.props('symbol')).toBe('ETHUSDT')
  })
})

