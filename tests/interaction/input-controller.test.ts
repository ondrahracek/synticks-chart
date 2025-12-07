import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { InputController } from '../../src/interaction/InputController'
import type { ChartState } from '../../src/core/state'
import type { Viewport } from '../../src/core/viewport'
import { createChartState } from '../../src/core/state'

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
})

