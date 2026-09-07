<script setup lang="ts">
import { storeToRefs } from 'pinia'
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import { useRouter } from 'vue-router'

import { useHistoryStore } from '@/stores/history'
import { useWorkspaceStore } from '@/stores/workspace'
import { useAuthStore } from '@/stores/auth'

import type { UserData } from '@/types/auth'
import type { HistoryItem } from '@/types/analysis'

import LiveDot from '../ui/LiveDot.vue'

import {
  IconPlus,
  IconLayoutSidebarLeftCollapse,
  IconLayoutSidebarLeftExpand,
  IconLogout,
} from '@tabler/icons-vue'

const router = useRouter()

const historyStore = useHistoryStore()
const workspaceStore = useWorkspaceStore()
const authStore = useAuthStore()

const user = ref<UserData | null>(null)

const { items: history, loading: histLoading } = storeToRefs(historyStore)
const { phase } = storeToRefs(workspaceStore)

// -----------------------------------------------------------------------------
// Sidebar
// -----------------------------------------------------------------------------

const sidebarWidth = ref(256)
const expandedWidth = ref(256)
const collapsed = ref(false)

const MIN_WIDTH = 56
const MAX_WIDTH = 275
const COLLAPSE_THRESHOLD = 100

const isResizing = ref(false)

// Collapse Sidebar
const collapseSidebar = () => {
  if (!collapsed.value) {
    expandedWidth.value = sidebarWidth.value
  }

  collapsed.value = true
  sidebarWidth.value = MIN_WIDTH
}

const expandSidebar = () => {
  collapsed.value = false
  sidebarWidth.value = expandedWidth.value
}

// Resize method
const startResize = (event: MouseEvent) => {
  event.preventDefault()

  isResizing.value = true

  document.body.style.cursor = 'col-resize'
  document.body.style.userSelect = 'none'

  document.addEventListener('mousemove', handleResize)
  document.addEventListener('mouseup', stopResize)
}

const handleResize = (event: MouseEvent) => {
  if (!isResizing.value) return

  const width = Math.min(Math.max(event.clientX, MIN_WIDTH), MAX_WIDTH)

  if (width <= COLLAPSE_THRESHOLD) {
    collapseSidebar()
    return
  }

  collapsed.value = false
  sidebarWidth.value = width
  expandedWidth.value = width
}

const stopResize = () => {
  if (!isResizing.value) return

  isResizing.value = false

  document.body.style.cursor = ''
  document.body.style.userSelect = ''

  document.removeEventListener('mousemove', handleResize)
  document.removeEventListener('mouseup', stopResize)
}

onBeforeUnmount(() => {
  stopResize()
})

onMounted(async () => {
  try {
    const res = await authStore.getUser()
    user.value = res.data

    await historyStore.getHistories()
  } catch {
    authStore.logout()
    router.push({ name: 'login' })
  }
})

const displayName = computed(() => {
  if (!user.value) return 'Not signed in'

  return [user.value.first_name, user.value.last_name].filter(Boolean).join(' ')
})

const initials = computed(() => {
  if (!user.value) return '?'

  return `${user.value.first_name?.[0] ?? ''}${user.value.last_name?.[0] ?? ''}`.toUpperCase()
})

function getScore(item: HistoryItem) {
  return historyStore.parseAnalysis(item.ai_analysis)?.match_score ?? null
}

function scoreClass(score: number | null): string {
  if (score === null) {
    return 'text-neutral-600 bg-neutral-800 border-neutral-700'
  }

  if (score >= 70) {
    return 'text-success-400 bg-success-400/10 border-success-400/25'
  }

  if (score >= 40) {
    return 'text-warning-400 bg-warning-400/10 border-warning-400/25'
  }

  return 'text-danger-400 bg-danger-400/10 border-danger-400/25'
}

