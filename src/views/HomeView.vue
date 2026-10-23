<template>
  <div class="page-layout">
    <AppSidebar />

    <!-- Main -->
    <main class="main">
      <!-- Topbar -->
      <header class="topbar">
        <div class="topbar-left">
          <h2 class="page-title">Inicio</h2>
          <span class="page-breadcrumb">Panel principal</span>
        </div>
        <div class="topbar-right">
          <span class="topbar-date">{{ currentDate }}</span>
          <RouterLink to="/eventos/nuevo" class="btn-new-event" id="btn-ir-nuevo-evento">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <line x1="12" x2="12" y1="5" y2="19"/><line x1="5" x2="19" y1="12" y2="12"/>
            </svg>
            Nuevo evento
          </RouterLink>
        </div>
      </header>

      <!-- Content -->
      <div class="content-area">

        <!-- Loading state -->
        <div v-if="eventosStore.loading" class="loading-state">
          <div class="loading-spinner"></div>
          <p>Cargando eventos...</p>
        </div>

        <template v-else>

        <!-- Stats -->
        <div class="stats-row" v-if="eventosStore.eventos.length > 0">
          <div class="stat-card">
            <div class="stat-icon stat-icon--total">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <rect x="3" y="4" width="18" height="18" rx="2"/>
                <line x1="16" x2="16" y1="2" y2="6"/><line x1="8" x2="8" y1="2" y2="6"/>
                <line x1="3" x2="21" y1="10" y2="10"/>
              </svg>
            </div>
            <div>
              <div class="stat-value">{{ eventosStore.eventos.length }}</div>
              <div class="stat-label">Total eventos</div>
            </div>
          </div>
          <div class="stat-card">
            <div class="stat-icon stat-icon--active">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
              </svg>
            </div>
            <div>
              <div class="stat-value">{{ eventosActivos }}</div>
              <div class="stat-label">En progreso</div>
            </div>
          </div>
          <div class="stat-card">
            <div class="stat-icon stat-icon--tasks">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/>
              </svg>
            </div>
            <div>
              <div class="stat-value">{{ totalTareas }}</div>
              <div class="stat-label">Tareas totales</div>
            </div>
          </div>
          <div class="stat-card">
            <div class="stat-icon stat-icon--done">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><path d="m9 11 3 3L22 4"/>
              </svg>
            </div>
            <div>
              <div class="stat-value">{{ tareasCompletadas }}</div>
              <div class="stat-label">Completadas</div>
            </div>
          </div>
        </div>

        <!-- Eventos list -->
        <div v-if="eventosStore.eventos.length > 0" class="section-header-row">
          <h3 class="section-heading">Todos los eventos</h3>
          <span class="events-count">{{ eventosStore.eventos.length }} registro{{ eventosStore.eventos.length !== 1 ? 's' : '' }}</span>
        </div>

        <TransitionGroup v-if="eventosStore.eventos.length > 0" name="list" tag="div" class="events-list">
          <div v-for="evento in eventosOrdenados" :key="evento.id" class="event-card">
            <!-- Card header -->
            <div class="event-card-header">
              <div class="event-header-left">
                <div class="event-status-dot" :class="getEventStatusClass(evento)"></div>
                <div>
                  <h4 class="event-name">{{ evento.evento }}</h4>
                  <p v-if="evento.descripcion" class="event-desc">{{ evento.descripcion }}</p>
                </div>
              </div>
              <div class="event-header-actions">
                <span class="event-status-chip" :class="getEventStatusClass(evento)">
                  {{ getEventStatusLabel(evento) }}
                </span>
                <button
                  :id="`btn-edit-${evento.id}`"
                  class="action-btn action-btn--edit"
                  @click="$router.push(`/eventos/${evento.id}/editar`)"
                  title="Editar evento"
                >
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                  </svg>
                  Editar
                </button>
                <button
                  :id="`btn-delete-${evento.id}`"
                  class="action-btn action-btn--delete"
                  @click="confirmarEliminar(evento.id)"
                  title="Eliminar evento"
                >
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M3 6h18"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"/>
                    <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                  </svg>
                  Eliminar
                </button>
              </div>
            </div>

            <!-- Fechas y duración -->
            <div class="event-dates">
              <div class="date-chip">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <rect x="3" y="4" width="18" height="18" rx="2"/>
                  <line x1="16" x2="16" y1="2" y2="6"/><line x1="8" x2="8" y1="2" y2="6"/>
                  <line x1="3" x2="21" y1="10" y2="10"/>
                </svg>
                {{ formatDate(evento.fechaInicio) }}
              </div>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#b0b8c4" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <line x1="5" x2="19" y1="12" y2="12"/><polyline points="12 5 19 12 12 19"/>
              </svg>
              <div class="date-chip date-chip--end" :class="{ 'date-chip--real': evento.fechaFinalizacion }">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <rect x="3" y="4" width="18" height="18" rx="2"/>
                  <line x1="16" x2="16" y1="2" y2="6"/><line x1="8" x2="8" y1="2" y2="6"/>
                  <line x1="3" x2="21" y1="10" y2="10"/>
                  <path d="m9 16 2 2 4-4"/>
                </svg>
                <span v-if="evento.fechaFinalizacion">Fin: {{ formatDate(evento.fechaFinalizacion) }}</span>
                <span v-else>Est: {{ formatDate(evento.fechaEstimada) }}</span>
              </div>
              <span v-if="getDuracion(evento)" class="duracion-badge">
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
                </svg>
                {{ getDuracion(evento) }}
              </span>
            </div>

            <!-- Progreso tareas -->
            <div v-if="evento.tareas.length > 0" class="event-progress">
              <div class="progress-header">
                <span class="progress-label">
                  Tareas: {{ evento.tareas.filter(t => t.completada).length }}/{{ evento.tareas.length }} completadas
                </span>
                <span class="progress-pct">{{ getProgreso(evento) }}%</span>
              </div>
              <div class="progress-bar">
                <div class="progress-fill" :style="{ width: getProgreso(evento) + '%' }"></div>
              </div>
            </div>

            <!-- Expandir tareas -->
            <div v-if="evento.tareas.length > 0" class="tasks-section">
              <button
                type="button"
                class="tasks-toggle"
                :class="{ 'tasks-toggle--open': expandedEvents.has(evento.id) }"
                @click="toggleExpand(evento.id)"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                  <polyline points="6 9 12 15 18 9"/>
                </svg>
                {{ expandedEvents.has(evento.id) ? 'Ocultar' : 'Ver' }} {{ evento.tareas.length }} tarea{{ evento.tareas.length !== 1 ? 's' : '' }}
              </button>

              <Transition name="expand">
                <div v-if="expandedEvents.has(evento.id)" class="tasks-list">
                  <div
                    v-for="tarea in evento.tareas"
                    :key="tarea.id"
                    class="task-row"
                    :class="{ 'task-row--done': tarea.completada }"
                  >
                    <div class="task-check" :class="{ 'task-check--done': tarea.completada }">
                      <svg v-if="tarea.completada" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M20 6 9 17l-5-5"/>
                      </svg>
                    </div>
                    <div class="task-content">
                      <span class="task-titulo">{{ tarea.nombre || 'Sin título' }}</span>
                      <span v-if="tarea.detalle" class="task-detalle">{{ tarea.detalle }}</span>
                    </div>
                    <div v-if="tarea.recordatorios && tarea.recordatorios.length > 0" class="task-reminders-list">
                      <div v-for="rec in tarea.recordatorios" :key="rec.id" class="task-reminder-chip" :class="getReminderClass(rec)">
                        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                          <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/>
                          <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/>
                        </svg>
                        {{ formatReminder(rec) }}
                      </div>
                    </div>
                  </div>
                </div>
              </Transition>
            </div>

            <div v-else class="no-tasks-note">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="12" cy="12" r="10"/><line x1="12" x2="12" y1="8" y2="12"/><line x1="12" x2="12.01" y1="16" y2="16"/>
              </svg>
              Sin tareas registradas
            </div>
          </div>
        </TransitionGroup>

        <!-- Empty state -->
        <div v-else class="empty-state">
          <div class="empty-icon">
            <svg width="72" height="72" viewBox="0 0 72 72" fill="none">
              <circle cx="36" cy="36" r="36" fill="rgba(111,207,151,0.1)"/>
              <rect x="22" y="18" width="28" height="36" rx="4" stroke="#6FCF97" stroke-width="2"/>
              <line x1="28" x2="44" y1="28" y2="28" stroke="#2FA084" stroke-width="2" stroke-linecap="round"/>
              <line x1="28" x2="40" y1="34" y2="34" stroke="#2FA084" stroke-width="2" stroke-linecap="round"/>
              <line x1="28" x2="36" y1="40" y2="40" stroke="#2FA084" stroke-width="2" stroke-linecap="round"/>
            </svg>
          </div>
          <h3 class="empty-title">No hay eventos registrados</h3>
          <p class="empty-desc">Crea tu primer evento para empezar a organizar tus actividades.</p>
          <RouterLink to="/eventos/nuevo" class="btn-empty-action">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <line x1="12" x2="12" y1="5" y2="19"/><line x1="5" x2="19" y1="12" y2="12"/>
            </svg>
            Crear primer evento
          </RouterLink>
        </div>

        </template><!-- end v-else loading -->
      </div>
    </main>

    <!-- Modal confirmación eliminar -->
    <Transition name="modal">
      <div v-if="deleteConfirm.show" class="modal-overlay" @click.self="deleteConfirm.show = false">
        <div class="modal-card">
          <div class="modal-icon">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M3 6h18"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"/>
              <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
            </svg>
          </div>
          <h3 class="modal-title">¿Eliminar evento?</h3>
          <p class="modal-desc">Esta acción es irreversible. El evento y todas sus tareas serán eliminados permanentemente.</p>
          <div class="modal-actions">
            <button class="modal-btn modal-btn--cancel" @click="deleteConfirm.show = false">Cancelar</button>
            <button id="btn-confirm-delete" class="modal-btn modal-btn--confirm" @click="ejecutarEliminar">Sí, eliminar</button>
          </div>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, reactive } from 'vue'
