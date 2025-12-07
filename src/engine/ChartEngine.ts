import type { TimeframeId, Candle, PlaybackMode } from '../core/types'
import { createChartState, type ChartState, type InteractionMode } from '../core/state'
import { PlaybackController } from '../core/playback'
import { ChartRenderer } from '../rendering/ChartRenderer'
import { AnimationLoop } from '../rendering/AnimationLoop'
import { InputController } from '../interaction/InputController'
import { IndicatorRegistry } from '../core/indicators'
import type { ThemeName } from '../core/theme'
import { getTheme } from '../core/theme'
import type { DrawingShape } from '../core/drawings'
import { createViewportFromCandles } from '../core/viewport'
import type { Viewport } from '../core/viewport'

export interface ChartEngineOptions {
  symbol: string
  timeframe: TimeframeId
}

export class ChartEngine {
  private state: ChartState
  private renderer: ChartRenderer
  private animationLoop: AnimationLoop
  private playbackController: PlaybackController
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
    this.playbackController = new PlaybackController(this.state)
    this.indicatorRegistry = new IndicatorRegistry()
    
    this.inputController = new InputController(
      canvas,
      () => this.state,
      (partial) => {
        this.state = { ...this.state, ...partial }
        this.animationLoop.setTargetState(this.state)
      }
    )

    this.animationLoop.start()
  }

  setSymbol(symbol: string): void {
    this.symbol = symbol
  }

  setTimeframe(tf: TimeframeId): void {
    this.timeframe = tf
  }

  play(): void {
    this.playbackController.play()
  }

  pause(): void {
    this.playbackController.pause()
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

  loadMockData(candles: Candle[]): void {
    this.state.candles = candles
    
    if (candles.length > 0) {
      const { width, height } = this.getCanvasDimensions()
      const viewport = createViewportFromCandles(candles, width, height)
      if (viewport) {
        this.state.viewport = viewport
      }
    }
    
    this.recalculateAllIndicators()
    this.animationLoop.setTargetState(this.state)
  }

  resetData(): void {
    this.state.candles = []
    this.state.missedCandles = []
    this.state.viewport = undefined
    this.animationLoop.setTargetState(this.state)
  }

  appendMockCandle(candle: Candle): void {
    this.state.candles.push(candle)
    this.recalculateAllIndicators()
    this.animationLoop.setTargetState(this.state)
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

  getState(): {
    symbol: string
    timeframe: TimeframeId
    playback: PlaybackMode | 'live'
    candles: Candle[]
    drawings?: DrawingShape[]
    indicators?: import('../core/state').IndicatorData[]
    indicatorsCount: number
    viewport?: Viewport
  } {
    return {
      symbol: this.symbol,
      timeframe: this.timeframe,
      playback: this.state.playback,
      candles: this.state.candles,
      drawings: this.state.drawings,
      indicators: this.state.indicators,
      indicatorsCount: this.indicatorRegistry.getActiveCount(),
      viewport: this.state.viewport
    }
  }

  destroy(): void {
    this.animationLoop.stop()
  }
}
