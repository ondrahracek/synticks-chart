import type { TimeframeId, Candle } from '../core/types'
import { createChartState, type ChartState, type InteractionMode } from '../core/state'
import { AutoScrollController } from '../core/auto-scroll'
import { ChartRenderer } from '../rendering/ChartRenderer'
import { AnimationLoop } from '../rendering/AnimationLoop'
import { InputController } from '../interaction/InputController'
import { IndicatorRegistry } from '../core/indicators'
import type { ThemeName } from '../core/theme'
import { getTheme } from '../core/theme'
import type { DrawingShape } from '../core/drawings'
import { createViewportFromCandles, updateViewportDimensions, calculateInitialCandleCount, createViewportFromLastCandles, panToLatest } from '../core/viewport'
import type { Viewport } from '../core/viewport'
import { getDefaultLabelPadding } from '../rendering/padding'

export interface ChartEngineOptions {
  symbol: string
  timeframe: TimeframeId
}

export class ChartEngine {
  private state: ChartState
  private renderer: ChartRenderer
  private animationLoop: AnimationLoop
  private autoScrollController: AutoScrollController
  private inputController: InputController
  private indicatorRegistry: IndicatorRegistry
  private symbol: string
  private timeframe: TimeframeId
  private canvas: HTMLCanvasElement

  constructor(canvas: HTMLCanvasElement, options: ChartEngineOptions) {
    this.canvas = canvas
    this.symbol = options.symbol
    this.timeframe = options.timeframe
    this.state = createChartState()
    this.renderer = new ChartRenderer(canvas)
    this.animationLoop = new AnimationLoop(this.renderer)
    this.autoScrollController = new AutoScrollController(this.state)
    this.indicatorRegistry = new IndicatorRegistry()
    
    this.inputController = new InputController(
      canvas,
      () => this.state,
      (partial) => {
        this.state = { ...this.state, ...partial }
        this.animationLoop.setTargetState(this.state)
      },
      this.autoScrollController
    )

    this.animationLoop.start()
  }

  setSymbol(symbol: string): void {
    this.symbol = symbol
  }

  setTimeframe(tf: TimeframeId): void {
    this.timeframe = tf
  }

  addIndicator(id: string, inputs: Record<string, unknown>): void {
    this.indicatorRegistry.register(id, inputs)
    this.recalculateAllIndicators()
    this.animationLoop.setTargetState(this.state)
  }

  private recalculateAllIndicators(): void {
    if (this.state.candles.length === 0) {
      this.state.indicators = []
      return
    }

    const indicators: import('../core/state').IndicatorData[] = []
    const activeIds = this.indicatorRegistry.getAllActiveIds()
    
    for (const fullId of activeIds) {
      const inputs = this.indicatorRegistry.getInputs(fullId) || {}
      const period = inputs.period as number
      const values = this.indicatorRegistry.calculate(fullId, this.state.candles, inputs)
      
      const timestamps: number[] = []
      const startIndex = period - 1
      for (let i = startIndex; i < this.state.candles.length; i++) {
        timestamps.push(this.state.candles[i].timestamp)
      }
      
      indicators.push({
        id: fullId,
        values,
        timestamps
      })
    }
    
    this.state.indicators = indicators
  }

  removeIndicator(id: string): void {
    this.indicatorRegistry.unregister(id)
    this.recalculateAllIndicators()
    this.animationLoop.setTargetState(this.state)
  }

  private getCanvasDimensions(): { width: number; height: number } {
    const rect = this.canvas.getBoundingClientRect()
    return {
      width: rect.width,
      height: rect.height
    }
  }

  private recalculateViewport(preserveTimeRange: boolean = false): void {
    if (this.state.candles.length === 0) return
    
    const { width, height } = this.getCanvasDimensions()
    let effectiveWidth = width
    let effectiveHeight = height
    
    if (this.state.layout?.labelPadding?.enabled) {
      const padding = getDefaultLabelPadding()
      const leftPadding = this.state.layout.labelPadding.left ?? padding.left
      const bottomPadding = this.state.layout.labelPadding.bottom ?? padding.bottom
      effectiveWidth = width - leftPadding
      effectiveHeight = height - bottomPadding
    }
    
    if (preserveTimeRange && this.state.viewport) {
      const viewport = updateViewportDimensions(this.state.viewport, effectiveWidth, effectiveHeight)
      this.state.viewport = viewport
    } else {
      const initialCount = calculateInitialCandleCount(effectiveWidth)
      const viewport = createViewportFromLastCandles(this.state.candles, initialCount, effectiveWidth, effectiveHeight)
      if (viewport) {
        this.state.viewport = viewport
      }
    }
  }

  loadCandles(candles: Candle[]): void {
    this.state.candles = candles
    this.state.autoScrollEnabled = true
    this.recalculateViewport()
    this.recalculateAllIndicators()
    this.animationLoop.setTargetState(this.state)
  }

