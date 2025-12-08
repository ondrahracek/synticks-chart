import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import App from '../App.vue'

const playMock = vi.fn()
const pauseMock = vi.fn()
const scrollToLiveMock = vi.fn()

vi.mock('synticks-chart/vue', () => ({
  SynticksChart: {
    name: 'SynticksChart',
    props: ['symbol', 'timeframe'],
    template: '<div></div>',
    setup() {
      return {
        play: playMock,
        pause: pauseMock,
        scrollToLive: scrollToLiveMock
      }
    }
  }
}))

describe('ControlPanel - Playback', () => {
  beforeEach(() => {
    playMock.mockClear()
    pauseMock.mockClear()
    scrollToLiveMock.mockClear()
  })

  it('calls play when Play button is clicked', async () => {
    const wrapper = mount(App)
    
    const playButton = wrapper.find('[data-test="btn-play"]')
    expect(playButton.exists()).toBe(true)
    
    await playButton.trigger('click')
    
    expect(playMock).toHaveBeenCalledTimes(1)
  })

  it('calls pause when Pause button is clicked', async () => {
    const wrapper = mount(App)
    
    const playButton = wrapper.find('[data-test="btn-play"]')
    await playButton.trigger('click')
    await wrapper.vm.$nextTick()
    
    const pauseButton = wrapper.find('[data-test="btn-pause"]')
    expect(pauseButton.exists()).toBe(true)
    expect(pauseButton.attributes('disabled')).toBeUndefined()
    
    await pauseButton.trigger('click')
    
    expect(pauseMock).toHaveBeenCalledTimes(1)
  })

  it('calls scrollToLive when Go LIVE button is clicked', async () => {
    const wrapper = mount(App)
    
    const liveButton = wrapper.find('[data-test="btn-live"]')
    expect(liveButton.exists()).toBe(true)
    
    await liveButton.trigger('click')
    
    expect(scrollToLiveMock).toHaveBeenCalledTimes(1)
  })

  it('disables Play button when playing', async () => {
    const wrapper = mount(App)
    
    const playButton = wrapper.find('[data-test="btn-play"]')
    await playButton.trigger('click')
    await wrapper.vm.$nextTick()
    
    expect(playButton.attributes('disabled')).toBeDefined()
  })

  it('disables Pause button when not playing', () => {
    const wrapper = mount(App)
    
    const pauseButton = wrapper.find('[data-test="btn-pause"]')
    expect(pauseButton.attributes('disabled')).toBeDefined()
  })
})