import { RouterLink } from 'vue-router'
import { eventosStore, deleteEvento, type Evento, type Recordatorio } from '../store/eventos'
import AppSidebar from '../components/AppSidebar.vue'

const currentDate = ref(
  new Date().toLocaleDateString('es-HN', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
  })
)

// ── Stats ──
const eventosActivos = computed(() => {
  const hoy = new Date().toISOString().split('T')[0]
  return eventosStore.eventos.filter(e => {
    const end = e.fechaFinalizacion || e.fechaEstimada
    return e.fechaInicio <= hoy && end >= hoy
  }).length
})
const totalTareas = computed(() =>
  eventosStore.eventos.reduce((sum, e) => sum + e.tareas.length, 0)
)
const tareasCompletadas = computed(() =>
  eventosStore.eventos.reduce((sum, e) => sum + e.tareas.filter(t => t.completada).length, 0)
)

// ── Ordenar eventos (más reciente primero) ──
const eventosOrdenados = computed(() =>
  [...eventosStore.eventos].sort((a, b) =>
    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  )
)

// ── Expandir tareas ──
const expandedEvents = reactive(new Set<number>())
function toggleExpand(id: number) {
  if (expandedEvents.has(id)) expandedEvents.delete(id)
  else expandedEvents.add(id)
}

