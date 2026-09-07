export type ConnectionStatus = 'disconnected' | 'connecting' | 'connected' | 'error'
// Frontend-owned — not sent by backend. Tracks the raw socket lifecycle
// separately from the analysis phase, which is more about the user-facing progress of the analysis process.

// export interface WebSocketChunk {
//   type: 'progress' | 'chunk' | 'partial_result' | 'complete' | 'error'
//   stage?: 'extracting' | 'analyzing_skills' | 'checking_keywords' | 'generating_suggestions'
//   progress?: number
//   content?: string // Streaming text
//   partial_data?: {
//     match_score?: number
//     missing_keywords?: string[]
//     reasoning_so_far?: string
//   }
//   final_result?: JobAnalysisResponse
// }

export interface ResumeUploadResponse {
  status: 'success' | 'error'
  message: string
  data: string
}

export interface UploadErrorResponse {
  message?: string
  status?: string
}

export const isUploadSuccess = (
  response: ResumeUploadResponse,
): response is ResumeUploadResponse & { status: 'success' } => {
  return response.status === 'success'
}

export const isUploadError = (
  response: ResumeUploadResponse,
): response is ResumeUploadResponse & { status: 'error' } => {
  return response.status === 'error'
}

export interface JobAnalysisResponse {
  status: string
  message: string
  data: { ai_analysis: AIAnalysis }
}

export interface HistoryItem {
  id: string
  resume_text: string
  job_description: string
  ai_analysis: AIAnalysis | string
  created_at: string
}

export interface HistoriesResponse {
  status: string
  message: string
  data: PaginatedData
}

export interface PaginatedData {
  page: number
  per_page: number
  total_items: number
  total_pages: number
  data: HistoryItem[]
}

export interface AIAnalysis {
  reasoning: string
  match_score: number
  missing_keywords: string[]
  sentence_to_improve: string
  recommended_improvement: string
}

export type AnalysisPhase =
  | 'idle'
  | 'uploading' // HTTP upload
  | 'connecting_ws' // Opening WebSocket
  | 'streaming' // Receiving streaming chunks
  | 'done'
  | 'error'

// ---- WebSocket message shapes ----
// Only 'connected' is confirmed by backend so far. Everything else is
// handled defensively in socket.ts rather than strictly typed, since the
// exact streaming/complete/error shapes haven't been specified yet.

export interface ConnectedMessage {
  type: 'connected'
  user: { id: string; email: string; first_name: string; last_name: string }
  message: string
}

// Generic catch-all for any other message the server sends.
// socket.ts inspects the actual keys present rather than trusting `type`.
export interface RawSocketMessage {
  type?: string
  status?: string
  content?: string
  data?: unknown
  message?: string
  [key: string]: unknown
}
