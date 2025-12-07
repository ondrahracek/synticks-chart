import type { ChartState } from '../core/state'
import { panViewport, zoomViewport, xToTime, yToPrice } from '../core/viewport'
import { startDrawing, updateDrawing, finishDrawing } from '../core/drawings'

export class InputController {
  private isDragging = false
  private lastX = 0
  private currentDrawing: { kind: 'trendline' | 'horizontal'; startPoint: { time: number; price: number } } | null = null

  constructor(
    private canvas: HTMLCanvasElement,
    private getState: () => ChartState,
    private updateState: (partial: Partial<ChartState>) => void
  ) {
    this.attachListeners()
  }

  private attachListeners(): void {
    this.canvas.addEventListener('pointerdown', this.handlePointerDown.bind(this))
    this.canvas.addEventListener('pointermove', this.handlePointerMove.bind(this))
    this.canvas.addEventListener('pointerup', this.handlePointerUp.bind(this))
    this.canvas.addEventListener('wheel', this.handleWheel.bind(this))
  }

  private handlePointerDown(e: PointerEvent): void {
    const state = this.getState()
    const mode = state.interactionMode || 'pan'

    if (mode === 'pan') {
      this.isDragging = true
      this.lastX = e.clientX
    } else if (mode === 'draw-trendline' || mode === 'draw-horizontal') {
      const point = this.screenToPoint(e.clientX, e.clientY, state)
      if (point && state.viewport) {
        this.currentDrawing = {
          kind: mode === 'draw-trendline' ? 'trendline' : 'horizontal',
          startPoint: point
        }
      }
    }
  }

  private handlePointerMove(e: PointerEvent): void {
    const state = this.getState()
    const rect = this.canvas.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top

    this.updateState({
      crosshair: { x, y }
    })

    const mode = state.interactionMode || 'pan'
    if (mode === 'pan' && this.isDragging && state.viewport) {
      const deltaX = e.clientX - this.lastX
      const newViewport = panViewport(state.viewport, deltaX)
      this.updateState({ viewport: newViewport })
      this.lastX = e.clientX
    }
  }

  private handlePointerUp(e: PointerEvent): void {
    const state = this.getState()
    const mode = state.interactionMode || 'pan'

    if (mode === 'pan') {
      this.isDragging = false
    } else if (this.currentDrawing && (mode === 'draw-trendline' || mode === 'draw-horizontal')) {
      const endPoint = this.screenToPoint(e.clientX, e.clientY, state)
      if (endPoint && state.viewport) {
        const candles = state.candles || []
        const minPrice = candles.length > 0 ? Math.min(...candles.map(c => c.low)) : 0
        const maxPrice = candles.length > 0 ? Math.max(...candles.map(c => c.high)) : 100

        let shape = startDrawing(this.currentDrawing.kind, this.currentDrawing.startPoint)
        
        if (this.currentDrawing.kind === 'horizontal') {
          endPoint.price = this.currentDrawing.startPoint.price
        }
        
        shape = updateDrawing(shape, endPoint)
        shape = finishDrawing(shape)

        const drawings = state.drawings || []
        this.updateState({
          drawings: [...drawings, shape]
        })
        this.currentDrawing = null
      }
    }
  }

  private handleWheel(e: WheelEvent): void {
    e.preventDefault()
    const state = this.getState()
    if (!state.viewport) return

    const rect = this.canvas.getBoundingClientRect()
    const offsetX = e.clientX - rect.left
    const anchorTime = xToTime(offsetX, state.viewport)

    const zoomFactor = e.deltaY > 0 ? 1.1 : 0.9
    const newViewport = zoomViewport(state.viewport, zoomFactor, anchorTime)
    this.updateState({ viewport: newViewport })
  }

  private screenToPoint(clientX: number, clientY: number, state: ChartState): { time: number; price: number } | null {
    if (!state.viewport) return null

    const rect = this.canvas.getBoundingClientRect()
    const x = clientX - rect.left
    const y = clientY - rect.top

    const time = xToTime(x, state.viewport)

    const candles = state.candles || []
    const minPrice = candles.length > 0 ? Math.min(...candles.map(c => c.low)) : 0
    const maxPrice = candles.length > 0 ? Math.max(...candles.map(c => c.high)) : 100

    const price = yToPrice(y, state.viewport, minPrice, maxPrice)

    return { time, price }
  }
}
