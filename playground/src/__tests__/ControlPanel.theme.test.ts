import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import App from '../App.vue'

const setTheme = vi.fn()

vi.mock('synticks-chart/vue', () => ({
  SynticksChart: {
    name: 'SynticksChart',
    props: ['symbol', 'timeframe', 'theme'],
    template: '<div></div>',
    setup() {
      return {
        setTheme
      }
    }
  }
}))

describe('ControlPanel - Theme', () => {
  beforeEach(() => {
    setTheme.mockClear()
  })

  it('calls setTheme with "dark" when Dark theme button is clicked', async () => {
    const wrapper = mount(App)
    
    const darkButton = wrapper.find('[data-test="theme-dark"]')
    expect(darkButton.exists()).toBe(true)
    
    await darkButton.trigger('click')
    
    expect(setTheme).toHaveBeenCalledTimes(1)
    expect(setTheme).toHaveBeenCalledWith('dark')
  })

  it('calls setTheme with "light" when Light theme button is clicked', async () => {
    const wrapper = mount(App)
    
    const lightButton = wrapper.find('[data-test="theme-light"]')
    expect(lightButton.exists()).toBe(true)
    
    await lightButton.trigger('click')
    
    expect(setTheme).toHaveBeenCalledTimes(1)
    expect(setTheme).toHaveBeenCalledWith('light')
  })

  it('applies active class to selected theme button', async () => {
    const wrapper = mount(App)
    
    const darkButton = wrapper.find('[data-test="theme-dark"]')
    await darkButton.trigger('click')
    await wrapper.vm.$nextTick()
    
    expect(darkButton.classes()).toContain('active')
  })

  it('updates SynticksChart theme prop when theme changes', async () => {
    const wrapper = mount(App)
    
    const darkButton = wrapper.find('[data-test="theme-dark"]')
    await darkButton.trigger('click')
    await wrapper.vm.$nextTick()
    
    const chart = wrapper.findComponent({ name: 'SynticksChart' })
    expect(chart.props('theme')).toBe('dark')
  })
})

