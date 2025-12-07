import { ref } from 'vue'
import type { TimeframeId } from 'synticks-chart'

export function usePlaygroundState() {
  const symbol = ref('BTCUSDT')
  const timeframe = ref<TimeframeId>('1m')

  return { symbol, timeframe }
}

