import type { LoginPayload, RegisterPayload, UserResponse } from '@/types/auth'
import type { HistoriesResponse, ResumeUploadResponse } from '@/types/analysis'

export const BASE = import.meta.env.VITE_API_BASE_URL

function getAccessToken() {
  return localStorage.getItem('accessToken')
}

// async function request<T = unknown>(path: string, options: RequestInit = {}): Promise<T> {
//   const token = getAccessToken()

//   const headers = new Headers(options.headers)

//   if (token) {
//     headers.set('Authorization', `Bearer ${token}`)
//   }

//   if (!(options.body instanceof FormData)) {
//     headers.set('Content-Type', 'application/json')
//   }

//   const res = await fetch(`${BASE}${path}`, {
//     credentials: 'include',
//     ...options,
//     headers,
//   })

//   const result = await res.json().catch(() => ({}))

//   if (!res.ok) {
//     throw new Error(result.message || `Request failed (${res.status})`)
//   }

//   return result as T
// }

async function request<T = unknown>(path: string, options: RequestInit = {}): Promise<T> {
  const token = getAccessToken()
  const headers = new Headers(options.headers)

  if (token) {
    headers.set('Authorization', `Bearer ${token}`)
  }

  if (!(options.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json')
  }

  try {
    // Add a timeout signal to prevent the request from hanging indefinitely
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 10000) // 10 second timeout

    const res = await fetch(`${BASE}${path}`, {
      credentials: 'include',
      ...options,
      headers,
      signal: controller.signal,
    })

    clearTimeout(timeoutId)

    const result = await res.json().catch(() => ({}))

    if (!res.ok) {
      throw new Error(result.message || `Request failed (${res.status})`)
    }

    return result as T
  } catch (error: unknown) {
    // Handle network errors (like TIMED_OUT) or Abort errors
    if (error instanceof Error && error.name === 'AbortError') {
      throw new Error('The request timed out. Please check your connection.')
    }
    const message = error instanceof Error ? error.message : String(error ?? 'Unknown error')
    throw new Error(`Network error: ${message}`)
  }
}

export const authService = {
  onRegister(payload: RegisterPayload) {
    return request('/auth/register', {
      method: 'POST',
      body: JSON.stringify(payload),
    })
  },

  onLogin(payload: LoginPayload) {
    return request('/auth/login', {
      method: 'POST',
      body: JSON.stringify(payload),
    })
  },

  getMe(): Promise<UserResponse> {
    return request<UserResponse>('/users/me')
  },
}

export const resumeService = {
  upload(file: File): Promise<ResumeUploadResponse> {
    const formData = new FormData()
    formData.append('resume', file)

    return request<ResumeUploadResponse>('/resume/upload', {
      method: 'POST',
      body: formData,
    })
  },
}

export const historyService = {
  getAll(): Promise<HistoriesResponse> {
    return request<HistoriesResponse>('/resume/histories')
  },
}
