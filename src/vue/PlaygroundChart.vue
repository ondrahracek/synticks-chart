<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, watch } from 'vue'
import { ChartEngine, type ChartEngineOptions } from '../engine/ChartEngine'
import type { TimeframeId, Candle } from '../core/types'
import type { ThemeName } from '../core/theme'

interface Props {
  symbol: string
  timeframe: TimeframeId
  theme?: ThemeName
}

const props = defineProps<Props>()
const canvasRef = ref<HTMLCanvasElement | null>(null)
let engine: ChartEngine | null = null

onMounted(() => {
  if (!canvasRef.value) return
  
  const rect = canvasRef.value.getBoundingClientRect()
  canvasRef.value.width = rect.width
  canvasRef.value.height = rect.height
  
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

watch(() => props.theme, (newTheme: ThemeName | undefined) => {
  if (engine && newTheme) {
    engine.setTheme(newTheme)
  }
})

defineExpose({
  play: () => engine?.play(),
  pause: () => engine?.pause(),
  setTimeframe: (tf: TimeframeId) => engine?.setTimeframe(tf),
  setDrawingMode: (mode: string) => engine?.setDrawingMode?.(mode),
  scrollToLive: () => {},
  loadMockData: (candles: Candle[]) => engine?.loadMockData?.(candles),
  resetData: () => engine?.resetData?.(),
  appendMockCandle: (candle: Candle) => engine?.appendMockCandle?.(candle),
  clearDrawings: () => engine?.clearDrawings?.(),
  addIndicator: (id: string, inputs: Record<string, unknown>) => engine?.addIndicator?.(id, inputs),
  removeIndicator: (id: string) => engine?.removeIndicator?.(id),
  setTheme: (theme: ThemeName) => engine?.setTheme?.(theme),
  getState: () => engine?.getState?.()
})
</script>

<template>
  <canvas ref="canvasRef" class="synticks-chart-canvas" />
</template>

<style scoped>
.synticks-chart-canvas {
  width: 100%;
  height: 100%;
  display: block;
}
</style>
