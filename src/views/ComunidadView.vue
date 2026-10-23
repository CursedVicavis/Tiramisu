<template>
  <div class="page-layout">
    <AppSidebar />

    <main class="main">
      <!-- Topbar compacta estilo red social -->
      <header class="topbar">
        <div class="search-box">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/>
          </svg>
          <input
            v-model="busqueda"
            type="text"
            class="search-input"
            placeholder="Buscar publicaciones en la comunidad..."
          />
        </div>

        <div class="topbar-right">
          <NotificationCenter />
          <RouterLink to="/proyectos" class="btn-primary">
            Mis proyectos
          </RouterLink>
        </div>
      </header>

      <!-- Layout de 2 columnas estilo Facebook / LinkedIn -->
      <div class="social-layout">
        <!-- Columna central: Feed -->
        <div class="feed-column">
          <!-- Caja para compartir proyecto en el feed -->
          <div class="share-post-box">
            <div class="share-post-top">
              <div class="author-avatar">T</div>
              <select v-model="proyectoACompartirId" class="share-select">
                <option :value="0">¿Quieres compartir un proyecto con la comunidad para recibir feedback?</option>
                <option v-for="p in misProyectosPrivados" :key="p.id" :value="p.id">
                  Publicar: {{ p.titulo }} ({{ getEstadoLabel(p.estado) }})
                </option>
              </select>
              <button
                type="button"
                class="btn-publish-now"
                :disabled="!proyectoACompartirId"
                @click="publicarSeleccionado"
              >
                Publicar
              </button>
            </div>

            <!-- Pestañas de filtro compactas -->
            <div class="feed-tabs">
              <button
                type="button"
                class="feed-tab"
                :class="{ 'feed-tab--active': filtro === 'todos' }"
                @click="filtro = 'todos'"
              >
                Todos ({{ proyectosPublicos.length }})
              </button>
              <button
                type="button"
                class="feed-tab"
                :class="{ 'feed-tab--active': filtro === 'en_desarrollo' }"
                @click="filtro = 'en_desarrollo'"
              >
                🔧 Buscando feedback ({{ countEnDesarrollo }})
              </button>
              <button
                type="button"
                class="feed-tab"
                :class="{ 'feed-tab--active': filtro === 'terminados' }"
                @click="filtro = 'terminados'"
              >
                ✓ Terminados ({{ countTerminados }})
              </button>
            </div>
          </div>

          <!-- Publicaciones del Feed -->
          <div v-if="proyectosComunidadFiltrados.length > 0" class="community-feed">
            <article v-for="proy in proyectosComunidadFiltrados" :key="proy.id" class="post-card">
              <!-- Cabecera del post -->
              <div class="post-header">
                <div class="author-info">
                  <div class="author-avatar">{{ getInitial(proy.autorEmail) }}</div>
                  <div>
                    <div class="author-line">
                      <span class="author-name">{{ getAuthorName(proy.autorEmail) }}</span>
                      <span v-if="proy.marcaOCategoria" class="brand-pill">{{ proy.marcaOCategoria }}</span>
                    </div>
                    <span class="author-date">{{ formatShortDate(proy.createdAt) }} · 🌐 Público</span>
                  </div>
                </div>

                <span class="status-pill" :class="`status--${proy.estado}`">
                  {{ proy.estado === 'terminado' ? '✓ Terminado' : '🔧 ' + getEstadoLabel(proy.estado) }}
                </span>
              </div>

              <!-- Cuerpo del post -->
              <div class="post-body">
                <h3 class="post-title">{{ proy.titulo }}</h3>
                <p v-if="proy.descripcion" class="post-desc">{{ proy.descripcion }}</p>

                <div v-if="proy.notas" class="post-notes">
                  <strong>Notas / Qué falta revisar:</strong> {{ proy.notas }}
                </div>

                <!-- Enlaces estilo preview -->
                <div v-if="proy.enlaces.length > 0" class="post-links">
                  <a
                    v-for="link in proy.enlaces"
                    :key="link.id"
                    :href="normalizarUrl(link.url)"
                    target="_blank"
                    rel="noopener noreferrer"
                    class="post-link-chip"
                  >
                    🔗 {{ link.titulo || link.url }} ↗
                  </a>
                </div>
              </div>

              <!-- Imágenes estilo post social -->
              <div v-if="proy.imagenes.length > 0" class="post-media-grid">
                <div
                  v-for="img in proy.imagenes"
                  :key="img.id"
                  class="post-media-item"
                  @click="imagenLightbox = img"
                >
                  <img :src="img.url" :alt="img.titulo || proy.titulo" loading="lazy" />
                </div>
              </div>

              <!-- Contador de reacciones y comentarios -->
              <div class="post-stats-row">
                <span>👍 {{ proy.likes }} apoyo{{ proy.likes !== 1 ? 's' : '' }}</span>
                <span>{{ proy.feedback.length }} comentario{{ proy.feedback.length !== 1 ? 's' : '' }}</span>
              </div>

              <!-- Botones de acción estilo Facebook / LinkedIn -->
              <div class="post-action-buttons">
                <button type="button" class="post-action-btn" @click="likeProyecto(proy.id)">
                  👍 Apoyar
                </button>
                <label :for="`comment-input-${proy.id}`" class="post-action-btn">
                  💬 Dar feedback / nota
                </label>
              </div>

              <!-- Caja de comentarios estilo Facebook -->
              <div class="comments-area">
                <form class="comment-composer" @submit.prevent="enviarFeedback(proy.id)">
                  <select v-model="getDraft(proy.id).tipo" class="comment-type-select">
                    <option value="feedback">💬 Feedback</option>
                    <option value="nota">📝 Nota</option>
                    <option value="idea">💡 Idea</option>
                  </select>
                  <input
                    :id="`comment-input-${proy.id}`"
                    v-model="getDraft(proy.id).texto"
                    type="text"
                    class="comment-input"
                    placeholder="Escribe un comentario o sugerencia..."
                    required
                  />
                  <button type="submit" class="btn-comment-send">Enviar</button>
                </form>

                <!-- Lista de burbujas de comentarios -->
                <div v-if="proy.feedback.length > 0" class="comments-list">
                  <div v-for="fb in proy.feedback" :key="fb.id" class="comment-row">
                    <div class="comment-avatar">{{ fb.autor.charAt(0).toUpperCase() }}</div>
                    <div class="comment-bubble">
                      <div class="comment-bubble-top">
                        <strong class="comment-author">{{ fb.autor }}</strong>
                        <span class="fb-badge" :class="`fb-badge--${fb.tipo}`">
                          {{ fb.tipo === 'idea' ? '💡 Idea' : (fb.tipo === 'nota' ? '📝 Nota' : '💬 Feedback') }}
                        </span>
                        <span class="comment-date">{{ formatShortDate(fb.createdAt) }}</span>
                      </div>
                      <p class="comment-text">{{ fb.comentario }}</p>
                    </div>
                  </div>
                </div>
              </div>
            </article>
          </div>

          <div v-else class="empty-state">
            <p class="empty-title">Aún no hay proyectos en el feed</p>
            <p class="empty-desc">Publica uno de tus proyectos arriba para empezar a recibir comentarios e ideas.</p>
          </div>
        </div>

        <!-- Columna derecha: Panel lateral estilo LinkedIn -->
        <aside class="right-rail">
          <div class="rail-card">
            <h4 class="rail-title">Acerca de la Comunidad</h4>
            <p class="rail-text">
              Comparte tus proyectos terminados o en progreso para recibir retroalimentación constructiva.
            </p>
            <div class="rail-tags">
              <div class="rail-tag-row">
                <span class="fb-badge fb-badge--feedback">💬 Feedback</span>
                <span>Opiniones sobre diseño o código</span>
              </div>
              <div class="rail-tag-row">
                <span class="fb-badge fb-badge--nota">📝 Nota</span>
                <span>Detalles o correcciones puntuales</span>
              </div>
              <div class="rail-tag-row">
                <span class="fb-badge fb-badge--idea">💡 Idea</span>
                <span>Propuestas de mejora o funciones</span>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </main>

    <!-- Lightbox -->
    <Transition name="modal">
      <div v-if="imagenLightbox" class="modal-overlay" @click="imagenLightbox = null">
        <div class="lightbox-card" @click.stop>
          <img :src="imagenLightbox.url" :alt="imagenLightbox.titulo" />
          <div class="lightbox-bar">
            <span>{{ imagenLightbox.titulo || 'Imagen del proyecto' }}</span>
            <button type="button" class="btn-close-lb" @click="imagenLightbox = null">Cerrar</button>
          </div>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { RouterLink } from 'vue-router'
