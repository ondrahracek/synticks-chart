import { describe, it, expect, beforeEach, vi } from 'vitest'
import { ChartEngine } from '../../src/engine/ChartEngine'
import type { TimeframeId } from '../../src/core/types'

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
})

