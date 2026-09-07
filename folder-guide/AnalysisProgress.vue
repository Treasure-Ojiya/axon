<script setup lang="ts">
import { computed } from 'vue'
import { storeToRefs } from 'pinia'
import { useWorkspaceStore } from '@/stores/workspace'

const store = useWorkspaceStore()
const { progressPercent, currentStage, phase } = storeToRefs(store)

const stageMessage = computed(() => {
  return store.getStageMessage(store.currentStage)
})

const displayProgress = computed(() => Math.max(0, Math.min(store.progressPercent || 0, 100)))

const order = ['extracting', 'analyzing_skills', 'checking_keywords', 'generating_suggestions']

function stepStatus(stage: string) {
  const current = order.indexOf(store.currentStage)
  const index = order.indexOf(stage)

  if (index < current) return 'done'
  if (index === current) return 'active'
  return 'pending'
}

// const steps = [
//   { label: 'Connecting',   stage: 'connecting',            threshold: 5  },
//   { label: 'Reading CV',   stage: 'extracting',            threshold: 25 },
//   { label: 'Skill check',  stage: 'analyzing_skills',      threshold: 50 },
//   { label: 'Keywords',     stage: 'checking_keywords',     threshold: 75 },
//   { label: 'Suggestions',  stage: 'generating_suggestions',threshold: 90 },
// ]

function stepStatus(stage: string, threshold: number) {
  if (progressPercent.value >= threshold) return 'done'
  if (currentStage.value === stage || (stage === 'connecting' && phase.value === 'connecting_ws'))
    return 'active'
  if (store.phase === 'done') {
    return 'done'
  }
  return 'pending'
}

const funMessage = computed(() => {
  switch (store.currentStage) {
    case 'extracting':
      return 'Extracting text from your resume.'

    case 'analyzing_skills':
      return 'Comparing your skills with the role.'

    case 'checking_keywords':
      return 'Checking important keywords.'

    case 'generating_suggestions':
      return 'Preparing tailored recommendations.'

    default:
      return 'Preparing analysis.'
  }
})

const funMessage = computed(
  () => funMessages[currentStage.value] ?? funMessages[phase.value] ?? 'Analyzing your match…',
)
</script>

<template>
  <div class="flex flex-col gap-5">
    <!-- Progress bar -->
    <div>
      <div class="flex items-center justify-between mb-2">
        <span class="text-xs font-mono text-neutral-400">{{ stageMessage }}</span>
        <span class="text-xs font-mono text-brand-400">{{ displayProgress }}%</span>
      </div>
      <div class="h-1.5 bg-neutral-800 rounded-full overflow-hidden border border-white/5">
        <div
          class="h-full bg-brand-500 rounded-full transition-all duration-500 ease-out"
          :style="{ width: `${displayProgress}%` }"
        />
      </div>
    </div>

    <!-- Step pills — driven by real stage data from WebSocket -->
    <div class="flex gap-2 flex-wrap">
      <div
        v-for="step in steps"
        :key="step.stage"
        class="flex items-center gap-1.5 text-[10px] font-mono px-2.5 py-1 rounded-md border transition-all duration-300"
        :class="{
          'bg-success-400/10 border-success-400/25 text-success-400':
            stepStatus(step.stage, step.threshold) === 'done',
          'bg-brand-500/10  border-brand-500/25  text-brand-300':
            stepStatus(step.stage, step.threshold) === 'active',
          'bg-neutral-800   border-neutral-700   text-neutral-600':
            stepStatus(step.stage, step.threshold) === 'pending',
        }"
      >
        <i
          class="text-[10px]"
          :class="{
            'ti ti-check': stepStatus(step.stage, step.threshold) === 'done',
            'ti ti-loader spin': stepStatus(step.stage, step.threshold) === 'active',
            'ti ti-clock': stepStatus(step.stage, step.threshold) === 'pending',
          }"
        ></i>
        {{ step.label }}
      </div>
    </div>

    <!-- Fun message -->
    <div class="bg-neutral-800 border border-neutral-700 rounded-xl px-4 py-5 text-center">
      <div class="text-sm text-neutral-300 mb-1.5">Hang tight</div>
      <div class="text-xs font-mono text-neutral-600">{{ funMessage }}</div>
    </div>
  </div>
</template>
