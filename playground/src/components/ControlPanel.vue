<template>
  <div class="control-panel">
    <input data-testid="symbol-input" :value="symbol"
      @input="emit('update:symbol', ($event.target as HTMLInputElement).value)" />
    <div class="tf-buttons">
      <button v-for="tf in timeframes" :key="tf" :data-tf="tf" @click="emit('update:timeframe', tf)">
        {{ tf }}
      </button>
    </div>
    <div class="playback-buttons">
      <button data-test="btn-play" :disabled="isPlaying" @click="emit('play')">
        Play
      </button>
      <button data-test="btn-pause" :disabled="!isPlaying" @click="emit('pause')">
        Pause
      </button>
      <button data-test="btn-live" @click="emit('live')">
        Go LIVE
      </button>
    </div>
    <div class="mock-data-buttons">
      <button data-test="btn-load-sample" @click="emit('loadSample')">
        Load sample data
      </button>
      <button data-test="btn-reset" @click="emit('resetData')">
        Reset
      </button>
      <button data-test="btn-add-candle" @click="emit('addRandomCandle')">
        Add random candle
      </button>
    </div>
    <div class="tools-buttons">
      <button data-test="btn-tool-cursor" :class="{ active: activeTool === 'pan' }" @click="emit('setTool', 'pan')">
        Cursor
      </button>
      <button data-test="btn-tool-trendline" :class="{ active: activeTool === 'draw-trendline' }"
        @click="emit('setTool', 'draw-trendline')">
        Trendline
      </button>
      <button data-test="btn-tool-horizontal" :class="{ active: activeTool === 'draw-horizontal' }"
        @click="emit('setTool', 'draw-horizontal')">
        Horizontal line
      </button>
      <button data-test="btn-clear-drawings" @click="emit('clearDrawings')">
        Clear drawings
      </button>
    </div>
    <div class="indicators-section">
      <label>
        <input data-test="indicator-sma-20" type="checkbox" :checked="indicators.sma20"
          @change="emit('toggleIndicator', { type: 'sma', period: 20 })" />
        SMA(20)
      </label>
      <label>
        <input data-test="indicator-sma-50" type="checkbox" :checked="indicators.sma50"
          @change="emit('toggleIndicator', { type: 'sma', period: 50 })" />
        SMA(50)
      </label>
      <label>
        <input data-test="indicator-sma-200" type="checkbox" :checked="indicators.sma200"
          @change="emit('toggleIndicator', { type: 'sma', period: 200 })" />
        SMA(200)
      </label>
    </div>
    <div class="theme-buttons">
      <button data-test="theme-light" :class="{ active: theme === 'light' }" @click="emit('setTheme', 'light')">
        Light
      </button>
      <button data-test="theme-dark" :class="{ active: theme === 'dark' }" @click="emit('setTheme', 'dark')">
        Dark
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { ThemeName, TimeframeId } from 'synticks-chart'

defineProps<{
  symbol: string
  timeframe: TimeframeId
  isPlaying: boolean
  activeTool: string
  indicators: {
    sma20: boolean
    sma50: boolean
    sma200: boolean
  }
  theme: ThemeName
}>()

const emit = defineEmits<{
  (e: 'update:symbol', value: string): void
  (e: 'update:timeframe', value: TimeframeId): void
  (e: 'play'): void
  (e: 'pause'): void
  (e: 'live'): void
  (e: 'loadSample'): void
  (e: 'resetData'): void
  (e: 'addRandomCandle'): void
  (e: 'setTool', mode: string): void
  (e: 'clearDrawings'): void
  (e: 'toggleIndicator', payload: { type: string; period: number }): void
  (e: 'setTheme', theme: ThemeName): void
}>()

const timeframes: TimeframeId[] = ['1m', '5m', '15m', '1h', '1d']
</script>
