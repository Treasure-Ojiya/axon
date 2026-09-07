<script setup lang="ts">
import { storeToRefs } from 'pinia'
import { useWorkspaceStore } from '@/stores/workspace'
import { useHistoryStore } from '@/stores/history'
import { watch, computed } from 'vue'

const workspaceStore = useWorkspaceStore()
const historyStore = useHistoryStore()
const { phase, jobDescriptionText } = storeToRefs(workspaceStore)
const canAnalyze = computed(() => !!workspaceStore.cvFile && !!jobDescriptionText.value)

watch(
  () => workspaceStore.result,
  (result) => {
    if (result && workspaceStore.cvFile) {
      historyStore.prepend({
        id: crypto.randomUUID(),
        resume_text: workspaceStore.cvFile.name,
        job_description: jobDescriptionText.value,
        ai_analysis: JSON.stringify(result.data.ai_analysis),
        created_at: new Date().toDateString(),
      })
    }
  },
)

function analyze() {
  if (!canAnalyze.value) return
  workspaceStore.analyzeWithWebsocket()
}

const isBusy = computed(() => {
  return phase.value === 'connecting_ws' || phase.value === 'streaming'
})

const buttonText = computed(() => {
  switch (phase.value) {
    case 'connecting_ws':
      return 'Connecting...'

    case 'streaming':
      return 'Analyzing...'

    default:
      return 'Analyze Match'
  }
})
</script>

<template>
  <div>
    <button
      :disabled="!canAnalyze || isBusy"
      @click="analyze"
      class="w-full h-11 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 transition-all duration-200"
      :class="
        canAnalyze && !isBusy
          ? 'bg-brand-500 hover:bg-brand-600 text-white'
          : 'bg-neutral-800 text-neutral-600 cursor-not-allowed opacity-70'
      "
    >
      <i class="text-base" :class="isBusy ? 'ti ti-loader animate-spin' : 'ti ti-cpu'"></i>

      <span>
        {{ buttonText }}
      </span>
    </button>
  </div>
</template>

<style scoped></style>
