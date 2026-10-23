import { reactive } from 'vue'
import { supabase } from '../utils/supabase'

// ── Tipos de Proyectos, Seguimiento y Comunidad ────────
export type EstadoProyecto = 'por_ver' | 'en_progreso' | 'en_revision' | 'terminado'

export interface EnlaceProyecto {
  id: string
  titulo: string
  url: string
}

export interface ImagenProyecto {
  id: string
  url: string
  titulo: string
  origen: 'url' | 'archivo'
}

export interface ItemSeguimiento {
  id: string
  texto: string
  completado: boolean
}

export interface RecordatorioProyecto {
  id: string
  mensaje: string
  fecha: string
  hora: string
  telefonoWhatsapp?: string
  notificado?: boolean
}

export interface FeedbackComunidad {
  id: string
  autor: string
  autorEmail?: string
  tipo: 'feedback' | 'nota' | 'idea'
  comentario: string
  createdAt: string
}

export interface EntradaBlog {
  id: string
  titulo: string
  contenido: string
  imagenUrl?: string
  createdAt: string
}

export interface Proyecto {
  id: number
  titulo: string
  marcaOCategoria: string
  descripcion: string
  notas: string
  estado: EstadoProyecto
  enlaces: EnlaceProyecto[]
  imagenes: ImagenProyecto[]
  items: ItemSeguimiento[]
  recordatorios: RecordatorioProyecto[]
  blog: EntradaBlog[]
  esPublico: boolean
  likes: number
  feedback: FeedbackComunidad[]
  autorEmail: string
  createdAt: string
  updatedAt: string
}

// ── Store reactivo ─────────────────────────────────────
export const proyectosStore = reactive<{
  proyectos: Proyecto[]
  loading: boolean
  initialized: boolean
  error: string | null
  _nextId: number
}>({
  proyectos: [],
  loading: false,
  initialized: false,
  error: null,
  _nextId: 1,
})

let initPromise: Promise<void> | null = null

// ── Mappers Supabase <-> App ───────────────────────────
function toProyectoRow(data: Omit<Proyecto, 'id' | 'createdAt' | 'updatedAt'>) {
  return {
    titulo: data.titulo,
    marca_categoria: data.marcaOCategoria,
    descripcion: data.descripcion,
    notas: data.notas,
    estado: data.estado,
    enlaces: data.enlaces,
    imagenes: data.imagenes,
    items: data.items,
    recordatorios: data.recordatorios,
    blog: data.blog,
    es_publico: data.esPublico,
    likes: data.likes,
    feedback: data.feedback,
    autor_email: data.autorEmail,
    updated_at: new Date().toISOString(),
  }
}

function fromProyectoRow(row: any): Proyecto {
  return {
    id: row.id,
    titulo: row.titulo ?? '',
    marcaOCategoria: row.marca_categoria ?? '',
    descripcion: row.descripcion ?? '',
    notas: row.notas ?? '',
    estado: (row.estado as EstadoProyecto) ?? 'por_ver',
    enlaces: Array.isArray(row.enlaces) ? row.enlaces : [],
    imagenes: Array.isArray(row.imagenes) ? row.imagenes : [],
    items: Array.isArray(row.items) ? row.items : [],
    recordatorios: Array.isArray(row.recordatorios) ? row.recordatorios : [],
    blog: Array.isArray(row.blog) ? row.blog : [],
    esPublico: Boolean(row.es_publico),
    likes: Number(row.likes ?? 0),
    feedback: Array.isArray(row.feedback) ? row.feedback : [],
    autorEmail: row.autor_email ?? 'admin@tiramisu.com',
    createdAt: row.created_at ?? new Date().toISOString(),
    updatedAt: row.updated_at ?? row.created_at ?? new Date().toISOString(),
  }
}

// ── localStorage fallback ──────────────────────────────
const LS_KEY = 'tiramisu_proyectos'

function lsLoad(): Proyecto[] {
  try {
    const raw = localStorage.getItem(LS_KEY)
    if (raw) return JSON.parse(raw)
    return []
  } catch {
    return []
  }
}

