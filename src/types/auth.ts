export interface LoginPayload {
  email: string
  password: string
}

export interface RegisterPayload {
  email: string
  password: string
  first_name: string
  last_name: string
}

export interface AuthResponse {
  status: string
  message: string
  data: AuthToken
}

export interface AuthToken {
  access: string
  refresh: string
  session_id: string
}

export interface UserResponse {
  status: string
  message: string
  data: UserData
}

export interface UserData {
  id: string
  email: string
  first_name: string
  last_name: string
}
