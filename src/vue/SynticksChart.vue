<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, watch } from 'vue'
import { ChartEngine, type ChartEngineOptions } from '../engine/ChartEngine'
import type { TimeframeId, Candle } from '../core/types'
import type { ThemeName } from '../core/theme'
import type { InteractionMode } from '../core/state'

interface Props {
  symbol: string
  timeframe: TimeframeId
  theme?: ThemeName
}

const props = defineProps<Props>()
const canvasRef = ref<HTMLCanvasElement | null>(null)
let engine: ChartEngine | null = null
let resizeObserver: ResizeObserver | null = null

function updateCanvasSize(canvas: HTMLCanvasElement) {
  const rect = canvas.getBoundingClientRect()
  canvas.width = rect.width
  canvas.height = rect.height
}

onMounted(() => {
  if (!canvasRef.value) return

  const canvas = canvasRef.value
  canvas.style.width = '100%'
  canvas.style.height = '100%'
  canvas.style.display = 'block'

  updateCanvasSize(canvas)

  engine = new ChartEngine(canvas, {
    symbol: props.symbol,
    timeframe: props.timeframe
  })
  engine.setSymbol(props.symbol)
  engine.setTimeframe(props.timeframe)

  resizeObserver = new ResizeObserver(() => {
    if (canvasRef.value) {
      updateCanvasSize(canvasRef.value)
    }
  })
  resizeObserver.observe(canvas)
})

onBeforeUnmount(() => {
  if (resizeObserver) {
    resizeObserver.disconnect()
    resizeObserver = null
  }
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
  setDrawingMode: (mode: string) => engine?.setDrawingMode?.(mode as InteractionMode),
  scrollToLive: () => { },
  loadCandles: (candles: Candle[]) => engine?.loadCandles?.(candles),
  resetData: () => engine?.resetData?.(),
  appendCandle: (candle: Candle) => engine?.appendCandle?.(candle),
  clearDrawings: () => engine?.clearDrawings?.(),
  addIndicator: (id: string, inputs: Record<string, unknown>) => engine?.addIndicator?.(id, inputs),
  removeIndicator: (id: string) => engine?.removeIndicator?.(id),
  setTheme: (theme: ThemeName) => engine?.setTheme?.(theme),
  setLabelPadding: (enabled: boolean) => engine?.setLabelPadding?.(enabled),
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
