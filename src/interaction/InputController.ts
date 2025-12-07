import type { ChartState } from '../core/state'
import { panViewport, zoomViewport, xToTime } from '../core/viewport'

export class InputController {
  private isDragging = false
  private lastX = 0

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
    this.isDragging = true
    this.lastX = e.clientX
  }

  private handlePointerMove(e: PointerEvent): void {
    const state = this.getState()
    const rect = this.canvas.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top

    this.updateState({
      crosshair: { x, y }
    })

    if (this.isDragging && state.viewport) {
      const deltaX = e.clientX - this.lastX
      const newViewport = panViewport(state.viewport, deltaX)
      this.updateState({ viewport: newViewport })
      this.lastX = e.clientX
    }
  }

  private handlePointerUp(): void {
    this.isDragging = false
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
}
