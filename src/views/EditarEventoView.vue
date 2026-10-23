<template>
  <div class="page-layout">
    <AppSidebar />

    <!-- Main -->
    <main class="main">
      <header class="topbar">
        <div class="topbar-left">
          <h2 class="page-title">Editar evento</h2>
          <span class="page-breadcrumb">Eventos › Editar</span>
        </div>
        <div class="topbar-right">
          <button class="btn-back" @click="$router.push('/eventos')">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <polyline points="15 18 9 12 15 6"/>
            </svg>
            Volver
          </button>
        </div>
      </header>

      <!-- Not found -->
      <div v-if="!eventoExiste" class="not-found">
        <svg width="60" height="60" viewBox="0 0 60 60" fill="none">
          <circle cx="30" cy="30" r="30" fill="rgba(217,79,79,0.08)"/>
          <path d="M30 20v12m0 6h.01" stroke="#c0392b" stroke-width="2.5" stroke-linecap="round"/>
        </svg>
        <h3>Evento no encontrado</h3>
        <p>El evento que intentas editar no existe o fue eliminado.</p>
        <RouterLink to="/eventos" class="btn-ir-inicio">Ir a eventos</RouterLink>
      </div>

      <div v-else class="content-area">
        <!-- Formulario principal -->
        <section class="section-card">
          <div class="section-header">
            <div class="section-icon">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
              </svg>
            </div>
            <div>
              <h3 class="section-title">Información del evento</h3>
              <p class="section-sub">Modifica los datos generales del evento</p>
            </div>
          </div>

          <div class="form-grid">
            <div class="field field--full" :class="{ 'field--focused': focused === 'evento', 'field--error': errors.evento }">
              <label class="field-label" for="edit-evento">Nombre del evento <span class="required">*</span></label>
              <div class="field-wrapper">
                <span class="field-icon">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/>
                  </svg>
                </span>
                <input id="edit-evento" v-model="form.evento" type="text" class="field-input"
                  placeholder="Nombre del evento" @focus="focused = 'evento'" @blur="focused = null" />
              </div>
              <span v-if="errors.evento" class="field-error">{{ errors.evento }}</span>
            </div>

            <div class="field field--full" :class="{ 'field--focused': focused === 'descripcion' }">
              <label class="field-label" for="edit-descripcion">Descripción</label>
              <div class="field-wrapper">
                <span class="field-icon field-icon--top">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <line x1="8" x2="21" y1="6" y2="6"/><line x1="8" x2="21" y1="12" y2="12"/>
                    <line x1="8" x2="21" y1="18" y2="18"/><line x1="3" x2="3.01" y1="6" y2="6"/>
                    <line x1="3" x2="3.01" y1="12" y2="12"/><line x1="3" x2="3.01" y1="18" y2="18"/>
                  </svg>
                </span>
                <textarea id="edit-descripcion" v-model="form.descripcion" class="field-input field-textarea"
                  rows="3" placeholder="Descripción del evento..."
                  @focus="focused = 'descripcion'" @blur="focused = null" />
              </div>
            </div>

            <div class="field" :class="{ 'field--focused': focused === 'fechaInicio', 'field--error': errors.fechaInicio }">
              <label class="field-label" for="edit-fechaInicio">Fecha de inicio <span class="required">*</span></label>
              <div class="field-wrapper">
                <span class="field-icon">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <rect x="3" y="4" width="18" height="18" rx="2"/>
                    <line x1="16" x2="16" y1="2" y2="6"/><line x1="8" x2="8" y1="2" y2="6"/>
                    <line x1="3" x2="21" y1="10" y2="10"/>
                  </svg>
                </span>
                <input id="edit-fechaInicio" v-model="form.fechaInicio" type="date" class="field-input"
                  @focus="focused = 'fechaInicio'" @blur="focused = null" />
              </div>
              <span v-if="errors.fechaInicio" class="field-error">{{ errors.fechaInicio }}</span>
            </div>

            <div class="field" :class="{ 'field--focused': focused === 'fechaEstimada', 'field--error': errors.fechaEstimada }">
              <label class="field-label" for="edit-fechaEstimada">Fecha estimada de finalización <span class="required">*</span></label>
              <div class="field-wrapper">
                <span class="field-icon">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <rect x="3" y="4" width="18" height="18" rx="2"/>
                    <line x1="16" x2="16" y1="2" y2="6"/><line x1="8" x2="8" y1="2" y2="6"/>
                    <line x1="3" x2="21" y1="10" y2="10"/>
                    <path d="m9 16 2 2 4-4"/>
                  </svg>
                </span>
                <input id="edit-fechaEstimada" v-model="form.fechaEstimada" type="date" class="field-input"
                  @focus="focused = 'fechaEstimada'" @blur="focused = null" />
              </div>
              <span v-if="errors.fechaEstimada" class="field-error">{{ errors.fechaEstimada }}</span>
            </div>

            <div class="field" :class="{ 'field--focused': focused === 'fechaFinalizacion' }">
              <label class="field-label" for="edit-fechaFinalizacion">Fecha de finalización (Real)</label>
              <div class="field-wrapper">
                <span class="field-icon">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <rect x="3" y="4" width="18" height="18" rx="2"/>
                    <line x1="16" x2="16" y1="2" y2="6"/><line x1="8" x2="8" y1="2" y2="6"/>
                    <line x1="3" x2="21" y1="10" y2="10"/>
                    <path d="M9 12l2 2 4-4"/>
                  </svg>
                </span>
                <input id="edit-fechaFinalizacion" v-model="form.fechaFinalizacion" type="date" class="field-input"
                  @focus="focused = 'fechaFinalizacion'" @blur="focused = null" />
              </div>
            </div>
          </div>

          <div v-if="duracion" class="duracion-badge">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
            </svg>
            Duración estimada: <strong>{{ duracion }}</strong>
          </div>
        </section>

        <!-- Tarjetas de tareas -->
        <section class="section-card">
          <div class="section-header">
            <div class="section-icon section-icon--light">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/>
              </svg>
            </div>
            <div>
              <h3 class="section-title">Tareas y recordatorios</h3>
              <p class="section-sub">Modifica las actividades de este evento</p>
            </div>
            <button id="btn-add-task-edit" type="button" class="btn-add-task" @click="addTarea">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                <line x1="12" x2="12" y1="5" y2="19"/><line x1="5" x2="19" y1="12" y2="12"/>
              </svg>
              Agregar tarea
            </button>
          </div>

          <TransitionGroup name="card-list" tag="div" class="tasks-grid">
            <div v-for="(tarea, index) in tareas" :key="tarea.id"
              class="task-card" :class="{ 'task-card--completed': tarea.completada }">
              <div class="task-card-header">
                <div class="task-number"><span>{{ index + 1 }}</span></div>
                <div class="task-card-actions">
                  <button type="button" class="task-action-btn task-action-btn--check"
                    :class="{ active: tarea.completada }" @click="tarea.completada = !tarea.completada">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                      <path d="M20 6 9 17l-5-5"/>
                    </svg>
                  </button>
                  <button type="button" class="task-action-btn task-action-btn--delete" @click="removeTarea(tarea.id)">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                      <path d="M3 6h18"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"/>
                      <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                    </svg>
                  </button>
                </div>
              </div>

              <div class="task-field">
                <label class="task-field-label" :for="`edit-task-title-${tarea.id}`">Título de la tarea</label>
                <input :id="`edit-task-title-${tarea.id}`" v-model="tarea.nombre" type="text"
                  class="task-input" placeholder="Título" :disabled="tarea.completada" />
              </div>

              <div class="task-field">
                <label class="task-field-label" :for="`edit-task-detail-${tarea.id}`">Detalle / qué se hará</label>
                <textarea :id="`edit-task-detail-${tarea.id}`" v-model="tarea.detalle"
                  class="task-input task-textarea" rows="2"
                  placeholder="Qué se realizará..." :disabled="tarea.completada" />
              </div>

              <!-- Recordatorios -->
              <div class="task-reminders-section">
                <div class="reminders-header">
                  <label class="task-field-label">Recordatorios</label>
                  <button type="button" class="btn-add-reminder" @click="addRecordatorio(tarea)" :disabled="tarea.completada">
                    + Añadir
                  </button>
                </div>
                
                <div v-for="rec in tarea.recordatorios" :key="rec.id" class="reminder-item">
                  <div class="reminder-row">
                    <input type="date" v-model="rec.fecha" class="task-input task-input--date" :disabled="tarea.completada">
                    <input type="time" v-model="rec.hora" class="task-input task-input--time" :disabled="tarea.completada">
                    <button type="button" class="btn-remove-reminder" @click="removeRecordatorio(tarea, rec.id)" :disabled="tarea.completada" title="Quitar recordatorio">✕</button>
                  </div>
                  <div class="reminder-options">
                    <label class="checkbox-label">
                      <input type="checkbox" v-model="rec.repetirPorDia" :disabled="tarea.completada"> Repetir por día
                    </label>
                    <label class="checkbox-label">
                      <input type="checkbox" v-model="rec.repetirPorHora" :disabled="tarea.completada"> Repetir por hora
                    </label>
                  </div>
                </div>
                
                <div v-if="tarea.recordatorios.length === 0" class="no-reminders-text">
                  Sin recordatorios asignados
                </div>
              </div>
            </div>
          </TransitionGroup>

          <div v-if="tareas.length === 0" class="tasks-empty">
            <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
              <circle cx="24" cy="24" r="24" fill="rgba(111,207,151,0.1)"/>
              <path d="M16 24l5 5 11-10" stroke="#6FCF97" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
            <p>Sin tareas. Haz clic en <strong>"Agregar tarea"</strong> para añadir.</p>
          </div>
        </section>

        <!-- Acciones -->
        <div class="form-actions">
          <button type="button" class="btn-cancel" @click="$router.push('/eventos')">Cancelar</button>
          <button id="btn-update-event" type="button" class="btn-save"
            :disabled="saving" @click="handleUpdate">
            <span v-if="!saving">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/>
                <polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/>
              </svg>
              Guardar cambios
            </span>
            <span v-else class="spinner"></span>
          </button>
        </div>

        <Transition name="toast">
          <div v-if="showToast" class="toast-success">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><path d="m9 11 3 3L22 4"/>
            </svg>
            ¡Evento actualizado exitosamente!
          </div>
        </Transition>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { useRouter, useRoute, RouterLink } from 'vue-router'