  resetData(): void {
    this.state.candles = []
    this.state.viewport = undefined
    this.animationLoop.setTargetState(this.state)
  }

  private pendingScrollUpdate: number | null = null

  appendCandle(candle: Candle): void {
    this.state.candles.push(candle)
    this.recalculateAllIndicators()
    
    if (this.state.autoScrollEnabled && this.state.viewport) {
      if (this.pendingScrollUpdate === null) {
        this.pendingScrollUpdate = requestAnimationFrame(() => {
          if (this.state.autoScrollEnabled && this.state.viewport) {
            const renderer = (this.animationLoop as any).renderer as any
            const rendererState = renderer.getState()
            const prevStateForAnimation = rendererState ? this.deepCloneState(rendererState) : undefined
            
            const newViewport = panToLatest(this.state.viewport, this.state.candles)
            
            this.state = {
              ...this.state,
              viewport: newViewport
            }
            
            this.animationLoop.setTargetState(this.state, prevStateForAnimation || undefined)
          }
          this.pendingScrollUpdate = null
        })
      }
      this.animationLoop.setTargetState(this.state)
    } else {
      this.animationLoop.setTargetState(this.state)
    }
  }

  setDrawingMode(mode: InteractionMode): void {
    this.state.interactionMode = mode
    this.animationLoop.setTargetState(this.state)
  }

  clearDrawings(): void {
    this.state.drawings = []
    this.animationLoop.setTargetState(this.state)
  }

  setTheme(themeName: ThemeName): void {
    this.state.theme = getTheme(themeName)
    this.animationLoop.setTargetState(this.state)
  }

  setLabelPadding(enabled: boolean): void {
    if (!this.state.layout) {
      this.state.layout = {}
    }
    if (!this.state.layout.labelPadding) {
      this.state.layout.labelPadding = { enabled }
    } else {
      this.state.layout.labelPadding.enabled = enabled
    }
    
    this.recalculateViewport(true)
    this.animationLoop.setTargetState(this.state)
  }

  scrollToLive(): void {
    if (this.state.viewport) {
      // Cancel any pending scroll updates from appendCandle
      if (this.pendingScrollUpdate !== null) {
        cancelAnimationFrame(this.pendingScrollUpdate)
        this.pendingScrollUpdate = null
      }

      const renderer = (this.animationLoop as any).renderer as any
      const rendererState = renderer.getState()
      
      const prevStateForAnimation = rendererState ? this.deepCloneState(rendererState) : undefined
      
      const newViewport = this.autoScrollController.scrollToLive(this.state.viewport, this.state.candles)
      
      // Create new state object (consistent with InputController.updateState pattern)
      // This ensures state references are consistent across all components
      this.state = {
        ...this.state,
        viewport: newViewport,
        autoScrollEnabled: true
      }
      
      this.animationLoop.setTargetState(this.state, prevStateForAnimation || undefined)
    }
  }

  private deepCloneState(state: ChartState): ChartState {
    return {
      ...state,
      candles: [...state.candles],
      viewport: state.viewport ? { ...state.viewport } : undefined,
      crosshair: state.crosshair ? { ...state.crosshair } : undefined,
      drawings: state.drawings ? [...state.drawings] : undefined,
      currentDrawing: state.currentDrawing ? { ...state.currentDrawing } : undefined,
      indicators: state.indicators ? state.indicators.map(ind => ({
        ...ind,
        values: [...ind.values],
        timestamps: [...ind.timestamps]
      })) : undefined,
      theme: state.theme ? { ...state.theme } : undefined,
      layout: state.layout ? {
        ...state.layout,
        labelPadding: state.layout.labelPadding ? { ...state.layout.labelPadding } : undefined
      } : undefined
    }
  }

  getState(): {
    symbol: string
    timeframe: TimeframeId
    autoScrollEnabled: boolean
    candles: Candle[]
    drawings?: DrawingShape[]
    indicators?: import('../core/state').IndicatorData[]
    indicatorsCount: number
    viewport?: Viewport
    layout?: import('../core/state').LayoutConfig
  } {
    return {
      symbol: this.symbol,
      timeframe: this.timeframe,
      autoScrollEnabled: this.state.autoScrollEnabled,
      candles: this.state.candles,
      drawings: this.state.drawings,
      indicators: this.state.indicators,
      indicatorsCount: this.indicatorRegistry.getActiveCount(),
      viewport: this.state.viewport,
      layout: this.state.layout
    }
  }

  destroy(): void {
    if (this.pendingScrollUpdate !== null) {
      cancelAnimationFrame(this.pendingScrollUpdate)
      this.pendingScrollUpdate = null
    }
    this.animationLoop.stop()
  }
}
