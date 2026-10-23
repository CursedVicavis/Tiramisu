<template>
  <aside class="sidebar">
    <div class="sidebar-brand">
      <div class="sidebar-icon">
        <AppLogo :size="28" />
      </div>
      <span class="sidebar-name">Tiramisu</span>
    </div>

    <nav class="sidebar-nav">
      <RouterLink to="/home" class="nav-item" active-class="nav-item--active">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/>
          <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>
        </svg>
        Proyectos e Ideas
      </RouterLink>
      <RouterLink to="/eventos" class="nav-item" exact-active-class="nav-item--active">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/>
          <rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/>
        </svg>
        Eventos
      </RouterLink>
      <RouterLink to="/eventos/nuevo" class="nav-item" active-class="nav-item--active">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <rect x="3" y="4" width="18" height="18" rx="2"/>
          <line x1="16" x2="16" y1="2" y2="6"/><line x1="8" x2="8" y1="2" y2="6"/>
          <line x1="3" x2="21" y1="10" y2="10"/>
          <line x1="12" x2="12" y1="14" y2="18"/><line x1="10" x2="14" y1="16" y2="16"/>
        </svg>
        Nuevo Evento
      </RouterLink>
    </nav>

    <div class="sidebar-footer">
      <div class="user-badge">
        <div class="user-avatar">{{ userInitial }}</div>
        <div class="user-info">
          <span class="user-name">{{ userName }}</span>
          <span class="user-email">{{ userEmail }}</span>
        </div>
      </div>
      <button id="btn-logout" class="btn-logout" @click="handleLogout" title="Cerrar sesión">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
          <polyline points="16 17 21 12 16 7"/><line x1="21" x2="9" y1="12" y2="12"/>
        </svg>
      </button>
    </div>
  </aside>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter, RouterLink } from 'vue-router'
import AppLogo from './AppLogo.vue'
import { supabase } from '../utils/supabase'

const router = useRouter()
const userEmail = ref('admin@tiramisu.com')

const userName = computed(() => {
  const localPart = userEmail.value.split('@')[0]
  if (!localPart || localPart === 'admin') return 'Administrador'
  return localPart.charAt(0).toUpperCase() + localPart.slice(1)
})

const userInitial = computed(() => userName.value.charAt(0).toUpperCase())

onMounted(async () => {
  const { data: { session } } = await supabase.auth.getSession()
  if (session?.user?.email) {
    userEmail.value = session.user.email
  }
})

async function handleLogout() {
  await supabase.auth.signOut()
  localStorage.removeItem('tiramisu_auth')
  router.push({ name: 'login' })
}
</script>

<style scoped>
.sidebar {
  width: 240px;
  min-height: 100vh;
  background: linear-gradient(180deg, #1F6F5F 0%, #154d43 100%);
  display: flex;
  flex-direction: column;
  padding: 24px 16px;
  gap: 8px;
  position: fixed;
  top: 0; left: 0; bottom: 0;
  z-index: 100;
  box-shadow: 4px 0 24px rgba(31, 111, 95, 0.2);
}
.sidebar-brand {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 4px 8px 20px;
  border-bottom: 1px solid rgba(111, 207, 151, 0.2);
  margin-bottom: 8px;
}
.sidebar-name {
  font-size: 1.25rem;
  font-weight: 700;
  color: white;
  letter-spacing: -0.3px;
}
.sidebar-nav {
  display: flex;
  flex-direction: column;
  gap: 4px;
  flex: 1;
}
.nav-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 12px;
  border-radius: var(--radius-sm);
  color: rgba(255, 255, 255, 0.65);
  font-size: 0.9rem;
  font-weight: 500;
  transition: background var(--transition), color var(--transition);
  text-decoration: none;
}
.nav-item:hover {
  background: rgba(111, 207, 151, 0.15);
  color: white;
}
.nav-item--active {
  background: rgba(111, 207, 151, 0.2);
  color: #6FCF97;
}
.nav-item--active svg {
  stroke: #6FCF97;
}
.sidebar-footer {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 16px 8px 8px;
  border-top: 1px solid rgba(111, 207, 151, 0.2);
}
.user-badge {
  display: flex;
  align-items: center;
  gap: 10px;
  flex: 1;
  min-width: 0;
}
.user-avatar {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: linear-gradient(135deg, #6FCF97, #2FA084);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.9rem;
  font-weight: 700;
  color: white;
  flex-shrink: 0;
}
.user-info {
  display: flex;
  flex-direction: column;
  min-width: 0;
}
.user-name {
  font-size: 0.8rem;
  font-weight: 600;
  color: white;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.user-email {
  font-size: 0.7rem;
  color: rgba(255, 255, 255, 0.5);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.btn-logout {
  background: none;
  border: none;
  color: rgba(255, 255, 255, 0.4);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 6px;
  border-radius: var(--radius-sm);
  transition: background var(--transition), color var(--transition);
  flex-shrink: 0;
}
.btn-logout:hover {
  background: rgba(217, 79, 79, 0.15);
  color: #f08080;
}

@media (max-width: 768px) {
  .sidebar {
    width: 200px;
  }
}
</style>
