import { describe, it, expect, beforeEach, vi } from 'vitest'
import { InputController } from '../../src/interaction/InputController'
import type { ChartState } from '../../src/core/state'
import { createChartState } from '../../src/core/state'

class MockTouch {
  identifier: number
  target: EventTarget
  clientX: number
  clientY: number

  constructor(options: { identifier: number; target: EventTarget; clientX: number; clientY: number }) {
    this.identifier = options.identifier
    this.target = options.target
    this.clientX = options.clientX
    this.clientY = options.clientY
  }
}

global.Touch = MockTouch as any

describe('InputController - Mobile', () => {
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

  it('handles touchstart for crosshair', () => {
    controller = new InputController(canvas, getState, updateState)

    const touchEvent = new TouchEvent('touchstart', {
      touches: [new MockTouch({ identifier: 1, target: canvas, clientX: 200, clientY: 300 })] as any
    })
    canvas.dispatchEvent(touchEvent)

    expect(updateState).toHaveBeenCalled()
    const call = updateState.mock.calls.find(c => c[0].crosshair)
    expect(call).toBeDefined()
    expect(call![0].crosshair?.x).toBe(200)
    expect(call![0].crosshair?.y).toBe(300)
  })

  it('handles pinch zoom with two touches', () => {
    controller = new InputController(canvas, getState, updateState)

    const touch1 = new MockTouch({ identifier: 1, target: canvas, clientX: 200, clientY: 300 })
    const touch2 = new MockTouch({ identifier: 2, target: canvas, clientX: 400, clientY: 300 })

    const touchStart = new TouchEvent('touchstart', {
      touches: [touch1, touch2] as any
    })
    canvas.dispatchEvent(touchStart)

    const touchMove = new TouchEvent('touchmove', {
      touches: [
        new MockTouch({ identifier: 1, target: canvas, clientX: 150, clientY: 300 }),
        new MockTouch({ identifier: 2, target: canvas, clientX: 450, clientY: 300 })
      ] as any
    })
    canvas.dispatchEvent(touchMove)

    expect(updateState).toHaveBeenCalled()
  })
})

