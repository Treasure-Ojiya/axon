<script setup lang="ts">
import { onMounted } from 'vue'
import { storeToRefs } from 'pinia'
import { useWorkspaceStore } from '@/stores/workspace'
import { useHistoryStore } from '@/stores/history'
import AppSidebar from '@/components/layouts/AppSidebar.vue'
import TopBar from '@/components/layouts/TopBar.vue'
import DocUploader from '@/components/workspace/DocUploader.vue'
import JobDescription from '@/components/workspace/JobDescription.vue'
import AnalyzeButton from '@/components/workspace/AnalyzeButton.vue'
import AnalysisResults from '@/components/workspace/AnalysisResults.vue'
import AnalysisProgress from '@/components/workspace/AnalysisProgress.vue'
import { IconWifiOff } from '@tabler/icons-vue'

const workspaceStore = useWorkspaceStore()
const historyStore = useHistoryStore()
const { phase } = storeToRefs(workspaceStore)

const topBarTitle: Record<string, string> = {
  idle: 'New analysis',
  uploading: 'Uploading CV...',
  connecting_ws: 'Connecting...',
  streaming: 'Analyzing your Cv...',
  done: 'Results',
  error: 'Error',
}

onMounted(() => {
  historyStore.getHistories()
})
</script>

<template>
  <div class="flex h-screen overflow-hidden bg-neutral-900">
    <AppSidebar />

    <div class="flex flex-col flex-1 min-w-0">
      <TopBar :title="topBarTitle[phase] ?? 'New analysis'" />

      <main class="flex-1 overflow-y-auto px-5 py-5">
        <Transition
          enter-active-class="transition-all duration-300"
          enter-from-class="opacity-0 translate--y-2"
          leave-active-class="transition-200"
          leave-to-class="opacity-0 translate-y-2"
          mode="out-in"
        >
          <div v-if="phase === 'idle' || phase == 'uploading'">
            <DocUploader />
            <JobDescription />
            <AnalyzeButton />
          </div>

          <div
            v-else-if="phase === 'connecting_ws' || phase === 'streaming'"
            key="progress"
            class="max-w-2xl mx-auto"
          >
            <AnalysisProgress />
          </div>

          <div v-else-if="phase === 'done'" key="results" class="max-w-2xl mx-auto">
            <AnalysisResults />
          </div>

          <div v-else-if="phase === 'error'" key="error" class="max-w-2xl mx-auto">
            <div
              class="bg-danger-400/10 border border-danger-400/25 rounded-xl px-5 py-6 text-center"
            >
              <IconWifiOff color="red" size="36" stroke-width="2" />
              <p class="text-sm text-danger-300 mb-1">{{ workspaceStore.errorMessage }}</p>
              <p class="text-xs text-neutral-600 font-mono mb-5">
                Check your conection and try again
              </p>
              <button
                @click="workspaceStore.reset()"
                class="px-4 py-4 rounded-lg bg-neutral-800 border border-neutral-700 text-sm text-neutral-300 hover:text-white hover:border-neutral-600 transition-all"
              >
                Try again
              </button>
            </div>
          </div>
        </Transition>
      </main>
    </div>
  </div>
</template>

<style scoped></style>
