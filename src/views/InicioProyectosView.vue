<template>
  <div class="page-layout">
    <AppSidebar />

    <main class="main">
      <!-- Topbar compacta estilo Pinterest / Facebook -->
      <header class="topbar">
        <div class="search-pill">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/>
          </svg>
          <input
            v-model="busqueda"
            type="text"
            class="search-input"
            placeholder="Explorar mis proyectos..."
          />
        </div>

        <div class="topbar-right">
          <NotificationCenter />
          <RouterLink to="/proyectos" class="btn-create-pin">
            + Gestionar proyectos
          </RouterLink>
        </div>
      </header>

      <div class="content-area">
        <div v-if="proyectosStore.loading" class="loading-state">
          <div class="loading-spinner"></div>
          <p>Cargando tablero...</p>
        </div>

        <template v-else>
          <!-- Tablero estilo Pinterest: solo imagen y nombre compacto -->
          <div v-if="proyectosFiltrados.length > 0" class="pinterest-masonry">
            <RouterLink
              v-for="proy in proyectosFiltrados"
              :key="proy.id"
              :to="`/proyectos?id=${proy.id}`"
              class="pin-item"
            >
              <div class="pin-media">
                <img
                  v-if="proy.imagenes.length > 0"
                  :src="proy.imagenes[0].url"
                  :alt="proy.titulo"
                  class="pin-img"
                  loading="lazy"
                />
                <div v-else class="pin-placeholder">
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6">
                    <rect x="3" y="3" width="18" height="18" rx="3"/>
                    <circle cx="8.5" cy="8.5" r="1.5"/>
                    <polyline points="21 15 16 10 5 21"/>
                  </svg>
                </div>

                <!-- Overlay estilo Pinterest al pasar el mouse -->
                <div class="pin-overlay">
                  <span class="pin-open-badge">Ver proyecto</span>
                </div>
              </div>

              <span class="pin-title">{{ proy.titulo }}</span>
            </RouterLink>
          </div>

          <!-- Estado vacío -->
          <div v-else class="empty-state">
            <p class="empty-title">Tu tablero de proyectos está vacío</p>
            <p class="empty-desc">Agrega tu primer proyecto con su imagen para verlo aquí estilo tablero visual.</p>
            <RouterLink to="/proyectos" class="btn-create-pin">
              + Crear proyecto
            </RouterLink>
          </div>
        </template>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { RouterLink } from 'vue-router'
import AppSidebar from '../components/AppSidebar.vue'
import NotificationCenter from '../components/NotificationCenter.vue'
import { proyectosStore, initProyectos } from '../store/proyectos'

const busqueda = ref('')

const proyectosFiltrados = computed(() => {
  const q = busqueda.value.trim().toLowerCase()
  if (!q) return proyectosStore.proyectos
  return proyectosStore.proyectos.filter(p => p.titulo.toLowerCase().includes(q))
})

onMounted(() => {
  initProyectos()
})
</script>

<style scoped>
.page-layout { display: flex; min-height: 100vh; background: var(--color-bg); }
.main { flex: 1; margin-left: 220px; display: flex; flex-direction: column; min-height: 100vh; }

/* Topbar compacta */
.topbar {
  height: 52px;
  display: flex; align-items: center; justify-content: space-between; gap: 12px;
  padding: 0 20px; background: rgba(255,255,255,0.95);
  backdrop-filter: blur(8px);
  border-bottom: 1px solid var(--color-border);
  position: sticky; top: 0; z-index: 50;
}

.search-pill {
  flex: 1; max-width: 480px;
  display: flex; align-items: center; gap: 8px;
  background: #f0f2f5; border-radius: var(--radius-full);
  padding: 6px 14px; color: var(--color-text-muted);
}
.search-input {
  border: none; outline: none; background: transparent;
  width: 100%; font-size: 0.8rem; color: var(--color-text);
}

.topbar-right { display: flex; align-items: center; gap: 10px; }

.btn-create-pin {
  display: inline-flex; align-items: center; gap: 5px;
  padding: 6px 14px;
  background: var(--color-mid); color: white;
  border-radius: var(--radius-full);
  font-size: 0.78rem; font-weight: 600; text-decoration: none;
  transition: background var(--transition);
}
.btn-create-pin:hover { background: var(--color-dark); color: white; }

.content-area { padding: 18px 20px; }

.loading-state { display: flex; flex-direction: column; align-items: center; gap: 10px; padding: 60px 20px; color: var(--color-text-muted); font-size: 0.8rem; }
.loading-spinner { width: 28px; height: 28px; border: 2.5px solid rgba(47,160,132,0.15); border-top-color: var(--color-mid); border-radius: 50%; animation: spin 0.8s linear infinite; }
@keyframes spin { to { transform: rotate(360deg); } }

/* Tablero estilo Pinterest */
.pinterest-masonry {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(195px, 1fr));
  gap: 16px;
}

.pin-item {
  display: flex;
  flex-direction: column;
  gap: 6px;
  text-decoration: none;
  cursor: pointer;
}

.pin-media {
  position: relative;
  width: 100%;
  aspect-ratio: 4 / 3;
  border-radius: 14px;
  overflow: hidden;
  background: #e4e6eb;
}

.pin-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
  transition: transform 0.25s ease;
}

.pin-item:hover .pin-img {
  transform: scale(1.03);
}

.pin-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #e3f5ec, #d0ede0);
  color: var(--color-dark);
  opacity: 0.75;
}

.pin-overlay {
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.28);
  opacity: 0;
  transition: opacity 0.2s ease;
  display: flex;
  align-items: flex-start;
  justify-content: flex-end;
  padding: 10px;
}

.pin-item:hover .pin-overlay {
  opacity: 1;
}

.pin-open-badge {
  background: var(--color-mid);
  color: white;
  font-size: 0.72rem;
  font-weight: 600;
  padding: 5px 10px;
  border-radius: var(--radius-full);
}

.pin-title {
  font-size: 0.8rem;
  font-weight: 600;
  color: var(--color-text);
  padding: 0 4px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.empty-state {
  display: flex; flex-direction: column; align-items: center; gap: 8px;
  padding: 60px 20px; text-align: center;
}
.empty-title { font-size: 0.92rem; font-weight: 700; color: var(--color-text); }
.empty-desc { font-size: 0.78rem; color: var(--color-text-muted); max-width: 340px; margin-bottom: 4px; }

@media (max-width: 768px) {
  .main { margin-left: 190px; }
  .pinterest-masonry { grid-template-columns: repeat(auto-fill, minmax(150px, 1fr)); gap: 12px; }
}
</style>
