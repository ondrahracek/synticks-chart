import type { ChartState } from './state'
import type { Viewport } from './viewport'
import type { Candle } from './types'
import { panToLatest, isViewportAtLatest } from './viewport'

export class AutoScrollController {
  constructor(private state: ChartState) {}

  disableAutoScroll(): void {
    this.state.autoScrollEnabled = false
  }

  scrollToLive(viewport: Viewport, candles: Candle[]): Viewport {
    this.state.autoScrollEnabled = true
    return panToLatest(viewport, candles)
  }

  updateAutoScrollState(viewport: Viewport, candles: Candle[]): void {
    if (isViewportAtLatest(viewport, candles)) {
      this.state.autoScrollEnabled = true
    }
  }
}

