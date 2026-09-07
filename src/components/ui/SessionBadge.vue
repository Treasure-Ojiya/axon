<script setup lang="ts">
import { storeToRefs } from 'pinia'
import { useAuthStore } from '@/stores/auth'
import LiveDot from '@/components/ui/LiveDot.vue'

const authStore = useAuthStore()
const { isLoggedIn } = storeToRefs(authStore)
</script>

<template>
  <div
    v-if="isLoggedIn"
    class="flex items-center gap-1.5 text-[11px] font-mono bg-success-400/10 border border-success-400/20 text-success-400 px-2 py-1 rounded-md"
  >
    <LiveDot status="live" />
    session active
  </div>
  <div
    v-else
    class="flex items-center gap-1.5 text-[11px] font-mono bg-neutral-800 border border-neutral-700 text-neutral-600 px-2 py-1 rounded-md"
  >
    <LiveDot status="offline" />
    no session
  </div>
</template>
