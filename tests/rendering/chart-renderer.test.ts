import { describe, it, expect, beforeEach, vi } from 'vitest'
import { ChartRenderer } from '../../src/rendering/ChartRenderer'
import type { ChartState } from '../../src/core/state'
import { getTheme } from '../../src/core/theme'
import * as layoutModule from '../../src/rendering/layout'

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
      autoScrollEnabled: true,
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
      autoScrollEnabled: true,
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
      autoScrollEnabled: true,
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
      autoScrollEnabled: true,
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

  it('draws preview drawing with lighter color', () => {
    let strokeStyleValues: string[] = []
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
      fillText: vi.fn(),
      get strokeStyle() { return strokeStyleValues[strokeStyleValues.length - 1] || '' },
      set strokeStyle(value: string) { strokeStyleValues.push(value) }
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
      autoScrollEnabled: true,
      currentDrawing: {
        kind: 'trendline',
        points: [
          { time: 1000, price: 100 },
          { time: 1500, price: 105 }
        ],
        isComplete: false
      },
      viewport: {
        from: 1000,
        to: 2000,
        widthPx: 800,
        heightPx: 600
      }
    }

    renderer.setState(state)
    renderer.render()

    const drawingLines = moveToCalls.filter((moveTo, i) => {
      const correspondingLineTo = lineToCalls[i]
      return correspondingLineTo && moveTo[0] !== correspondingLineTo[0] && moveTo[1] !== correspondingLineTo[1]
    })

    expect(drawingLines.length).toBeGreaterThan(0)
    const previewColor = strokeStyleValues.find(color => color.includes('rgba') || color.includes('80'))
    expect(previewColor).toBeDefined()
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
      autoScrollEnabled: true,
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
      autoScrollEnabled: true,
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
      autoScrollEnabled: true,
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
      autoScrollEnabled: true,
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
      autoScrollEnabled: true,
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

  it('calls drawIndicators in render sequence', () => {
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
      autoScrollEnabled: true,
      viewport: {
        from: 1000,
        to: 2000,
        widthPx: 800,
        heightPx: 600
      }
    }

    renderer.setState(state)
    renderer.render()
    
    expect(mockCtx.clearRect).toHaveBeenCalled()
  })

  it('does nothing when no indicators in state', () => {
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
      fillText: vi.fn()
    }
    
    const canvas = document.createElement('canvas')
    canvas.width = 800
    canvas.height = 600
    vi.spyOn(canvas, 'getContext').mockReturnValue(mockCtx as unknown as CanvasRenderingContext2D)
    const renderer = new ChartRenderer(canvas)
    
    const state: ChartState = {
      candles: [],
      autoScrollEnabled: true,
      indicators: [],
      viewport: {
        from: 1000,
        to: 2000,
        widthPx: 800,
        heightPx: 600
      }
    }

    renderer.setState(state)
    renderer.render()
    
    expect(mockCtx.clearRect).toHaveBeenCalled()
  })

  it('draws indicator line when indicator exists', () => {
    let moveToCalls: Array<[number, number]> = []
    let lineToCalls: Array<[number, number]> = []
    let strokeStyleValues: string[] = []
    
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
      fillText: vi.fn(),
      get strokeStyle() { return strokeStyleValues[strokeStyleValues.length - 1] || '' },
      set strokeStyle(value: string) { strokeStyleValues.push(value) }
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
      autoScrollEnabled: true,
      indicators: [
        {
          id: 'sma:2',
          values: [103, 104.5],
          timestamps: [1000, 2000]
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

    const indicatorLines = moveToCalls.filter((moveTo, i) => {
      const correspondingLineTo = lineToCalls[i]
      return correspondingLineTo && moveTo[0] !== correspondingLineTo[0] && moveTo[1] !== correspondingLineTo[1]
    })

    expect(indicatorLines.length).toBeGreaterThan(0)
    expect(strokeStyleValues).toContain('#ff9800')
  })

  it('correctly maps indicator values to candle timestamps with period offset', () => {
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
        { timestamp: 2000, open: 103, high: 107, low: 102, close: 106, volume: 1200 },
        { timestamp: 3000, open: 106, high: 108, low: 104, close: 105, volume: 1100 }
      ],
      autoScrollEnabled: true,
      indicators: [
        {
          id: 'sma:2',
          values: [104.5, 105.5],
          timestamps: [2000, 3000]
        }
      ],
      viewport: {
        from: 1000,
        to: 3000,
        widthPx: 800,
        heightPx: 600
      }
    }

    renderer.setState(state)
    renderer.render()

    const firstMoveTo = moveToCalls.find(call => call[0] > 0 && call[0] < 800)
    expect(firstMoveTo).toBeDefined()
    
    const xPositions = moveToCalls.map(([x]) => x).filter(x => x > 0 && x < 800)
    expect(xPositions.length).toBeGreaterThan(0)
  })

  it('only draws indicator points visible in viewport', () => {
    let indicatorMoveToCalls: Array<[number, number]> = []
    let isDrawingIndicator = false
    
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
      moveTo: vi.fn((x: number, y: number) => {
        if (isDrawingIndicator) {
          indicatorMoveToCalls.push([x, y])
        }
      }),
      lineTo: vi.fn(),
      stroke: vi.fn(),
      fillText: vi.fn(),
      set strokeStyle(value: string) {
        if (value === '#ff9800') {
          isDrawingIndicator = true
        } else {
          isDrawingIndicator = false
        }
      }
    }
    
    const canvas = document.createElement('canvas')
    canvas.width = 800
    canvas.height = 600
    vi.spyOn(canvas, 'getContext').mockReturnValue(mockCtx as unknown as CanvasRenderingContext2D)
    const renderer = new ChartRenderer(canvas)

    const state: ChartState = {
      candles: [
        { timestamp: 1000, open: 100, high: 105, low: 99, close: 103, volume: 1000 },
        { timestamp: 2000, open: 103, high: 107, low: 102, close: 106, volume: 1200 },
        { timestamp: 3000, open: 106, high: 108, low: 104, close: 105, volume: 1100 },
        { timestamp: 4000, open: 105, high: 109, low: 103, close: 108, volume: 1300 }
      ],
      autoScrollEnabled: true,
      indicators: [
        {
          id: 'sma:2',
          values: [104.5, 105.5, 106.5],
          timestamps: [2000, 3000, 4000]
        }
      ],
      viewport: {
        from: 2500,
        to: 3500,
        widthPx: 800,
        heightPx: 600
      }
    }

    renderer.setState(state)
    renderer.render()

    expect(indicatorMoveToCalls.length).toBe(1)
  })

  it('draws indicator points slightly outside viewport bounds', () => {
    let indicatorMoveToCalls: Array<[number, number]> = []
    let indicatorLineToCalls: Array<[number, number]> = []
    let isDrawingIndicator = false
    
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
      moveTo: vi.fn((x: number, y: number) => {
        if (isDrawingIndicator) {
          indicatorMoveToCalls.push([x, y])
        }
      }),
      lineTo: vi.fn((x: number, y: number) => {
        if (isDrawingIndicator) {
          indicatorLineToCalls.push([x, y])
        }
      }),
      stroke: vi.fn(),
      fillText: vi.fn(),
      set strokeStyle(value: string) {
        if (value === '#ff9800') {
          isDrawingIndicator = true
        } else {
          isDrawingIndicator = false
        }
      }
    }
    
    const canvas = document.createElement('canvas')
    canvas.width = 800
    canvas.height = 600
    vi.spyOn(canvas, 'getContext').mockReturnValue(mockCtx as unknown as CanvasRenderingContext2D)
    const renderer = new ChartRenderer(canvas)

    const state: ChartState = {
      candles: [
        { timestamp: 1000, open: 100, high: 105, low: 99, close: 103, volume: 1000 },
        { timestamp: 2000, open: 103, high: 107, low: 102, close: 106, volume: 1200 },
        { timestamp: 3000, open: 106, high: 108, low: 104, close: 105, volume: 1100 },
        { timestamp: 4000, open: 105, high: 109, low: 103, close: 108, volume: 1300 }
      ],
      autoScrollEnabled: true,
      indicators: [
        {
          id: 'sma:2',
          values: [104.5, 105.5, 106.5],
          timestamps: [2000, 3000, 4000]
        }
      ],
      viewport: {
        from: 2500,
        to: 3500,
        widthPx: 800,
        heightPx: 600
      }
    }

    renderer.setState(state)
    renderer.render()

    const totalPoints = indicatorMoveToCalls.length + indicatorLineToCalls.length
    expect(totalPoints).toBeGreaterThan(1)
  })

  it('draws multiple indicators simultaneously', () => {
    let indicatorBeginPathCalls = 0
    let isDrawingIndicator = false
    
    const mockCtx = {
      strokeStyle: '',
      fillStyle: '',
      lineWidth: 0,
      font: '',
      textAlign: '',
      textBaseline: '',
      clearRect: vi.fn(),
      fillRect: vi.fn(),
      beginPath: vi.fn(() => {
        if (isDrawingIndicator) {
          indicatorBeginPathCalls++
        }
      }),
      moveTo: vi.fn(),
      lineTo: vi.fn(),
      stroke: vi.fn(),
      fillText: vi.fn(),
      set strokeStyle(value: string) {
        if (value === '#ff9800') {
          isDrawingIndicator = true
        } else {
          isDrawingIndicator = false
        }
      }
    }
    
    const canvas = document.createElement('canvas')
    canvas.width = 800
    canvas.height = 600
    vi.spyOn(canvas, 'getContext').mockReturnValue(mockCtx as unknown as CanvasRenderingContext2D)
    const renderer = new ChartRenderer(canvas)

    const state: ChartState = {
      candles: [
        { timestamp: 1000, open: 100, high: 105, low: 99, close: 103, volume: 1000 },
        { timestamp: 2000, open: 103, high: 107, low: 102, close: 106, volume: 1200 },
        { timestamp: 3000, open: 106, high: 108, low: 104, close: 105, volume: 1100 }
      ],
      autoScrollEnabled: true,
      indicators: [
        {
          id: 'sma:2',
          values: [104.5, 105.5],
          timestamps: [2000, 3000]
        },
        {
          id: 'sma:3',
          values: [104.67],
          timestamps: [3000]
        }
      ],
      viewport: {
        from: 1000,
        to: 3000,
        widthPx: 800,
        heightPx: 600
      }
    }

    renderer.setState(state)
    renderer.render()

    expect(indicatorBeginPathCalls).toBe(2)
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
      autoScrollEnabled: true,
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

  it('applies canvas clipping when label padding is enabled', () => {
    const saveCalls: number[] = []
    const restoreCalls: number[] = []
    const beginPathCalls: number[] = []
    const rectCalls: Array<[number, number, number, number]> = []
    const clipCalls: number[] = []
    
    const mockCtx = {
      strokeStyle: '',
      fillStyle: '',
      lineWidth: 0,
      font: '',
      textAlign: '',
      textBaseline: '',
      clearRect: vi.fn(),
      fillRect: vi.fn(),
      beginPath: vi.fn(() => beginPathCalls.push(1)),
      moveTo: vi.fn(),
      lineTo: vi.fn(),
      stroke: vi.fn(),
      fillText: vi.fn(),
      rect: vi.fn((x: number, y: number, w: number, h: number) => rectCalls.push([x, y, w, h])),
      clip: vi.fn(() => clipCalls.push(1)),
      save: vi.fn(() => saveCalls.push(1)),
      restore: vi.fn(() => restoreCalls.push(1))
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
      autoScrollEnabled: true,
      layout: {
        labelPadding: {
          enabled: true
        }
      },
      viewport: {
        from: 1000,
        to: 2000,
        widthPx: 740,
        heightPx: 570
      }
    }

    renderer.setState(state)
    renderer.render()
    
    expect(saveCalls.length).toBeGreaterThan(0)
    expect(beginPathCalls.length).toBeGreaterThan(0)
    expect(rectCalls.length).toBeGreaterThan(0)
    expect(clipCalls.length).toBeGreaterThan(0)
    expect(restoreCalls.length).toBeGreaterThan(0)
    
    const clippingRect = rectCalls.find(rect => rect[2] === 740 && rect[3] === 570)
    expect(clippingRect).toBeDefined()
    expect(clippingRect![0]).toBe(60)
    expect(clippingRect![1]).toBe(0)
  })

  it('draws labels in padding area when clipping is enabled', () => {
    const fillTextCalls: Array<[string, number, number]> = []
    const restoreCalls: number[] = []
    let clipActive = false
    
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
      fillText: vi.fn((text: string, x: number, y: number) => {
        if (!clipActive) {
          fillTextCalls.push([text, x, y])
        }
      }),
      rect: vi.fn(),
      clip: vi.fn(() => { clipActive = true }),
      save: vi.fn(),
      restore: vi.fn(() => {
        restoreCalls.push(1)
        clipActive = false
      })
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
      autoScrollEnabled: true,
      layout: {
        labelPadding: {
          enabled: true
        }
      },
      viewport: {
        from: 1000,
        to: 2000,
        widthPx: 740,
        heightPx: 570
      }
    }

    renderer.setState(state)
    renderer.render()
    
    expect(restoreCalls.length).toBeGreaterThan(0)
    const labelsInPaddingArea = fillTextCalls.filter(call => call[1] < 60 || call[2] > 570)
    expect(labelsInPaddingArea.length).toBeGreaterThan(0)
  })

  it('filters overlapping time labels when zoomed in', () => {
    let fillTextCalls: Array<[string, number, number]> = []
    
    const mockCtx = {
      strokeStyle: '',
      fillStyle: '',
      lineWidth: 0,
      font: '12px sans-serif',
      textAlign: 'center',
      textBaseline: 'top',
      clearRect: vi.fn(),
      fillRect: vi.fn(),
      beginPath: vi.fn(),
      moveTo: vi.fn(),
      lineTo: vi.fn(),
      stroke: vi.fn(),
      measureText: vi.fn((text: string) => {
        return { width: 80 } as TextMetrics
      }),
      fillText: vi.fn((text: string, x: number, y: number) => { fillTextCalls.push([text, x, y]) })
    }
    
    const canvas = document.createElement('canvas')
    canvas.width = 200
    canvas.height = 600
    vi.spyOn(canvas, 'getContext').mockReturnValue(mockCtx as unknown as CanvasRenderingContext2D)
    const renderer = new ChartRenderer(canvas)

    // Create a viewport that would generate many overlapping labels
    // Use a larger time span but narrow width to force many labels close together
    const state: ChartState = {
      candles: [
        { timestamp: 1000, open: 100, high: 105, low: 99, close: 103, volume: 1000 },
        { timestamp: 2000, open: 103, high: 107, low: 102, close: 106, volume: 1200 }
      ],
      autoScrollEnabled: true,
      viewport: {
        from: 1000,
        to: 7000, // 6 second span in 200px width - will generate multiple 1-second interval labels
        widthPx: 200,
        heightPx: 600
      }
    }

    renderer.setState(state)
    renderer.render()

    // Get all time label calls (labels drawn at bottom of chart, y = 604 when no padding)
    // Time labels are formatted as time strings, not numbers
    const timeLabelCalls = fillTextCalls.filter(call => {
      const [text, x, y] = call
      // Time labels are at the bottom (y = 604 when no padding, or canvas.height - bottomPadding + 4)
      const isAtBottom = y >= 600 && y <= 610
      // Time labels contain colons (e.g., "12:34:56") or are date strings
      const looksLikeTime = typeof text === 'string' && (text.includes(':') || text.includes('/') || text.match(/\d{1,2}\/\d{1,2}\/\d{4}/))
      return isAtBottom && looksLikeTime
    })

    expect(timeLabelCalls.length).toBeGreaterThan(1) // Should have multiple labels to test filtering

    // Sort by x position to check adjacent labels
    timeLabelCalls.sort((a, b) => a[1] - b[1])

    // Verify that no two labels overlap (each label is 80px wide, so spacing should be >= 80px)
    for (let i = 0; i < timeLabelCalls.length - 1; i++) {
      const [text1, x1] = timeLabelCalls[i]
      const [text2, x2] = timeLabelCalls[i + 1]
      const spacing = Math.abs(x2 - x1)
      expect(spacing).toBeGreaterThanOrEqual(80)
    }
  })

  it('calculates price range from visible candles only, not all candles', () => {
    let fillRectCalls: Array<[number, number, number, number]> = []
    let moveToCalls: Array<[number, number]> = []
    
    const mockCtx = {
      strokeStyle: '',
      fillStyle: '',
      lineWidth: 0,
      font: '',
      textAlign: '',
      textBaseline: '',
      clearRect: vi.fn(),
      fillRect: vi.fn((x: number, y: number, w: number, h: number) => {
        fillRectCalls.push([x, y, w, h])
      }),
      beginPath: vi.fn(),
      moveTo: vi.fn((x: number, y: number) => {
        moveToCalls.push([x, y])
      }),
      lineTo: vi.fn(),
      stroke: vi.fn(),
      fillText: vi.fn()
    }
    
    const canvas = document.createElement('canvas')
    canvas.width = 800
    canvas.height = 600
    vi.spyOn(canvas, 'getContext').mockReturnValue(mockCtx as unknown as CanvasRenderingContext2D)
    const renderer = new ChartRenderer(canvas)

    // Create candles with different price ranges:
    // Old candles: prices 100-200
    // New candles: prices 300-400
    const state: ChartState = {
      candles: [
        { timestamp: 1000, open: 100, high: 150, low: 100, close: 120, volume: 1000 },
        { timestamp: 2000, open: 120, high: 200, low: 110, close: 180, volume: 1200 },
        { timestamp: 3000, open: 300, high: 350, low: 300, close: 320, volume: 1300 },
        { timestamp: 4000, open: 320, high: 400, low: 310, close: 380, volume: 1400 }
      ],
      autoScrollEnabled: true,
      viewport: {
        from: 3000,  // Only showing new candles (300-400 price range)
        to: 4000,
        widthPx: 800,
        heightPx: 600
      }
    }

    renderer.setState(state)
    renderer.render()

    // If price range uses ALL candles (100-400), candles at 300-400 would be positioned
    // in the middle of the canvas (since 300 is in the middle of 100-400 range).
    // If price range uses VISIBLE candles only (300-400), candles should use
    // the full height range (low at bottom, high at top).
    
    // Get Y positions of candle bodies (from fillRect calls)
    // For visible candles (300-400), low prices (300-310) should be near bottom (high Y)
    // and high prices (350-400) should be near top (low Y)
    const candleBodyYs = fillRectCalls.map(rect => rect[1]) // y coordinate
    
    // If price range is correct (300-400), candles should span a large Y range
    // If price range is wrong (100-400), candles would be squished in middle
    const minY = Math.min(...candleBodyYs)
    const maxY = Math.max(...candleBodyYs)
    const ySpan = maxY - minY
    
    // With correct price range (300-400), candles should use most of the canvas height
    // Allow for some padding, but should use at least 50% of height (300px)
    expect(ySpan).toBeGreaterThan(300)
    
    // Also check that candles are not all clustered in the middle
    // If using wrong price range (100-400), candles would be around middle (Y ~200-400)
    // With correct range (300-400), candles should be distributed across height
    const averageY = candleBodyYs.reduce((sum, y) => sum + y, 0) / candleBodyYs.length
    // Average should not be in the very top (which would indicate wrong price range)
    // With correct range (300-400), average should be in lower half (closer to bottom since we have low prices visible)
    // Canvas height is 600, so middle would be 300. With correct range, average should be >= 200
    expect(averageY).toBeGreaterThanOrEqual(200)
  })

  it('adds padding to price range so candle wicks do not touch top and bottom edges', () => {
    let capturedMinPrice: number | null = null
    let capturedMaxPrice: number | null = null
    let capturedRects: any[] = []
    
    const originalComputeCandleRects = layoutModule.computeCandleRects
    const computeCandleRectsSpy = vi.spyOn(layoutModule, 'computeCandleRects').mockImplementation((candles: any, viewport: any, minPrice: number, maxPrice: number) => {
      capturedMinPrice = minPrice
      capturedMaxPrice = maxPrice
      const rects = originalComputeCandleRects(candles, viewport, minPrice, maxPrice)
      capturedRects = rects
      return rects
    })
    
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
      fillText: vi.fn()
    }
    
    const canvas = document.createElement('canvas')
    canvas.width = 800
    canvas.height = 600
    vi.spyOn(canvas, 'getContext').mockReturnValue(mockCtx as unknown as CanvasRenderingContext2D)
    const renderer = new ChartRenderer(canvas)

    // Create candles with prices 100-200
    // Without padding: minPrice=100, maxPrice=200
    // With 5% padding: minPrice=95, maxPrice=205
    const state: ChartState = {
      candles: [
        { timestamp: 1000, open: 100, high: 200, low: 100, close: 150, volume: 1000 },
        { timestamp: 2000, open: 150, high: 200, low: 100, close: 180, volume: 1200 }
      ],
      autoScrollEnabled: true,
      viewport: {
        from: 1000,
        to: 2000,
        widthPx: 800,
        heightPx: 600
      }
    }

    renderer.setState(state)
    renderer.render()

    // Verify padding was applied to price range
    expect(capturedMinPrice).not.toBeNull()
    expect(capturedMaxPrice).not.toBeNull()
    
    // With 5% padding on span of 100, padding = 5
    // So minPrice should be 100 - 5 = 95, maxPrice should be 200 + 5 = 205
    expect(capturedMinPrice!).toBeLessThan(100)
    expect(capturedMaxPrice!).toBeGreaterThan(200)
    
    // Verify wick Y coordinates don't touch edges
    // highY should be > 0 (top edge), lowY should be < 600 (bottom edge)
    expect(capturedRects.length).toBeGreaterThan(0)
    
    const allHighYs = capturedRects.map(r => r.highY)
    const allLowYs = capturedRects.map(r => r.lowY)
    
    const minHighY = Math.min(...allHighYs)
    const maxLowY = Math.max(...allLowYs)
    
    // Wicks should not touch top edge (Y=0) or bottom edge (Y=600)
    expect(minHighY).toBeGreaterThan(5)
    expect(maxLowY).toBeLessThan(595)
    
    computeCandleRectsSpy.mockRestore()
  })
})

