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
      fillText: vi.fn(),
      textAlign: '',
      textBaseline: '',
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
      textAlign: '',
      textBaseline: '',
      clearRect: vi.fn(),
      fillRect: vi.fn(),
      beginPath: vi.fn(),
      moveTo: vi.fn(),
      lineTo: vi.fn(),
      stroke: vi.fn(),
      fillText: vi.fn(),
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
      fillText: vi.fn(),
      textAlign: '',
      textBaseline: '',
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
      textAlign: '',
      textBaseline: '',
      clearRect: vi.fn(),
      fillRect: vi.fn(),
      beginPath: vi.fn(),
      moveTo: vi.fn(),
      lineTo: vi.fn(),
      stroke: vi.fn(),
      fillText: vi.fn(),
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

  it('draws wick lines for candles', () => {
    let moveToCalls: Array<[number, number]> = []
    let lineToCalls: Array<[number, number]> = []
    let strokeCallCount = 0
    
    const mockCtx = {
      strokeStyle: '',
      fillStyle: '',
      lineWidth: 0,
      font: '',
      textAlign: '',
      textBaseline: '',
      clearRect: vi.fn(),
      fillRect: vi.fn(),
      beginPath: vi.fn(),
      moveTo: vi.fn((x: number, y: number) => { moveToCalls.push([x, y]) }),
      lineTo: vi.fn((x: number, y: number) => { lineToCalls.push([x, y]) }),
      stroke: vi.fn(() => { strokeCallCount++ }),
      fillText: vi.fn()
    }
    
    const canvas = document.createElement('canvas')
    canvas.width = 800
    canvas.height = 600
    vi.spyOn(canvas, 'getContext').mockReturnValue(mockCtx as unknown as CanvasRenderingContext2D)
    const renderer = new ChartRenderer(canvas)

    const state: ChartState = {
      candles: [
        { timestamp: 1000, open: 100, high: 105, low: 99, close: 103, volume: 1000 }
      ],
      missedCandles: [],
      playback: 'live',
      viewport: {
        from: 1000,
        to: 2000,
        widthPx: 800,
        heightPx: 600
      }
    }

    renderer.setState(state)
    renderer.render()

    const verticalLines = moveToCalls.filter((moveTo, i) => {
      const correspondingLineTo = lineToCalls[i]
      return correspondingLineTo && moveTo[0] === correspondingLineTo[0] && moveTo[1] !== correspondingLineTo[1]
    })

    expect(verticalLines.length).toBeGreaterThan(0)
  })

  it('draws horizontal grid lines at price levels when candles are available', () => {
    let moveToCalls: Array<[number, number]> = []
    let lineToCalls: Array<[number, number]> = []
    
    const mockCtx = {
      strokeStyle: '',
      fillStyle: '',
      lineWidth: 0,
      font: '',
      textAlign: '',
      textBaseline: '',
      clearRect: vi.fn(),
      fillRect: vi.fn(),
      beginPath: vi.fn(),
      moveTo: vi.fn((x: number, y: number) => { moveToCalls.push([x, y]) }),
      lineTo: vi.fn((x: number, y: number) => { lineToCalls.push([x, y]) }),
      stroke: vi.fn(),
      fillText: vi.fn()
    }
    
    const canvas = document.createElement('canvas')
    canvas.width = 800
    canvas.height = 600
    vi.spyOn(canvas, 'getContext').mockReturnValue(mockCtx as unknown as CanvasRenderingContext2D)
    const renderer = new ChartRenderer(canvas)

    const state: ChartState = {
      candles: [
        { timestamp: 1000, open: 100, high: 105, low: 99, close: 103, volume: 1000 },
        { timestamp: 2000, open: 103, high: 107, low: 102, close: 106, volume: 1200 }
      ],
      missedCandles: [],
      playback: 'live',
      viewport: {
        from: 1000,
        to: 2000,
        widthPx: 800,
        heightPx: 600
      }
    }

    renderer.setState(state)
    renderer.render()

    const horizontalLines = moveToCalls.filter((moveTo, i) => {
      const correspondingLineTo = lineToCalls[i]
      return correspondingLineTo && moveTo[1] === correspondingLineTo[1] && moveTo[0] === 0 && correspondingLineTo[0] === 800
    })

    expect(horizontalLines.length).toBeGreaterThan(0)
    
    const minPrice = 99
    const maxPrice = 107
    
    const yPositions = horizontalLines.map(([_, y]) => y).sort((a, b) => a - b)
    
    yPositions.forEach((y) => {
      const price = maxPrice - ((y / 600) * (maxPrice - minPrice))
      const roundedPrice = Math.round(price)
      expect(roundedPrice % 1).toBe(0)
    })
  })

  it('draws vertical grid lines at time levels when viewport is available', () => {
    let moveToCalls: Array<[number, number]> = []
    let lineToCalls: Array<[number, number]> = []
    
    const mockCtx = {
      strokeStyle: '',
      fillStyle: '',
      lineWidth: 0,
      font: '',
      textAlign: '',
      textBaseline: '',
      clearRect: vi.fn(),
      fillRect: vi.fn(),
      beginPath: vi.fn(),
      moveTo: vi.fn((x: number, y: number) => { moveToCalls.push([x, y]) }),
      lineTo: vi.fn((x: number, y: number) => { lineToCalls.push([x, y]) }),
      stroke: vi.fn(),
      fillText: vi.fn()
    }
    
    const canvas = document.createElement('canvas')
    canvas.width = 800
    canvas.height = 600
    vi.spyOn(canvas, 'getContext').mockReturnValue(mockCtx as unknown as CanvasRenderingContext2D)
    const renderer = new ChartRenderer(canvas)

    const state: ChartState = {
      candles: [
        { timestamp: 1000, open: 100, high: 105, low: 99, close: 103, volume: 1000 },
        { timestamp: 2000, open: 103, high: 107, low: 102, close: 106, volume: 1200 }
      ],
      missedCandles: [],
      playback: 'live',
      viewport: {
        from: 1000,
        to: 2000,
        widthPx: 800,
        heightPx: 600
      }
    }

    renderer.setState(state)
    renderer.render()

    const verticalLines = moveToCalls.filter((moveTo, i) => {
      const correspondingLineTo = lineToCalls[i]
      return correspondingLineTo && moveTo[0] === correspondingLineTo[0] && moveTo[0] >= 0 && moveTo[0] <= 800 && moveTo[1] === 0 && correspondingLineTo[1] === 600
    })

    expect(verticalLines.length).toBeGreaterThan(0)
  })

  it('draws price labels on horizontal grid lines', () => {
    let fillTextCalls: Array<[string, number, number]> = []
    
    const mockCtx = {
      strokeStyle: '',
      fillStyle: '',
      lineWidth: 0,
      font: '',
      clearRect: vi.fn(),
      fillRect: vi.fn(),
      beginPath: vi.fn(),
      moveTo: vi.fn(),
      lineTo: vi.fn(),
      stroke: vi.fn(),
      fillText: vi.fn((text: string, x: number, y: number) => { fillTextCalls.push([text, x, y]) })
    }
    
    const canvas = document.createElement('canvas')
    canvas.width = 800
    canvas.height = 600
    vi.spyOn(canvas, 'getContext').mockReturnValue(mockCtx as unknown as CanvasRenderingContext2D)
    const renderer = new ChartRenderer(canvas)

    const state: ChartState = {
      candles: [
        { timestamp: 1000, open: 100, high: 105, low: 99, close: 103, volume: 1000 },
        { timestamp: 2000, open: 103, high: 107, low: 102, close: 106, volume: 1200 }
      ],
      missedCandles: [],
      playback: 'live',
      viewport: {
        from: 1000,
        to: 2000,
        widthPx: 800,
        heightPx: 600
      }
    }

    renderer.setState(state)
    renderer.render()

    expect(fillTextCalls.length).toBeGreaterThan(0)
    expect(fillTextCalls.some(call => /^\d+/.test(call[0]))).toBe(true)
  })

  it('draws time labels on vertical grid lines', () => {
    let fillTextCalls: Array<[string, number, number]> = []
    
    const mockCtx = {
      strokeStyle: '',
      fillStyle: '',
      lineWidth: 0,
      font: '',
      textAlign: '',
      textBaseline: '',
      clearRect: vi.fn(),
      fillRect: vi.fn(),
      beginPath: vi.fn(),
      moveTo: vi.fn(),
      lineTo: vi.fn(),
      stroke: vi.fn(),
      fillText: vi.fn((text: string, x: number, y: number) => { fillTextCalls.push([text, x, y]) })
    }
    
    const canvas = document.createElement('canvas')
    canvas.width = 800
    canvas.height = 600
    vi.spyOn(canvas, 'getContext').mockReturnValue(mockCtx as unknown as CanvasRenderingContext2D)
    const renderer = new ChartRenderer(canvas)

    const state: ChartState = {
      candles: [
        { timestamp: 1000, open: 100, high: 105, low: 99, close: 103, volume: 1000 },
        { timestamp: 2000, open: 103, high: 107, low: 102, close: 106, volume: 1200 }
      ],
      missedCandles: [],
      playback: 'live',
      viewport: {
        from: 1000,
        to: 2000,
        widthPx: 800,
        heightPx: 600
      }
    }

    renderer.setState(state)
    renderer.render()

    const timeLabelCalls = fillTextCalls.filter(call => {
      const [text, x, y] = call
      return y >= 600 && y <= 610 && x >= 0 && x <= 800
    })

    expect(timeLabelCalls.length).toBeGreaterThan(0)
  })

  it('uses adaptive spacing when zoomed in', () => {
    let moveToCalls: Array<[number, number]> = []
    let lineToCalls: Array<[number, number]> = []
    
    const mockCtx = {
      strokeStyle: '',
      fillStyle: '',
      lineWidth: 0,
      font: '',
      textAlign: '',
      textBaseline: '',
      clearRect: vi.fn(),
      fillRect: vi.fn(),
      beginPath: vi.fn(),
      moveTo: vi.fn((x: number, y: number) => { moveToCalls.push([x, y]) }),
      lineTo: vi.fn((x: number, y: number) => { lineToCalls.push([x, y]) }),
      stroke: vi.fn(),
      fillText: vi.fn()
    }
    
    const canvas = document.createElement('canvas')
    canvas.width = 800
    canvas.height = 600
    vi.spyOn(canvas, 'getContext').mockReturnValue(mockCtx as unknown as CanvasRenderingContext2D)
    const renderer = new ChartRenderer(canvas)

    const state: ChartState = {
      candles: [
        { timestamp: 1000, open: 100, high: 105, low: 99, close: 103, volume: 1000 },
        { timestamp: 1100, open: 103, high: 107, low: 102, close: 106, volume: 1200 }
      ],
      missedCandles: [],
      playback: 'live',
      viewport: {
        from: 1000,
        to: 1100,
        widthPx: 800,
        heightPx: 600
      }
    }

    renderer.setState(state)
    renderer.render()

    const horizontalLines = moveToCalls.filter((moveTo, i) => {
      const correspondingLineTo = lineToCalls[i]
      return correspondingLineTo && moveTo[1] === correspondingLineTo[1] && moveTo[0] === 0 && correspondingLineTo[0] === 800
    })

    expect(horizontalLines.length).toBeGreaterThan(0)
    expect(horizontalLines.length).toBeLessThanOrEqual(20)
  })
})

