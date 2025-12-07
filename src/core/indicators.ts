import type { Candle } from './types'

export interface IndicatorDefinition {
  calculate: (candles: Candle[], params: Record<string, unknown>) => number[]
}

export class IndicatorRegistry {
  private indicators = new Map<string, IndicatorDefinition>()

  register(id: string, definition: IndicatorDefinition): void {
    this.indicators.set(id, definition)
  }

  has(id: string): boolean {
    return this.indicators.has(id)
  }

  calculate(id: string, candles: Candle[], params: Record<string, unknown>): number[] {
    const indicator = this.indicators.get(id)
    if (!indicator) {
      throw new Error(`Indicator not found: ${id}`)
    }
    return indicator.calculate(candles, params)
  }
}

export function createSMAIndicator(): IndicatorDefinition {
  return {
    calculate: (candles: Candle[], params: Record<string, unknown>): number[] => {
      const period = params.period as number
      if (!period || period < 1) {
        throw new Error('SMA period must be at least 1')
      }

      const result: number[] = []
      
      for (let i = period - 1; i < candles.length; i++) {
        let sum = 0
        for (let j = i - period + 1; j <= i; j++) {
          sum += candles[j].close
        }
        result.push(sum / period)
      }

      return result
    }
  }
}

