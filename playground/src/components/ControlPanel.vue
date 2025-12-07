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
  </div>
</template>

<script setup lang="ts">
import type { TimeframeId } from 'synticks-chart'

defineProps<{
  symbol: string
  timeframe: TimeframeId
}>()

const emit = defineEmits<{
  (e: 'update:symbol', value: string): void
  (e: 'update:timeframe', value: TimeframeId): void
}>()

const timeframes: TimeframeId[] = ['1m', '5m', '15m', '1h', '1d']
</script>

