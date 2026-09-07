import type { ConnectedMessage, RawSocketMessage, JobAnalysisResponse } from '@/types/analysis'

const WS_BASE = import.meta.env.VITE_WS_BASE_URL

export class SocketService {
  private ws: WebSocket | null = null
  private connectedHandler: ((user: ConnectedMessage['user']) => void) | null = null
  private chunkHandler: ((test: string) => void) | null = null
  private completeHandler: ((result: JobAnalysisResponse) => void) | null = null
  private errorHandler: ((error: string) => void) | null = null

  onConnected(fn: (user: ConnectedMessage['user']) => void) {
    this.connectedHandler = fn
  }

  onChunk(fn: (text: string) => void) {
    this.chunkHandler = fn
  }

  onComplete(fn: (result: JobAnalysisResponse) => void) {
    this.completeHandler = fn
  }

  onError(fn: (error: string) => void) {
    this.errorHandler = fn
  }

  connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      const sessionId = document.cookie
        .split('; ')
        .find((row) => row.startsWith('sessionid='))
        ?.split('=')[1]

      // WS_BASE already has the full path
      const wsUrl = sessionId ? `${WS_BASE}?session_id=${sessionId}` : WS_BASE

      console.log('Connecting to:', wsUrl)
      this.ws = new WebSocket(wsUrl)

      this.ws.onopen = () => {
        resolve()
      }

      this.ws.onmessage = (event: MessageEvent) => {
        let msg: RawSocketMessage

        try {
          msg = JSON.parse(event.data)
        } catch {
          console.warn('Non-JSON WS message:', event.data)
          return
        }

        this.handleMessage(msg)
      }

      this.ws.onerror = (event) => {
        console.error('WS ERROR:', event)
        reject(new Error('Connection error'))
      }

      this.ws.onclose = (event) => {
        console.log('WS CLOSED')
        console.log('Code:', event.code)
        console.log('Reason:', event.reason)
        console.log('Clean:', event.wasClean)

        if (event.code !== 1000) {
          this.errorHandler?.(event.reason || `WebSocket closed unexpectedly (code ${event.code})`)
        }

        this.ws = null
      }
    })
  }

  private handleMessage(msg: RawSocketMessage) {
    console.log('WS MESSAGE RECEIVED:', msg)

    if (msg.type === 'connected') {
      this.connectedHandler?.((msg as unknown as ConnectedMessage).user)
      return
    }

    if (msg.type === 'error' || msg.status === 'error' || msg.status === 'failed') {
      console.log('WS FAILURE:', msg.message)

      this.errorHandler?.(msg.message ?? msg.content ?? 'Analysis failed')

      return
    }

    const looksLikeFinalResult =
      msg.type === 'complete' ||
      (msg.data && typeof msg.data === 'object' && 'ai_analysis' in (msg.data as object))

    if (looksLikeFinalResult) {
      console.log('WS COMPLETE:', msg)

      this.completeHandler?.(msg as unknown as JobAnalysisResponse)

      return
    }

    if (typeof msg.content === 'string' && msg.content.length > 0) {
      console.log('WS CHUNK:', msg.content)

      this.chunkHandler?.(msg.content)
      return
    }

    console.warn('Unrecognized WS message shape:', msg)
  }

  send(cvText: string, jobDescription: string) {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
      this.errorHandler?.('WebSocket not connected')
      return
    }

    const payload = {
      resume_text: cvText,
      job_description: jobDescription,
    }

    console.log('Sending analysis request:', {
      resumeLength: cvText.length,
      jobDescriptionLength: jobDescription.length,
    })

    this.ws.send(JSON.stringify(payload))
  }

  disconnect() {
    this.ws?.close()
    this.ws = null
  }

  get isConnected() {
    return this.ws?.readyState === WebSocket.OPEN
  }
}
