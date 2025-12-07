<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { PlaygroundChart } from 'synticks-chart/vue'
import ControlPanel from './components/ControlPanel.vue'
import StatusPanel from './components/StatusPanel.vue'
import { usePlaygroundState } from './composables/usePlaygroundState'
import { generateSampleData, generateRandomCandle } from './utils/mockData'
import { ThemeName } from 'synticks-chart'

const chartRef = ref<InstanceType<typeof PlaygroundChart> | null>(null)
const { symbol, timeframe } = usePlaygroundState()
const isPlaying = ref(false)
const activeTool = ref<string>('pan')
const theme = ref<ThemeName>('light')
const indicators = ref({
  sma20: false,
  sma50: false,
  sma200: false
})

const devState = ref({
  symbol: 'BTCUSDT',
  timeframe: '1m',
  playback: 'live',
  candlesCount: 0,
  drawingsCount: 0,
  indicatorsCount: 0
})

let stateUpdateInterval: number | null = null

function updateDevState() {
  if (chartRef.value?.getState) {
    const state = chartRef.value.getState()
    devState.value = {
      symbol: state.symbol || symbol.value,
      timeframe: state.timeframe || timeframe.value,
      playback: state.playback || 'live',
      candlesCount: state.candles?.length || 0,
      drawingsCount: state.drawings?.length || 0,
      indicatorsCount: state.indicatorsCount || 0
    }
  }
}

onMounted(() => {
  updateDevState()
  stateUpdateInterval = window.setInterval(() => {
    updateDevState()
  }, 100)
})

onUnmounted(() => {
  if (stateUpdateInterval !== null) {
    clearInterval(stateUpdateInterval)
  }
})

function handlePlay() {
  chartRef.value?.play()
  isPlaying.value = true
}

function handlePause() {
  chartRef.value?.pause()
  isPlaying.value = false
}

function handleGoLive() {
  chartRef.value?.scrollToLive?.()
}

function handleLoadSample() {
  const candles = generateSampleData()
  chartRef.value?.loadMockData?.(candles)
}

function handleResetData() {
  chartRef.value?.resetData?.()
}

function handleAddRandomCandle() {
  const candle = generateRandomCandle()
  chartRef.value?.appendMockCandle?.(candle)
}

function handleSetTool(mode: string) {
  activeTool.value = mode
  chartRef.value?.setDrawingMode?.(mode)
}

function handleClearDrawings() {
  chartRef.value?.clearDrawings?.()
}

function handleToggleIndicator(payload: { type: string; period: number }) {
  const key = `sma${payload.period}` as 'sma20' | 'sma50' | 'sma200'
  indicators.value[key] = !indicators.value[key]

  if (indicators.value[key]) {
    chartRef.value?.addIndicator?.(payload.type, { period: payload.period })
  } else {
    chartRef.value?.removeIndicator?.(`${payload.type}:${payload.period}`)
  }
}

function handleSetTheme(newTheme: ThemeName) {
  theme.value = newTheme
  chartRef.value?.setTheme?.(newTheme)
}
</script>

<template>
  <div class="app-root" style="width: 100vw; height: 100vh; box-sizing: border-box;">
    <div class="app-layout" style="display:flex; flex-direction:column; height:100%;">
      <ControlPanel :symbol="symbol" :timeframe="timeframe" :is-playing="isPlaying" :active-tool="activeTool"
        :indicators="indicators" :theme="theme" @update:symbol="symbol = $event" @update:timeframe="timeframe = $event"
        @play="handlePlay" @pause="handlePause" @live="handleGoLive" @load-sample="handleLoadSample"
        @reset-data="handleResetData" @add-random-candle="handleAddRandomCandle" @set-tool="handleSetTool"
        @clear-drawings="handleClearDrawings" @toggle-indicator="handleToggleIndicator" @set-theme="handleSetTheme" />
      <div style="flex:1; min-height:0; padding:16px; display:flex; flex-direction:column;">
        <div style="flex: 1; min-height: 0; position: relative;">
          <PlaygroundChart ref="chartRef" :symbol="symbol" :timeframe="timeframe" :theme="theme" />
        </div>
        <StatusPanel :state="devState" />
      </div>
    </div>
  </div>
</template>