// ── Helpers de formato ──
function formatDate(dateStr: string): string {
  if (!dateStr) return '—'
  const [y, m, d] = dateStr.split('-')
  return `${d}/${m}/${y}`
}

function formatReminder(rec: Recordatorio): string {
  let text = ''
  if (rec.fecha) text += formatDate(rec.fecha)
  if (rec.hora) text += ` ${rec.hora}`
  if (rec.repetirPorDia) text += ' (Diario)'
  if (rec.repetirPorHora) text += ' (Horario)'
  return text || 'Sin hora'
}

function getDuracion(evento: Evento): string {
  const end = evento.fechaFinalizacion || evento.fechaEstimada
  if (!evento.fechaInicio || !end) return ''
  const dias = Math.ceil(
    (new Date(end).getTime() - new Date(evento.fechaInicio).getTime()) / 86400000
  )
  if (dias <= 0) return ''
  if (dias === 1) return '1 día'
  if (dias < 7) return `${dias} días`
  const sem = Math.floor(dias / 7)
  return sem < 4 ? `${sem} sem.` : `${Math.floor(dias / 30)} mes${Math.floor(dias / 30) > 1 ? 'es' : ''}`
}

function getProgreso(evento: Evento): number {
  if (!evento.tareas.length) return 0
  return Math.round((evento.tareas.filter(t => t.completada).length / evento.tareas.length) * 100)
}

