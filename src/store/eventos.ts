import { reactive } from 'vue'
import { supabase } from '../utils/supabase'

// ── Tipos ──────────────────────────────────────────────
export interface Recordatorio {
  id: string; // Generado localmente para keys en Vue
  fecha: string;
  hora: string;
  repetirPorDia: boolean;
  repetirPorHora: boolean;
}

export interface Tarea {
  id: number
  nombre: string
  detalle: string
  recordatorios: Recordatorio[]
  completada: boolean
}

export interface Evento {
  id: number
  evento: string
  descripcion: string
  fechaInicio: string
  fechaEstimada: string
  fechaFinalizacion: string
  tareas: Tarea[]
  createdAt: string
}

// ── Store reactivo ─────────────────────────────────────
export const eventosStore = reactive<{
  eventos: Evento[]
  loading: boolean
  initialized: boolean
  error: string | null
  _nextId: number
}>({
  eventos: [],
  loading: false,
  initialized: false,
  error: null,
  _nextId: 1,
})

let initPromise: Promise<void> | null = null

// ── Mappers ────────────────────────────────────────────
function toEventoRow(data: Omit<Evento, 'id' | 'createdAt' | 'tareas'>) {
  return {
    evento: data.evento,
    descripcion: data.descripcion,
    fecha_inicio: data.fechaInicio,
    fecha_estimada_finalizacion: data.fechaEstimada,
    fecha_finalizacion: data.fechaFinalizacion || null,
  }
}

function fromEventoRow(row: any): Evento {
  const tareasDb = row.Eventos_Detalles || []
  return {
    id: row.id,
    evento: row.evento ?? '',
    descripcion: row.descripcion ?? '',
    fechaInicio: row.fecha_inicio ?? '',
    fechaEstimada: row.fecha_estimada_finalizacion ?? '',
    fechaFinalizacion: row.fecha_finalizacion ?? '',
    tareas: tareasDb.map(fromTareaRow),
    createdAt: row.created_at ?? new Date().toISOString(),
  }
}

function toTareaRow(tarea: Tarea, idEvento: number) {
  return {
    nombre: tarea.nombre,
    detalle: tarea.detalle,
    recordatorios: tarea.recordatorios,
    completada: tarea.completada,
    id_evento: idEvento,
  }
}

function fromTareaRow(row: any): Tarea {
  return {
    id: row.id,
    nombre: row.nombre ?? '',
    detalle: row.detalle ?? '',
    recordatorios: Array.isArray(row.recordatorios) ? row.recordatorios : [],
    completada: row.completada ?? false,
  }
}

// ── localStorage fallback ──────────────────────────────
const LS_KEY = 'tiramisu_eventos'

function lsLoad(): Evento[] {
  try {
    const raw = localStorage.getItem(LS_KEY)
    if (raw) return JSON.parse(raw)
    return []
  } catch {
    return []
  }
}

function lsSave(eventos: Evento[]) {
  localStorage.setItem(LS_KEY, JSON.stringify(eventos))
}

// ── Init ───────────────────────────────────────────────
export async function initEventos(force = false): Promise<void> {
  if (initPromise && !force) return initPromise
  if (eventosStore.initialized && !force) return

  initPromise = (async () => {
    eventosStore.loading = true
    eventosStore.error = null

    // Supabase join
    const { data, error } = await supabase
      .from('Eventos')
      .select('*, Eventos_Detalles(*)')
      .order('created_at', { ascending: false })

    if (error || !data) {
      console.warn('[Supabase] Fallback a localStorage:', error?.message)
      eventosStore.eventos = lsLoad()
    } else {
      eventosStore.eventos = data.map(fromEventoRow)
      lsSave(eventosStore.eventos)
    }

    eventosStore._nextId = eventosStore.eventos.reduce((max, e) => Math.max(max, e.id), 0) + 1
    eventosStore.initialized = true
    eventosStore.loading = false
    initPromise = null
  })()

  return initPromise
}

// ── CRUD ───────────────────────────────────────────────

export async function addEvento(data: Omit<Evento, 'id' | 'createdAt'>): Promise<Evento | null> {
  const { data: { session } } = await supabase.auth.getSession()
  const userId = session?.user?.id

  // Insertar Evento
  const { data: rows, error } = await supabase
    .from('Eventos')
    .insert([{ ...toEventoRow(data), user_id: userId }])
    .select()
    .single()

  if (error || !rows) {
    console.warn('[Supabase] addEvento falló, usando localStorage:', error?.message)
    const nuevo: Evento = { ...data, id: eventosStore._nextId++, createdAt: new Date().toISOString() }
    eventosStore.eventos.unshift(nuevo)
    lsSave(eventosStore.eventos)
    return nuevo
  }

  const newEventoId = rows.id

  // Insertar Tareas (Eventos_Detalles) si hay
  let tareasInsertadas: any[] = []
  if (data.tareas.length > 0) {
    const tareasRows = data.tareas.map(t => toTareaRow(t, newEventoId))
    const { data: tareasData, error: tError } = await supabase
      .from('Eventos_Detalles')
      .insert(tareasRows)
      .select()
    
    if (!tError && tareasData) {
      tareasInsertadas = tareasData
    } else {
      console.warn('[Supabase] Error al insertar detalles:', tError?.message)
    }
  }

  // Combinar
  const fullRow = { ...rows, Eventos_Detalles: tareasInsertadas }
  const nuevo = fromEventoRow(fullRow)
  
  eventosStore.eventos.unshift(nuevo)
  eventosStore._nextId = Math.max(eventosStore._nextId, nuevo.id + 1)
  lsSave(eventosStore.eventos)
  return nuevo
}

export async function updateEvento(id: number, data: Omit<Evento, 'id' | 'createdAt'>): Promise<void> {
  // 1. Actualizar Evento
  const { error } = await supabase
    .from('Eventos')
    .update(toEventoRow(data))
    .eq('id', id)

  if (error) {
    console.warn('[Supabase] updateEvento falló, usando localStorage:', error.message)
  }

  // 2. Sincronizar Tareas (Eventos_Detalles)
  // Borramos todas las tareas de este evento y reinsertamos (simplificación)
  await supabase.from('Eventos_Detalles').delete().eq('id_evento', id)

  if (data.tareas.length > 0) {
    const tareasRows = data.tareas.map(t => toTareaRow(t, id))
    await supabase.from('Eventos_Detalles').insert(tareasRows)
  }

  // Actualizar store local de todas formas
  const idx = eventosStore.eventos.findIndex(e => e.id === id)
  if (idx !== -1) {
    eventosStore.eventos[idx] = { ...eventosStore.eventos[idx], ...data }
    lsSave(eventosStore.eventos)
  }
}

export async function deleteEvento(id: number): Promise<void> {
  // Si no está configurado ON DELETE CASCADE, borramos detalles primero:
  await supabase.from('Eventos_Detalles').delete().eq('id_evento', id)

  const { error } = await supabase
    .from('Eventos')
    .delete()
    .eq('id', id)

  if (error) {
    console.warn('[Supabase] deleteEvento falló, usando localStorage:', error.message)
  }

  const idx = eventosStore.eventos.findIndex(e => e.id === id)
  if (idx !== -1) {
    eventosStore.eventos.splice(idx, 1)
    lsSave(eventosStore.eventos)
  }
}

export function getEvento(id: number): Evento | undefined {
  return eventosStore.eventos.find(e => e.id === id)
}
