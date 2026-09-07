<!-- App.vue -->
<script setup lang="ts">
import { onMounted } from 'vue'
import { useAuthStore } from './stores/auth'

const auth = useAuthStore()

onMounted(async () => {
  try {
    console.log('App mounted, initializing auth...')
    await auth.getUser()
    console.log('App - Auth initialized, authenticated:', auth.isLoggedIn)
  } catch (error) {
    console.error('Failed to initialize App:', error)
  }
})
</script>

<template>
  <router-view />
</template>
