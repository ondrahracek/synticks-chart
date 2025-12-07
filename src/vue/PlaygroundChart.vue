<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, watch } from 'vue'
import { ChartEngine, type ChartEngineOptions } from '../engine/ChartEngine'
import type { TimeframeId, Candle } from '../core/types'

interface Props {
  symbol: string
  timeframe: TimeframeId
}

const props = defineProps<Props>()
const canvasRef = ref<HTMLCanvasElement | null>(null)
let engine: ChartEngine | null = null

onMounted(() => {
  if (!canvasRef.value) return
  
  engine = new ChartEngine(canvasRef.value, {
    symbol: props.symbol,
    timeframe: props.timeframe
  })
  engine.setSymbol(props.symbol)
  engine.setTimeframe(props.timeframe)
})

onBeforeUnmount(() => {
  if (engine) {
    engine.destroy()
    engine = null
  }
})

watch(() => props.symbol, (newSymbol: string) => {
  if (engine) {
    engine.setSymbol(newSymbol)
  }
})

watch(() => props.timeframe, (newTimeframe: TimeframeId) => {
  if (engine) {
    engine.setTimeframe(newTimeframe)
  }
})

defineExpose({
  play: () => engine?.play(),
  pause: () => engine?.pause(),
  setTimeframe: (tf: TimeframeId) => engine?.setTimeframe(tf),
  setDrawingMode: () => {},
  scrollToLive: () => {},
  loadMockData: (candles: Candle[]) => engine?.loadMockData?.(candles),
  resetData: () => engine?.resetData?.(),
  appendMockCandle: (candle: Candle) => engine?.appendMockCandle?.(candle)
})
</script>

<template>
  <canvas ref="canvasRef" class="synticks-chart-canvas" />
</template>