import { getEvento, updateEvento, initEventos, eventosStore } from '../store/eventos'
import type { Tarea } from '../store/eventos'
import AppSidebar from '../components/AppSidebar.vue'

const router = useRouter()
const route = useRoute()

const eventoId = Number(route.params.id)
const eventoExiste = ref(true)
const focused = ref<string | null>(null)
const saving = ref(false)
const showToast = ref(false)

const form = reactive({
  evento: '',
  descripcion: '',
  fechaInicio: '',
  fechaEstimada: '',
  fechaFinalizacion: '',
})

const errors = reactive({ evento: '', fechaInicio: '', fechaEstimada: '' })

let nextTaskId = 1000
const tareas = ref<Tarea[]>([])

// ── Cargar datos al montar ──
onMounted(async () => {
  if (!eventosStore.initialized || eventosStore.loading) {
    await initEventos()
  }
  const evento = getEvento(eventoId)
  if (!evento) {
    eventoExiste.value = false
    return
  }
  form.evento = evento.evento
  form.descripcion = evento.descripcion
  form.fechaInicio = evento.fechaInicio
  form.fechaEstimada = evento.fechaEstimada
  form.fechaFinalizacion = evento.fechaFinalizacion || ''
  
  // Clone tasks and internal arrays
  tareas.value = evento.tareas.map(t => ({ 
    ...t, 
    recordatorios: Array.isArray(t.recordatorios) ? t.recordatorios.map(r => ({ ...r })) : [] 
  }))
  nextTaskId = tareas.value.reduce((max, t) => Math.max(max, t.id), 0) + 1
})

