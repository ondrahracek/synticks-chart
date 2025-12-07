import type { TimeframeId, Candle } from '../core/types'
import { createChartState, type ChartState, type InteractionMode } from '../core/state'
import { PlaybackController } from '../core/playback'
import { ChartRenderer } from '../rendering/ChartRenderer'
import { AnimationLoop } from '../rendering/AnimationLoop'
import { InputController } from '../interaction/InputController'
import { IndicatorRegistry } from '../core/indicators'

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

  constructor(canvas: HTMLCanvasElement, options: ChartEngineOptions) {
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
    // Indicator logic will be handled by registry
  }

  removeIndicator(id: string): void {
    // Indicator removal logic
  }

  loadMockData(candles: Candle[]): void {
    this.state.candles = candles
    this.animationLoop.setTargetState(this.state)
  }

  resetData(): void {
    this.state.candles = []
    this.state.missedCandles = []
    this.animationLoop.setTargetState(this.state)
  }

  appendMockCandle(candle: Candle): void {
    this.state.candles.push(candle)
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

  destroy(): void {
    this.animationLoop.stop()
  }
}
