import type { ChartState } from '../core/state'
import type { Viewport } from '../core/viewport'
import { computeCandleRects } from './layout'

export class ChartRenderer {
  private canvas: HTMLCanvasElement | null = null
  private state: ChartState | null = null
  private viewport: Viewport | null = null

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas
  }

  setState(state: ChartState): void {
    this.state = state
  }

  resize(width: number, height: number): void {
    if (!this.canvas) return
    this.canvas.width = width
    this.canvas.height = height
    if (this.viewport) {
      this.viewport.widthPx = width
      this.viewport.heightPx = height
    }
  }

  render(): void {
    if (!this.canvas || !this.state || !this.viewport) return

    const ctx = this.canvas.getContext('2d')
    if (!ctx) return

    ctx.clearRect(0, 0, this.canvas.width, this.canvas.height)

    this.drawBackground(ctx)
    this.drawGrid(ctx)
    this.drawCandles(ctx)
    this.drawAxes(ctx)
  }

  setViewport(viewport: Viewport): void {
    this.viewport = viewport
  }

  private drawBackground(ctx: CanvasRenderingContext2D): void {
    ctx.fillStyle = '#ffffff'
    ctx.fillRect(0, 0, this.canvas!.width, this.canvas!.height)
  }

  private drawGrid(ctx: CanvasRenderingContext2D): void {
    if (!this.viewport) return

    ctx.strokeStyle = '#e0e0e0'
    ctx.lineWidth = 1

    const gridLines = 5
    for (let i = 0; i <= gridLines; i++) {
      const y = (this.viewport.heightPx / gridLines) * i
      ctx.beginPath()
      ctx.moveTo(0, y)
      ctx.lineTo(this.viewport.widthPx, y)
      ctx.stroke()
    }

    for (let i = 0; i <= gridLines; i++) {
      const x = (this.viewport.widthPx / gridLines) * i
      ctx.beginPath()
      ctx.moveTo(x, 0)
      ctx.lineTo(x, this.viewport.heightPx)
      ctx.stroke()
    }
  }

  private drawCandles(ctx: CanvasRenderingContext2D): void {
    if (!this.state || !this.viewport) return

    const candles = this.state.candles
    if (candles.length === 0) return

    const minPrice = Math.min(...candles.map(c => c.low))
    const maxPrice = Math.max(...candles.map(c => c.high))

    const rects = computeCandleRects(candles, this.viewport, minPrice, maxPrice)

    for (const rect of rects) {
      ctx.fillStyle = rect.isUp ? '#26a69a' : '#ef5350'
      ctx.fillRect(rect.x, rect.y, rect.w, rect.h)
    }
  }

  private drawAxes(ctx: CanvasRenderingContext2D): void {
    if (!this.viewport) return

    ctx.strokeStyle = '#000000'
    ctx.lineWidth = 2
    ctx.font = '12px sans-serif'
    ctx.fillStyle = '#000000'

    ctx.beginPath()
    ctx.moveTo(0, this.viewport.heightPx)
    ctx.lineTo(this.viewport.widthPx, this.viewport.heightPx)
    ctx.stroke()

    ctx.beginPath()
    ctx.moveTo(0, 0)
    ctx.lineTo(0, this.viewport.heightPx)
    ctx.stroke()
  }
}
