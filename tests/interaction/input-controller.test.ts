import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { InputController } from '../../src/interaction/InputController'
import type { ChartState } from '../../src/core/state'
import type { Viewport } from '../../src/core/viewport'
import { createChartState } from '../../src/core/state'
import { AutoScrollController } from '../../src/core/auto-scroll'

describe('InputController', () => {
  let canvas: HTMLCanvasElement
  let getState: () => ChartState
  let updateState: (partial: Partial<ChartState>) => void
  let controller: InputController

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
    if (document.body) {
      document.body.appendChild(canvas)
    }

    const state: ChartState = {
      ...createChartState(),
      viewport: {
        from: 1000,
        to: 2000,
        widthPx: 800,
        heightPx: 600
      }
    }

    getState = vi.fn(() => state)
    updateState = vi.fn()
  })

  afterEach(() => {
    if (canvas && document.body && document.body.contains(canvas)) {
      document.body.removeChild(canvas)
    }
  })

  it('pans viewport when pointer is dragged', () => {
    controller = new InputController(canvas, getState, updateState)

    const pointerDown = new PointerEvent('pointerdown', {
      clientX: 100,
      clientY: 100,
      pointerId: 1
    })
    canvas.dispatchEvent(pointerDown)

    const pointerMove = new PointerEvent('pointermove', {
      clientX: 150,
      clientY: 100,
      pointerId: 1
    })
    canvas.dispatchEvent(pointerMove)

    expect(updateState).toHaveBeenCalled()
    const calls = updateState.mock.calls
    const viewportCall = calls.find(call => call[0].viewport)
    expect(viewportCall).toBeDefined()
    expect(viewportCall![0].viewport?.from).not.toBe(1000)
  })

  it('zooms viewport when wheel event occurs', () => {
    controller = new InputController(canvas, getState, updateState)

    const wheelEvent = new WheelEvent('wheel', {
      deltaY: 100,
      clientX: 400,
      clientY: 300
    })
    canvas.dispatchEvent(wheelEvent)

    expect(updateState).toHaveBeenCalled()
    const call = updateState.mock.calls[0][0]
    expect(call.viewport).toBeDefined()
    const originalSpan = 2000 - 1000
    const newSpan = (call.viewport as Viewport).to - (call.viewport as Viewport).from
    expect(newSpan).toBeLessThan(originalSpan)
  })

  it('updates crosshair on pointer move', () => {
    controller = new InputController(canvas, getState, updateState)

    const pointerMove = new PointerEvent('pointermove', {
      clientX: 200,
      clientY: 300
    })
    canvas.dispatchEvent(pointerMove)

    expect(updateState).toHaveBeenCalled()
    const call = updateState.mock.calls[0][0]
    expect(call.crosshair).toBeDefined()
    expect(call.crosshair?.x).toBe(200)
    expect(call.crosshair?.y).toBe(300)
  })

  it('creates drawing when in draw-trendline mode', () => {
    const state: ChartState = {
      ...createChartState(),
      viewport: {
        from: 1000,
        to: 2000,
        widthPx: 800,
        heightPx: 600
      },
      interactionMode: 'draw-trendline',
      drawings: []
    }

    getState = vi.fn(() => state)
    controller = new InputController(canvas, getState, updateState)

    const pointerDown = new PointerEvent('pointerdown', {
      clientX: 100,
      clientY: 200,
      pointerId: 1
    })
    canvas.dispatchEvent(pointerDown)

    const pointerUp = new PointerEvent('pointerup', {
      clientX: 300,
      clientY: 400,
      pointerId: 1
    })
    canvas.dispatchEvent(pointerUp)

    expect(updateState).toHaveBeenCalled()
    const calls = updateState.mock.calls
    const drawingsCall = calls.find(call => call[0].drawings !== undefined)
    expect(drawingsCall).toBeDefined()
    expect(drawingsCall![0].drawings).toHaveLength(1)
    expect(drawingsCall![0].drawings![0].kind).toBe('trendline')
  })

  it('updates currentDrawing in state during pointer move when drawing', () => {
    const state: ChartState = {
      ...createChartState(),
      viewport: {
        from: 1000,
        to: 2000,
        widthPx: 800,
        heightPx: 600
      },
      interactionMode: 'draw-trendline',
      candles: [
        { timestamp: 1000, open: 100, high: 105, low: 99, close: 103, volume: 1000 }
      ],
      drawings: []
    }

    getState = vi.fn(() => state)
    controller = new InputController(canvas, getState, updateState)

    const pointerDown = new PointerEvent('pointerdown', {
      clientX: 100,
      clientY: 200,
      pointerId: 1
    })
    canvas.dispatchEvent(pointerDown)

    const pointerMove = new PointerEvent('pointermove', {
      clientX: 300,
      clientY: 400,
      pointerId: 1
    })
    canvas.dispatchEvent(pointerMove)

    expect(updateState).toHaveBeenCalled()
    const calls = updateState.mock.calls
    const currentDrawingCall = calls.find(call => call[0].currentDrawing !== undefined)
    expect(currentDrawingCall).toBeDefined()
    expect(currentDrawingCall![0].currentDrawing?.kind).toBe('trendline')
    expect(currentDrawingCall![0].currentDrawing?.points.length).toBe(2)
  })

  it('panning left disables autoScrollEnabled', () => {
    const state: ChartState = {
      ...createChartState(),
      viewport: {
        from: 1000,
        to: 2000,
        widthPx: 800,
        heightPx: 600
      },
      candles: [
        { timestamp: 1000, open: 100, high: 105, low: 99, close: 103, volume: 1000 },
        { timestamp: 2000, open: 103, high: 107, low: 102, close: 106, volume: 1200 },
        { timestamp: 3000, open: 106, high: 108, low: 104, close: 105, volume: 1100 }
      ]
    }
    getState = vi.fn(() => state)
    updateState = vi.fn()
    const autoScrollController = new AutoScrollController(state)
    controller = new InputController(canvas, getState, updateState, autoScrollController)

    const pointerDown = new PointerEvent('pointerdown', {
      clientX: 400,
      clientY: 300,
      pointerId: 1
    })
    canvas.dispatchEvent(pointerDown)

    const pointerMove = new PointerEvent('pointermove', {
      clientX: 450,
      clientY: 300,
      pointerId: 1
    })
    canvas.dispatchEvent(pointerMove)

    expect(updateState).toHaveBeenCalled()
    const calls = updateState.mock.calls
    const stateUpdate = calls.find(call => call[0].autoScrollEnabled !== undefined)
    expect(stateUpdate).toBeDefined()
    expect(stateUpdate![0].autoScrollEnabled).toBe(false)
  })

  it('panning right checks and re-enables autoScroll if at latest', () => {
    const state: ChartState = {
      ...createChartState(),
      viewport: {
        from: 2000,
        to: 3200,
        widthPx: 800,
        heightPx: 600
      },
      candles: [
        { timestamp: 1000, open: 100, high: 105, low: 99, close: 103, volume: 1000 },
        { timestamp: 2000, open: 103, high: 107, low: 102, close: 106, volume: 1200 },
        { timestamp: 3000, open: 106, high: 108, low: 104, close: 105, volume: 1100 }
      ],
      autoScrollEnabled: false
    }
    getState = vi.fn(() => state)
    updateState = vi.fn()
    const autoScrollController = new AutoScrollController(state)
    controller = new InputController(canvas, getState, updateState, autoScrollController)

    const pointerDown = new PointerEvent('pointerdown', {
      clientX: 400,
      clientY: 300,
      pointerId: 1
    })
    canvas.dispatchEvent(pointerDown)

    const pointerMove = new PointerEvent('pointermove', {
      clientX: 350,
      clientY: 300,
      pointerId: 1
    })
    canvas.dispatchEvent(pointerMove)

    expect(updateState).toHaveBeenCalled()
    const calls = updateState.mock.calls
    const stateUpdate = calls.find(call => call[0].autoScrollEnabled === true)
    expect(stateUpdate).toBeDefined()
  })

  it('zooming out checks and updates autoScroll state', () => {
    const state: ChartState = {
      ...createChartState(),
      viewport: {
        from: 2000,
        to: 3200,
        widthPx: 800,
        heightPx: 600
      },
      candles: [
        { timestamp: 1000, open: 100, high: 105, low: 99, close: 103, volume: 1000 },
        { timestamp: 2000, open: 103, high: 107, low: 102, close: 106, volume: 1200 },
        { timestamp: 3000, open: 106, high: 108, low: 104, close: 105, volume: 1100 }
      ],
      autoScrollEnabled: false
    }
    getState = vi.fn(() => state)
    updateState = vi.fn()
    const autoScrollController = new AutoScrollController(state)
    controller = new InputController(canvas, getState, updateState, autoScrollController)

    const wheelEvent = new WheelEvent('wheel', {
      deltaY: -100,
      clientX: 400,
      clientY: 300
    })
    canvas.dispatchEvent(wheelEvent)

    expect(updateState).toHaveBeenCalled()
    const calls = updateState.mock.calls
    const viewportCall = calls.find(call => call[0].viewport)
    expect(viewportCall).toBeDefined()
  })

  it('touch pinch zoom updates autoScroll state', () => {
    const state: ChartState = {
      ...createChartState(),
      viewport: {
        from: 2000,
        to: 3200,
        widthPx: 800,
        heightPx: 600
      },
      candles: [
        { timestamp: 1000, open: 100, high: 105, low: 99, close: 103, volume: 1000 },
        { timestamp: 2000, open: 103, high: 107, low: 102, close: 106, volume: 1200 },
        { timestamp: 3000, open: 106, high: 108, low: 104, close: 105, volume: 1100 }
      ],
      autoScrollEnabled: false
    }
    getState = vi.fn(() => state)
    updateState = vi.fn()
    const autoScrollController = new AutoScrollController(state)
    controller = new InputController(canvas, getState, updateState, autoScrollController)

    const touchStart = new TouchEvent('touchstart', {
      touches: [
        { clientX: 200, clientY: 300 } as Touch,
        { clientX: 400, clientY: 300 } as Touch
      ]
    })
    canvas.dispatchEvent(touchStart)

    const touchMove = new TouchEvent('touchmove', {
      touches: [
        { clientX: 150, clientY: 300 } as Touch,
        { clientX: 450, clientY: 300 } as Touch
      ]
    })
    canvas.dispatchEvent(touchMove)

    expect(updateState).toHaveBeenCalled()
    const calls = updateState.mock.calls
    const viewportCall = calls.find(call => call[0].viewport)
    expect(viewportCall).toBeDefined()
  })
})

