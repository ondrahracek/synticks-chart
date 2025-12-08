import { mount } from '@vue/test-utils'
import App from '../App.vue'
import { describe, it, expect, vi } from 'vitest'

vi.mock('synticks-chart/vue', () => ({
    SynticksChart: {
        name: 'SynticksChart',
        template: '<div class="mock-chart"></div>',
    },
}))

describe('App.vue (smoke)', () => {
    it('renders SynticksChart', () => {
        const wrapper = mount(App)
        expect(wrapper.find('.mock-chart').exists()).toBe(true)
    })
})
