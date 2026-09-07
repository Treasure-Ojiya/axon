<script setup lang="ts">
import { computed } from 'vue'
import { useWorkspaceStore } from '@/stores/workspace'

const store = useWorkspaceStore()

const displayProgress = computed(() => Math.max(0, Math.min(store.progressPercent || 0, 100)))
</script>

<template>
  <div class="flex flex-col gap-5">
    <!-- Progress bar (frontend-simulated, not backend-driven) -->
    <div>
      <div class="flex items-center justify-between mb-2">
        <span class="text-xs font-mono text-neutral-400">analyzing</span>
        <span class="text-xs font-mono text-brand-400">{{ displayProgress }}%</span>
      </div>
      <div class="h-1.5 bg-neutral-800 rounded-full overflow-hidden border border-white/5">
        <div
          class="h-full bg-brand-500 rounded-full transition-all duration-500 ease-out"
          :style="{ width: `${displayProgress}%` }"
        />
      </div>
    </div>

    <!-- Live streamed text — chat-style, grows as chunks arrive -->
    <div
      class="bg-neutral-800 border border-neutral-700 rounded-xl px-4 py-3.5 max-h-80 overflow-y-auto"
    >
      <p
        v-if="store.streamedContent"
        class="text-sm text-neutral-200 leading-relaxed whitespace-pre-wrap"
      >
        {{ store.streamedContent }}<span class="animate-pulse">▌</span>
      </p>
      <p v-else class="text-sm text-neutral-500 text-center py-2">Hang tight, preparing analysis…</p>
    </div>
  </div>
</template>

<style scoped></style>
