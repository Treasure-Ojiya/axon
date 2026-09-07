<script setup lang="ts">
defineProps<{
  status: 'live' | 'working' | 'offline'
}>()
</script>

<template>
  <span
    class="inline-block w-2 h-2 rounded-full shrink-0"
    :class="{
      'bg-success-400 pulse-live': status === 'live',
      'bg-warning-400 blink-working': status === 'working',
      'bg-neutral-500': status === 'offline',
    }"
  />
</template>
