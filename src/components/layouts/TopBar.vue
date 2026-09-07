<script setup lang="ts">
import { storeToRefs } from 'pinia'
import { useWorkspaceStore } from '@/stores/workspace'
import LiveDot from '@/components/ui/LiveDot.vue'

defineProps<{ title: string }>()

const workspaceStore = useWorkspaceStore()
const { phase, isWorking } = storeToRefs(workspaceStore)
</script>

<template>
  <header class="h-12 flex items-center gap-3 px-4 border-b border-white/5 shrink-0">
    <span class="flex-1 text-sm font-medium text-neutral-50">{{ title }}</span>

    <!-- Session indicator — always visible when logged in -->
    <div
      class="flex items-center gap-1.5 text-[11px] font-mono bg-success-400/10 border border-success-400/20 text-success-400 px-2 py-1 rounded-md"
    >
      <LiveDot status="live" />
      session
    </div>

    <!-- Working indicator — only during upload / connecting / streaming -->
    <Transition
      enter-active-class="transition-all duration-200"
      enter-from-class="opacity-0 scale-95"
      leave-active-class="transition-all duration-150"
      leave-to-class="opacity-0 scale-95"
    >
      <div
        v-if="isWorking"
        class="flex items-center gap-1.5 text-[11px] font-mono bg-warning-400/10 border border-warning-400/20 text-warning-400 px-2 py-1 rounded-md"
      >
        <LiveDot status="working" />
        {{
          phase === 'uploading'
            ? 'uploading'
            : phase === 'connecting_ws'
              ? 'connecting'
              : 'analyzing'
        }}
      </div>
    </Transition>
  </header>
</template>
