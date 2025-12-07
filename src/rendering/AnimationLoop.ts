import type { ChartRenderer } from './ChartRenderer'

export class AnimationLoop {
  private animationFrameId: number | null = null
  private isRunning = false

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

  private tick(): void {
    if (!this.isRunning) return
    this.renderer.render()
    this.animationFrameId = requestAnimationFrame(() => this.tick())
  }
}
