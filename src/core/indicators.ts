import type { Candle } from './types'

export interface IndicatorDefinition {
  calculate: (candles: Candle[], params: Record<string, unknown>) => number[]
}

export class IndicatorRegistry {
  private indicators = new Map<string, IndicatorDefinition>()
  private inputs = new Map<string, Record<string, unknown>>()

  register(id: string, definition: IndicatorDefinition): void
  register(id: string, inputs: Record<string, unknown>): void
  register(id: string, definitionOrInputs: IndicatorDefinition | Record<string, unknown>): void {
    if (id === 'sma') {
      const inputs = definitionOrInputs as Record<string, unknown>
      const period = inputs.period as number
      const fullId = `sma:${period}`
      if (!this.indicators.has(fullId)) {
        this.indicators.set(fullId, createSMAIndicator())
        this.inputs.set(fullId, inputs)
      }
    } else if ('calculate' in definitionOrInputs) {
      this.indicators.set(id, definitionOrInputs as IndicatorDefinition)
    } else {
      this.inputs.set(id, definitionOrInputs as Record<string, unknown>)
    }
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

  unregister(id: string): void {
    this.indicators.delete(id)
    this.inputs.delete(id)
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

