<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const authStore = useAuthStore()

const email = ref('')
const password = ref('')
const error = ref('')

const loading = ref(false)
const showPassword = ref(false)

async function handleLogin() {
  if (!email.value || !password.value) {
    error.value = 'Please fill in all fields'
    return
  }

  loading.value = true
  error.value = ''

  const result = await authStore.login({
    email: email.value,
    password: password.value,
  })

  if (result.status === 'success') {
    router.push('/')
  } else {
    error.value = result.message
  }

  loading.value = false
}

function togglePassword(): void {
  showPassword.value = !showPassword.value
}
</script>

<template>
  <div class="min-h-screen flex items-center justify-center bg-neutral-900 px-4 py-8">
    <div class="w-full max-w-md p-8">
      <!-- Brand -->
      <div class="flex items-center justify-center gap-3 mb-7">
        <div>
          <div class="text-xl text-center font-medium text-neutral-50 font-mono">Axon</div>
          <div class="text-lg text-center text-neutral-500 font-mono tracking-wide">
            Resume intelligence
          </div>
        </div>
      </div>

      <h1 class="text-xl font-semibold text-neutral-50 mb-1">Welcome back</h1>
      <p class="text-sm text-neutral-400 mb-6">Log in to continue tailoring</p>

      <!-- Error -->
      <div
        v-if="error"
        class="flex items-center gap-2 bg-danger-600/20 border border-danger-400/40 rounded-lg px-3 py-2.5 text-sm text-danger-300 mb-5"
      >
        <i class="ti ti-alert-circle text-base shrink-0" aria-hidden="true"></i>
        {{ error }}
      </div>

      <!-- Email -->
      <div class="mb-3.5">
        <!-- <label for="email" class="block text-xs text-neutral-400 mb-1.5">Email</label> -->
        <input
          v-model="email"
          type="email"
          placeholder="Email"
          autocomplete="email"
          :disabled="loading"
          @keyup.enter="handleLogin"
          class="w-full h-10 bg-neutral-950 border border-neutral-700 rounded-lg px-4 py-2 text-neutral-50 font-sans focus:outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        />
      </div>

      <!-- Password -->
      <div class="mb-5">
        <!-- <label for="password" class="block text-xs text-neutral-400 mb-1.5"> Password </label> -->

        <div class="relative">
          <input
            id="password"
            v-model="password"
            :type="showPassword ? 'text' : 'password'"
            placeholder="••••••••"
            autocomplete="current-password"
            :disabled="loading"
            @keyup.enter="handleLogin"
            class="w-full h-10 bg-neutral-950 border border-neutral-700 rounded-lg px-3 pr-10 text-sm text-neutral-50 font-sans placeholder:text-neutral-600 focus:outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          />

          <button
            type="submit"
            @click="togglePassword"
            :disabled="loading"
            class="absolute inset-y-0 right-0 flex items-center pr-3"
          >
            <img
              :src="showPassword ? '/assets/icons/eye-hide.svg' : '/assets/icons/eye-view.svg'"
              alt="toggle password visibility"
              class="w-5 h-5 opacity-60 hover:opacity-100 transition-opacity"
            />
          </button>
        </div>
      </div>

      <!-- Submit -->
      <button
        :disabled="loading || !email || !password"
        @click="handleLogin"
        class="w-full h-11 rounded-lg text-sm font-medium text-white font-sans flex items-center justify-center gap-2 transition-all bg-brand-500 hover:bg-brand-600 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
      >
        <i v-if="loading" class="ti ti-loader spin" aria-hidden="true"></i>
        <span>{{ loading ? 'Logging in…' : 'Log in' }}</span>
      </button>

      <p class="text-xs text-neutral-500 text-center mt-4">
        No account?
        <RouterLink to="/register" class="text-brand-400 hover:text-brand-300 transition-colors">
          Create one
        </RouterLink>
      </p>
    </div>
  </div>
</template>
