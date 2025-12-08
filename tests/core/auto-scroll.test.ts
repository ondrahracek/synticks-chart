import { describe, it, expect } from 'vitest'
import { AutoScrollController } from '../../src/core/auto-scroll'
import { createChartState } from '../../src/core/state'
import { isViewportAtLatest } from '../../src/core/viewport'
import type { Viewport } from '../../src/core/viewport'
import type { Candle } from '../../src/core/types'

describe('AutoScrollController', () => {
  it('initializes with autoScrollEnabled true', () => {
    const state = createChartState()
    const controller = new AutoScrollController(state)

    expect(state.autoScrollEnabled).toBe(true)
  })

  it('disableAutoScroll sets autoScrollEnabled to false', () => {
    const state = createChartState()
    const controller = new AutoScrollController(state)

    controller.disableAutoScroll()

    expect(state.autoScrollEnabled).toBe(false)
  })

  it('scrollToLive enables autoScroll and pans to latest candle', () => {
    const state = createChartState()
    const controller = new AutoScrollController(state)
    const candles: Candle[] = [
      { timestamp: 1000, open: 100, high: 105, low: 99, close: 103, volume: 1000 },
      { timestamp: 2000, open: 103, high: 107, low: 102, close: 106, volume: 1200 },
      { timestamp: 3000, open: 106, high: 108, low: 104, close: 105, volume: 1100 }
    ]
    state.candles = candles
    const viewport: Viewport = {
      from: 500,
      to: 1500,
      widthPx: 800,
      heightPx: 600
    }
    state.autoScrollEnabled = false

    const result = controller.scrollToLive(viewport, candles)

    expect(state.autoScrollEnabled).toBe(true)
    expect(isViewportAtLatest(result, candles)).toBe(true)
  })

  it('updateAutoScrollState enables autoScroll when viewport at latest', () => {
    const state = createChartState()
    const controller = new AutoScrollController(state)
    const candles: Candle[] = [
      { timestamp: 1000, open: 100, high: 105, low: 99, close: 103, volume: 1000 },
      { timestamp: 2000, open: 103, high: 107, low: 102, close: 106, volume: 1200 },
      { timestamp: 3000, open: 106, high: 108, low: 104, close: 105, volume: 1100 }
    ]
    state.candles = candles
    const viewport: Viewport = {
      from: 1000,
      to: 3100,
      widthPx: 800,
      heightPx: 600
    }
    state.autoScrollEnabled = false

    controller.updateAutoScrollState(viewport, candles)

    expect(state.autoScrollEnabled).toBe(true)
  })

  it('updateAutoScrollState does not enable autoScroll when viewport not at latest', () => {
    const state = createChartState()
    const controller = new AutoScrollController(state)
    const candles: Candle[] = [
      { timestamp: 1000, open: 100, high: 105, low: 99, close: 103, volume: 1000 },
      { timestamp: 2000, open: 103, high: 107, low: 102, close: 106, volume: 1200 },
      { timestamp: 3000, open: 106, high: 108, low: 104, close: 105, volume: 1100 }
    ]
    state.candles = candles
    const viewport: Viewport = {
      from: 1000,
      to: 2500,
      widthPx: 800,
      heightPx: 600
    }
    state.autoScrollEnabled = false

    controller.updateAutoScrollState(viewport, candles)

    expect(state.autoScrollEnabled).toBe(false)
  })
})