// ── Duración ──
const duracion = computed(() => {
  if (!form.fechaInicio || !form.fechaEstimada) return ''
  const dias = Math.ceil(
    (new Date(form.fechaEstimada).getTime() - new Date(form.fechaInicio).getTime()) / 86400000
  )
  if (dias <= 0) return ''
  if (dias === 1) return '1 día'
  if (dias < 7) return `${dias} días`
  const sem = Math.floor(dias / 7)
  return sem < 4 ? `${sem} sem.` : `${Math.floor(dias / 30)} mes${Math.floor(dias / 30) > 1 ? 'es' : ''}`
})

// ── Tareas ──
function addTarea() {
  tareas.value.push({ id: nextTaskId++, nombre: '', detalle: '', recordatorios: [], completada: false })
}
function removeTarea(id: number) {
  tareas.value = tareas.value.filter(t => t.id !== id)
}

function addRecordatorio(tarea: Tarea) {
  tarea.recordatorios.push({
    id: Date.now().toString(36) + Math.random().toString(36).substring(2),
    fecha: '',
    hora: '',
    repetirPorDia: false,
    repetirPorHora: false,
  })
}

function removeRecordatorio(tarea: Tarea, idRec: string) {
  tarea.recordatorios = tarea.recordatorios.filter(r => r.id !== idRec)
}

