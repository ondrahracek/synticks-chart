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

  it('appendCandle auto-pans viewport when autoScrollEnabled is true', async () => {
    const engine = new ChartEngine(canvas, { symbol: 'BTCUSDT', timeframe: '1m' })
    const candles: Candle[] = [
      { timestamp: 1000, open: 100, high: 105, low: 99, close: 103, volume: 1000 },
      { timestamp: 2000, open: 103, high: 107, low: 102, close: 106, volume: 1200 }
    ]
    engine.loadCandles(candles)
    const stateBefore = engine.getState()
    const viewportBefore = stateBefore.viewport!

    const newCandle: Candle = { timestamp: 3000, open: 106, high: 108, low: 104, close: 105, volume: 1100 }
    engine.appendCandle(newCandle)
    
    await new Promise(resolve => requestAnimationFrame(resolve))
    
    const stateAfter = engine.getState()
    const viewportAfter = stateAfter.viewport!

    expect(viewportAfter.to).toBeGreaterThan(viewportBefore.to)
    expect(viewportAfter.to).toBeGreaterThanOrEqual(3000)
  })

  it('updates state immediately when appendCandle called while scroll update is pending', async () => {
    const engine = new ChartEngine(canvas, { symbol: 'BTCUSDT', timeframe: '1m' })
    const candles: Candle[] = [
      { timestamp: 1000, open: 100, high: 105, low: 99, close: 103, volume: 1000 },
      { timestamp: 2000, open: 103, high: 107, low: 102, close: 106, volume: 1200 }
    ]
    engine.loadCandles(candles)
    
    const candle1: Candle = { timestamp: 3000, open: 106, high: 108, low: 104, close: 105, volume: 1100 }
    engine.appendCandle(candle1)
    
    const candle2: Candle = { timestamp: 4000, open: 105, high: 109, low: 103, close: 107, volume: 1200 }
    engine.appendCandle(candle2)
    
    const stateBeforeRAF = engine.getState()
    expect(stateBeforeRAF.candles).toHaveLength(4)
    expect(stateBeforeRAF.candles[3].timestamp).toBe(4000)

    await new Promise(resolve => requestAnimationFrame(resolve))

    const stateAfterRAF = engine.getState()
    expect(stateAfterRAF.viewport?.to).toBeGreaterThanOrEqual(4000)
  })

  it('scrolls only to final candle when multiple appendCandle calls happen synchronously', async () => {
    const engine = new ChartEngine(canvas, { symbol: 'BTCUSDT', timeframe: '1m' })
    const candles: Candle[] = [
      { timestamp: 1000, open: 100, high: 105, low: 99, close: 103, volume: 1000 },
      { timestamp: 2000, open: 103, high: 107, low: 102, close: 106, volume: 1200 }
    ]
    engine.loadCandles(candles)
    const stateBefore = engine.getState()
    const viewportBefore = stateBefore.viewport!
    const timeSpan = viewportBefore.to - viewportBefore.from

    const candle1: Candle = { timestamp: 3000, open: 106, high: 108, low: 104, close: 105, volume: 1100 }
    const candle2: Candle = { timestamp: 4000, open: 105, high: 109, low: 103, close: 107, volume: 1200 }
    const candle3: Candle = { timestamp: 5000, open: 107, high: 111, low: 106, close: 110, volume: 1300 }

    engine.appendCandle(candle1)
    engine.appendCandle(candle2)
    engine.appendCandle(candle3)

    await new Promise(resolve => requestAnimationFrame(resolve))

    const stateAfter = engine.getState()
    const viewportAfter = stateAfter.viewport!
    const expectedPadding = timeSpan * 0.1

    expect(viewportAfter.to).toBe(5000 + expectedPadding)
    expect(viewportAfter.from).toBe(5000 - timeSpan + expectedPadding)
  })

  it('appendCandle does not pan viewport when autoScrollEnabled is false', () => {
    const engine = new ChartEngine(canvas, { symbol: 'BTCUSDT', timeframe: '1m' })
    const candles: Candle[] = [
      { timestamp: 1000, open: 100, high: 105, low: 99, close: 103, volume: 1000 },
      { timestamp: 2000, open: 103, high: 107, low: 102, close: 106, volume: 1200 }
    ]
    engine.loadCandles(candles)
    
    const newCandle: Candle = { timestamp: 3000, open: 106, high: 108, low: 104, close: 105, volume: 1100 }
    engine.appendCandle(newCandle)
    const stateAfterFirst = engine.getState()
    const viewportAfterFirst = stateAfterFirst.viewport!
    
    const engineAny = engine as any
    engineAny.state.autoScrollEnabled = false
    
    const anotherCandle: Candle = { timestamp: 4000, open: 105, high: 109, low: 103, close: 107, volume: 1300 }
    engine.appendCandle(anotherCandle)
    const stateAfterDisabled = engine.getState()
    const viewportAfterDisabled = stateAfterDisabled.viewport!
    
    expect(viewportAfterDisabled.to).toBe(viewportAfterFirst.to)
    expect(viewportAfterDisabled.from).toBe(viewportAfterFirst.from)
  })

  it('scrollToLive enables autoScroll and pans to latest candle', () => {
    const engine = new ChartEngine(canvas, { symbol: 'BTCUSDT', timeframe: '1m' })
    const candles: Candle[] = [
      { timestamp: 1000, open: 100, high: 105, low: 99, close: 103, volume: 1000 },
      { timestamp: 2000, open: 103, high: 107, low: 102, close: 106, volume: 1200 },
      { timestamp: 3000, open: 106, high: 108, low: 104, close: 105, volume: 1100 }
    ]
    engine.loadCandles(candles)
    
    const engineAny = engine as any
    engineAny.state.autoScrollEnabled = false
    engineAny.state.viewport = {
      from: 500,
      to: 1500,
      widthPx: 800,
      heightPx: 600
    }
    const viewportBefore = engine.getState().viewport!
    expect(viewportBefore.to).toBe(1500)
    
    engine.scrollToLive()
    const stateAfter = engine.getState()
    
    expect(stateAfter.autoScrollEnabled).toBe(true)
    expect(stateAfter.viewport!.to).toBeGreaterThanOrEqual(3000)
  })

  it('scrollToLive animates smoothly instead of jumping when called after animation completes', async () => {
    const engine = new ChartEngine(canvas, { symbol: 'BTCUSDT', timeframe: '1m' })
    const candles: Candle[] = [
      { timestamp: 1000, open: 100, high: 105, low: 99, close: 103, volume: 1000 },
      { timestamp: 2000, open: 103, high: 107, low: 102, close: 106, volume: 1200 },
      { timestamp: 3000, open: 106, high: 108, low: 104, close: 105, volume: 1100 }
    ]
    engine.loadCandles(candles)
    
    const engineAny = engine as any
    engineAny.state.autoScrollEnabled = false
    engineAny.state.viewport = {
      from: 500,
      to: 1500,
      widthPx: 800,
      heightPx: 600
    }
    
    const viewportBefore = engine.getState().viewport!
    
    await new Promise(resolve => setTimeout(resolve, 250))
    
    engine.scrollToLive()
    
    await new Promise(resolve => setTimeout(resolve, 10))
    
    const stateMid = engine.getState()
    const viewportMid = stateMid.viewport!
    
    await new Promise(resolve => setTimeout(resolve, 250))
    
    const stateAfter = engine.getState()
    const viewportAfter = stateAfter.viewport!
    
    expect(viewportMid.to).toBeGreaterThan(viewportBefore.to)
    expect(viewportMid.to).toBeLessThanOrEqual(viewportAfter.to)
  })

  it('scrollToLive captures correct prevState when renderer state is shared reference', async () => {
    const engine = new ChartEngine(canvas, { symbol: 'BTCUSDT', timeframe: '1m' })
    const candles: Candle[] = [
      { timestamp: 1000, open: 100, high: 105, low: 99, close: 103, volume: 1000 },
      { timestamp: 2000, open: 103, high: 107, low: 102, close: 106, volume: 1200 },
      { timestamp: 3000, open: 106, high: 108, low: 104, close: 105, volume: 1100 }
    ]
    engine.loadCandles(candles)
    
    const engineAny = engine as any
    engineAny.state.autoScrollEnabled = false
    const initialViewport = {
      from: 500,
      to: 1500,
      widthPx: 800,
      heightPx: 600
    }
    engineAny.state.viewport = { ...initialViewport }
    
    await new Promise(resolve => setTimeout(resolve, 250))
    
    const viewportBefore = { ...engine.getState().viewport! }
    
    engine.scrollToLive()
    
    await new Promise(resolve => setTimeout(resolve, 5))
    
    const animationLoopAny = engineAny.animationLoop as any
    const prevState = animationLoopAny.prevState
    const targetState = animationLoopAny.targetState
    
    expect(prevState).toBeTruthy()
    expect(targetState).toBeTruthy()
    expect(prevState.viewport).toBeTruthy()
    expect(targetState.viewport).toBeTruthy()
    
    if (prevState.viewport && targetState.viewport) {
      const prevTo = prevState.viewport.to
      const targetTo = targetState.viewport.to
      
      expect(prevTo).toBe(viewportBefore.to)
      expect(targetTo).toBeGreaterThan(viewportBefore.to)
      expect(prevTo).toBeLessThan(targetTo)
    }
  })

  it('getState includes autoScrollEnabled field', () => {
    const engine = new ChartEngine(canvas, { symbol: 'BTCUSDT', timeframe: '1m' })
    const state = engine.getState()

    expect(state.autoScrollEnabled).toBeDefined()
    expect(state.autoScrollEnabled).toBe(true)
  })

  it('appendCandle scrolls automatically after scrollToLive when state was recreated by InputController', async () => {
    vi.useFakeTimers()
    const engine = new ChartEngine(canvas, { symbol: 'BTCUSDT', timeframe: '1m' })
    const candles: Candle[] = [
      { timestamp: 1000, open: 100, high: 105, low: 99, close: 103, volume: 1000 },
      { timestamp: 2000, open: 103, high: 107, low: 102, close: 106, volume: 1200 },
      { timestamp: 3000, open: 106, high: 108, low: 104, close: 105, volume: 1100 }
    ]
    engine.loadCandles(candles)
    
    vi.advanceTimersByTime(250)
    
    const engineAny = engine as any
    
    // Simulate InputController.updateState pattern: create new state object and disable auto-scroll
    // This simulates what happens when user pans left
    engineAny.state = {
      ...engineAny.state,
      autoScrollEnabled: false,
      viewport: {
        ...engineAny.state.viewport!,
        from: 1000,
        to: 2000
      }
    }
    
    vi.advanceTimersByTime(250)
    
    // User clicks "Go to Live"
    engine.scrollToLive()
    
    vi.advanceTimersByTime(250)
    
    // Verify autoScrollEnabled is true and viewport is at latest
    const stateAfterScrollToLive = engine.getState()
    expect(stateAfterScrollToLive.autoScrollEnabled).toBe(true)
    expect(stateAfterScrollToLive.viewport!.to).toBeGreaterThan(3000)
    
    const viewportBeforeAppend = { ...engine.getState().viewport! }
    
    // User adds a candle - should scroll automatically
    const newCandle: Candle = { timestamp: 4000, open: 105, high: 107, low: 104, close: 106, volume: 1200 }
    engine.appendCandle(newCandle)
    
    // Execute pending requestAnimationFrame callbacks - use Promise wrapper since fake timers need special handling
    await new Promise<void>((resolve) => {
      const rafId = requestAnimationFrame(() => {
        resolve()
      })
      // Manually trigger the RAF callback if using fake timers
      if (rafId) {
        // The RAF callback is already scheduled by appendCandle, we just need to wait for it
        setTimeout(() => resolve(), 0)
      }
    })
    
    // Execute all pending timers and RAF callbacks
    await vi.runAllTimersAsync()
    
    // Wait a bit for the animation loop to process
    vi.advanceTimersByTime(50)
    
    const stateAfterAppend = engine.getState()
    const viewportAfterAppend = stateAfterAppend.viewport!
    
    // Should have scrolled to show the new candle
    expect(viewportAfterAppend.to).toBeGreaterThan(viewportBeforeAppend.to)
    expect(viewportAfterAppend.to).toBeGreaterThan(4000)
    
    vi.useRealTimers()
  })

  it('appendCandle animates smoothly instead of jumping when auto-scrolling', async () => {
    const engine = new ChartEngine(canvas, { symbol: 'BTCUSDT', timeframe: '1m' })
    const candles: Candle[] = [
      { timestamp: 1000, open: 100, high: 105, low: 99, close: 103, volume: 1000 },
      { timestamp: 2000, open: 103, high: 107, low: 102, close: 106, volume: 1200 },
      { timestamp: 3000, open: 106, high: 108, low: 104, close: 105, volume: 1100 }
    ]
    engine.loadCandles(candles)
    
    await new Promise(resolve => setTimeout(resolve, 250))
    
    const engineAny = engine as any
    const initialViewport = {
      from: 2100,
      to: 3100,
      widthPx: 800,
      heightPx: 600
    }
    engineAny.state.viewport = { ...initialViewport }
    
    await new Promise(resolve => setTimeout(resolve, 250))
    
    const viewportBefore = { ...engine.getState().viewport! }
    
    const newCandle: Candle = { timestamp: 4000, open: 105, high: 107, low: 104, close: 106, volume: 1200 }
    engine.appendCandle(newCandle)
    
    await new Promise(resolve => requestAnimationFrame(resolve))
    
    await new Promise(resolve => setTimeout(resolve, 10))
    
    const animationLoopAny = engineAny.animationLoop as any
    const prevState = animationLoopAny.prevState
    const targetState = animationLoopAny.targetState
    
    // Verify that prevState was captured correctly (not null, has correct viewport)
    expect(prevState).toBeTruthy()
    expect(targetState).toBeTruthy()
    expect(prevState.viewport).toBeTruthy()
    expect(targetState.viewport).toBeTruthy()
    
    if (prevState.viewport && targetState.viewport) {
      const prevTo = prevState.viewport.to
      const targetTo = targetState.viewport.to
      
      // prevState should be the viewport before the change (3100)
      expect(prevTo).toBe(viewportBefore.to)
      // targetState should be the new viewport (after 4000)
      expect(targetTo).toBeGreaterThan(viewportBefore.to)
      expect(targetTo).toBeGreaterThan(4000)
      // Animation should interpolate between them
      expect(prevTo).toBeLessThan(targetTo)
    }
  })
})