function lsSave(proyectos: Proyecto[]) {
  try {
    localStorage.setItem(LS_KEY, JSON.stringify(proyectos))
  } catch (e) {
    console.warn('[Storage] No se pudo guardar en localStorage (posible límite de tamaño de imágenes):', e)
  }
}

// ── Inicialización ─────────────────────────────────────
export async function initProyectos(force = false): Promise<void> {
  if (initPromise && !force) return initPromise
  if (proyectosStore.initialized && !force) return

  initPromise = (async () => {
    proyectosStore.loading = true
    proyectosStore.error = null

    const { data, error } = await supabase
      .from('Proyectos')
      .select('*')
      .order('created_at', { ascending: false })

    if (error || !data) {
      console.warn('[Supabase Proyectos] Usando localStorage:', error?.message)
      proyectosStore.proyectos = lsLoad()
    } else {
      proyectosStore.proyectos = data.map(fromProyectoRow)
      lsSave(proyectosStore.proyectos)
    }

    proyectosStore._nextId = proyectosStore.proyectos.reduce((max, p) => Math.max(max, p.id), 0) + 1
    proyectosStore.initialized = true
    proyectosStore.loading = false
    initPromise = null
  })()

  return initPromise
}

// ── Operaciones CRUD ───────────────────────────────────
export type NuevoProyectoInput = Omit<Proyecto, 'id' | 'createdAt' | 'updatedAt' | 'likes' | 'feedback' | 'autorEmail' | 'blog'> & {
  blog?: EntradaBlog[]
}

export async function addProyecto(input: NuevoProyectoInput): Promise<Proyecto> {
  const { data: { session } } = await supabase.auth.getSession()
  const userId = session?.user?.id
  const autorEmail = session?.user?.email || 'admin@tiramisu.com'

  const payload: Omit<Proyecto, 'id' | 'createdAt' | 'updatedAt'> = {
    ...input,
    blog: input.blog ?? [],
    likes: 0,
    feedback: [],
    autorEmail,
  }

  const { data: row, error } = await supabase
    .from('Proyectos')
    .insert([{ ...toProyectoRow(payload), user_id: userId }])
    .select()
    .single()

  const now = new Date().toISOString()
  if (error || !row) {
    console.warn('[Supabase] addProyecto fallback localStorage:', error?.message)
    const nuevo: Proyecto = {
      ...payload,
      id: proyectosStore._nextId++,
      createdAt: now,
      updatedAt: now,
    }
    proyectosStore.proyectos.unshift(nuevo)
    lsSave(proyectosStore.proyectos)
    return nuevo
  }

  const nuevo = fromProyectoRow(row)
  proyectosStore.proyectos.unshift(nuevo)
  proyectosStore._nextId = Math.max(proyectosStore._nextId, nuevo.id + 1)
  lsSave(proyectosStore.proyectos)
  return nuevo
}

export async function updateProyecto(
  id: number,
  changes: Partial<Omit<Proyecto, 'id' | 'createdAt'>>
): Promise<void> {
  const idx = proyectosStore.proyectos.findIndex(p => p.id === id)
  if (idx === -1) return

  const actual = proyectosStore.proyectos[idx]
  const actualizado: Proyecto = {
    ...actual,
    ...changes,
    updatedAt: new Date().toISOString(),
  }

  proyectosStore.proyectos[idx] = actualizado
  lsSave(proyectosStore.proyectos)

  const { error } = await supabase
    .from('Proyectos')
    .update(toProyectoRow(actualizado))
    .eq('id', id)

  if (error) {
    console.warn('[Supabase] updateProyecto fallback localStorage:', error.message)
  }
}

export async function deleteProyecto(id: number): Promise<void> {
  const { error } = await supabase
    .from('Proyectos')
    .delete()
    .eq('id', id)

  if (error) {
    console.warn('[Supabase] deleteProyecto fallback localStorage:', error.message)
  }

  const idx = proyectosStore.proyectos.findIndex(p => p.id === id)
  if (idx !== -1) {
    proyectosStore.proyectos.splice(idx, 1)
    lsSave(proyectosStore.proyectos)
  }
}