function getEventStatusClass(evento: Evento): string {
  const hoy = new Date().toISOString().split('T')[0]
  if (evento.fechaFinalizacion) return 'status--finished'
  const end = evento.fechaEstimada
  if (end < hoy) return 'status--overdue'
  if (evento.fechaInicio > hoy) return 'status--upcoming'
  return 'status--active'
}

function getEventStatusLabel(evento: Evento): string {
  const hoy = new Date().toISOString().split('T')[0]
  if (evento.fechaFinalizacion) return 'Finalizado'
  const end = evento.fechaEstimada
  if (end < hoy) return 'Atrasado'
  if (evento.fechaInicio > hoy) return 'Próximo'
  return 'En progreso'
}

function getReminderClass(rec: Recordatorio): string {
  if (!rec.fecha) return 'reminder--ok'
  const datetime = new Date(`${rec.fecha}T${rec.hora || '00:00'}`)
  const diff = datetime.getTime() - Date.now()
  if (diff < 0 && !rec.repetirPorDia) return 'reminder--overdue'
  if (diff < 86400000) return 'reminder--soon'
  return 'reminder--ok'
}

// ── Eliminar ──
const deleteConfirm = reactive({ show: false, id: 0 })

function confirmarEliminar(id: number) {
  deleteConfirm.id = id
  deleteConfirm.show = true
}

async function ejecutarEliminar() {
  deleteConfirm.show = false
  await deleteEvento(deleteConfirm.id)
}
</script>

<style scoped>
/* ── Layout ── */
.page-layout {
  display: flex;
  min-height: 100vh;
  background: var(--color-bg);
}

/* ── Loading state ── */
.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  padding: 80px 20px;
  color: var(--color-text-muted);
  font-size: 0.9rem;
}
.loading-spinner {
  width: 40px; height: 40px;
  border: 3px solid rgba(47, 160, 132, 0.15);
  border-top-color: var(--color-mid);
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}
@keyframes spin { to { transform: rotate(360deg); } }

/* ── Main ── */
.main { flex: 1; margin-left: 240px; display: flex; flex-direction: column; min-height: 100vh; }

/* ── Topbar ── */
.topbar {
  display: flex; align-items: center; justify-content: space-between;
  padding: 18px 32px;
  background: white; border-bottom: 1px solid rgba(47,160,132,0.1);
  box-shadow: var(--shadow-sm); position: sticky; top: 0; z-index: 50;
}
.topbar-left    { display: flex; flex-direction: column; gap: 2px; }
.page-title     { font-size: 1.25rem; font-weight: 700; color: var(--color-dark); }
.page-breadcrumb{ font-size: 0.78rem; color: var(--color-text-muted); }
.topbar-right   { display: flex; align-items: center; gap: 16px; }
.topbar-date    { font-size: 0.8rem; color: var(--color-text-muted); font-weight: 500; text-transform: capitalize; }

