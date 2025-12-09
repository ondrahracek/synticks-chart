import type { ChartState } from '../core/state'
import type { Viewport } from '../core/viewport'
import { computeCandleRects } from './layout'
import { timeToX, priceToY, filterCandlesByViewport, addPricePadding } from '../core/viewport'
import { calculatePriceInterval, generatePriceLevels, calculateTimeInterval, generateTimeLevels, formatPrice, formatTime, calculateOptimalLineCount } from '../core/grid'
import { getDefaultLabelPadding } from './padding'

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

  getState(): ChartState | null {
    return this.state
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
    
    const { offsetX, offsetY } = this.getPaddingOffsets()
    if (this.state.layout?.labelPadding?.enabled) {
      ctx.save()
      ctx.beginPath()
      ctx.rect(offsetX, offsetY, this.viewport.widthPx, this.viewport.heightPx)
      ctx.clip()
    }
    
    this.drawGridLines(ctx)
    this.drawCandles(ctx)
    this.drawIndicators(ctx)
    this.drawDrawings(ctx)
    
    if (this.state.layout?.labelPadding?.enabled) {
      ctx.restore()
    }
    
    this.drawGridLabels(ctx)
    this.drawAxes(ctx)
  }

  setViewport(viewport: Viewport): void {
    this.viewport = viewport
  }

  private getThemeColor(key: keyof NonNullable<ChartState['theme']>, fallback: string): string {
    return this.state?.theme?.[key] || fallback
  }

  private getPaddingOffsets(): { offsetX: number; offsetY: number } {
    if (!this.state?.layout?.labelPadding?.enabled) {
      return { offsetX: 0, offsetY: 0 }
    }
    
    const padding = getDefaultLabelPadding()
    const leftPadding = this.state.layout.labelPadding.left ?? padding.left
    const bottomPadding = this.state.layout.labelPadding.bottom ?? padding.bottom
    
    return {
      offsetX: leftPadding,
      offsetY: 0
    }
  }

  private drawBackground(ctx: CanvasRenderingContext2D): void {
    ctx.fillStyle = this.getThemeColor('background', '#ffffff')
    ctx.fillRect(0, 0, this.canvas!.width, this.canvas!.height)
  }

  private drawGridLines(ctx: CanvasRenderingContext2D): void {
    if (!this.viewport) return

    const { offsetX, offsetY } = this.getPaddingOffsets()

    ctx.strokeStyle = this.getThemeColor('grid', '#e0e0e0')
    ctx.lineWidth = 1

    const candles = this.state?.candles || []
    if (candles.length > 0) {
      const visibleCandles = filterCandlesByViewport(candles, this.viewport)
      const rawMinPrice = visibleCandles.length > 0 ? Math.min(...visibleCandles.map(c => c.low)) : Math.min(...candles.map(c => c.low))
      const rawMaxPrice = visibleCandles.length > 0 ? Math.max(...visibleCandles.map(c => c.high)) : Math.max(...candles.map(c => c.high))
      const { minPrice, maxPrice } = addPricePadding(rawMinPrice, rawMaxPrice)
      const priceSpan = maxPrice - minPrice
      
      const targetLines = calculateOptimalLineCount(priceSpan, this.viewport.heightPx, 50)
      const interval = calculatePriceInterval(minPrice, maxPrice, targetLines)
      const priceLevels = generatePriceLevels(minPrice, maxPrice, interval)
      
      for (const price of priceLevels) {
        const y = priceToY(price, this.viewport, minPrice, maxPrice) + offsetY
        ctx.beginPath()
        ctx.moveTo(offsetX, y)
        ctx.lineTo(offsetX + this.viewport.widthPx, y)
        ctx.stroke()
      }
    }

    const timeSpan = this.viewport.to - this.viewport.from
    const targetLines = calculateOptimalLineCount(timeSpan, this.viewport.widthPx, 80)
    const timeInterval = calculateTimeInterval(this.viewport.from, this.viewport.to, targetLines)
    const timeLevels = generateTimeLevels(this.viewport.from, this.viewport.to, timeInterval)
    
    for (const time of timeLevels) {
      const x = timeToX(time, this.viewport) + offsetX
      ctx.beginPath()
      ctx.moveTo(x, offsetY)
      ctx.lineTo(x, offsetY + this.viewport.heightPx)
      ctx.stroke()
    }
  }

  private drawGridLabels(ctx: CanvasRenderingContext2D): void {
    if (!this.viewport) return

    const { offsetX, offsetY } = this.getPaddingOffsets()
    const padding = this.state?.layout?.labelPadding?.enabled 
      ? getDefaultLabelPadding() 
      : null
    const bottomPadding = padding ? (this.state?.layout?.labelPadding?.bottom ?? padding.bottom) : 0

    ctx.font = '12px sans-serif'
    ctx.fillStyle = this.getThemeColor('grid', '#e0e0e0')
    ctx.textAlign = 'left'
    ctx.textBaseline = 'middle'

    const candles = this.state?.candles || []
    if (candles.length > 0) {
      const visibleCandles = filterCandlesByViewport(candles, this.viewport)
      const rawMinPrice = visibleCandles.length > 0 ? Math.min(...visibleCandles.map(c => c.low)) : Math.min(...candles.map(c => c.low))
      const rawMaxPrice = visibleCandles.length > 0 ? Math.max(...visibleCandles.map(c => c.high)) : Math.max(...candles.map(c => c.high))
      const { minPrice, maxPrice } = addPricePadding(rawMinPrice, rawMaxPrice)
      const priceSpan = maxPrice - minPrice
      
      const targetLines = calculateOptimalLineCount(priceSpan, this.viewport.heightPx, 50)
      const interval = calculatePriceInterval(minPrice, maxPrice, targetLines)
      const priceLevels = generatePriceLevels(minPrice, maxPrice, interval)
      
      for (const price of priceLevels) {
        const y = priceToY(price, this.viewport, minPrice, maxPrice) + offsetY
        const label = formatPrice(price)
        const labelX = offsetX > 0 ? 4 : 4
        ctx.fillText(label, labelX, y)
      }
    }

    const timeSpan = this.viewport.to - this.viewport.from
    const targetLines = calculateOptimalLineCount(timeSpan, this.viewport.widthPx, 80)
    const timeInterval = calculateTimeInterval(this.viewport.from, this.viewport.to, targetLines)
    const timeLevels = generateTimeLevels(this.viewport.from, this.viewport.to, timeInterval)
    
    ctx.textAlign = 'center'
    ctx.textBaseline = 'top'
    
    // Filter labels to prevent overlap
    const filteredTimeLevels = this.filterOverlappingLabels(
      timeLevels,
      timeInterval,
      ctx,
      offsetX
    )
    
    for (const time of filteredTimeLevels) {
      const x = timeToX(time, this.viewport) + offsetX
      const label = formatTime(time, timeInterval)
      const labelY = offsetY + this.viewport.heightPx
      if (bottomPadding > 0 && this.canvas) {
        ctx.fillText(label, x, this.canvas.height - bottomPadding + 4)
      } else {
        ctx.fillText(label, x, labelY + 4)
      }
    }
  }

  private drawCandles(ctx: CanvasRenderingContext2D): void {
    if (!this.state || !this.viewport) return

    const candles = this.state.candles
    if (candles.length === 0) return

    const { offsetX, offsetY } = this.getPaddingOffsets()
    const visibleCandles = filterCandlesByViewport(candles, this.viewport)
    const rawMinPrice = visibleCandles.length > 0 ? Math.min(...visibleCandles.map(c => c.low)) : Math.min(...candles.map(c => c.low))
    const rawMaxPrice = visibleCandles.length > 0 ? Math.max(...visibleCandles.map(c => c.high)) : Math.max(...candles.map(c => c.high))
    const { minPrice, maxPrice } = addPricePadding(rawMinPrice, rawMaxPrice)

    const rects = computeCandleRects(candles, this.viewport, minPrice, maxPrice)

    const candleUpColor = this.getThemeColor('candleUp', '#26a69a')
    const candleDownColor = this.getThemeColor('candleDown', '#ef5350')

    for (const rect of rects) {
      const centerX = rect.x + rect.w / 2 + offsetX
      
      ctx.strokeStyle = rect.isUp ? candleUpColor : candleDownColor
      ctx.lineWidth = 1
      ctx.beginPath()
      ctx.moveTo(centerX, rect.lowY + offsetY)
      ctx.lineTo(centerX, rect.highY + offsetY)
      ctx.stroke()
      
      ctx.fillStyle = rect.isUp ? candleUpColor : candleDownColor
      ctx.fillRect(rect.x + offsetX, rect.y + offsetY, rect.w, rect.h)
    }
  }

  private drawIndicators(ctx: CanvasRenderingContext2D): void {
    if (!this.state || !this.viewport) return

    const indicators = this.state.indicators || []
    if (indicators.length === 0) return

    const { offsetX, offsetY } = this.getPaddingOffsets()
    const candles = this.state.candles || []
    const visibleCandles = filterCandlesByViewport(candles, this.viewport)
    const rawMinPrice = visibleCandles.length > 0 ? Math.min(...visibleCandles.map(c => c.low)) : (candles.length > 0 ? Math.min(...candles.map(c => c.low)) : 0)
    const rawMaxPrice = visibleCandles.length > 0 ? Math.max(...visibleCandles.map(c => c.high)) : (candles.length > 0 ? Math.max(...candles.map(c => c.high)) : 100)
    const { minPrice, maxPrice } = addPricePadding(rawMinPrice, rawMaxPrice)

    ctx.strokeStyle = this.getThemeColor('indicator', '#ff9800')
    ctx.lineWidth = 2

    for (const indicator of indicators) {
      if (indicator.values.length === 0) continue

      const visiblePoints: Array<{ x: number; y: number }> = []
      const timeSpan = this.viewport.to - this.viewport.from
      
      let padding = timeSpan * 0.5
      if (indicator.timestamps.length > 1) {
        const intervals: number[] = []
        for (let i = 1; i < indicator.timestamps.length; i++) {
          intervals.push(indicator.timestamps[i] - indicator.timestamps[i - 1])
        }
        const avgInterval = intervals.reduce((sum, interval) => sum + interval, 0) / intervals.length
        padding = Math.max(padding, avgInterval)
      }
      
      const paddedFrom = this.viewport.from - padding
      const paddedTo = this.viewport.to + padding

      for (let i = 0; i < indicator.values.length; i++) {
        const timestamp = indicator.timestamps[i]
        if (timestamp >= paddedFrom && timestamp <= paddedTo) {
          const x = timeToX(timestamp, this.viewport) + offsetX
          const y = priceToY(indicator.values[i], this.viewport, minPrice, maxPrice) + offsetY
          visiblePoints.push({ x, y })
        }
      }

      if (visiblePoints.length === 0) continue

      ctx.beginPath()
      ctx.moveTo(visiblePoints[0].x, visiblePoints[0].y)
      for (let i = 1; i < visiblePoints.length; i++) {
        ctx.lineTo(visiblePoints[i].x, visiblePoints[i].y)
      }
      ctx.stroke()
    }
  }

  private drawDrawings(ctx: CanvasRenderingContext2D): void {
    if (!this.state || !this.viewport) return

    const { offsetX, offsetY } = this.getPaddingOffsets()
    const candles = this.state.candles || []
    const visibleCandles = filterCandlesByViewport(candles, this.viewport)
    const rawMinPrice = visibleCandles.length > 0 ? Math.min(...visibleCandles.map(c => c.low)) : (candles.length > 0 ? Math.min(...candles.map(c => c.low)) : 0)
    const rawMaxPrice = visibleCandles.length > 0 ? Math.max(...visibleCandles.map(c => c.high)) : (candles.length > 0 ? Math.max(...candles.map(c => c.high)) : 100)
    const { minPrice, maxPrice } = addPricePadding(rawMinPrice, rawMaxPrice)

    const drawings = this.state.drawings || []
    const baseColor = this.getThemeColor('drawing', '#2196F3')
    
    ctx.strokeStyle = baseColor
    ctx.lineWidth = 2

    for (const drawing of drawings) {
      if (drawing.points.length < 2) continue

      const x1 = timeToX(drawing.points[0].time, this.viewport) + offsetX
      const y1 = priceToY(drawing.points[0].price, this.viewport, minPrice, maxPrice) + offsetY
      const x2 = timeToX(drawing.points[drawing.points.length - 1].time, this.viewport) + offsetX
      const y2 = priceToY(drawing.points[drawing.points.length - 1].price, this.viewport, minPrice, maxPrice) + offsetY

      ctx.beginPath()
      ctx.moveTo(x1, y1)
      ctx.lineTo(x2, y2)
      ctx.stroke()
    }

    if (this.state.currentDrawing && this.state.currentDrawing.points.length >= 2) {
      const x1 = timeToX(this.state.currentDrawing.points[0].time, this.viewport) + offsetX
      const y1 = priceToY(this.state.currentDrawing.points[0].price, this.viewport, minPrice, maxPrice) + offsetY
      const x2 = timeToX(this.state.currentDrawing.points[this.state.currentDrawing.points.length - 1].time, this.viewport) + offsetX
      const y2 = priceToY(this.state.currentDrawing.points[this.state.currentDrawing.points.length - 1].price, this.viewport, minPrice, maxPrice) + offsetY

      ctx.strokeStyle = this.convertToRgba(baseColor, 0.5)
      ctx.lineWidth = 2
      ctx.beginPath()
      ctx.moveTo(x1, y1)
      ctx.lineTo(x2, y2)
      ctx.stroke()
    }
  }

  private convertToRgba(hex: string, alpha: number): string {
    if (!hex.startsWith('#')) {
      return hex
    }
    
    const hexColor = hex.slice(1)
    if (hexColor.length === 6) {
      const r = parseInt(hexColor.slice(0, 2), 16)
      const g = parseInt(hexColor.slice(2, 4), 16)
      const b = parseInt(hexColor.slice(4, 6), 16)
      return `rgba(${r}, ${g}, ${b}, ${alpha})`
    }
    
    return hex
  }

  private drawAxes(ctx: CanvasRenderingContext2D): void {
    if (!this.viewport) return

    const { offsetX, offsetY } = this.getPaddingOffsets()
    const padding = this.state?.layout?.labelPadding?.enabled 
      ? getDefaultLabelPadding() 
      : null
    const bottomPadding = padding ? (this.state?.layout?.labelPadding?.bottom ?? padding.bottom) : 0

    ctx.strokeStyle = '#000000'
    ctx.lineWidth = 2
    ctx.font = '12px sans-serif'
    ctx.fillStyle = '#000000'

    const bottomY = offsetY + this.viewport.heightPx
    ctx.beginPath()
    ctx.moveTo(offsetX, bottomY)
    ctx.lineTo(offsetX + this.viewport.widthPx, bottomY)
    ctx.stroke()

    ctx.beginPath()
    ctx.moveTo(offsetX, offsetY)
    ctx.lineTo(offsetX, bottomY)
    ctx.stroke()
  }

  private filterOverlappingLabels(
    timeLevels: number[],
    timeInterval: number,
    ctx: CanvasRenderingContext2D,
    offsetX: number
  ): number[] {
    const MIN_LABEL_SPACING = 8
    const filteredTimeLevels: number[] = []
    let lastLabelRight = -Infinity
    
    const hasMeasureText = typeof ctx.measureText === 'function'
    
    for (const time of timeLevels) {
      const x = timeToX(time, this.viewport!) + offsetX
      const label = formatTime(time, timeInterval)
      const labelWidth = hasMeasureText ? ctx.measureText(label).width : 80
      const labelLeft = x - labelWidth / 2
      const labelRight = x + labelWidth / 2
      
      if (labelLeft >= lastLabelRight + MIN_LABEL_SPACING) {
        filteredTimeLevels.push(time)
        lastLabelRight = labelRight
      }
    }
    
    return filteredTimeLevels
  }
}
