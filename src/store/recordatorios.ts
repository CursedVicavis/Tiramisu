import { reactive, computed } from 'vue'
import { proyectosStore, buildWhatsAppUrl } from './proyectos'
import { eventosStore } from './eventos'

export interface RecordatorioGeneral {
  id: string
  titulo: string
  fecha: string
  hora: string
  telefonoWhatsapp?: string
  completado: boolean
}

export interface AlertaUnificada {
  id: string
  origen: 'proyecto' | 'evento' | 'general'
  contexto: string
  mensaje: string
  fecha: string
  hora: string
  telefonoWhatsapp?: string
  estadoTiempo: 'vencido' | 'proximo' | 'programado'
  diffMinutos: number
}

const LS_KEY = 'tiramisu_recordatorios_generales'
const LS_NOTIFIED_KEY = 'tiramisu_notificados_ids'

function loadGenerales(): RecordatorioGeneral[] {
  try {
    const raw = localStorage.getItem(LS_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

function saveGenerales(items: RecordatorioGeneral[]) {
  localStorage.setItem(LS_KEY, JSON.stringify(items))
}

function loadNotified(): Set<string> {
  try {
    const raw = localStorage.getItem(LS_NOTIFIED_KEY)
    return new Set(raw ? JSON.parse(raw) : [])
  } catch {
    return new Set()
  }
}

function saveNotified(set: Set<string>) {
  localStorage.setItem(LS_NOTIFIED_KEY, JSON.stringify([...set]))
}

export const recordatoriosStore = reactive<{
  generales: RecordatorioGeneral[]
  permisoNavegador: NotificationPermission
}>({
  generales: loadGenerales(),
  permisoNavegador: typeof Notification !== 'undefined' ? Notification.permission : 'default',
})

export function addRecordatorioGeneral(data: Omit<RecordatorioGeneral, 'id' | 'completado'>) {
  const nuevo: RecordatorioGeneral = {
    ...data,
    id: Date.now().toString(36) + Math.random().toString(36).substring(2, 6),
    completado: false,
  }
  recordatoriosStore.generales.unshift(nuevo)
  saveGenerales(recordatoriosStore.generales)
}

export function deleteRecordatorioGeneral(id: string) {
  recordatoriosStore.generales = recordatoriosStore.generales.filter(r => r.id !== id)
  saveGenerales(recordatoriosStore.generales)
}

function calcularEstadoTiempo(fecha: string, hora: string): {
  estadoTiempo: 'vencido' | 'proximo' | 'programado'
  diffMinutos: number
} {
  if (!fecha) return { estadoTiempo: 'programado', diffMinutos: 999999 }
  const target = new Date(`${fecha}T${hora || '09:00'}:00`).getTime()
  const diffMin = Math.round((target - Date.now()) / 60000)
  if (diffMin < 0) return { estadoTiempo: 'vencido', diffMinutos: diffMin }
  if (diffMin <= 180) return { estadoTiempo: 'proximo', diffMinutos: diffMin }
  return { estadoTiempo: 'programado', diffMinutos: diffMin }
}

export const alertasUnificadas = computed<AlertaUnificada[]>(() => {
  const lista: AlertaUnificada[] = []

  // 1. De Proyectos
  for (const proy of proyectosStore.proyectos) {
    if (proy.estado === 'terminado') continue
    for (const rec of proy.recordatorios) {
      if (!rec.fecha && !rec.mensaje) continue
      const { estadoTiempo, diffMinutos } = calcularEstadoTiempo(rec.fecha, rec.hora)
      lista.push({
        id: `proy-${proy.id}-${rec.id}`,
        origen: 'proyecto',
        contexto: proy.titulo,
        mensaje: rec.mensaje || `Revisar proyecto ${proy.titulo}`,
        fecha: rec.fecha,
        hora: rec.hora || '09:00',
        telefonoWhatsapp: rec.telefonoWhatsapp,
        estadoTiempo,
        diffMinutos,
      })
    }
  }

  // 2. De Eventos
  for (const ev of eventosStore.eventos) {
    for (const tarea of ev.tareas) {
      if (tarea.completada) continue
      for (const rec of tarea.recordatorios) {
        if (!rec.fecha) continue
        const { estadoTiempo, diffMinutos } = calcularEstadoTiempo(rec.fecha, rec.hora)
        lista.push({
          id: `ev-${ev.id}-${tarea.id}-${rec.id}`,
          origen: 'evento',
          contexto: ev.evento,
          mensaje: tarea.nombre || 'Tarea de evento',
          fecha: rec.fecha,
          hora: rec.hora || '09:00',
          estadoTiempo,
          diffMinutos,
        })
      }
    }
  }

  // 3. Generales / Sueltos
  for (const gen of recordatoriosStore.generales) {
    if (gen.completado) continue
    const { estadoTiempo, diffMinutos } = calcularEstadoTiempo(gen.fecha, gen.hora)
    lista.push({
      id: `gen-${gen.id}`,
      origen: 'general',
      contexto: 'Recordatorio general',
      mensaje: gen.titulo,
      fecha: gen.fecha,
      hora: gen.hora || '09:00',
      telefonoWhatsapp: gen.telefonoWhatsapp,
      estadoTiempo,
      diffMinutos,
    })
  }

  return lista.sort((a, b) => a.diffMinutos - b.diffMinutos)
})

export async function solicitarPermisoNotificaciones(): Promise<void> {
  if (typeof Notification === 'undefined') return
  const result = await Notification.requestPermission()
  recordatoriosStore.permisoNavegador = result
}

let watcherInterval: number | null = null

export function startReminderWatcher(): void {
  if (watcherInterval !== null || typeof window === 'undefined') return

  const checkReminders = () => {
    if (typeof Notification === 'undefined' || Notification.permission !== 'granted') return
    const notified = loadNotified()
    let changed = false

    for (const alerta of alertasUnificadas.value) {
      // Dispara notificación cuando llega la hora (entre -30 min y +1 min) y no se ha notificado aún
      if (alerta.diffMinutos <= 1 && alerta.diffMinutos >= -30 && !notified.has(alerta.id)) {
        new Notification(`Tiramisu · ${alerta.contexto}`, {
          body: `${alerta.mensaje} (${alerta.hora})`,
          icon: '/logo.svg',
        })
        notified.add(alerta.id)
        changed = true
      }
    }

    if (changed) saveNotified(notified)
  }

  checkReminders()
  watcherInterval = window.setInterval(checkReminders, 30000)
}

export { buildWhatsAppUrl }
