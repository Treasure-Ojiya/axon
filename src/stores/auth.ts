import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { authService } from '@/services/api'
import type { LoginPayload, RegisterPayload, AuthResponse, UserData } from '@/types/auth'

export const useAuthStore = defineStore('auth', () => {
  const isAuthenticated = ref<boolean>(false)
  const user = ref<UserData | null>(null)
  const isLoggedIn = computed(() => isAuthenticated.value)

  async function login(payload: LoginPayload) {
    try {
      const res = (await authService.onLogin(payload)) as AuthResponse

      if (res.status === 'success') {
        localStorage.setItem('accessToken', res.data.access)
        localStorage.setItem('refreshToken', res.data.refresh)

        document.cookie = `sessionid=${res.data.session_id}; path=/; max-age=86400; SameSite=Lax`

        isAuthenticated.value = true
      } else {
        throw new Error(res.message)
      }

      return res
    } catch (err) {
      isAuthenticated.value = false
      throw err
    }
  }

  async function register(payload: RegisterPayload) {
    return await authService.onRegister(payload)
  }

  async function getUser() {
    try {
      const res = await authService.getMe()

      user.value = res.data
      isAuthenticated.value = true

      return res
    } catch (err) {
      user.value = null
      isAuthenticated.value = false
      throw err
    }
  }

  function logout() {
    localStorage.removeItem('accessToken')
    localStorage.removeItem('refreshToken')

    document.cookie = 'sessionid=; path=/; max-age=0; SameSite=Lax'

    user.value = null
    isAuthenticated.value = false
  }

  return {
    user,
    isLoggedIn,
    login,
    register,
    logout,
    getUser,
  }
})
