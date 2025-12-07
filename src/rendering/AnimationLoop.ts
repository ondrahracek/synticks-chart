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

  setTargetState(state: ChartState): void {
    if (this.targetState) {
      this.prevState = this.targetState
    }
    this.targetState = state
    this.animationStartTime = performance.now()
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
    }

    this.renderer.render()
    this.animationFrameId = requestAnimationFrame(() => this.tick())
  }
}
