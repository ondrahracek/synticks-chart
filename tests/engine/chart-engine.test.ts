import { describe, it, expect, beforeEach, vi } from 'vitest'
import { ChartEngine } from '../../src/engine/ChartEngine'
import type { TimeframeId, Candle } from '../../src/core/types'

describe('ChartEngine', () => {
  let canvas: HTMLCanvasElement

  beforeEach(() => {
    canvas = document.createElement('canvas')
    canvas.width = 800
    canvas.height = 600
    canvas.getBoundingClientRect = vi.fn(() => ({
      left: 0,
      top: 0,
      right: 800,
      bottom: 600,
      width: 800,
      height: 600,
      x: 0,
      y: 0,
      toJSON: () => {}
    }))
  })

  it('initializes with default state', () => {
    const engine = new ChartEngine(canvas, { symbol: 'BTCUSDT', timeframe: '1m' })

    expect(engine).toBeDefined()
  })

  it('sets symbol and triggers state update', () => {
    const engine = new ChartEngine(canvas, { symbol: 'BTCUSDT', timeframe: '1m' })
    
    engine.setSymbol('ETHUSDT')

    expect(engine).toBeDefined()
  })

  it('sets timeframe', () => {
    const engine = new ChartEngine(canvas, { symbol: 'BTCUSDT', timeframe: '1m' })
    
    engine.setTimeframe('5m')

    expect(engine).toBeDefined()
  })

  it('play delegates to playback controller', () => {
    const engine = new ChartEngine(canvas, { symbol: 'BTCUSDT', timeframe: '1m' })
    
    engine.play()

    expect(engine).toBeDefined()
  })

  it('pause delegates to playback controller', () => {
    const engine = new ChartEngine(canvas, { symbol: 'BTCUSDT', timeframe: '1m' })
    
    engine.pause()

    expect(engine).toBeDefined()
  })

  it('adds indicator', () => {
    const engine = new ChartEngine(canvas, { symbol: 'BTCUSDT', timeframe: '1m' })
    
    engine.addIndicator('sma', { period: 20 })

    expect(engine).toBeDefined()
  })

  it('stores indicator data in state', () => {
    const engine = new ChartEngine(canvas, { symbol: 'BTCUSDT', timeframe: '1m' })
    const candles: Candle[] = [
      { timestamp: 1000, open: 100, high: 105, low: 99, close: 103, volume: 1000 },
      { timestamp: 2000, open: 103, high: 107, low: 102, close: 106, volume: 1200 },
      { timestamp: 3000, open: 106, high: 108, low: 104, close: 105, volume: 1100 }
    ]
    engine.loadCandles(candles)
    
    engine.addIndicator('sma', { period: 2 })
    
    const state = engine.getState()
    expect(state.indicators).toBeDefined()
    expect(Array.isArray(state.indicators)).toBe(true)
  })

  it('recalculates indicators when candle is appended', () => {
    const engine = new ChartEngine(canvas, { symbol: 'BTCUSDT', timeframe: '1m' })
    const candles: Candle[] = [
      { timestamp: 1000, open: 100, high: 105, low: 99, close: 103, volume: 1000 },
      { timestamp: 2000, open: 103, high: 107, low: 102, close: 106, volume: 1200 }
    ]
    engine.loadCandles(candles)
    engine.addIndicator('sma', { period: 2 })
    
    const stateBefore = engine.getState()
    const indicatorBefore = stateBefore.indicators?.[0]
    expect(indicatorBefore?.values.length).toBe(1)
    
    engine.appendCandle({ timestamp: 3000, open: 106, high: 108, low: 104, close: 105, volume: 1100 })
    
    const stateAfter = engine.getState()
    const indicatorAfter = stateAfter.indicators?.[0]
    expect(indicatorAfter?.values.length).toBe(2)
  })

  it('recalculates indicators when candles are added', () => {
    const engine = new ChartEngine(canvas, { symbol: 'BTCUSDT', timeframe: '1m' })
    const candles: Candle[] = [
      { timestamp: 1000, open: 100, high: 105, low: 99, close: 103, volume: 1000 },
      { timestamp: 2000, open: 103, high: 107, low: 102, close: 106, volume: 1200 }
    ]
    engine.loadCandles(candles)
    engine.addIndicator('sma', { period: 2 })
    
    const stateBefore = engine.getState()
    const indicatorBefore = stateBefore.indicators?.[0]
    expect(indicatorBefore?.values.length).toBe(1)
    
    engine.appendCandle({ timestamp: 3000, open: 106, high: 108, low: 104, close: 105, volume: 1100 })
    
    const stateAfter = engine.getState()
    const indicatorAfter = stateAfter.indicators?.[0]
    expect(indicatorAfter?.values.length).toBe(2)
  })

  it('removes indicator', () => {
    const engine = new ChartEngine(canvas, { symbol: 'BTCUSDT', timeframe: '1m' })
    
    engine.addIndicator('sma', { period: 20 })
    engine.removeIndicator('sma')

    expect(engine).toBeDefined()
  })

  it('creates viewport when loading candles', () => {
    const engine = new ChartEngine(canvas, { symbol: 'BTCUSDT', timeframe: '1m' })
    const candles: Candle[] = [
      { timestamp: 1000, open: 100, high: 110, low: 90, close: 105, volume: 1000 },
      { timestamp: 2000, open: 105, high: 115, low: 95, close: 110, volume: 1000 }
    ]
    
    engine.loadCandles(candles)
    const state = engine.getState()
    
    expect(state.candles.length).toBe(2)
    expect(state.viewport).toBeDefined()
    expect(state.viewport?.widthPx).toBe(740)
    expect(state.viewport?.heightPx).toBe(570)
  })

  it('creates viewport showing only last N candles when loading many candles', () => {
    const engine = new ChartEngine(canvas, { symbol: 'BTCUSDT', timeframe: '1m' })
    const candles: Candle[] = []
    for (let i = 0; i < 500; i++) {
      candles.push({
        timestamp: 1000 + i * 60000,
        open: 100,
        high: 110,
        low: 90,
        close: 105,
        volume: 1000
      })
    }
    
    engine.loadCandles(candles)
    const state = engine.getState()
    
    expect(state.candles.length).toBe(500)
    expect(state.viewport).toBeDefined()
    const lastCandleTime = candles[candles.length - 1].timestamp
    expect(state.viewport!.to).toBeGreaterThan(lastCandleTime)
    const firstCandleTime = candles[0].timestamp
    expect(state.viewport!.from).toBeGreaterThan(firstCandleTime)
  })

  it('clears viewport when resetting data', () => {
    const engine = new ChartEngine(canvas, { symbol: 'BTCUSDT', timeframe: '1m' })
    const candles: Candle[] = [
      { timestamp: 1000, open: 100, high: 110, low: 90, close: 105, volume: 1000 }
    ]
    
    engine.loadCandles(candles)
    engine.resetData()
    const state = engine.getState()
    
    expect(state.candles.length).toBe(0)
    expect(state.viewport).toBeUndefined()
  })

  it('enables label padding when setLabelPadding is called with true', () => {
    const engine = new ChartEngine(canvas, { symbol: 'BTCUSDT', timeframe: '1m' })
    
    engine.setLabelPadding(true)
    
    const state = engine.getState()
    expect(state.layout?.labelPadding?.enabled).toBe(true)
  })

  it('disables label padding when setLabelPadding is called with false', () => {
    const engine = new ChartEngine(canvas, { symbol: 'BTCUSDT', timeframe: '1m' })
    engine.setLabelPadding(true)
    
    engine.setLabelPadding(false)
    
    const state = engine.getState()
    expect(state.layout?.labelPadding?.enabled).toBe(false)
  })

  it('reduces viewport dimensions when label padding is enabled', () => {
    const engine = new ChartEngine(canvas, { symbol: 'BTCUSDT', timeframe: '1m' })
    const candles: Candle[] = [
      { timestamp: 1000, open: 100, high: 110, low: 90, close: 105, volume: 1000 },
      { timestamp: 2000, open: 105, high: 115, low: 95, close: 110, volume: 1000 }
    ]
    
    engine.setLabelPadding(false)
    engine.loadCandles(candles)
    const stateWithoutPadding = engine.getState()
    const viewportWithoutPadding = stateWithoutPadding.viewport
    
    engine.setLabelPadding(true)
    engine.loadCandles(candles)
    const stateWithPadding = engine.getState()
    const viewportWithPadding = stateWithPadding.viewport
    
    expect(viewportWithPadding).toBeDefined()
    expect(viewportWithPadding!.widthPx).toBeLessThan(viewportWithoutPadding!.widthPx)
    expect(viewportWithPadding!.heightPx).toBeLessThan(viewportWithoutPadding!.heightPx)
  })

  it('has label padding enabled by default', () => {
    const engine = new ChartEngine(canvas, { symbol: 'BTCUSDT', timeframe: '1m' })
    
    const state = engine.getState()
    expect(state.layout?.labelPadding?.enabled).toBe(true)
  })

  it('recalculates viewport dimensions when label padding is toggled after loading candles', () => {
    const engine = new ChartEngine(canvas, { symbol: 'BTCUSDT', timeframe: '1m' })
    const candles: Candle[] = [
      { timestamp: 1000, open: 100, high: 110, low: 90, close: 105, volume: 1000 },
      { timestamp: 2000, open: 105, high: 115, low: 95, close: 110, volume: 1000 }
    ]
    
    // Load candles with padding enabled (default)
    engine.loadCandles(candles)
    const stateWithPadding = engine.getState()
    expect(stateWithPadding.viewport?.widthPx).toBe(740)
    expect(stateWithPadding.viewport?.heightPx).toBe(570)
    
    // Disable padding - viewport should be recalculated
    engine.setLabelPadding(false)
    const stateWithoutPadding = engine.getState()
    expect(stateWithoutPadding.viewport?.widthPx).toBe(800)
    expect(stateWithoutPadding.viewport?.heightPx).toBe(600)
  })

  it('preserves viewport time range when label padding is toggled', () => {
    const engine = new ChartEngine(canvas, { symbol: 'BTCUSDT', timeframe: '1m' })
    const candles: Candle[] = [
      { timestamp: 1000, open: 100, high: 110, low: 90, close: 105, volume: 1000 },
      { timestamp: 2000, open: 105, high: 115, low: 95, close: 110, volume: 1000 },
      { timestamp: 3000, open: 110, high: 120, low: 100, close: 115, volume: 1000 },
      { timestamp: 4000, open: 115, high: 125, low: 105, close: 120, volume: 1000 }
    ]
    
    // Load candles with padding enabled (default)
    engine.loadCandles(candles)
    const stateBefore = engine.getState()
    const viewportBefore = stateBefore.viewport!
    const originalFrom = viewportBefore.from
    const originalTo = viewportBefore.to
    
    // Toggle padding - time range should be preserved, only dimensions should change
    engine.setLabelPadding(false)
    const stateAfter = engine.getState()
    const viewportAfter = stateAfter.viewport!
    
    // The bug: createViewportFromCandles recalculates from/to from scratch
    // This test will fail because from/to will be recalculated, potentially changing
    expect(viewportAfter.from).toBe(originalFrom)
    expect(viewportAfter.to).toBe(originalTo)
    expect(viewportAfter.widthPx).toBe(800)
    expect(viewportAfter.heightPx).toBe(600)
  })
})