.btn-new-event {
  display: inline-flex; align-items: center; gap: 6px;
  padding: 9px 18px;
  background: linear-gradient(135deg, #2FA084, #1F6F5F);
  color: white; border-radius: var(--radius-md);
  font-size: 0.85rem; font-weight: 600; text-decoration: none;
  box-shadow: 0 3px 12px rgba(31,111,95,0.25);
  transition: transform var(--transition), box-shadow var(--transition);
}
.btn-new-event:hover { transform: translateY(-1px); box-shadow: 0 6px 20px rgba(31,111,95,0.35); color: white; }

/* ── Content ── */
.content-area { padding: 28px 32px; display: flex; flex-direction: column; gap: 20px; }

/* ── Stats ── */
.stats-row {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 14px;
}
.stat-card {
  background: white; border-radius: var(--radius-md);
  padding: 18px 20px;
  display: flex; align-items: center; gap: 14px;
  border: 1px solid rgba(47,160,132,0.08);
  box-shadow: var(--shadow-sm);
  animation: slideUp 0.4s cubic-bezier(0.4,0,0.2,1) both;
}
.stat-card:nth-child(2) { animation-delay: 0.05s; }
.stat-card:nth-child(3) { animation-delay: 0.10s; }
.stat-card:nth-child(4) { animation-delay: 0.15s; }

@keyframes slideUp {
  from { opacity: 0; transform: translateY(14px); }
  to   { opacity: 1; transform: translateY(0); }
}

.stat-icon {
  width: 40px; height: 40px; border-radius: var(--radius-sm);
  display: flex; align-items: center; justify-content: center; flex-shrink: 0;
}
.stat-icon--total  { background: rgba(47,160,132,0.12); color: var(--color-mid); }
.stat-icon--active { background: rgba(255,193,7,0.12);  color: #b8860b; }
.stat-icon--tasks  { background: rgba(111,207,151,0.15); color: var(--color-dark); }
.stat-icon--done   { background: rgba(31,111,95,0.1);   color: var(--color-dark); }

.stat-value { font-size: 1.5rem; font-weight: 800; color: var(--color-dark); line-height: 1; }
.stat-label { font-size: 0.75rem; color: var(--color-text-muted); margin-top: 3px; }

/* ── Section heading ── */
.section-header-row { display: flex; align-items: center; justify-content: space-between; }
.section-heading { font-size: 1rem; font-weight: 700; color: var(--color-dark); }
.events-count { font-size: 0.8rem; color: var(--color-text-muted); }

/* ── Events list ── */
.events-list { display: flex; flex-direction: column; gap: 14px; }

/* ── Event card ── */
.event-card {
  background: white;
  border: 1px solid rgba(47,160,132,0.1);
  border-radius: var(--radius-lg);
  padding: 22px 24px;
  box-shadow: var(--shadow-sm);
  transition: box-shadow var(--transition), border-color var(--transition);
  display: flex; flex-direction: column; gap: 14px;
}
.event-card:hover {
  box-shadow: var(--shadow-md);
  border-color: rgba(111,207,151,0.3);
}

/* Card header */
.event-card-header {
  display: flex; align-items: flex-start;
  justify-content: space-between; gap: 16px; flex-wrap: wrap;
}
.event-header-left { display: flex; align-items: flex-start; gap: 12px; flex: 1; min-width: 0; }

.event-status-dot {
  width: 10px; height: 10px; border-radius: 50%; flex-shrink: 0; margin-top: 6px;
}
.event-status-dot.status--active   { background: #2FA084; box-shadow: 0 0 0 3px rgba(47,160,132,0.2); }
.event-status-dot.status--upcoming { background: #b8860b; box-shadow: 0 0 0 3px rgba(184,134,11,0.2); }
.event-status-dot.status--overdue  { background: #c0392b; box-shadow: 0 0 0 3px rgba(217,79,79,0.2); }
.event-status-dot.status--finished { background: #b0b8c4; }

.event-name { font-size: 1rem; font-weight: 700; color: var(--color-dark); }
.event-desc { font-size: 0.83rem; color: var(--color-text-muted); margin-top: 3px; line-height: 1.4; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }

.event-header-actions { display: flex; align-items: center; gap: 8px; flex-shrink: 0; flex-wrap: wrap; }

.event-status-chip {
  display: inline-flex; align-items: center; gap: 5px;
  padding: 4px 10px; border-radius: var(--radius-full);
  font-size: 0.72rem; font-weight: 700; letter-spacing: 0.04em;
}
.event-status-chip.status--active   { background: rgba(47,160,132,0.12); color: #1F6F5F; }
.event-status-chip.status--upcoming { background: rgba(255,193,7,0.12);  color: #b8860b; }
.event-status-chip.status--overdue  { background: rgba(217,79,79,0.12);  color: #c0392b; }
.event-status-chip.status--finished { background: rgba(180,180,200,0.15); color: #888; }

.action-btn {
  display: inline-flex; align-items: center; gap: 5px;
  padding: 7px 12px; border: none; border-radius: var(--radius-sm);
  font-size: 0.8rem; font-weight: 600;
  transition: background var(--transition), transform var(--transition);
  cursor: pointer;
}
.action-btn:hover { transform: translateY(-1px); }
.action-btn--edit   { background: rgba(47,160,132,0.1); color: var(--color-dark); }
.action-btn--edit:hover { background: rgba(47,160,132,0.2); }
.action-btn--delete { background: rgba(217,79,79,0.08); color: #c0392b; }
.action-btn--delete:hover { background: rgba(217,79,79,0.18); }

/* Dates */
.event-dates {
  display: flex; align-items: center; gap: 8px; flex-wrap: wrap;
}
.date-chip {
  display: inline-flex; align-items: center; gap: 5px;
  padding: 5px 10px; background: rgba(238,238,238,0.7);
  border: 1px solid rgba(47,160,132,0.12);
  border-radius: var(--radius-full);
  font-size: 0.78rem; font-weight: 500; color: var(--color-dark);
}
.date-chip--end { border-color: rgba(31,111,95,0.2); }
.date-chip--real { background: rgba(47,160,132,0.12); border-color: rgba(47,160,132,0.3); color: var(--color-dark); }

.duracion-badge {
  display: inline-flex; align-items: center; gap: 4px;
  padding: 5px 10px;
  background: rgba(111,207,151,0.12);
  border: 1px solid rgba(111,207,151,0.25);
  border-radius: var(--radius-full);
  font-size: 0.75rem; font-weight: 600; color: var(--color-dark);
}

/* Progress */
.event-progress { display: flex; flex-direction: column; gap: 6px; }
.progress-header { display: flex; justify-content: space-between; align-items: center; }
.progress-label { font-size: 0.78rem; color: var(--color-text-muted); }
.progress-pct   { font-size: 0.78rem; font-weight: 700; color: var(--color-mid); }
.progress-bar   { height: 6px; background: rgba(238,238,238,0.8); border-radius: var(--radius-full); overflow: hidden; }
.progress-fill  { height: 100%; background: linear-gradient(90deg, #6FCF97, #2FA084); border-radius: var(--radius-full); transition: width 0.5s cubic-bezier(0.4,0,0.2,1); }

/* Tasks toggle */
.tasks-section { display: flex; flex-direction: column; gap: 0; }
.tasks-toggle {
  display: inline-flex; align-items: center; gap: 6px;
  background: none; border: none; cursor: pointer;
  font-size: 0.8rem; font-weight: 600; color: var(--color-mid);
  padding: 4px 0; transition: color var(--transition);
}
.tasks-toggle svg { transition: transform var(--transition); }
.tasks-toggle--open svg { transform: rotate(180deg); }
.tasks-toggle:hover { color: var(--color-dark); }

/* Tasks list */
.tasks-list {
  display: flex; flex-direction: column; gap: 0;
  margin-top: 10px;
  border: 1px solid rgba(111,207,151,0.15);
  border-radius: var(--radius-md);
  overflow: hidden;
}

.task-row {
  display: flex; align-items: flex-start; gap: 10px;
  padding: 10px 14px;
  border-bottom: 1px solid rgba(111,207,151,0.1);
  background: #fafffe;
  transition: background var(--transition);
}
.task-row:last-child { border-bottom: none; }
.task-row:hover { background: rgba(111,207,151,0.05); }
.task-row--done { opacity: 0.6; }

.task-check {
  width: 18px; height: 18px; border-radius: 50%;
  border: 2px solid rgba(47,160,132,0.3);
  display: flex; align-items: center; justify-content: center;
  flex-shrink: 0; margin-top: 2px;
}
.task-check--done { background: var(--color-mid); border-color: var(--color-mid); }
.task-check--done svg { stroke: white; }

.task-content { display: flex; flex-direction: column; gap: 2px; flex: 1; min-width: 0; }
.task-titulo  { font-size: 0.85rem; font-weight: 600; color: var(--color-dark); }
.task-detalle { font-size: 0.77rem; color: var(--color-text-muted); line-height: 1.4; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }

.task-reminders-list {
  display: flex; align-items: center; gap: 6px; flex-wrap: wrap; justify-content: flex-end;
}

.task-reminder-chip {
  display: inline-flex; align-items: center; gap: 4px;
  padding: 3px 8px; border-radius: var(--radius-full);
  font-size: 0.7rem; font-weight: 600; flex-shrink: 0;
}
.reminder--ok     { background: rgba(111,207,151,0.12); color: #2FA084; }
.reminder--soon   { background: rgba(255,193,7,0.12);   color: #b8860b; }
.reminder--overdue{ background: rgba(217,79,79,0.1);    color: #c0392b; }

.no-tasks-note {
  display: inline-flex; align-items: center; gap: 5px;
  font-size: 0.78rem; color: #b0b8c4; padding: 2px 0;
}

/* ── Empty state ── */
.empty-state {
  display: flex; flex-direction: column; align-items: center; gap: 14px;
  text-align: center; padding: 60px 20px;
  animation: slideUp 0.5s cubic-bezier(0.4,0,0.2,1) both;
}
.empty-icon    { animation: pulse 3s ease-in-out infinite; }
@keyframes pulse { 0%,100%{transform:scale(1)}50%{transform:scale(1.05)} }
.empty-title   { font-size: 1.2rem; font-weight: 700; color: var(--color-dark); }
.empty-desc    { font-size: 0.875rem; color: var(--color-text-muted); max-width: 300px; }

.btn-empty-action {
  display: inline-flex; align-items: center; gap: 8px;
  padding: 12px 24px;
  background: linear-gradient(135deg, #2FA084, #1F6F5F);
  color: white; border-radius: var(--radius-md);
  font-size: 0.9rem; font-weight: 600; text-decoration: none;
  box-shadow: 0 4px 16px rgba(31,111,95,0.3);
  transition: transform var(--transition), box-shadow var(--transition);
  margin-top: 6px;
}
.btn-empty-action:hover { transform: translateY(-2px); box-shadow: 0 8px 24px rgba(31,111,95,0.4); color: white; }

/* ── Modal ── */
.modal-overlay {
  position: fixed; inset: 0;
  background: rgba(0,0,0,0.45);
  backdrop-filter: blur(4px);
  display: flex; align-items: center; justify-content: center;
  z-index: 1000; padding: 20px;
}
.modal-card {
  background: white; border-radius: var(--radius-lg);
  padding: 36px 32px; max-width: 400px; width: 100%;
  box-shadow: 0 24px 60px rgba(0,0,0,0.18);
  display: flex; flex-direction: column; align-items: center; gap: 12px; text-align: center;
}
.modal-icon {
  width: 56px; height: 56px; border-radius: 50%;
  background: rgba(217,79,79,0.1);
  display: flex; align-items: center; justify-content: center;
  color: #c0392b; margin-bottom: 4px;
}
.modal-title { font-size: 1.15rem; font-weight: 700; color: var(--color-dark); }
.modal-desc  { font-size: 0.875rem; color: var(--color-text-muted); line-height: 1.5; }
.modal-actions { display: flex; gap: 10px; margin-top: 8px; width: 100%; }
.modal-btn { flex: 1; padding: 11px; border-radius: var(--radius-md); font-size: 0.9rem; font-weight: 600; border: none; cursor: pointer; transition: background var(--transition), transform var(--transition); }
.modal-btn:hover { transform: translateY(-1px); }
.modal-btn--cancel  { background: rgba(238,238,238,0.8); color: var(--color-text-muted); }
.modal-btn--cancel:hover { background: #e0e0e0; }
.modal-btn--confirm { background: linear-gradient(135deg, #e05c5c, #c0392b); color: white; box-shadow: 0 3px 12px rgba(192,57,43,0.3); }
.modal-btn--confirm:hover { box-shadow: 0 6px 20px rgba(192,57,43,0.4); }

/* ── Transitions ── */
.list-enter-active { animation: slideUp 0.35s cubic-bezier(0.4,0,0.2,1); }
.list-leave-active { animation: slideUp 0.25s cubic-bezier(0.4,0,0.2,1) reverse; }

.expand-enter-active { transition: all 0.3s ease; max-height: 1000px; }
.expand-leave-active { transition: all 0.25s ease; }
.expand-enter-from, .expand-leave-to { opacity: 0; max-height: 0; }

.modal-enter-active { animation: modalIn 0.3s cubic-bezier(0.4,0,0.2,1); }
.modal-leave-active { animation: modalIn 0.2s cubic-bezier(0.4,0,0.2,1) reverse; }
@keyframes modalIn { from { opacity:0; transform:scale(0.9); } to { opacity:1; transform:scale(1); } }

/* ── Responsive ── */
@media (max-width: 900px) {
  .stats-row { grid-template-columns: repeat(2, 1fr); }
}
@media (max-width: 768px) {
  .sidebar  { width: 200px; }
  .main     { margin-left: 200px; }
  .content-area, .topbar { padding-left: 20px; padding-right: 20px; }
  .stats-row { grid-template-columns: 1fr 1fr; }
  .event-card-header { flex-direction: column; }
}
</style>
