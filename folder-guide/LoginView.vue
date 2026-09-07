<script setup lang="ts">
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const authStore = useAuthStore()

const form = reactive({ email: '', password: '' })
const error = ref('')
const loading = ref(false)

async function handleLogin() {
  error.value = ''
  loading.value = true
  try {
    await authStore.login({ email: form.email, password: form.password })
    router.push({ name: 'workspace' })
  } catch (e) {
    error.value = e instanceof Error ? e.message : 'Login failed'
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="auth-page">
    <div class="auth-card">

      <div class="brand">
        <div class="brand-mark">D</div>
        <div>
          <div class="brand-name">DocTailor</div>
          <div class="brand-sub">Resume intelligence</div>
        </div>
      </div>

      <h1 class="auth-title">Welcome back</h1>
      <p class="auth-sub">Log in to continue tailoring</p>

      <div v-if="error" class="error-banner">
        <i class="ti ti-alert-circle" aria-hidden="true"></i>
        {{ error }}
      </div>

      <div class="field">
        <label for="email">Email</label>
        <input
          id="email"
          v-model="form.email"
          type="email"
          placeholder="you@example.com"
          autocomplete="email"
          :disabled="loading"
          @keyup.enter="handleLogin"
        />
      </div>

      <div class="field">
        <label for="password">Password</label>
        <input
          id="password"
          v-model="form.password"
          type="password"
          placeholder="••••••••"
          autocomplete="current-password"
          :disabled="loading"
          @keyup.enter="handleLogin"
        />
      </div>

      <button
        class="submit-btn"
        :disabled="loading || !form.email || !form.password"
        @click="handleLogin"
      >
        <i v-if="loading" class="ti ti-loader spin" aria-hidden="true"></i>
        <span>{{ loading ? 'Logging in…' : 'Log in' }}</span>
      </button>

      <p class="switch-link">
        No account?
        <RouterLink to="/register">Create one</RouterLink>
      </p>

    </div>
  </div>
</template>

<style scoped>
.auth-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #0a0a14;
  padding: 24px;
}

.auth-card {
  width: 100%;
  max-width: 380px;
  background: #12121f;
  border: 0.5px solid #2a2840;
  border-radius: 16px;
  padding: 32px;
}

.brand {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 28px;
}

.brand-mark {
  width: 34px;
  height: 34px;
  border-radius: 8px;
  background: #7F77DD;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 15px;
  font-weight: 500;
  color: #fff;
  flex-shrink: 0;
}

.brand-name {
  font-size: 14px;
  font-weight: 500;
  color: #ddd9f7;
  font-family: var(--font-mono, monospace);
}

.brand-sub {
  font-size: 10px;
  color: #4a4870;
  font-family: var(--font-mono, monospace);
  letter-spacing: 0.06em;
}

.auth-title {
  font-size: 22px;
  font-weight: 500;
  color: #eeedfb;
  margin-bottom: 4px;
}

.auth-sub {
  font-size: 13px;
  color: #6b6890;
  margin-bottom: 24px;
}

.error-banner {
  display: flex;
  align-items: center;
  gap: 7px;
  background: #2a1218;
  border: 0.5px solid #6b2030;
  border-radius: 8px;
  padding: 10px 12px;
  font-size: 13px;
  color: #f09595;
  margin-bottom: 16px;
}

.error-banner i {
  font-size: 15px;
  flex-shrink: 0;
}

.field {
  margin-bottom: 14px;
}

.field label {
  display: block;
  font-size: 12px;
  color: #9896b8;
  margin-bottom: 6px;
}

.field input {
  width: 100%;
  height: 40px;
  background: #0d0d1a;
  border: 0.5px solid #2a2840;
  border-radius: 8px;
  padding: 0 14px;
  font-size: 13px;
  color: #eeedfb;
  font-family: inherit;
  transition: border-color 0.15s;
}

.field input:focus {
  outline: none;
  border-color: #7F77DD;
  box-shadow: 0 0 0 3px #1e1b40;
}

.field input:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.submit-btn {
  width: 100%;
  height: 42px;
  background: #7F77DD;
  border: none;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 500;
  color: #fff;
  cursor: pointer;
  font-family: inherit;
  transition: background 0.15s, opacity 0.15s;
  margin-top: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 7px;
}

.submit-btn:hover:not(:disabled) {
  background: #534AB7;
}

.submit-btn:disabled {
  opacity: 0.45;
  cursor: not-allowed;
}

.switch-link {
  font-size: 12px;
  color: #4a4870;
  text-align: center;
  margin-top: 16px;
}

.switch-link a {
  color: #7F77DD;
  text-decoration: none;
}

.switch-link a:hover {
  text-decoration: underline;
}

.spin {
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}
</style>
