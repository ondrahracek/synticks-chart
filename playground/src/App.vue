<script setup lang="ts">
import { ref } from 'vue'
import { PlaygroundChart } from 'synticks-chart/vue'
import ControlPanel from './components/ControlPanel.vue'
import { usePlaygroundState } from './composables/usePlaygroundState'

const chartRef = ref<InstanceType<typeof PlaygroundChart> | null>(null)
const { symbol, timeframe } = usePlaygroundState()
</script>

<template>
  <div class="app-root" style="width: 100vw; height: 100vh; box-sizing: border-box;">
    <div class="app-layout" style="display:flex; flex-direction:column; height:100%;">
      <ControlPanel
        :symbol="symbol"
        :timeframe="timeframe"
        @update:symbol="symbol = $event"
        @update:timeframe="timeframe = $event"
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