export function getProyecto(id: number): Proyecto | undefined {
  return proyectosStore.proyectos.find(p => p.id === id)
}

// ── Acciones rápidas de seguimiento y comunidad ────────
export async function toggleItemSeguimiento(proyectoId: number, itemId: string): Promise<void> {
  const proyecto = getProyecto(proyectoId)
  if (!proyecto) return
  const nuevosItems = proyecto.items.map(item =>
    item.id === itemId ? { ...item, completado: !item.completado } : item
  )
  await updateProyecto(proyectoId, { items: nuevosItems })
}

export async function addFeedbackProyecto(
  proyectoId: number,
  comentario: string,
  tipo: 'feedback' | 'nota' | 'idea' = 'feedback'
): Promise<void> {
  const proyecto = getProyecto(proyectoId)
  if (!proyecto || !comentario.trim()) return

  const { data: { session } } = await supabase.auth.getSession()
  const email = session?.user?.email || 'usuario@tiramisu.com'
  const autor = email.split('@')[0] || 'Usuario'

  const nuevoFeedback: FeedbackComunidad = {
    id: Date.now().toString(36) + Math.random().toString(36).substring(2, 6),
    autor: autor.charAt(0).toUpperCase() + autor.slice(1),
    autorEmail: email,
    tipo,
    comentario: comentario.trim(),
    createdAt: new Date().toISOString(),
  }

  await updateProyecto(proyectoId, {
    feedback: [nuevoFeedback, ...proyecto.feedback],
  })
}

export async function likeProyecto(proyectoId: number): Promise<void> {
  const proyecto = getProyecto(proyectoId)
  if (!proyecto) return
  await updateProyecto(proyectoId, { likes: proyecto.likes + 1 })
}

// ── Blog de avances por proyecto ───────────────────────
export async function addEntradaBlog(
  proyectoId: number,
  data: { titulo: string; contenido: string; imagenUrl?: string }
): Promise<void> {
  const proyecto = getProyecto(proyectoId)
  if (!proyecto || !data.titulo.trim()) return

  const nuevaEntrada: EntradaBlog = {
    id: Date.now().toString(36) + Math.random().toString(36).substring(2, 6),
    titulo: data.titulo.trim(),
    contenido: data.contenido.trim(),
    imagenUrl: data.imagenUrl?.trim() || undefined,
    createdAt: new Date().toISOString(),
  }

  const blogActual = Array.isArray(proyecto.blog) ? proyecto.blog : []
  await updateProyecto(proyectoId, {
    blog: [nuevaEntrada, ...blogActual],
  })
}

export async function deleteEntradaBlog(proyectoId: number, entradaId: string): Promise<void> {
  const proyecto = getProyecto(proyectoId)
  if (!proyecto) return
  const blogActual = Array.isArray(proyecto.blog) ? proyecto.blog : []
  await updateProyecto(proyectoId, {
    blog: blogActual.filter(b => b.id !== entradaId),
  })
}

// ── Máscara de teléfono +504 y helper de WhatsApp ──────
export function formatPhoneHN(value: string): string {
  // Extraer solo dígitos
  let digits = (value || '').replace(/\D/g, '')
  // Si empieza con 504, quitar el prefijo para formatear los 8 dígitos locales
  if (digits.startsWith('504')) {
    digits = digits.slice(3)
  }
  digits = digits.slice(0, 8)
  if (digits.length === 0) return '+504 '
  if (digits.length <= 4) return `+504 ${digits}`
  return `+504 ${digits.slice(0, 4)}-${digits.slice(4)}`
}

export function buildWhatsAppUrl(mensaje: string, telefono?: string): string {
  let digits = (telefono || '').replace(/\D/g, '')
  if (digits === '504') digits = ''
  if (digits.length > 0 && !digits.startsWith('504') && digits.length <= 8) {
    digits = `504${digits}`
  }
  const encoded = encodeURIComponent(mensaje)
  return digits
    ? `https://wa.me/${digits}?text=${encoded}`
    : `https://wa.me/?text=${encoded}`
}
