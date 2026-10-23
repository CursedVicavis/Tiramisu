<template>
  <div class="notif-wrapper" ref="wrapperRef">
    <button
      type="button"
      class="bell-btn"
      :class="{ 'bell-btn--has-alerts': badgeCount > 0 }"
      @click="abierto = !abierto"
      title="Recordatorios y alertas"
    >
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/>
        <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/>
      </svg>
      <span v-if="badgeCount > 0" class="bell-badge">{{ badgeCount }}</span>
    </button>

    <Transition name="pop">
      <div v-if="abierto" class="notif-dropdown">
        <div class="notif-header">
          <div>
            <h4 class="notif-title">Centro de Recordatorios</h4>
            <p class="notif-sub">{{ alertasUnificadas.length }} recordatorio{{ alertasUnificadas.length !== 1 ? 's' : '' }} activo{{ alertasUnificadas.length !== 1 ? 's' : '' }}</p>
          </div>
          <button
            v-if="recordatoriosStore.permisoNavegador !== 'granted'"
            type="button"
            class="btn-enable-push"
            @click="solicitarPermisoNotificaciones"
          >
            🔔 Activar alertas PC
          </button>
          <span v-else class="push-active-tag">✓ Alertas activas</span>
        </div>

        <!-- Formulario rápido para agregar recordatorio suelto -->
        <form class="quick-reminder-form" @submit.prevent="guardarRapido">
          <input
            v-model="nuevo.titulo"
            type="text"
            class="qr-input"
            placeholder="Nuevo recordatorio rápido (ej. Llamar a cliente X)..."
            required
          />
          <div class="qr-row">
            <input v-model="nuevo.fecha" type="date" class="qr-input qr-input--sm" required />
            <input v-model="nuevo.hora" type="time" class="qr-input qr-input--sm" required />
            <input
              :value="nuevo.telefonoWhatsapp"
              type="tel"
              class="qr-input qr-input--sm"
              placeholder="+504 9999-9999"
              maxlength="14"
              @focus="!nuevo.telefonoWhatsapp && (nuevo.telefonoWhatsapp = '+504 ')"
              @input="nuevo.telefonoWhatsapp = formatPhoneHN(($event.target as HTMLInputElement).value)"
            />
            <button type="submit" class="btn-qr-add">+</button>
          </div>
        </form>

        <!-- Lista de alertas -->
        <div class="notif-list">
          <div
            v-for="alerta in alertasUnificadas"
            :key="alerta.id"
            class="notif-item"
            :class="`notif-item--${alerta.estadoTiempo}`"
          >
            <div class="notif-item-main">
              <div class="notif-tags">
                <span class="origin-tag" :class="`origin--${alerta.origen}`">{{ alerta.contexto }}</span>
                <span class="time-tag">{{ formatDate(alerta.fecha) }} · {{ alerta.hora }}</span>
              </div>
              <p class="notif-msg">{{ alerta.mensaje }}</p>
            </div>

            <div class="notif-item-actions">
              <a
                :href="buildWhatsAppUrl(`🔔 *Recordatorio Tiramisu (${alerta.contexto})*: ${alerta.mensaje} — ${formatDate(alerta.fecha)} ${alerta.hora}`, alerta.telefonoWhatsapp)"
                target="_blank"
                rel="noopener noreferrer"
                class="btn-wa-notif"
                title="Enviar por WhatsApp"
              >
                WA
              </a>
              <button
                v-if="alerta.origen === 'general'"
                type="button"
                class="btn-del-notif"
                @click="eliminarGeneral(alerta.id)"
                title="Eliminar recordatorio"
              >
                ✕
              </button>
            </div>
          </div>

          <div v-if="alertasUnificadas.length === 0" class="notif-empty">
            No tienes recordatorios pendientes. Añade uno arriba o dentro de un proyecto.
          </div>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted, onBeforeUnmount } from 'vue'
import {
  recordatoriosStore,
  alertasUnificadas,
  addRecordatorioGeneral,
  deleteRecordatorioGeneral,
  solicitarPermisoNotificaciones,
  buildWhatsAppUrl,
} from '../store/recordatorios'
import { formatPhoneHN } from '../store/proyectos'

const abierto = ref(false)
const wrapperRef = ref<HTMLElement | null>(null)

const hoy = new Date().toISOString().split('T')[0]
const nuevo = reactive({
  titulo: '',
  fecha: hoy,
  hora: '10:00',
  telefonoWhatsapp: '',
})

const badgeCount = computed(() =>
  alertasUnificadas.value.filter(a => a.estadoTiempo === 'vencido' || a.estadoTiempo === 'proximo').length ||
  alertasUnificadas.value.length
)

function guardarRapido() {
  if (!nuevo.titulo.trim()) return
  addRecordatorioGeneral({
    titulo: nuevo.titulo.trim(),
    fecha: nuevo.fecha,
    hora: nuevo.hora,
    telefonoWhatsapp: nuevo.telefonoWhatsapp.trim(),
  })
  nuevo.titulo = ''
}

function eliminarGeneral(alertaId: string) {
  const realId = alertaId.replace(/^gen-/, '')
  deleteRecordatorioGeneral(realId)
}

function formatDate(dateStr: string): string {
  if (!dateStr) return ''
  const [y, m, d] = dateStr.split('-')
  return d && m && y ? `${d}/${m}/${y}` : dateStr
}

