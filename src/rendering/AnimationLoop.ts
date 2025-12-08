import type { ChartRenderer } from './ChartRenderer'
import type { ChartState } from '../core/state'
import { lerpChartState } from './AnimationState'

export class AnimationLoop {
  private animationFrameId: number | null = null
  private isRunning = false
  private prevState: ChartState | null = null
  private targetState: ChartState | null = null
  private animationStartTime: number = 0
  private animationDuration: number = 200

  constructor(private renderer: ChartRenderer) {}

  start(): void {
    if (this.isRunning) return
    this.isRunning = true
    this.tick()
  }

  stop(): void {
    if (!this.isRunning) return
    this.isRunning = false
    if (this.animationFrameId !== null) {
      cancelAnimationFrame(this.animationFrameId)
      this.animationFrameId = null
    }
  }

  setTargetState(state: ChartState, explicitPrevState?: ChartState): void {
    if (explicitPrevState) {
      this.prevState = this.deepCloneState(explicitPrevState)
    } else if (!this.prevState) {
      const currentState = this.renderer.getState()
      if (currentState) {
        this.prevState = this.deepCloneState(currentState)
      } else if (this.targetState) {
        this.prevState = this.deepCloneState(this.targetState)
      }
    } else if (this.targetState) {
      this.prevState = this.deepCloneState(this.targetState)
    }
    this.targetState = state
    this.animationStartTime = performance.now()
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

  private tick(): void {
    if (!this.isRunning) return

    if (this.prevState && this.targetState) {
      const elapsed = performance.now() - this.animationStartTime
      const progress = Math.min(elapsed / this.animationDuration, 1)
      const interpolatedState = lerpChartState(this.prevState, this.targetState, progress)
      this.renderer.setState(interpolatedState)

      if (progress >= 1) {
        this.prevState = null
      }
    } else {
      if (this.targetState) {
        this.renderer.setState(this.targetState)
      }
    }

    this.renderer.render()
    this.animationFrameId = requestAnimationFrame(() => this.tick())
  }
}