import AppSidebar from '../components/AppSidebar.vue'
import NotificationCenter from '../components/NotificationCenter.vue'
import {
  proyectosStore,
  initProyectos,
  updateProyecto,
  addFeedbackProyecto,
  likeProyecto,
  type EstadoProyecto,
  type ImagenProyecto,
} from '../store/proyectos'

onMounted(() => {
  initProyectos()
})

const filtro = ref<'todos' | 'en_desarrollo' | 'terminados'>('todos')
const busqueda = ref('')
const proyectoACompartirId = ref(0)
const imagenLightbox = ref<ImagenProyecto | null>(null)

const proyectosPublicos = computed(() =>
  proyectosStore.proyectos.filter(p => p.esPublico)
)

const misProyectosPrivados = computed(() =>
  proyectosStore.proyectos.filter(p => !p.esPublico)
)

const countEnDesarrollo = computed(() =>
  proyectosPublicos.value.filter(p => p.estado !== 'terminado').length
)
const countTerminados = computed(() =>
  proyectosPublicos.value.filter(p => p.estado === 'terminado').length
)

const proyectosComunidadFiltrados = computed(() => {
  const q = busqueda.value.trim().toLowerCase()
  return proyectosPublicos.value.filter(p => {
    if (filtro.value === 'en_desarrollo' && p.estado === 'terminado') return false
    if (filtro.value === 'terminados' && p.estado !== 'terminado') return false
    if (!q) return true
    return (
      p.titulo.toLowerCase().includes(q) ||
      p.marcaOCategoria.toLowerCase().includes(q) ||
      p.descripcion.toLowerCase().includes(q) ||
      p.notas.toLowerCase().includes(q)
    )
  })
})

