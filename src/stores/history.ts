// stores/history.ts
import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { HistoryItem, HistoriesResponse, AIAnalysis } from '@/types/analysis'
import { historyService } from '@/services/api'

export const useHistoryStore = defineStore('history', () => {
  const items = ref<HistoryItem[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  async function getHistories() {
    // Don't fetch if already loading
    if (loading.value) return

    loading.value = true
    error.value = null

    try {
      const res: HistoriesResponse = await historyService.getAll()

      // Handle different response structures
      if (res.data && Array.isArray(res.data)) {
        items.value = res.data
      } else if (res.data && res.data.data && Array.isArray(res.data.data)) {
        items.value = res.data.data
      } else if (Array.isArray(res)) {
        items.value = res as unknown as HistoryItem[]
      } else {
        items.value = []
      }
    } catch (err: unknown) {
      console.error('Failed to fetch histories:', err)
      if (err instanceof Error) {
        error.value = err.message
      } else {
        error.value = String(err)
      }
      items.value = []
    } finally {
      loading.value = false
    }
  }

  function prepend(item: HistoryItem) {
    items.value.unshift(item)
  }

  // ai_analysis can arrive as a parsed object or a raw markdown/JSON string
  function parseAnalysis(raw: AIAnalysis | string): AIAnalysis | null {
    if (!raw) return null

    if (typeof raw === 'object' && raw !== null) {
      // Check if it has the expected properties
      if ('match_score' in raw || 'reasoning' in raw) {
        return raw as AIAnalysis
      }
      return null
    }

    if (typeof raw === 'string') {
      // Try JSON first
      try {
        const parsed = JSON.parse(raw)
        if (parsed && typeof parsed === 'object') {
          return parsed as AIAnalysis
        }
      } catch {
        // Not JSON, try to extract score from markdown
        const scoreMatch = raw.match(/Match Score[:\s]+(\d+)/i)
        const score = scoreMatch && scoreMatch[1] ? parseInt(scoreMatch[1]) : null

        if (score !== null) {
          return {
            match_score: score,
            missing_keywords: [],
            reasoning: raw,
            sentence_to_improve: '',
            recommended_improvement: '',
          }
        }
      }
    }

    return null
  }

  function getMatchScore(item: HistoryItem): number | null {
    const analysis = parseAnalysis(item.ai_analysis)
    return analysis?.match_score ?? null
  }

  function jobTitle(jd: string): string {
    const titleMatch = jd.match(/Job Title[:\s]+(.+)/i)
    if (titleMatch?.[1]) return titleMatch[1].trim()

    const firstLine = jd.split('\n').find((l) => l.trim().length > 0)
    return firstLine ? firstLine.trim().slice(0, 35) : 'Analysis'
  }

  function clearHistory() {
    items.value = []
    error.value = null
  }

  return {
    items,
    loading,
    error,
    getHistories,
    prepend,
    parseAnalysis,
    getMatchScore,
    jobTitle,
    clearHistory,
  }
})