function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime()

  const minute = Math.floor(diff / 60000)

  if (minute < 1) return 'just now'

  if (minute < 60) {
    return `${minute} min ago`
  }

  const hour = Math.floor(minute / 60)

  if (hour < 24) {
    return `${hour} hour${hour === 1 ? '' : 's'} ago`
  }

  const day = Math.floor(hour / 24)

  return `${day} day${day === 1 ? '' : 's'} ago`
}

function loadHistory(item: HistoryItem) {
  const parsed = historyStore.parseAnalysis(item.ai_analysis)

  if (!parsed) return

  workspaceStore.result = {
    status: 'success',
    message: 'Resume action',
    data: {
      ai_analysis: parsed as never,
    },
  }

  workspaceStore.phase = 'done'
}

function newAnalysis() {
  workspaceStore.reset()
}

function logout() {
  authStore.logout()
  router.push({ name: 'login' })
}
</script>

<template>
  <aside
    class="relative flex flex-col shrink-0 bg-neutral-850 border-r border-white/5"
    :class="!isResizing && 'transition-[width] duration-300'"
    :style="{ width: `${sidebarWidth}px` }"
  >
    <header
      class="border-b border-white/5"
      :class="
        collapsed
          ? 'flex flex-col items-center gap-3 px-0 py-3'
          : 'flex items-center gap-2 px-3 py-4'
      "
    >
      <div
        class="w-7 h-7 rounded-md bg-brand-500 flex items-center justify-center text-white text-xs font-semibold shrink-0"
      >
        A
      </div>

      <template v-if="!collapsed">
        <div class="flex-1 min-w-0">
          <div class="text-base font-medium text-neutral-50 font-mono">AXON</div>

          <div class="text-xs text-neutral-400 font-mono">resume intelligence</div>
        </div>

        <button
          type="button"
          @click="collapseSidebar"
          class="w-8 h-8 flex items-center justify-center rounded-md text-neutral-600 hover:text-neutral-300 hover:bg-white/5 transition-colors"
          aria-label="Collapse sidebar"
          title="Collapse sidebar"
        >
          <IconLayoutSidebarLeftCollapse size="18" />
        </button>
      </template>

      <template v-else>
        <button
          type="button"
          @click="expandSidebar"
          class="w-8 h-8 rounded-md flex items-center justify-center text-neutral-600 hover:text-neutral-300 hover:bg-white/5 transition-colors"
          aria-label="Expand sidebar"
          title="Expand sidebar"
        >
          <IconLayoutSidebarLeftExpand size="18" />
        </button>
      </template>
    </header>

    <div
      class="border-b border-white/5"
      :class="collapsed ? 'flex justify-center px-0 py-2.5' : 'px-3 py-2.5'"
    >
      <div class="flex items-center gap-2">
        <LiveDot
          :status="phase === 'connecting_ws' || phase === 'streaming' ? 'working' : 'live'"
        />

        <span
          v-if="!collapsed"
          class="text-sm font-mono"
          :class="
            phase === 'connecting_ws' || phase === 'streaming'
              ? 'text-warning-400'
              : 'text-success-400'
          "
        >
          {{
            phase === 'connecting_ws'
              ? 'connecting...'
              : phase === 'streaming'
                ? 'analyzing...'
                : 'ready to parse'
          }}
        </span>
      </div>
    </div>

    <button
      type="button"
      @click="newAnalysis"
      class="mx-2 my-2 rounded-lg border border-white/5 bg-white/2 text-neutral-400 hover:bg-brand-500/10 hover:border-brand-500/20 hover:text-brand-300 transition-all"
      :class="
        collapsed
          ? 'w-10 h-10 mx-auto flex items-center justify-center'
          : 'w-[calc(100%-1rem)] flex items-center gap-2 px-2.5 py-2'
      "
      :title="collapsed ? 'New analysis' : undefined"
    >
      <IconPlus class="w-5 h-5 shrink-0" />

      <span v-if="!collapsed" class="text-xs font-mono"> New analysis </span>
    </button>

    <div class="flex-1 min-h-0 overflow-y-auto">
      <template v-if="!collapsed">
        <div class="px-3 pt-3 pb-2 text-xs font-mono text-neutral-200 uppercase tracking-widest">
          Query History
        </div>

        <div v-if="histLoading" class="px-3 py-3 text-xs text-neutral-600 font-mono">
          Loading...
        </div>

        <div v-else-if="history.length === 0" class="px-3 py-3 text-xs text-neutral-200 font-mono">
          No queries yet...
        </div>

        <button
          v-for="item in history"
          :key="item.id"
          type="button"
          @click="loadHistory(item)"
          class="w-full text-left px-3 py-2 border border-transparent rounded-lg hover:bg-white/5 hover:border-brand-500/20 transition-all"
        >
          <div class="font-mono text-neutral-200 truncate text-[11px]">
            {{ historyStore.jobTitle(item.job_description) }}
          </div>

          <div class="flex items-center gap-1.5 mt-1">
            <span class="text-[10px] text-neutral-400">
              {{ timeAgo(item.created_at) }}
            </span>

            <span
              class="text-[9px] font-mono px-1.5 py-0.5 rounded border"
              :class="scoreClass(getScore(item))"
            >
              {{ getScore(item) }}%
            </span>
          </div>
        </button>
      </template>

      <template v-else>
        <div class="flex flex-col items-center gap-1.5 pt-2">
          <button
            v-for="item in history.slice(0, 6)"
            :key="item.id"
            type="button"
            @click="loadHistory(item)"
            class="w-8 h-8 rounded-md flex items-center justify-center text-[10px] font-mono border border-transparent hover:bg-white/5 transition-colors"
            :class="scoreClass(getScore(item))"
            :title="historyStore.jobTitle(item.job_description)"
          >
            {{ getScore(item) ?? '?' }}%
          </button>
        </div>
      </template>
    </div>

    <footer
      class="border-t border-white/10"
      :class="collapsed ? 'flex flex-col items-center gap-2 px-0 py-3' : 'px-3 py-3'"
    >
      <template v-if="!collapsed">
        <div class="flex items-center gap-2">
          <div
            class="h-8 w-8 rounded-full bg-brand-500/15 border border-brand-500/25 flex items-center justify-center text-xs font-semibold text-brand-300 shrink-0"
            :title="displayName"
          >
            {{ initials }}
          </div>

          <div class="flex-1 min-w-0">
            <div class="text-sm text-neutral-200 truncate">
              {{ displayName }}
            </div>

            <div class="text-[11px] text-neutral-400 truncate font-mono">
              {{ user?.email }}
            </div>
          </div>

          <button
            type="button"
            @click="logout"
            class="w-8 h-8 flex items-center justify-center rounded-md text-neutral-600 hover:text-danger-400 hover:bg-danger-400/10 transition-colors"
            title="Logout"
          >
            <IconLogout size="18" />
          </button>
        </div>
      </template>

      <template v-else>
        <div
          class="h-8 w-8 rounded-full bg-brand-500/15 border border-brand-500/25 flex items-center justify-center text-xs font-semibold text-brand-300"
          :title="displayName"
        >
          {{ initials }}
        </div>

        <button
          type="button"
          @click="logout"
          class="w-8 h-8 flex items-center justify-center rounded-md text-neutral-600 hover:text-danger-400 hover:bg-danger-400/10 transition-colors"
          title="Logout"
        >
          <IconLogout size="17" />
        </button>
      </template>
    </footer>

    <div
      class="absolute top-0 right-0.75 z-50 h-full w-1.5 cursor-col-resize group"
      @mousedown="startResize"
    >
      <div
        class="absolute inset-y-0 left-1/2 w-px -translate-x-1/2 bg-transparent group-hover:bg-brand-500/40 transition-colors"
      />
    </div>
  </aside>
</template>

<style scoped>
aside {
  contain: layout;
}
</style>
