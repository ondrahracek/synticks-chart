import type { ChartState } from '../core/state'
import { panViewport, zoomViewport, zoomViewportWithBounds, xToTime, yToPrice, getDataTimeRange, filterCandlesByViewport, addPricePadding, type Viewport } from '../core/viewport'
import { startDrawing, updateDrawing, finishDrawing } from '../core/drawings'
import type { AutoScrollController } from '../core/auto-scroll'
import { safeMinOf, safeMaxOf } from '../core/utils'

export class InputController {
  private isDragging = false
  private lastX = 0
  private currentDrawing: { kind: 'trendline' | 'horizontal'; startPoint: { time: number; price: number } } | null = null
  private lastPinchDistance: number | null = null

  constructor(
    private canvas: HTMLCanvasElement,
    private getState: () => ChartState,
    private updateState: (partial: Partial<ChartState>) => void,
    private autoScrollController?: AutoScrollController
  ) {
    this.attachListeners()
  }

  private attachListeners(): void {
    this.canvas.addEventListener('pointerdown', this.handlePointerDown.bind(this))
    this.canvas.addEventListener('pointermove', this.handlePointerMove.bind(this))
    this.canvas.addEventListener('pointerup', this.handlePointerUp.bind(this))
    this.canvas.addEventListener('wheel', this.handleWheel.bind(this))
    this.canvas.addEventListener('touchstart', this.handleTouchStart.bind(this))
    this.canvas.addEventListener('touchmove', this.handleTouchMove.bind(this))
    this.canvas.addEventListener('touchend', this.handleTouchEnd.bind(this))
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
      
      if (deltaX > 0 && this.autoScrollController) {
        this.autoScrollController.disableAutoScroll()
        this.updateState({ viewport: newViewport, autoScrollEnabled: false })
      } else if (deltaX < 0 && this.autoScrollController && state.candles) {
        this.autoScrollController.updateAutoScrollState(newViewport, state.candles)
        if (state.autoScrollEnabled) {
          this.updateState({ viewport: newViewport, autoScrollEnabled: true })
        } else {
          this.updateState({ viewport: newViewport })
        }
      } else {
        this.updateState({ viewport: newViewport })
      }
      
      this.lastX = e.clientX
    } else if (this.currentDrawing && (mode === 'draw-trendline' || mode === 'draw-horizontal')) {
      const endPoint = this.screenToPoint(e.clientX, e.clientY, state)
      if (endPoint && state.viewport) {
        let shape = startDrawing(this.currentDrawing.kind, this.currentDrawing.startPoint)
        
        if (this.currentDrawing.kind === 'horizontal') {
          endPoint.price = this.currentDrawing.startPoint.price
        }
        
        shape = updateDrawing(shape, endPoint)
        this.updateState({ currentDrawing: shape })
      }
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
        const visibleCandles = filterCandlesByViewport(candles, state.viewport)
        const rawMinPrice = visibleCandles.length > 0 ? safeMinOf(visibleCandles, c => c.low) : (candles.length > 0 ? safeMinOf(candles, c => c.low) : 0)
        const rawMaxPrice = visibleCandles.length > 0 ? safeMaxOf(visibleCandles, c => c.high) : (candles.length > 0 ? safeMaxOf(candles, c => c.high) : 100)
        const { minPrice, maxPrice } = addPricePadding(rawMinPrice, rawMaxPrice)

        let shape = startDrawing(this.currentDrawing.kind, this.currentDrawing.startPoint)
        
        if (this.currentDrawing.kind === 'horizontal') {
          endPoint.price = this.currentDrawing.startPoint.price
        }
        
        shape = updateDrawing(shape, endPoint)
        shape = finishDrawing(shape)

        const drawings = state.drawings || []
        this.updateState({
          drawings: [...drawings, shape],
          currentDrawing: undefined
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
    
    const candles = state.candles || []
    const dataRange = getDataTimeRange(candles)
    
    let newViewport: Viewport
    if (dataRange) {
      newViewport = zoomViewportWithBounds(
        state.viewport,
        zoomFactor,
        anchorTime,
        dataRange.minTime,
        dataRange.maxTime,
        candles
      )
    } else {
      newViewport = zoomViewport(state.viewport, zoomFactor, anchorTime)
    }

    if (this.autoScrollController && candles.length > 0) {
      this.autoScrollController.updateAutoScrollState(newViewport, candles)
      if (state.autoScrollEnabled) {
        this.updateState({ viewport: newViewport, autoScrollEnabled: true })
      } else {
        this.updateState({ viewport: newViewport })
      }
    } else {
      this.updateState({ viewport: newViewport })
    }
  }

  private screenToPoint(clientX: number, clientY: number, state: ChartState): { time: number; price: number } | null {
    if (!state.viewport) return null

    const rect = this.canvas.getBoundingClientRect()
    const x = clientX - rect.left
    const y = clientY - rect.top

    const time = xToTime(x, state.viewport)

    const candles = state.candles || []
    const visibleCandles = filterCandlesByViewport(candles, state.viewport)
    const rawMinPrice = visibleCandles.length > 0 ? safeMinOf(visibleCandles, c => c.low) : (candles.length > 0 ? safeMinOf(candles, c => c.low) : 0)
    const rawMaxPrice = visibleCandles.length > 0 ? safeMaxOf(visibleCandles, c => c.high) : (candles.length > 0 ? safeMaxOf(candles, c => c.high) : 100)
    const { minPrice, maxPrice } = addPricePadding(rawMinPrice, rawMaxPrice)

    const price = yToPrice(y, state.viewport, minPrice, maxPrice)

    return { time, price }
  }

  private handleTouchStart(e: TouchEvent): void {
    e.preventDefault()
    if (e.touches.length === 1) {
      const touch = e.touches[0]
      const state = this.getState()
      const rect = this.canvas.getBoundingClientRect()
      const x = touch.clientX - rect.left
      const y = touch.clientY - rect.top

      this.updateState({
        crosshair: { x, y }
      })
    } else if (e.touches.length === 2) {
      const touch1 = e.touches[0]
      const touch2 = e.touches[1]
      this.lastPinchDistance = Math.hypot(
        touch2.clientX - touch1.clientX,
        touch2.clientY - touch1.clientY
      )
    }
  }

  private handleTouchMove(e: TouchEvent): void {
    e.preventDefault()
    const state = this.getState()
    
    if (e.touches.length === 1) {
      const touch = e.touches[0]
      const rect = this.canvas.getBoundingClientRect()
      const x = touch.clientX - rect.left
      const y = touch.clientY - rect.top

      this.updateState({
        crosshair: { x, y }
      })
    } else if (e.touches.length === 2 && state.viewport) {
      const touch1 = e.touches[0]
      const touch2 = e.touches[1]
      const distance = Math.hypot(
        touch2.clientX - touch1.clientX,
        touch2.clientY - touch1.clientY
      )

      if (this.lastPinchDistance !== null) {
        const scale = distance / this.lastPinchDistance
        const centerX = (touch1.clientX + touch2.clientX) / 2
        const rect = this.canvas.getBoundingClientRect()
        const offsetX = centerX - rect.left
        const anchorTime = xToTime(offsetX, state.viewport)
        
        const candles = state.candles || []
        const dataRange = getDataTimeRange(candles)
        
        let newViewport: Viewport
        if (dataRange) {
          newViewport = zoomViewportWithBounds(
            state.viewport,
            scale,
            anchorTime,
            dataRange.minTime,
            dataRange.maxTime,
            candles
          )
        } else {
          newViewport = zoomViewport(state.viewport, scale, anchorTime)
        }

        if (this.autoScrollController && candles.length > 0) {
          this.autoScrollController.updateAutoScrollState(newViewport, candles)
          if (state.autoScrollEnabled) {
            this.updateState({ viewport: newViewport, autoScrollEnabled: true })
          } else {
            this.updateState({ viewport: newViewport })
          }
        } else {
          this.updateState({ viewport: newViewport })
        }
      }
      this.lastPinchDistance = distance
    }
  }

  private handleTouchEnd(e: TouchEvent): void {
    if (e.touches.length === 0) {
      this.lastPinchDistance = null
    }
  }
}