async function publicarSeleccionado() {
  if (!proyectoACompartirId.value) return
  await updateProyecto(proyectoACompartirId.value, { esPublico: true })
  proyectoACompartirId.value = 0
}

const drafts = reactive<Record<number, { tipo: 'feedback' | 'nota' | 'idea'; texto: string }>>({})

function getDraft(id: number) {
  if (!drafts[id]) {
    drafts[id] = { tipo: 'feedback', texto: '' }
  }
  return drafts[id]
}

async function enviarFeedback(proyectoId: number) {
  const draft = getDraft(proyectoId)
  if (!draft.texto.trim()) return
  await addFeedbackProyecto(proyectoId, draft.texto, draft.tipo)
  draft.texto = ''
}

function getEstadoLabel(estado: EstadoProyecto): string {
  switch (estado) {
    case 'por_ver': return 'Por ver / Idea'
    case 'en_progreso': return 'En progreso'
    case 'en_revision': return 'En revisión'
    case 'terminado': return 'Terminado'
  }
}

function getAuthorName(email: string): string {
  const name = (email || 'usuario').split('@')[0] || 'Usuario'
  return name.charAt(0).toUpperCase() + name.slice(1)
}

function getInitial(email: string): string {
  return getAuthorName(email).charAt(0).toUpperCase()
}

function normalizarUrl(url: string): string {
  if (!url) return '#'
  return /^https?:\/\//i.test(url) ? url : `https://${url}`
}

function formatShortDate(iso: string): string {
  if (!iso) return ''
  return new Date(iso).toLocaleDateString('es-HN', { day: '2-digit', month: 'short' })
}
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
.search-box {
  flex: 1; max-width: 440px;
  display: flex; align-items: center; gap: 8px;
  background: #f0f2f5; border-radius: var(--radius-full);
  padding: 6px 14px; color: var(--color-text-muted);
}
.search-input { border: none; outline: none; width: 100%; font-size: 0.8rem; background: transparent; color: var(--color-text); }
.topbar-right { display: flex; align-items: center; gap: 10px; }

.btn-primary {
  padding: 6px 14px;
  background: var(--color-mid); color: white;
  border-radius: var(--radius-full);
  font-size: 0.78rem; font-weight: 600; text-decoration: none;
}
.btn-primary:hover { background: var(--color-dark); color: white; }

/* Layout de 2 columnas estilo Facebook / LinkedIn */
.social-layout {
  max-width: 960px; width: 100%; margin: 0 auto;
  padding: 16px 20px;
  display: grid;
  grid-template-columns: minmax(0, 600px) 280px;
  gap: 18px;
  justify-content: center;
  align-items: start;
}

.feed-column { display: flex; flex-direction: column; gap: 12px; }

