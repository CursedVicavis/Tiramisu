import { createRouter, createWebHistory } from 'vue-router'
import LoginView from '../views/LoginView.vue'
import ResetPasswordView from '../views/ResetPasswordView.vue'
import ProyectosView from '../views/ProyectosView.vue'
import HomeView from '../views/HomeView.vue'
import NuevoEventoView from '../views/NuevoEventoView.vue'
import EditarEventoView from '../views/EditarEventoView.vue'
import { supabase } from '../utils/supabase'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      redirect: '/login',
    },
    {
      path: '/login',
      name: 'login',
      component: LoginView,
      meta: { requiresAuth: false },
    },
    {
      path: '/reset-password',
      name: 'reset-password',
      component: ResetPasswordView,
      meta: { requiresAuth: false },
    },
    {
      path: '/home',
      name: 'home',
      component: ProyectosView,
      meta: { requiresAuth: true },
    },
    {
      path: '/eventos',
      name: 'eventos',
      component: HomeView,
      meta: { requiresAuth: true },
    },
    {
      path: '/eventos/nuevo',
      name: 'nuevo-evento',
      component: NuevoEventoView,
      meta: { requiresAuth: true },
    },
    {
      path: '/eventos/:id/editar',
      name: 'editar-evento',
      component: EditarEventoView,
      meta: { requiresAuth: true },
    },
    {
      path: '/:pathMatch(.*)*',
      redirect: '/home',
    },
  ],
})

// Navigation Guard
router.beforeEach(async (to, _from, next) => {
  // Si viene de un enlace de recuperación de contraseña de Supabase (#...type=recovery)
  if (
    to.name !== 'reset-password' &&
    (window.location.hash.includes('type=recovery') || window.location.search.includes('type=recovery'))
  ) {
    next({ name: 'reset-password' })
    return
  }

  const { data: { session } } = await supabase.auth.getSession()
  const isAuthenticated = !!session

  if (to.meta.requiresAuth && !isAuthenticated) {
    next({ name: 'login' })
  } else if (to.name === 'login' && isAuthenticated) {
    next({ name: 'home' })
  } else {
    next()
  }
})

supabase.auth.onAuthStateChange((event) => {
  if (event === 'PASSWORD_RECOVERY') {
    router.push({ name: 'reset-password' })
  }
})

export default router
