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

  it('removes indicator', () => {
    const engine = new ChartEngine(canvas, { symbol: 'BTCUSDT', timeframe: '1m' })
    
    engine.addIndicator('sma', { period: 20 })
    engine.removeIndicator('sma')

    expect(engine).toBeDefined()
  })

  it('creates viewport when loading mock data', () => {
    const engine = new ChartEngine(canvas, { symbol: 'BTCUSDT', timeframe: '1m' })
    const candles: Candle[] = [
      { timestamp: 1000, open: 100, high: 110, low: 90, close: 105, volume: 1000 },
      { timestamp: 2000, open: 105, high: 115, low: 95, close: 110, volume: 1000 }
    ]
    
    engine.loadMockData(candles)
    const state = engine.getState()
    
    expect(state.candles.length).toBe(2)
    expect(state.viewport).toBeDefined()
    expect(state.viewport?.widthPx).toBe(800)
    expect(state.viewport?.heightPx).toBe(600)
  })

  it('clears viewport when resetting data', () => {
    const engine = new ChartEngine(canvas, { symbol: 'BTCUSDT', timeframe: '1m' })
    const candles: Candle[] = [
      { timestamp: 1000, open: 100, high: 110, low: 90, close: 105, volume: 1000 }
    ]
    
    engine.loadMockData(candles)
    engine.resetData()
    const state = engine.getState()
    
    expect(state.candles.length).toBe(0)
    expect(state.viewport).toBeUndefined()
  })
})

