<template>
  <aside class="sidebar">
    <!-- Brand -->
    <div class="sidebar-brand">
      <div class="sidebar-icon">
        <AppLogo :size="24" />
      </div>
      <span class="sidebar-name">tiramisu</span>
    </div>

    <!-- Perfil estilo LinkedIn / Facebook -->
    <div class="profile-mini-card">
      <div class="user-avatar">{{ userInitial }}</div>
      <div class="user-info">
        <span class="user-name">{{ userName }}</span>
        <span class="user-email">{{ userEmail }}</span>
      </div>
    </div>

    <!-- Navegación social compacta -->
    <nav class="sidebar-nav">
      <RouterLink to="/home" class="nav-item" active-class="nav-item--active">
        <span class="nav-icon-wrap">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/>
            <rect x="14" y="14" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/>
          </svg>
        </span>
        <span>Mis Proyectos</span>
      </RouterLink>

      <RouterLink to="/proyectos" class="nav-item" active-class="nav-item--active">
        <span class="nav-icon-wrap">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/>
            <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>
          </svg>
        </span>
        <span>Todos los Proyectos</span>
      </RouterLink>

      <RouterLink to="/comunidad" class="nav-item" active-class="nav-item--active">
        <span class="nav-icon-wrap">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
            <circle cx="9" cy="7" r="4"/>
            <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
            <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
          </svg>
        </span>
        <span>Comunidad</span>
      </RouterLink>

      <div class="nav-divider"></div>
      <span class="nav-section-label">Agenda</span>

      <RouterLink to="/eventos" class="nav-item" exact-active-class="nav-item--active">
        <span class="nav-icon-wrap">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <rect x="3" y="4" width="18" height="18" rx="2"/>
            <line x1="16" x2="16" y1="2" y2="6"/><line x1="8" x2="8" y1="2" y2="6"/>
            <line x1="3" x2="21" y1="10" y2="10"/>
          </svg>
        </span>
        <span>Eventos</span>
      </RouterLink>

      <RouterLink to="/eventos/nuevo" class="nav-item" active-class="nav-item--active">
        <span class="nav-icon-wrap">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <line x1="12" x2="12" y1="5" y2="19"/><line x1="5" x2="19" y1="12" y2="12"/>
          </svg>
        </span>
        <span>Nuevo Evento</span>
      </RouterLink>
    </nav>

    <!-- Footer Logout -->
    <div class="sidebar-footer">
      <button id="btn-logout" class="btn-logout" @click="handleLogout" title="Cerrar sesión">
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
          <polyline points="16 17 21 12 16 7"/><line x1="21" x2="9" y1="12" y2="12"/>
        </svg>
        <span>Cerrar sesión</span>
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
  width: 220px;
  min-height: 100vh;
  background: #ffffff;
  border-right: 1px solid rgba(0, 0, 0, 0.08);
  display: flex;
  flex-direction: column;
  padding: 14px 10px;
  gap: 8px;
  position: fixed;
  top: 0; left: 0; bottom: 0;
  z-index: 100;
}

.sidebar-brand {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 4px 10px 10px;
}

.sidebar-name {
  font-size: 1.05rem;
  font-weight: 800;
  color: var(--color-dark);
  letter-spacing: -0.4px;
}

.profile-mini-card {
  display: flex;
  align-items: center;
  gap: 9px;
  padding: 8px 10px;
  background: #f7f9fa;
  border: 1px solid rgba(0, 0, 0, 0.06);
  border-radius: var(--radius-md);
  margin-bottom: 4px;
}

.user-avatar {
  width: 30px;
  height: 30px;
  border-radius: 50%;
  background: linear-gradient(135deg, #2FA084, #1F6F5F);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.78rem;
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
  font-size: 0.78rem;
  font-weight: 600;
  color: var(--color-text);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.user-email {
  font-size: 0.68rem;
  color: var(--color-text-muted);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.sidebar-nav {
  display: flex;
  flex-direction: column;
  gap: 2px;
  flex: 1;
}

.nav-section-label {
  font-size: 0.68rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  color: var(--color-text-muted);
  padding: 6px 10px 2px;
}

.nav-divider {
  height: 1px;
  background: rgba(0, 0, 0, 0.06);
  margin: 6px 8px;
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 7px 10px;
  border-radius: var(--radius-md);
  color: #4b4f56;
  font-size: 0.82rem;
  font-weight: 500;
  transition: background var(--transition), color var(--transition);
  text-decoration: none;
}

.nav-icon-wrap {
  width: 26px;
  height: 26px;
  border-radius: 50%;
  background: #f0f2f5;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #4b4f56;
  transition: all var(--transition);
  flex-shrink: 0;
}

.nav-item:hover {
  background: #f0f2f5;
  color: var(--color-text);
}

.nav-item--active {
  background: rgba(47, 160, 132, 0.1);
  color: var(--color-dark);
  font-weight: 600;
}

.nav-item--active .nav-icon-wrap {
  background: var(--color-mid);
  color: white;
}

.sidebar-footer {
  padding-top: 8px;
  border-top: 1px solid rgba(0, 0, 0, 0.06);
}

.btn-logout {
  width: 100%;
  background: none;
  border: none;
  color: var(--color-text-muted);
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 7px 10px;
  border-radius: var(--radius-md);
  font-size: 0.78rem;
  font-weight: 500;
  transition: background var(--transition), color var(--transition);
}

.btn-logout:hover {
  background: rgba(217, 79, 79, 0.08);
  color: #c0392b;
}

@media (max-width: 768px) {
  .sidebar {
    width: 190px;
  }
}
</style>
