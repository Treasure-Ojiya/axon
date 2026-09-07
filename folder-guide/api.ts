import type { LoginPayload, RegisterPayload, AuthResponse, AuthError } from '@/types/auth'

const BASE = import.meta.env.VITE_API_BASE_URL

// ─── Core fetch wrapper ────────────────────────────────────────────────────

async function request<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const token = localStorage.getItem('access_token')

  const res = await fetch(`${BASE}${path}`, {
    ...options,
    credentials: 'include',          // sends sessionid cookie automatically
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers ?? {}),
    },
  })

  if (!res.ok) {
    const err: AuthError = await res.json().catch(() => ({}))
    // Surface the most useful message from whatever shape Django returns
    const message =
      err.detail ??
      err.non_field_errors?.[0] ??
      err.email?.[0] ??
      err.password?.[0] ??
      `Request failed (${res.status})`
    throw new Error(message)
  }

  return res.json() as Promise<T>
}

// ─── Auth endpoints ────────────────────────────────────────────────────────

export const authService = {
  register(payload: RegisterPayload) {
    return request<void>('/api/v1/auth/register/', {
      method: 'POST',
      body: JSON.stringify(payload),
    })
  },

  login(payload: LoginPayload) {
    return request<AuthResponse>('/api/v1/auth/login/', {
      method: 'POST',
      body: JSON.stringify(payload),
    })
  },
}

// ─── Resume endpoint ───────────────────────────────────────────────────────

export const resumeService = {
  upload(file: File) {
    const token = localStorage.getItem('access_token')
    const form = new FormData()
    form.append('file', file)

    return fetch(`${BASE}/api/v1/resume/upload/`, {
      method: 'POST',
      credentials: 'include',
      headers: {
        // No Content-Type here — browser sets it with the boundary for FormData
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: form,
    }).then(async (res) => {
      if (!res.ok) throw new Error(`Upload failed (${res.status})`)
      return res.json()
    })
  },
}