// ── Validación ──
function validate(): boolean {
  errors.evento = ''; errors.fechaInicio = ''; errors.fechaEstimada = ''
  let valid = true
  if (!form.evento.trim()) { errors.evento = 'El nombre es requerido'; valid = false }
  if (!form.fechaInicio)   { errors.fechaInicio = 'La fecha de inicio es requerida'; valid = false }
  if (!form.fechaEstimada) { errors.fechaEstimada = 'La fecha estimada es requerida'; valid = false }
  else if (form.fechaEstimada <= form.fechaInicio) { errors.fechaEstimada = 'Debe ser posterior a la de inicio'; valid = false }
  return valid
}

// ── Guardar cambios ──
async function handleUpdate() {
  if (!validate()) return
  saving.value = true
  await updateEvento(eventoId, {
    evento: form.evento.trim(),
    descripcion: form.descripcion.trim(),
    fechaInicio: form.fechaInicio,
    fechaEstimada: form.fechaEstimada,
    fechaFinalizacion: form.fechaFinalizacion,
    tareas: tareas.value.map(t => ({ ...t, recordatorios: [...t.recordatorios] })),
  })
  saving.value = false
  showToast.value = true
  setTimeout(() => {
    showToast.value = false
    router.push({ name: 'eventos' })
  }, 1500)
}
</script>

<style scoped>
.page-layout { display: flex; min-height: 100vh; background: var(--color-bg); }

/* Main */
.main { flex: 1; margin-left: 240px; display: flex; flex-direction: column; min-height: 100vh; }

/* Topbar */
.topbar { display: flex; align-items: center; justify-content: space-between; padding: 20px 32px; background: white; border-bottom: 1px solid rgba(47,160,132,0.1); box-shadow: var(--shadow-sm); position: sticky; top: 0; z-index: 50; }
.topbar-left { display: flex; flex-direction: column; gap: 2px; }
.page-title  { font-size: 1.25rem; font-weight: 700; color: var(--color-dark); }
.page-breadcrumb { font-size: 0.78rem; color: var(--color-text-muted); }

.btn-back {
  display: inline-flex; align-items: center; gap: 5px;
  padding: 9px 16px; background: rgba(238,238,238,0.8);
  border: 1.5px solid var(--color-border); border-radius: var(--radius-md);
  font-size: 0.85rem; font-weight: 600; color: var(--color-text-muted);
  cursor: pointer; transition: border-color var(--transition), color var(--transition);
}
.btn-back:hover { border-color: var(--color-mid); color: var(--color-mid); }