function onClickOutside(e: MouseEvent) {
  if (wrapperRef.value && !wrapperRef.value.contains(e.target as Node)) {
    abierto.value = false
  }
}

onMounted(() => document.addEventListener('click', onClickOutside))
onBeforeUnmount(() => document.removeEventListener('click', onClickOutside))
</script>

<style scoped>
.notif-wrapper { position: relative; }

.bell-btn {
  position: relative;
  width: 38px; height: 38px;
  border-radius: var(--radius-md);
  background: rgba(47,160,132,0.1);
  border: 1px solid rgba(47,160,132,0.2);
  color: var(--color-dark);
  display: flex; align-items: center; justify-content: center;
  transition: all var(--transition);
}
.bell-btn:hover { background: rgba(47,160,132,0.2); transform: translateY(-1px); }
.bell-btn--has-alerts { color: var(--color-mid); }

.bell-badge {
  position: absolute; top: -5px; right: -5px;
  min-width: 18px; height: 18px; padding: 0 5px;
  border-radius: var(--radius-full);
  background: #e05c5c; color: white;
  font-size: 0.68rem; font-weight: 700;
  display: flex; align-items: center; justify-content: center;
}

.notif-dropdown {
  position: absolute; top: calc(100% + 10px); right: 0;
  width: 380px; max-width: 92vw;
  background: white; border-radius: var(--radius-lg);
  border: 1px solid rgba(47,160,132,0.2);
  box-shadow: var(--shadow-lg);
  padding: 16px; z-index: 500;
  display: flex; flex-direction: column; gap: 12px;
}

.notif-header {
  display: flex; align-items: center; justify-content: space-between; gap: 8px;
}
.notif-title { font-size: 0.95rem; font-weight: 700; color: var(--color-dark); }
.notif-sub { font-size: 0.74rem; color: var(--color-text-muted); }

.btn-enable-push {
  padding: 5px 10px; border-radius: var(--radius-full);
  background: rgba(255,193,7,0.16); color: #8a6500;
  border: 1px solid rgba(255,193,7,0.35);
  font-size: 0.72rem; font-weight: 700;
}
.push-active-tag {
  font-size: 0.72rem; font-weight: 700; color: var(--color-mid);
  background: rgba(111,207,151,0.15); padding: 4px 8px; border-radius: var(--radius-full);
}

.quick-reminder-form {
  background: #f7fbf9; border: 1px solid rgba(47,160,132,0.18);
  border-radius: var(--radius-md); padding: 10px;
  display: flex; flex-direction: column; gap: 7px;
}
.qr-row { display: flex; gap: 6px; align-items: center; }
.qr-input {
  width: 100%; padding: 7px 9px; border-radius: var(--radius-sm);
  border: 1px solid rgba(47,160,132,0.2); font-size: 0.78rem; outline: none; background: white;
}
.qr-input--sm { font-size: 0.72rem; padding: 6px 7px; }
.btn-qr-add {
  padding: 6px 12px; border-radius: var(--radius-sm);
  background: var(--color-mid); color: white; border: none; font-weight: 700;
}

.notif-list {
  display: flex; flex-direction: column; gap: 8px;
  max-height: 300px; overflow-y: auto;
}
.notif-item {
  display: flex; align-items: center; justify-content: space-between; gap: 10px;
  padding: 10px 12px; border-radius: var(--radius-sm);
  background: #f9fffe; border-left: 3px solid var(--color-mid);
  border-top: 1px solid rgba(47,160,132,0.1);
  border-right: 1px solid rgba(47,160,132,0.1);
  border-bottom: 1px solid rgba(47,160,132,0.1);
}
.notif-item--vencido { border-left-color: #e05c5c; background: #fff9f9; }
.notif-item--proximo { border-left-color: #f39c12; background: #fffdf6; }

.notif-item-main { display: flex; flex-direction: column; gap: 3px; min-width: 0; flex: 1; }
.notif-tags { display: flex; align-items: center; gap: 6px; flex-wrap: wrap; }
.origin-tag {
  padding: 2px 7px; border-radius: var(--radius-full);
  font-size: 0.66rem; font-weight: 700;
  background: rgba(47,160,132,0.12); color: var(--color-dark);
}
.origin--evento { background: rgba(41,128,185,0.12); color: #2980b9; }
.origin--general { background: rgba(142,68,173,0.12); color: #8e44ad; }
.time-tag { font-size: 0.68rem; color: var(--color-text-muted); }
.notif-msg { font-size: 0.8rem; font-weight: 600; color: var(--color-text); }

.notif-item-actions { display: flex; align-items: center; gap: 5px; flex-shrink: 0; }
.btn-wa-notif {
  padding: 4px 8px; border-radius: var(--radius-sm);
  background: #25d366; color: white; font-size: 0.68rem; font-weight: 700;
}
.btn-wa-notif:hover { background: #1da851; color: white; }
.btn-del-notif {
  background: none; border: none; color: #c0392b; font-size: 0.8rem; padding: 2px 4px;
}

.notif-empty {
  text-align: center; padding: 24px 10px;
  font-size: 0.8rem; color: var(--color-text-muted);
}

.pop-enter-active, .pop-leave-active { transition: opacity 0.2s ease, transform 0.2s ease; }
.pop-enter-from, .pop-leave-to { opacity: 0; transform: translateY(-6px); }
</style>
