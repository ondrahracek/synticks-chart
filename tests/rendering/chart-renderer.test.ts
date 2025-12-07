import { describe, it, expect, beforeEach, vi } from 'vitest'
import { ChartRenderer } from '../../src/rendering/ChartRenderer'
import type { ChartState } from '../../src/core/state'
import { getTheme } from '../../src/core/theme'

describe('ChartRenderer', () => {
  let canvas: HTMLCanvasElement
  let renderer: ChartRenderer
  let ctx: CanvasRenderingContext2D

  let fillStyleValues: string[] = []

  beforeEach(() => {
    canvas = document.createElement('canvas')
    canvas.width = 800
    canvas.height = 600
    
    fillStyleValues = []
    const mockCtx = {
      strokeStyle: '',
      lineWidth: 0,
      font: '',
      clearRect: vi.fn(),
      fillRect: vi.fn(),
      beginPath: vi.fn(),
      moveTo: vi.fn(),
      lineTo: vi.fn(),
      stroke: vi.fn(),
      get fillStyle() { return fillStyleValues[fillStyleValues.length - 1] || '' },
      set fillStyle(value: string) { fillStyleValues.push(value) }
    }
    
    ctx = mockCtx as unknown as CanvasRenderingContext2D
    vi.spyOn(canvas, 'getContext').mockReturnValue(ctx)
    renderer = new ChartRenderer(canvas)
  })

  it('uses theme background color when rendering', () => {
    const darkTheme = getTheme('dark')
    const state: ChartState = {
      candles: [],
      missedCandles: [],
      playback: 'live',
      theme: darkTheme,
      viewport: {
        from: 1000,
        to: 2000,
        widthPx: 800,
        heightPx: 600
      }
    }

    renderer.setState(state)
    renderer.render()

    expect(fillStyleValues).toContain(darkTheme.background)
  })

  it('uses theme grid color when rendering', () => {
    let strokeStyleValues: string[] = []
    const fillStyleValue = { value: '' }
    const mockCtx = {
      lineWidth: 0,
      font: '',
      clearRect: vi.fn(),
      fillRect: vi.fn(),
      beginPath: vi.fn(),
      moveTo: vi.fn(),
      lineTo: vi.fn(),
      stroke: vi.fn(),
      get fillStyle() { return fillStyleValue.value },
      set fillStyle(value: string) { fillStyleValue.value = value },
      get strokeStyle() { return strokeStyleValues[strokeStyleValues.length - 1] || '' },
      set strokeStyle(value: string) { strokeStyleValues.push(value) }
    }
    
    const canvas = document.createElement('canvas')
    canvas.width = 800
    canvas.height = 600
    vi.spyOn(canvas, 'getContext').mockReturnValue(mockCtx as unknown as CanvasRenderingContext2D)
    const renderer = new ChartRenderer(canvas)

    const darkTheme = getTheme('dark')
    const state: ChartState = {
      candles: [],
      missedCandles: [],
      playback: 'live',
      theme: darkTheme,
      viewport: {
        from: 1000,
        to: 2000,
        widthPx: 800,
        heightPx: 600
      }
    }

    renderer.setState(state)
    renderer.render()

    expect(strokeStyleValues).toContain(darkTheme.grid)
  })

  it('uses theme candle colors when rendering', () => {
    let fillStyleValues: string[] = []
    const mockCtx = {
      strokeStyle: '',
      lineWidth: 0,
      font: '',
      clearRect: vi.fn(),
      fillRect: vi.fn(),
      beginPath: vi.fn(),
      moveTo: vi.fn(),
      lineTo: vi.fn(),
      stroke: vi.fn(),
      get fillStyle() { return fillStyleValues[fillStyleValues.length - 1] || '' },
      set fillStyle(value: string) { fillStyleValues.push(value) }
    }
    
    const canvas = document.createElement('canvas')
    canvas.width = 800
    canvas.height = 600
    vi.spyOn(canvas, 'getContext').mockReturnValue(mockCtx as unknown as CanvasRenderingContext2D)
    const renderer = new ChartRenderer(canvas)

    const customTheme = {
      background: '#ffffff',
      grid: '#e0e0e0',
      candleUp: '#00ff00',
      candleDown: '#ff0000',
      drawing: '#2196F3',
      indicator: '#ff9800'
    }
    const state: ChartState = {
      candles: [
        { timestamp: 1000, open: 100, high: 105, low: 99, close: 103, volume: 1000 },
        { timestamp: 2000, open: 103, high: 107, low: 102, close: 101, volume: 1200 }
      ],
      missedCandles: [],
      playback: 'live',
      theme: customTheme,
      viewport: {
        from: 1000,
        to: 2000,
        widthPx: 800,
        heightPx: 600
      }
    }

    renderer.setState(state)
    renderer.render()

    expect(fillStyleValues).toContain(customTheme.candleUp)
    expect(fillStyleValues).toContain(customTheme.candleDown)
  })

  it('uses theme drawing color when rendering', () => {
    let strokeStyleValues: string[] = []
    const mockCtx = {
      lineWidth: 0,
      font: '',
      clearRect: vi.fn(),
      fillRect: vi.fn(),
      beginPath: vi.fn(),
      moveTo: vi.fn(),
      lineTo: vi.fn(),
      stroke: vi.fn(),
      get strokeStyle() { return strokeStyleValues[strokeStyleValues.length - 1] || '' },
      set strokeStyle(value: string) { strokeStyleValues.push(value) }
    }
    
    const canvas = document.createElement('canvas')
    canvas.width = 800
    canvas.height = 600
    vi.spyOn(canvas, 'getContext').mockReturnValue(mockCtx as unknown as CanvasRenderingContext2D)
    const renderer = new ChartRenderer(canvas)

    const customTheme = {
      background: '#ffffff',
      grid: '#e0e0e0',
      candleUp: '#26a69a',
      candleDown: '#ef5350',
      drawing: '#ff00ff',
      indicator: '#ff9800'
    }
    const state: ChartState = {
      candles: [
        { timestamp: 1000, open: 100, high: 105, low: 99, close: 103, volume: 1000 }
      ],
      missedCandles: [],
      playback: 'live',
      theme: customTheme,
      drawings: [
        {
          kind: 'trendline',
          points: [
            { time: 1000, price: 100 },
            { time: 2000, price: 105 }
          ],
          isComplete: true
        }
      ],
      viewport: {
        from: 1000,
        to: 2000,
        widthPx: 800,
        heightPx: 600
      }
    }

    renderer.setState(state)
    renderer.render()

    expect(strokeStyleValues).toContain(customTheme.drawing)
  })
})

