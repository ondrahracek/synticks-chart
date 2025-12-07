import { mount } from '@vue/test-utils'
import App from '../App.vue'
import { describe, it, expect, vi } from 'vitest'

vi.mock('synticks-chart/vue', () => ({
    PlaygroundChart: {
        name: 'PlaygroundChart',
        template: '<div class="mock-chart"></div>',
    },
}))

describe('App.vue (smoke)', () => {
    it('renders PlaygroundChart', () => {
        const wrapper = mount(App)
        expect(wrapper.find('.mock-chart').exists()).toBe(true)
    })
})
