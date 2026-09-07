<script setup lang="ts">
import { ref } from 'vue'
import { useWorkspaceStore } from '@/stores/workspace'
import {
  IconAlertCircle,
  IconCircleCheck,
  IconCloudUpload,
  IconFileText,
  IconLoader,
  IconX,
} from '@tabler/icons-vue'

const store = useWorkspaceStore()
const dragging = ref(false)
const upLoadError = ref('')

async function handleFile(file: File) {
  if (file.type !== 'application/pdf') {
    upLoadError.value = 'Please upload a PDF file'
    return
  }

  if (file.size > 10 * 1024 * 1024) {
    upLoadError.value = 'File must be under 10MB'
    return
  }

  await store.uploadCvFile(file)

  if (store.phase === 'error') {
    upLoadError.value = store.errorMessage
  }
}

async function onFileInput(event: Event) {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]

  if (!file) return

  await handleFile(file)
}

function onDrop(e: DragEvent) {
  dragging.value = false
  const file = e.dataTransfer?.files?.[0]
  if (file) handleFile(file)
}
</script>
<template>
  <div>
    <label
      for=""
      class="block text-[11px] font-medium text-neutral-200 uppercase tracking-widest mb-2"
    >
      <IconFileText class="mr-1" />
    </label>

    <div
      v-if="store.cvFile"
      class="flex items-center gap-3 rounded-xl border border-success-400 bg-success-400/10 px-4 py-3"
    >
      <IconCircleCheck class="text-success-400 text-xl shrink-0" />

      <div class="flex-1 min-w-0">
        <div class="text-sm font-medium text-success-400 truncate">
          {{ store.cvFile?.name }}
        </div>

        <div class="text-sm text-success-400 font-mono">Text extracted • Ready for analysis</div>
      </div>

      <button
        @click="store.reset()"
        class="text-danger-400 hover:text-danger-200 transition-colors shrink-0"
        aria-label="Remove file"
      >
        <IconX class="text-sm" />
      </button>
    </div>
    <label
      v-else
      for="resume-upload"
      class="flex flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed cursor-pointer transition-all min-h-25"
      :class="[
        dragging
          ? 'border-brand-500 bg-brand-500/10'
          : 'border-neutral-700 bg-neutral-800/50 hover:border-brand-500/60 hover:bg-brand-500/5',
        store.phase === 'uploading' ? 'pointer-events-none opacity-60' : '',
      ]"
      @dragover.prevent="dragging = true"
      @dragleave.prevent="dragging = false"
      @drop.prevent="onDrop"
    >
      <input
        id="resume-upload"
        type="file"
        accept=".pdf"
        class="hidden"
        :disabled="store.phase === 'uploading'"
        @change="onFileInput"
      />
      <template v-if="store.phase === 'uploading'">
        <IconLoader class="text-2xl text-neutral-200 animate-spin" />

        <span class="text-sm text-neutral-200"> Uploading and extracting text... </span>
      </template>

      <template v-else>
        <IconCloudUpload
          class="text-2xl"
          :class="dragging ? 'text-brand-400' : 'text-neutral-600'"
        />

        <span
          class="text-sm font-medium"
          :class="dragging ? 'text-neutral-200' : 'text-neutral-200'"
        >
          Drop your PDF here
        </span>

        <span class="text-neutral-300 font-mono text-xs"> Or click to browse • Max 10 MB </span>
      </template>
    </label>

    <p
      v-if="store.errorMessage"
      class="mt-2 text-xs text-danger-400 font-mono flex items-center gap-1"
    >
      <IconAlertCircle />
      {{ store.errorMessage }}
    </p>
  </div>
</template>

<style scoped></style>
