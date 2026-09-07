import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { resumeService } from '@/services/api'
import { SocketService } from '@/services/socket'
import type { JobAnalysisResponse, AnalysisPhase } from '@/types/analysis'

// Frontend-owned simulated progress. Since the backend sends no progress/stage
// info, we ramp toward 90% while streaming and only ever hit 100% on actual
// completion — so the bar always looks alive but never lies about being done.
const SIMULATED_PROGRESS_CAP = 90
const SIMULATED_PROGRESS_INTERVAL_MS = 400
const SIMULATED_PROGRESS_STEP = 3

export const useWorkspaceStore = defineStore('workspace', () => {
  const cvFile = ref<File | null>(null)
  const cvText = ref('')
  const jobDescriptionText = ref('')

  const phase = ref<AnalysisPhase>('idle')
  const progressPercent = ref(0)
  const streamedContent = ref('') // grows chat-style as chunks arrive
  const result = ref<JobAnalysisResponse | null>(null)

  const errorMessage = ref('')

  let socketService: SocketService | null = null
  let progressTimer: ReturnType<typeof setInterval> | null = null

  const analyzeAction = computed(() => cvText.value && jobDescriptionText.value.trim().length > 10)

  const sessionBegin = computed(
    () =>
      phase.value === 'uploading' || phase.value === 'connecting_ws' || phase.value === 'streaming',
  )

  function startSimulatedProgress() {
    stopSimulatedProgress()
    progressTimer = setInterval(() => {
      if (progressPercent.value < SIMULATED_PROGRESS_CAP) {
        progressPercent.value = Math.min(
          progressPercent.value + SIMULATED_PROGRESS_STEP,
          SIMULATED_PROGRESS_CAP,
        )
      }
    }, SIMULATED_PROGRESS_INTERVAL_MS)
  }

  function stopSimulatedProgress() {
    if (progressTimer) {
      clearInterval(progressTimer)
      progressTimer = null
    }
  }

  async function uploadCvFile(file: File) {
    phase.value = 'uploading'
    progressPercent.value = 0

    try {
      const res = await resumeService.upload(file)
      if (res.status === 'success') {
        cvText.value = res.data
        cvFile.value = file
        phase.value = 'idle'
      }
    } catch (err) {
      setErrorMessage('Upload failed')
    }
  }

  async function analyzeWithWebsocket() {
    if (!cvText.value.trim().length || !jobDescriptionText.value.trim().length) {
      setErrorMessage('CV and Job Description cannot be empty')
      return
    }

    phase.value = 'connecting_ws'
    progressPercent.value = 0
    streamedContent.value = ''
    result.value = null
    errorMessage.value = ''

    socketService = new SocketService()

    socketService.onConnected(() => {
      // Connection confirmed with an authenticated user; nothing to do yet,
      // the actual request is sent right after connect() resolves below.
    })

    socketService.onChunk((text) => {
      streamedContent.value += text
    })

    socketService.onComplete((endResult: JobAnalysisResponse) => {
      stopSimulatedProgress()
      result.value = endResult
      phase.value = 'done'
      progressPercent.value = 100
      socketService?.disconnect()
    })

    socketService.onError((message) => {
      stopSimulatedProgress()
      setErrorMessage(message)
      socketService?.disconnect()
    })

    try {
      await socketService.connect()
      phase.value = 'streaming'
      startSimulatedProgress()
      socketService.send(cvText.value, jobDescriptionText.value)
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : 'Failed to connect to analysis server')
    }
  }

  function setErrorMessage(msg: string) {
    stopSimulatedProgress()
    errorMessage.value = msg
    phase.value = 'error'
  }

  function reset() {
    stopSimulatedProgress()
    cvFile.value = null
    cvText.value = ''
    jobDescriptionText.value = ''
    phase.value = 'idle'
    progressPercent.value = 0
    streamedContent.value = ''
    result.value = null
    errorMessage.value = ''
    socketService?.disconnect()
    socketService = null
  }

  return {
    cvFile,
    cvText,
    jobDescriptionText,
    phase,
    progressPercent,
    streamedContent,
    result,
    errorMessage,
    analyzeAction,
    sessionBegin,
    uploadCvFile,
    analyzeWithWebsocket,
    reset,
  }
})
