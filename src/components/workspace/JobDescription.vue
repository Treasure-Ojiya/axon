<script setup lang="ts">
import { storeToRefs } from 'pinia'
import { useWorkspaceStore } from '@/stores/workspace'
import { IconBriefcase } from '@tabler/icons-vue'

const workspaceStore = useWorkspaceStore()
const { jobDescriptionText } = storeToRefs(workspaceStore)
</script>

<template>
  <div class="mt-10">
    <div class="flex items-center justify-between mb-2">
      <label
        for="jd-input"
        class="flex items-center text-[11px] font-medium text-neutral-200 uppercase tracking-widest"
      >
        <IconBriefcase class="mr-1" />
        Job Description
      </label>

      <span
        class="text-sm font-mono transition-colors"
        :class="jobDescriptionText.trim().length > 50 ? 'text-success-400' : 'text-neutral-600'"
      >
        {{ jobDescriptionText.length }} chars
      </span>
    </div>

    <textarea
      id="jd-input"
      v-model="jobDescriptionText"
      placeholder="Paste the job description here..."
      rows="6"
      spellcheck="false"
      class="w-full rounded-xl border border-neutral-700 bg-neutral-950 px-4 py-3 text-sm text-neutral-50 font-sans leading-relaxed placeholder:text-neutral-300 resize-none focus:outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 transition-colors"
    ></textarea>

    <p
      v-if="jobDescriptionText.trim().length > 0 && jobDescriptionText.trim().length <= 20"
      class="mt-2 mb-2 text-xs text-danger-400 font-mono"
    >
      Add a bit more detail for better comparison results.
    </p>
  </div>
</template>

<style scoped></style>
