// router/index.ts
import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/login',
      name: 'login',
      component: () => import('@/views/LoginView.vue'),
      meta: { requiresAuth: false },
    },
    {
      path: '/register',
      name: 'register',
      component: () => import('@/views/RegisterView.vue'),
      meta: { requiresAuth: false },
    },
    {
      path: '/',
      name: 'workspace',
      component: () => import('@/views/WorkSpace.vue'),
      // meta: { requiresAuth: true }, // ← ENABLE THIS
    },
    {
      path: '/:pathMatch(.*)*',
      redirect: '/',
    },
  ],
})

// router.beforeEach(async (to, from, next) => {
//   const auth = useAuthStore()

//   console.log('Router guard - to:', to.name, 'requiresAuth:', to.meta.requiresAuth)

//   // Initialize auth if not done yet
//   if (!auth.initialized) {
//     console.log('Auth not initialized, initializing...')
//     await auth.init()
//   }

//   console.log('Router guard - isAuthenticated:', auth.isAuthenticated)

//   // If route requires authentication
//   if (to.meta.requiresAuth) {
//     if (!auth.isAuthenticated) {
//       console.log('Not authenticated, redirecting to login')
//       next({ name: 'login' })
//       return
//     }
//   }

//   // If already authenticated and trying to go to login/register
//   if ((to.name === 'login' || to.name === 'register') && auth.isAuthenticated) {
//     console.log('Already authenticated, redirecting to workspace')
//     next({ name: 'workspace' })
//     return
//   }

//   next()
// })

export default router
