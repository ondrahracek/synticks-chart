<script setup lang="ts">
import { ref } from 'vue'
import { PlaygroundChart } from 'synticks-chart/vue'
import ControlPanel from './components/ControlPanel.vue'
import { usePlaygroundState } from './composables/usePlaygroundState'
import { generateSampleData, generateRandomCandle } from './utils/mockData'

const chartRef = ref<InstanceType<typeof PlaygroundChart> | null>(null)
const { symbol, timeframe } = usePlaygroundState()
const isPlaying = ref(false)

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
</script>

<template>
  <div class="app-root" style="width: 100vw; height: 100vh; box-sizing: border-box;">
    <div class="app-layout" style="display:flex; flex-direction:column; height:100%;">
      <ControlPanel
        :symbol="symbol"
        :timeframe="timeframe"
        :is-playing="isPlaying"
        @update:symbol="symbol = $event"
        @update:timeframe="timeframe = $event"
        @play="handlePlay"
        @pause="handlePause"
        @live="handleGoLive"
        @load-sample="handleLoadSample"
        @reset-data="handleResetData"
        @add-random-candle="handleAddRandomCandle"
      />
      <div style="flex:1; min-height:0; padding:16px;">
        <PlaygroundChart
          ref="chartRef"
          :symbol="symbol"
          :timeframe="timeframe"
        />
      </div>
    </div>
  </div>
</template>
