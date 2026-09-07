import type { RawSocketMessage, ConnectedMessage, JobAnalysisResponse } from '@/types/analysis'

const WS_BASE = import.meta.env.VITE_WS_BASE_URL

export class SocketService {
  private ws: WebSocket | null = null
  private connectedHandler: ((user: ConnectedMessage['user']) => void) | null = null
  private chunkHandler: ((text: string) => void) | null = null
  private completeHandler: ((result: JobAnalysisResponse) => void) | null = null
  private errorHandler: ((error: string) => void) | null = null

  onConnected(fn: (user: ConnectedMessage['user']) => void) {
    this.connectedHandler = fn
  }

  // Called once per streamed piece of text — append-only, chat-style.
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

      const wsUrl = sessionId ? `${WS_BASE}?session_id=${sessionId}` : WS_BASE

      this.ws = new WebSocket(wsUrl)

      this.ws.onopen = () => resolve()

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

      this.ws.onerror = () => {
        reject(new Error('Connection error'))
      }

      this.ws.onclose = () => {
        this.ws = null
      }
    })
  }

  private handleMessage(msg: RawSocketMessage) {
    // 1. Confirmed shape: connection ack with authenticated user
    if (msg.type === 'connected') {
      this.connectedHandler?.((msg as unknown as ConnectedMessage).user)
      return
    }

    // 2. Explicit error signal
    if (msg.type === 'error') {
      this.errorHandler?.(msg.content ?? msg.message ?? 'Analysis failed')
      return
    }

    // 3. Final structured result — recognized by shape, not just `type`,
    //    since backend hasn't confirmed a literal 'complete' type string.
    const looksLikeFinalResult =
      msg.type === 'complete' ||
      (msg.data && typeof msg.data === 'object' && 'ai_analysis' in (msg.data as object))

    if (looksLikeFinalResult) {
      this.completeHandler?.(msg as unknown as JobAnalysisResponse)
      return
    }

    // 4. Otherwise treat it as a streamed text chunk (chat-style).
    if (typeof msg.content === 'string' && msg.content.length > 0) {
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

    this.ws.send(JSON.stringify({ cv_text: cvText, job_description: jobDescription }))
  }

  disconnect() {
    this.ws?.close()
    this.ws = null
  }

  get isConnected() {
    return this.ws?.readyState === WebSocket.OPEN
  }
}
