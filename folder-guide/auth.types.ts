export interface LoginPayload {
  email: string
  password: string
}

export interface RegisterPayload {
  email: string
  password: string
  full_name: string
}

export interface AuthResponse {
  access: string
  refresh: string
  session_created: boolean
}

export interface AuthError {
  detail?: string
  email?: string[]
  password?: string[]
  non_field_errors?: string[]
}
