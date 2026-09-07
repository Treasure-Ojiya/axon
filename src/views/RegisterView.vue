<!-- views/RegisterView.vue -->
<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const authStore = useAuthStore()

const firstName = ref('')
const lastName = ref('')
const email = ref('')
const password = ref('')
const error = ref('')
const success = ref('')
const loading = ref(false)

// const loading = ref(false)
const showPassword = ref(false)

async function handleRegister() {
  if (!firstName.value || !lastName.value || !email.value || !password.value) {
    error.value = 'Please fill in all fields'
    return
  }

  loading.value = true
  error.value = ''
  success.value = ''

  const result = (await authStore.register({
    first_name: firstName.value,
    last_name: lastName.value,
    email: email.value,
    password: password.value,
  })) as { status: string; message?: string }

  if (result.status === 'success') {
    success.value = 'Registration successful! Redirecting to login...'
    setTimeout(() => {
      router.push('/login')
    }, 2000)
  } else {
    error.value = result.message || 'Registration failed'
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
      <div class="flex items-center justify-center gap-3 mb-7">
        <div>
          <div class="text-xl text-center font-medium text-neutral-50 font-mono">Axon</div>
          <div class="text-lg text-center text-neutral-500 font-mono tracking-wide">
            Resume intelligence
          </div>
        </div>
      </div>

      <h1 class="text-xl font-semibold text-neutral-50 mb-1">Create an account</h1>
      <p class="text-sm text-neutral-400 mb-6">Join us to get started</p>

      <form @submit.prevent="handleRegister" class="space-y-4">
        <div class="grid grid-cols-2 gap-4">
          <input
            v-model="firstName"
            type="text"
            placeholder="First Name"
            class="bg-neutral-950 border border-neutral-700 rounded-lg px-4 py-2 text-neutral-50 font-sans focus:outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          />
          <input
            v-model="lastName"
            type="text"
            placeholder="Last Name"
            class="bg-neutral-950 border border-neutral-700 rounded-lg px-4 py-2 text-neutral-50 font-sans focus:outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          />
        </div>

        <div>
          <input
            v-model="email"
            type="email"
            placeholder="Email"
            class="w-full h-10 bg-neutral-950 border border-neutral-700 rounded-lg px-4 py-2 text-neutral-50 font-sans focus:outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          />
        </div>

        <div class="relative">
          <input
            id="password"
            v-model="password"
            :type="showPassword ? 'text' : 'password'"
            placeholder="••••••••"
            class="w-full h-10 bg-neutral-950 border border-neutral-700 rounded-lg px-3 pr-10 text-sm text-neutral-50 font-sans placeholder:text-neutral-600 focus:outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          />

          <button
            type="button"
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

        <p v-if="error" class="text-danger-400 text-sm">{{ error }}</p>
        <p v-if="success" class="text-success-400 text-sm">{{ success }}</p>

        <button
          type="submit"
          :disabled="loading || !email || !password || !firstName || !lastName"
          class="w-full h-11 rounded-lg text-sm font-medium text-white font-sans flex items-center justify-center gap-2 transition-all bg-brand-500 hover:bg-brand-600 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
        >
          <i v-if="loading" class="ti ti-loader spin" aria-hidden="true"></i>
          {{ loading ? 'Registering...' : 'Register' }}
        </button>

        <p class="text-xs text-neutral-500 text-center mt-4">
          Already have an account?
          <router-link to="/login" class="text-brand-400 hover:text-brand-300 transition-colors">
            Login
          </router-link>
        </p>
      </form>
    </div>
  </div>
</template>
