<template>
  <div class="control-panel">
    <input
      data-testid="symbol-input"
      :value="symbol"
      @input="emit('update:symbol', ($event.target as HTMLInputElement).value)"
    />
    <div class="tf-buttons">
      <button
        v-for="tf in timeframes"
        :key="tf"
        :data-tf="tf"
        @click="emit('update:timeframe', tf)"
      >
        {{ tf }}
      </button>
    </div>
    <div class="playback-buttons">
      <button
        data-test="btn-play"
        :disabled="isPlaying"
        @click="emit('play')"
      >
        Play
      </button>
      <button
        data-test="btn-pause"
        :disabled="!isPlaying"
        @click="emit('pause')"
      >
        Pause
      </button>
      <button
        data-test="btn-live"
        @click="emit('live')"
      >
        Go LIVE
      </button>
    </div>
    <div class="mock-data-buttons">
      <button
        data-test="btn-load-sample"
        @click="emit('loadSample')"
      >
        Load sample data
      </button>
      <button
        data-test="btn-reset"
        @click="emit('resetData')"
      >
        Reset
      </button>
      <button
        data-test="btn-add-candle"
        @click="emit('addRandomCandle')"
      >
        Add random candle
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { TimeframeId } from 'synticks-chart'

defineProps<{
  symbol: string
  timeframe: TimeframeId
  isPlaying: boolean
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
}>()

const timeframes: TimeframeId[] = ['1m', '5m', '15m', '1h', '1d']
</script>