/* Caja superior para compartir */
.share-post-box {
  background: white; border: 1px solid var(--color-border);
  border-radius: var(--radius-md); padding: 12px 14px;
  box-shadow: var(--shadow-sm);
  display: flex; flex-direction: column; gap: 10px;
}
.share-post-top { display: flex; align-items: center; gap: 8px; }
.share-select {
  flex: 1; padding: 7px 12px; border-radius: var(--radius-full);
  border: 1px solid transparent; background: #f0f2f5;
  font-size: 0.78rem; color: var(--color-text-muted); outline: none;
}
.btn-publish-now {
  padding: 6px 14px; border-radius: var(--radius-full);
  background: var(--color-mid); color: white; border: none;
  font-size: 0.76rem; font-weight: 600;
}
.btn-publish-now:disabled { opacity: 0.5; cursor: not-allowed; }

.feed-tabs {
  display: flex; gap: 6px; padding-top: 8px;
  border-top: 1px solid rgba(0,0,0,0.06);
}
.feed-tab {
  padding: 4px 10px; border-radius: var(--radius-full);
  background: transparent; border: none;
  color: var(--color-text-muted); font-size: 0.75rem; font-weight: 600;
}
.feed-tab:hover { background: #f0f2f5; }
.feed-tab--active { background: rgba(47,160,132,0.12); color: var(--color-dark); }

/* Post Cards */
.community-feed { display: flex; flex-direction: column; gap: 12px; }

.post-card {
  background: white; border: 1px solid var(--color-border);
  border-radius: var(--radius-md); box-shadow: var(--shadow-sm);
  overflow: hidden;
  display: flex; flex-direction: column;
}

.post-header {
  display: flex; align-items: center; justify-content: space-between;
  padding: 12px 14px 8px; gap: 8px;
}
.author-info { display: flex; align-items: center; gap: 9px; }
.author-avatar {
  width: 34px; height: 34px; border-radius: 50%;
  background: linear-gradient(135deg, #2FA084, #1F6F5F);
  color: white; font-size: 0.8rem; font-weight: 700;
  display: flex; align-items: center; justify-content: center; flex-shrink: 0;
}
.author-line { display: flex; align-items: center; gap: 6px; }
.author-name { font-size: 0.82rem; font-weight: 700; color: var(--color-text); }
.author-date { font-size: 0.7rem; color: var(--color-text-muted); }

.brand-pill {
  padding: 1px 7px; border-radius: var(--radius-full);
  background: #f0f2f5; color: var(--color-text-muted);
  font-size: 0.66rem; font-weight: 600;
}
.status-pill {
  padding: 3px 9px; border-radius: var(--radius-full);
  font-size: 0.68rem; font-weight: 600;
}
.status--terminado { background: rgba(47,160,132,0.12); color: #1F6F5F; }
.status--por_ver, .status--en_progreso, .status--en_revision {
  background: rgba(255,193,7,0.14); color: #9c6d00;
}

.post-body { padding: 4px 14px 10px; display: flex; flex-direction: column; gap: 6px; }
.post-title { font-size: 0.94rem; font-weight: 700; color: var(--color-text); }
.post-desc { font-size: 0.82rem; color: var(--color-text); line-height: 1.42; }
.post-notes {
  background: #f7f8fa; border-left: 3px solid var(--color-mid);
  padding: 6px 10px; border-radius: 0 var(--radius-sm) var(--radius-sm) 0;
  font-size: 0.78rem; color: var(--color-text-muted);
}

.post-links { display: flex; gap: 6px; flex-wrap: wrap; margin-top: 2px; }
.post-link-chip {
  padding: 4px 10px; border-radius: var(--radius-full);
  background: #f0faf6; border: 1px solid rgba(47,160,132,0.22);
  color: var(--color-dark); font-size: 0.74rem; font-weight: 600;
}
.post-link-chip:hover { background: var(--color-mid); color: white; }

/* Media en el post */
.post-media-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 2px; background: #e4e6eb;
  border-top: 1px solid rgba(0,0,0,0.05);
  border-bottom: 1px solid rgba(0,0,0,0.05);
}
.post-media-item {
  max-height: 280px; overflow: hidden; cursor: pointer;
}
.post-media-item img {
  width: 100%; height: 100%; object-fit: cover; display: block;
}

.post-stats-row {
  display: flex; justify-content: space-between;
  padding: 7px 14px; font-size: 0.74rem; color: var(--color-text-muted);
  border-bottom: 1px solid rgba(0,0,0,0.06);
}

.post-action-buttons {
  display: grid; grid-template-columns: 1fr 1fr;
  padding: 3px 6px; border-bottom: 1px solid rgba(0,0,0,0.06);
}
.post-action-btn {
  padding: 6px; border-radius: var(--radius-sm);
  background: transparent; border: none;
  color: var(--color-text-muted); font-size: 0.78rem; font-weight: 600;
  text-align: center; cursor: pointer;
}
.post-action-btn:hover { background: #f0f2f5; color: var(--color-text); }

/* Comentarios estilo Facebook */
.comments-area { padding: 10px 14px 12px; display: flex; flex-direction: column; gap: 8px; }
.comment-composer { display: flex; gap: 6px; align-items: center; }
.comment-type-select {
  padding: 5px 8px; border-radius: var(--radius-full);
  border: 1px solid var(--color-border); background: #f0f2f5;
  font-size: 0.72rem; font-weight: 600; color: var(--color-text); outline: none;
}
.comment-input {
  flex: 1; padding: 6px 12px; border-radius: var(--radius-full);
  border: 1px solid transparent; background: #f0f2f5;
  font-size: 0.78rem; outline: none;
}
.comment-input:focus { background: white; border-color: var(--color-mid); }
.btn-comment-send {
  padding: 5px 12px; border-radius: var(--radius-full);
  background: var(--color-mid); color: white; border: none;
  font-size: 0.74rem; font-weight: 600;
}

.comments-list { display: flex; flex-direction: column; gap: 6px; }
.comment-row { display: flex; align-items: flex-start; gap: 7px; }
.comment-avatar {
  width: 26px; height: 26px; border-radius: 50%;
  background: #e4e6eb; color: var(--color-text);
  font-size: 0.7rem; font-weight: 700;
  display: flex; align-items: center; justify-content: center; flex-shrink: 0; margin-top: 2px;
}
.comment-bubble {
  background: #f0f2f5; border-radius: 14px;
  padding: 7px 11px; flex: 1;
}
.comment-bubble-top { display: flex; align-items: center; gap: 6px; margin-bottom: 2px; }
.comment-author { font-size: 0.75rem; color: var(--color-text); }
.comment-date { font-size: 0.66rem; color: var(--color-text-muted); margin-left: auto; }
.comment-text { font-size: 0.78rem; color: var(--color-text); line-height: 1.35; }

.fb-badge {
  padding: 1px 6px; border-radius: var(--radius-full);
  font-size: 0.64rem; font-weight: 700;
}
.fb-badge--feedback { background: rgba(47,160,132,0.14); color: var(--color-dark); }
.fb-badge--nota { background: rgba(41,128,185,0.14); color: #2980b9; }
.fb-badge--idea { background: rgba(255,193,7,0.2); color: #9c6d00; }

/* Right Rail */
.right-rail { position: sticky; top: 68px; }
.rail-card {
  background: white; border: 1px solid var(--color-border);
  border-radius: var(--radius-md); padding: 14px;
  box-shadow: var(--shadow-sm);
  display: flex; flex-direction: column; gap: 10px;
}
.rail-title { font-size: 0.82rem; font-weight: 700; color: var(--color-text); }
.rail-text { font-size: 0.75rem; color: var(--color-text-muted); line-height: 1.4; }
.rail-tags { display: flex; flex-direction: column; gap: 6px; font-size: 0.72rem; color: var(--color-text-muted); }
.rail-tag-row { display: flex; align-items: center; gap: 6px; }

.empty-state {
  background: white; border: 1px solid var(--color-border);
  border-radius: var(--radius-md); padding: 40px 20px; text-align: center;
}
.empty-title { font-size: 0.88rem; font-weight: 700; color: var(--color-text); }
.empty-desc { font-size: 0.76rem; color: var(--color-text-muted); margin-top: 4px; }

.modal-overlay {
  position: fixed; inset: 0; background: rgba(0,0,0,0.6);
  display: flex; align-items: center; justify-content: center;
  z-index: 1000; padding: 20px;
}
.lightbox-card {
  background: white; border-radius: var(--radius-md); padding: 12px;
  max-width: 85vw; max-height: 88vh; display: flex; flex-direction: column; gap: 8px;
}
.lightbox-card img { max-width: 80vw; max-height: 75vh; object-fit: contain; border-radius: var(--radius-sm); }
.lightbox-bar { display: flex; justify-content: space-between; align-items: center; font-size: 0.78rem; font-weight: 600; }
.btn-close-lb { padding: 4px 12px; border-radius: var(--radius-sm); border: 1px solid var(--color-border); background: white; font-size: 0.76rem; }

@media (max-width: 900px) {
  .social-layout { grid-template-columns: 1fr; }
  .right-rail { display: none; }
}
@media (max-width: 768px) {
  .main { margin-left: 190px; }
}
</style>
