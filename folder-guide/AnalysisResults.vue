<script setup lang="ts">
import { computed } from 'vue'
import { storeToRefs } from 'pinia'
import { useWorkspaceStore } from '@/stores/workspace'

const store = useWorkspaceStore()
const { result } = storeToRefs(store)

const analysis = computed(() => result.value?.data.ai_analysis ?? null)

const analysis = computed(() => {
  return store.result?.data.ai_analysis
})

const scoreColor = computed(() => {
  const s = analysis.value?.match_score ?? 0
  if (s >= 70)
    return {
      ring: '#1D9E75',
      text: 'text-success-400',
      sub: 'Strong match — apply with confidence',
    }
  if (s >= 40)
    return {
      ring: '#EF9F27',
      text: 'text-warning-400',
      sub: 'Good foundation — a few gaps to close',
    }
  return { ring: '#D85A30', text: 'text-danger-400', sub: 'Needs work before applying' }
})

const circumference = 138.2
const dashOffset = computed(() => {
  const pct = (analysis.value?.match_score ?? 0) / 100
  return circumference - pct * circumference
})
</script>

<template>
  <div v-if="analysis" class="flex flex-col gap-5">
    <!-- Score ring -->
    <div class="flex items-center gap-4 bg-neutral-800 border border-neutral-700 rounded-xl p-4">
      <svg viewBox="0 0 56 56" class="w-14 h-14 shrink-0">
        <circle cx="28" cy="28" r="22" fill="none" stroke="#201e3a" stroke-width="5" />
        <circle
          cx="28"
          cy="28"
          r="22"
          fill="none"
          :stroke="scoreColor.ring"
          stroke-width="5"
          stroke-linecap="round"
          :stroke-dasharray="circumference"
          :stroke-dashoffset="dashOffset"
          transform="rotate(-90 28 28)"
          class="transition-all duration-700"
        />
        <text
          x="28"
          y="32"
          text-anchor="middle"
          font-size="12"
          font-weight="600"
          :fill="scoreColor.ring"
          font-family="JetBrains Mono, monospace"
        >
          {{ analysis.match_score }}%
        </text>
      </svg>
      <div>
        <div class="text-base font-semibold text-neutral-50">
          Match score: {{ analysis.match_score }} / 100
        </div>
        <div class="text-sm mt-0.5" :class="scoreColor.text">{{ scoreColor.sub }}</div>
      </div>
    </div>

    <!-- Missing keywords -->
    <!-- Missing keywords -->
    <div>
      <div
        class="text-[11px] font-medium text-neutral-400 uppercase tracking-widest mb-2.5 flex items-center gap-1.5"
      >
        <i class="ti ti-tag"></i>
        Missing keywords
      </div>

      <div v-if="analysis.missing_keywords.length" class="flex flex-wrap gap-2">
        <span
          v-for="kw in analysis.missing_keywords"
          :key="kw"
          class="text-xs font-mono px-2.5 py-1 rounded-md bg-danger-400/10 border border-danger-400/25 text-danger-300"
        >
          {{ kw }}
        </span>
      </div>

      <p v-else class="text-sm text-success-300">No major keywords missing.</p>
    </div>

    <!-- Before / after -->
    <div>
      <div
        class="text-[11px] font-medium text-neutral-400 uppercase tracking-widest mb-2.5 flex items-center gap-1.5"
      >
        <i class="ti ti-pencil"></i> Sentence to improve
      </div>
      <div
        v-if="analysis.sentence_to_improve || analysis.recommended_improvement"
        class="flex flex-col gap-2"
      >
        <div class="rounded-xl p-3.5 bg-danger-400/8 border border-danger-400/20">
          <div class="text-[9px] font-mono text-danger-500 uppercase tracking-widest mb-1.5">
            Before
          </div>
          <p class="text-sm text-danger-200 leading-relaxed">{{ analysis.sentence_to_improve }}</p>
        </div>
        <div class="flex justify-center">
          <i class="ti ti-arrow-down text-neutral-600"></i>
        </div>
        <div class="rounded-xl p-3.5 bg-success-400/8 border border-success-400/20">
          <div class="text-[9px] font-mono text-success-500 uppercase tracking-widest mb-1.5">
            After
          </div>
          <p class="text-sm text-success-200 leading-relaxed">
            {{ analysis.recommended_improvement }}
          </p>
        </div>
      </div>

      <p v-else class="text-sm text-neutral-500">No sentence improvements suggested.</p>
    </div>

    <!-- Reasoning -->
    <div>
      <div
        class="text-[11px] font-medium text-neutral-400 uppercase tracking-widest mb-2.5 flex items-center gap-1.5"
      >
        <i class="ti ti-bulb"></i> Reasoning
      </div>
      <div class="bg-brand-500/8 border border-brand-500/20 rounded-xl px-4 py-3.5">
        <p class="text-sm text-brand-200 leading-relaxed whitespace-pre-wrap">
          {{ analysis.reasoning }}
        </p>
      </div>
    </div>

    <!-- New analysis -->
    <button
      @click="store.reset()"
      class="w-full h-10 rounded-xl border border-neutral-700 text-sm font-medium text-neutral-400 hover:text-neutral-200 hover:border-neutral-600 flex items-center justify-center gap-2 transition-all"
    >
      <i class="ti ti-plus text-base"></i> New analysis
    </button>
  </div>
</template>
