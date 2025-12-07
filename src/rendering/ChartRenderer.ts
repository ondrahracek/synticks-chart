import type { ChartState } from '../core/state'
import type { Viewport } from '../core/viewport'
import { computeCandleRects } from './layout'
import { timeToX, priceToY } from '../core/viewport'

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
    if (!this.canvas || !this.state) return

    if (this.state.viewport) {
      this.viewport = this.state.viewport
    }

    if (!this.viewport) return

    const ctx = this.canvas.getContext('2d')
    if (!ctx) return

    ctx.clearRect(0, 0, this.canvas.width, this.canvas.height)

    this.drawBackground(ctx)
    this.drawGrid(ctx)
    this.drawCandles(ctx)
    this.drawDrawings(ctx)
    this.drawAxes(ctx)
  }

  setViewport(viewport: Viewport): void {
    this.viewport = viewport
  }

  private getThemeColor(key: keyof NonNullable<ChartState['theme']>, fallback: string): string {
    return this.state?.theme?.[key] || fallback
  }

  private drawBackground(ctx: CanvasRenderingContext2D): void {
    ctx.fillStyle = this.getThemeColor('background', '#ffffff')
    ctx.fillRect(0, 0, this.canvas!.width, this.canvas!.height)
  }

  private drawGrid(ctx: CanvasRenderingContext2D): void {
    if (!this.viewport) return

    ctx.strokeStyle = this.getThemeColor('grid', '#e0e0e0')
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

    const candleUpColor = this.getThemeColor('candleUp', '#26a69a')
    const candleDownColor = this.getThemeColor('candleDown', '#ef5350')

    for (const rect of rects) {
      const centerX = rect.x + rect.w / 2
      
      ctx.strokeStyle = rect.isUp ? candleUpColor : candleDownColor
      ctx.lineWidth = 1
      ctx.beginPath()
      ctx.moveTo(centerX, rect.lowY)
      ctx.lineTo(centerX, rect.highY)
      ctx.stroke()
      
      ctx.fillStyle = rect.isUp ? candleUpColor : candleDownColor
      ctx.fillRect(rect.x, rect.y, rect.w, rect.h)
    }
  }

  private drawDrawings(ctx: CanvasRenderingContext2D): void {
    if (!this.state || !this.viewport) return

    const drawings = this.state.drawings || []
    if (drawings.length === 0) return

    const candles = this.state.candles || []
    const minPrice = candles.length > 0 ? Math.min(...candles.map(c => c.low)) : 0
    const maxPrice = candles.length > 0 ? Math.max(...candles.map(c => c.high)) : 100

    ctx.strokeStyle = this.getThemeColor('drawing', '#2196F3')
    ctx.lineWidth = 2

    for (const drawing of drawings) {
      if (drawing.points.length < 2) continue

      const x1 = timeToX(drawing.points[0].time, this.viewport)
      const y1 = priceToY(drawing.points[0].price, this.viewport, minPrice, maxPrice)
      const x2 = timeToX(drawing.points[drawing.points.length - 1].time, this.viewport)
      const y2 = priceToY(drawing.points[drawing.points.length - 1].price, this.viewport, minPrice, maxPrice)

      ctx.beginPath()
      ctx.moveTo(x1, y1)
      ctx.lineTo(x2, y2)
      ctx.stroke()
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