/* Not found */
.not-found { display: flex; flex-direction: column; align-items: center; gap: 12px; padding: 80px 20px; text-align: center; color: var(--color-text-muted); }
.not-found h3 { font-size: 1.1rem; font-weight: 700; color: var(--color-dark); }
.btn-ir-inicio { display: inline-flex; align-items: center; padding: 10px 20px; background: var(--color-mid); color: white; border-radius: var(--radius-md); font-size: 0.875rem; font-weight: 600; text-decoration: none; margin-top: 8px; }

/* Content */
.content-area { padding: 32px; display: flex; flex-direction: column; gap: 24px; max-width: 960px; width: 100%; }

/* Section card */
.section-card { background: white; border-radius: var(--radius-lg); box-shadow: var(--shadow-sm); border: 1px solid rgba(47,160,132,0.08); padding: 28px; animation: slideUp 0.4s cubic-bezier(0.4,0,0.2,1) both; }
.section-card:nth-child(2) { animation-delay: 0.06s; }
@keyframes slideUp { from { opacity:0; transform:translateY(16px); } to { opacity:1; transform:translateY(0); } }

.section-header { display: flex; align-items: center; gap: 14px; margin-bottom: 24px; flex-wrap: wrap; }
.section-icon { width: 40px; height: 40px; border-radius: var(--radius-sm); background: linear-gradient(135deg, #2FA084, #1F6F5F); display: flex; align-items: center; justify-content: center; color: white; flex-shrink: 0; }
.section-icon--light { background: linear-gradient(135deg, #6FCF97, #2FA084); }
.section-title { font-size: 1rem; font-weight: 700; color: var(--color-dark); }
.section-sub   { font-size: 0.8rem; color: var(--color-text-muted); margin-top: 2px; }
.section-header .btn-add-task { margin-left: auto; }

/* Form grid */
.form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
.field { display: flex; flex-direction: column; gap: 6px; }
.field--full { grid-column: 1 / -1; }
.field-label { font-size: 0.8rem; font-weight: 600; color: var(--color-dark); }
.required { color: #e05c5c; }
.field-wrapper { position: relative; display: flex; align-items: flex-start; }
.field-icon { position: absolute; left: 13px; top: 50%; transform: translateY(-50%); color: var(--color-mid); display: flex; align-items: center; pointer-events: none; transition: color var(--transition); }
.field-icon--top { top: 14px; transform: none; }
.field-input { width: 100%; padding: 11px 14px 11px 40px; background: rgba(238,238,238,0.45); border: 1.5px solid var(--color-border); border-radius: var(--radius-md); font-size: 0.9rem; color: var(--color-text); outline: none; transition: border-color var(--transition), background var(--transition), box-shadow var(--transition); resize: none; font-family: var(--font); }
.field-input::placeholder { color: #b0b8c4; }
.field--focused .field-input { border-color: var(--color-mid); background: white; box-shadow: 0 0 0 3px rgba(47,160,132,0.1); }
.field--error .field-input { border-color: #e05c5c; }
.field--focused .field-icon { color: var(--color-dark); }
.field-textarea { min-height: 80px; padding-top: 12px; }
.field-error { font-size: 0.76rem; color: #d94f4f; font-weight: 500; }

/* Duración */
.duracion-badge { display: inline-flex; align-items: center; gap: 6px; margin-top: 12px; padding: 7px 14px; background: rgba(111,207,151,0.12); border: 1px solid rgba(111,207,151,0.3); border-radius: var(--radius-full); font-size: 0.8rem; color: var(--color-dark); width: fit-content; }

/* Add task */
.btn-add-task { display: inline-flex; align-items: center; gap: 6px; padding: 9px 18px; background: linear-gradient(135deg, #2FA084, #1F6F5F); color: white; border: none; border-radius: var(--radius-md); font-size: 0.85rem; font-weight: 600; transition: transform var(--transition), box-shadow var(--transition); box-shadow: 0 3px 12px rgba(31,111,95,0.25); cursor: pointer; }
.btn-add-task:hover { transform: translateY(-1px); box-shadow: 0 6px 20px rgba(31,111,95,0.35); }

/* Tasks grid */
.tasks-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 16px; }

/* Task card */
.task-card { background: linear-gradient(145deg, #f9fffe, #f0faf6); border: 1.5px solid rgba(111,207,151,0.25); border-radius: var(--radius-md); padding: 18px; display: flex; flex-direction: column; gap: 12px; position: relative; overflow: hidden; transition: box-shadow var(--transition); }
.task-card::before { content:''; position: absolute; top:0; left:0; width:4px; height:100%; background: linear-gradient(180deg, #6FCF97, #2FA084); border-radius: 4px 0 0 4px; }
.task-card:hover { box-shadow: var(--shadow-md); }
.task-card--completed { opacity: 0.65; }
.task-card--completed::before { background: #b0b8c4; }
.task-card-header { display: flex; align-items: center; justify-content: space-between; }
.task-number { width: 26px; height: 26px; border-radius: 50%; background: linear-gradient(135deg, #6FCF97, #2FA084); display: flex; align-items: center; justify-content: center; font-size: 0.75rem; font-weight: 700; color: white; }
.task-card-actions { display: flex; gap: 6px; }
.task-action-btn { width: 28px; height: 28px; border: none; border-radius: var(--radius-sm); display: flex; align-items: center; justify-content: center; cursor: pointer; transition: background var(--transition), color var(--transition); }
.task-action-btn--check { background: rgba(111,207,151,0.1); color: var(--color-mid); }
.task-action-btn--check:hover, .task-action-btn--check.active { background: var(--color-mid); color: white; }
.task-action-btn--delete { background: rgba(217,79,79,0.08); color: #c0392b; }
.task-action-btn--delete:hover { background: rgba(217,79,79,0.18); }
.task-field { display: flex; flex-direction: column; gap: 4px; }
.task-field-label { font-size: 0.72rem; font-weight: 600; color: var(--color-text-muted); text-transform: uppercase; letter-spacing: 0.06em; }
.task-input { width: 100%; padding: 8px 10px; background: white; border: 1.5px solid rgba(47,160,132,0.15); border-radius: var(--radius-sm); font-size: 0.875rem; color: var(--color-text); outline: none; transition: border-color var(--transition), box-shadow var(--transition); resize: none; font-family: var(--font); }
.task-input:focus { border-color: var(--color-mid); box-shadow: 0 0 0 2px rgba(47,160,132,0.1); }
.task-input:disabled { background: #f4f4f4; color: #aaa; cursor: not-allowed; }
.task-input::placeholder { color: #c0c8d0; }
.task-textarea { min-height: 56px; }
.task-input--date { font-size: 0.82rem; }
/* ── Recordatorios Múltiples ── */
.task-reminders-section {
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 12px;
  background: rgba(238, 238, 238, 0.4);
  border-radius: var(--radius-sm);
  border: 1px dashed rgba(47, 160, 132, 0.2);
}
.reminders-header { display: flex; justify-content: space-between; align-items: center; }
.btn-add-reminder { background: none; border: none; color: var(--color-mid); font-size: 0.8rem; font-weight: 600; cursor: pointer; }
.btn-add-reminder:hover { text-decoration: underline; }
.reminder-item { display: flex; flex-direction: column; gap: 8px; padding: 8px; background: white; border-radius: var(--radius-sm); border: 1px solid var(--color-border); }
.reminder-row { display: flex; gap: 8px; align-items: center; }
.task-input--time { max-width: 100px; }
.btn-remove-reminder { background: none; border: none; color: #c0392b; font-size: 1rem; cursor: pointer; padding: 0 4px; }
.reminder-options { display: flex; gap: 16px; font-size: 0.8rem; }
.checkbox-label { display: flex; align-items: center; gap: 6px; color: var(--color-text-muted); }
.no-reminders-text { font-size: 0.8rem; color: #999; text-align: center; font-style: italic; padding: 4px 0; }

.task-status-chip { display: inline-flex; align-items: center; gap: 6px; padding: 4px 10px; border-radius: var(--radius-full); font-size: 0.72rem; font-weight: 600; width: fit-content; }
.chip-dot { width: 6px; height: 6px; border-radius: 50%; background: currentColor; }
.chip--neutral  { background: rgba(180,180,200,0.15); color: #888; }
.chip--upcoming { background: rgba(111,207,151,0.15); color: #2FA084; }
.chip--soon     { background: rgba(255,193,7,0.15);   color: #b8860b; }
.chip--overdue  { background: rgba(217,79,79,0.12);   color: #c0392b; }
.chip--done     { background: rgba(47,160,132,0.12);  color: #1F6F5F; }

/* Tasks empty */
.tasks-empty { display: flex; flex-direction: column; align-items: center; gap: 12px; padding: 40px 20px; color: var(--color-text-muted); font-size: 0.875rem; text-align: center; }

/* Actions */
.form-actions { display: flex; justify-content: flex-end; gap: 12px; padding: 4px 0 8px; }
.btn-cancel { padding: 12px 24px; background: white; border: 1.5px solid var(--color-border); border-radius: var(--radius-md); font-size: 0.9rem; font-weight: 600; color: var(--color-text-muted); cursor: pointer; transition: border-color var(--transition), color var(--transition); }
.btn-cancel:hover { border-color: var(--color-mid); color: var(--color-mid); }
.btn-save { display: inline-flex; align-items: center; gap: 8px; padding: 12px 28px; background: linear-gradient(135deg, #2FA084, #1F6F5F); color: white; border: none; border-radius: var(--radius-md); font-size: 0.95rem; font-weight: 600; box-shadow: 0 4px 16px rgba(31,111,95,0.3); transition: transform var(--transition), box-shadow var(--transition); cursor: pointer; position: relative; overflow: hidden; }
.btn-save::before { content:''; position: absolute; inset:0; background: linear-gradient(135deg, #6FCF97, #2FA084); opacity: 0; transition: opacity var(--transition); }
.btn-save:hover:not(:disabled)::before { opacity: 1; }
.btn-save:hover:not(:disabled) { transform: translateY(-2px); box-shadow: 0 8px 24px rgba(31,111,95,0.4); }
.btn-save span { position: relative; z-index: 1; display: inline-flex; align-items: center; gap: 8px; }
.btn-save:disabled { opacity: 0.7; cursor: not-allowed; }

/* Spinner */
.spinner { display: inline-block; width: 20px; height: 20px; border: 2.5px solid rgba(255,255,255,0.3); border-top-color: white; border-radius: 50%; animation: spin 0.7s linear infinite; }
@keyframes spin { to { transform: rotate(360deg); } }

/* Toast */
.toast-success { position: fixed; bottom: 32px; right: 32px; display: flex; align-items: center; gap: 10px; padding: 14px 22px; background: linear-gradient(135deg, #2FA084, #1F6F5F); color: white; border-radius: var(--radius-md); font-size: 0.9rem; font-weight: 600; box-shadow: 0 8px 32px rgba(31,111,95,0.35); z-index: 9999; }
.toast-enter-active { animation: toastIn 0.35s cubic-bezier(0.4,0,0.2,1); }
.toast-leave-active { animation: toastIn 0.3s cubic-bezier(0.4,0,0.2,1) reverse; }
@keyframes toastIn { from { opacity:0; transform:translateY(20px) scale(0.95); } to { opacity:1; transform:translateY(0) scale(1); } }

/* Card list transitions */
.card-list-enter-active { animation: cardIn 0.3s cubic-bezier(0.4,0,0.2,1); }
.card-list-leave-active { animation: cardOut 0.25s cubic-bezier(0.4,0,0.2,1); position: absolute; width: 100%; }
@keyframes cardIn  { from { opacity:0; transform:scale(0.95) translateY(8px); } to { opacity:1; transform:scale(1) translateY(0); } }
@keyframes cardOut { from { opacity:1; } to { opacity:0; transform:scale(0.9); } }

/* Responsive */
@media (max-width: 768px) {
  .sidebar { width: 200px; } .main { margin-left: 200px; }
  .content-area { padding: 20px; } .form-grid { grid-template-columns: 1fr; }
  .tasks-grid { grid-template-columns: 1fr; }
}
</style>
