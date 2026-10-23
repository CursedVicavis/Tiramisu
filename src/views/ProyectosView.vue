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
            placeholder="Buscar proyectos, marcas, notas o links..."
          />
        </div>

        <div class="topbar-right">
          <NotificationCenter />
          <button id="btn-nuevo-proyecto" class="btn-primary" @click="abrirModalNuevo">
            + Nuevo proyecto
          </button>
        </div>
      </header>

      <div class="content-area">
        <!-- Loading -->
        <div v-if="proyectosStore.loading" class="loading-state">
          <div class="loading-spinner"></div>
          <p>Cargando proyectos...</p>
        </div>

        <template v-else>
          <!-- Caja estilo Facebook / LinkedIn para crear proyecto/idea + resumen compacto -->
          <div class="social-composer-card">
            <div class="composer-top">
              <div class="composer-avatar">T</div>
              <button type="button" class="composer-trigger" @click="abrirModalNuevo">
                ¿Qué proyecto, página web o idea quieres empezar a seguir hoy?
              </button>
            </div>
            <div class="composer-bottom">
              <div class="composer-shortcuts">
                <button type="button" class="shortcut-btn" @click="abrirModalNuevo">🖼️ Imagen</button>
                <button type="button" class="shortcut-btn" @click="abrirModalNuevo">🔗 URL / Link</button>
                <button type="button" class="shortcut-btn" @click="abrirModalNuevo">🔔 Recordatorio</button>
              </div>
              <div class="mini-counters">
                <span><strong>{{ countPorVer }}</strong> por ver</span>
                <span>·</span>
                <span><strong>{{ countEnProgreso }}</strong> en curso</span>
                <span>·</span>
                <span><strong>{{ countTerminados }}</strong> listos</span>
              </div>
            </div>
          </div>

          <!-- Filtros compactos -->
          <div class="filters-bar">
            <div class="filter-tabs">
              <button
                v-for="tab in tabsEstado"
                :key="tab.value"
                type="button"
                class="filter-tab"
                :class="{ 'filter-tab--active': filtroEstado === tab.value }"
                @click="filtroEstado = tab.value"
              >
                {{ tab.label }}
                <span class="tab-count">{{ getCountByTab(tab.value) }}</span>
              </button>
            </div>
          </div>

          <!-- Grid de Proyectos -->
          <TransitionGroup v-if="proyectosFiltrados.length > 0" name="list" tag="div" class="projects-grid">
            <article v-for="proy in proyectosFiltrados" :key="proy.id" class="project-card">
              <!-- Cabecera -->
              <div class="project-header">
                <div class="project-title-group">
                  <div class="project-badges">
                    <span v-if="proy.marcaOCategoria" class="brand-pill">{{ proy.marcaOCategoria }}</span>
                    <span class="status-pill" :class="`status--${proy.estado}`">
                      {{ getEstadoLabel(proy.estado) }}
                    </span>
                    <span v-if="proy.esPublico" class="community-pill" title="Visible en la Comunidad">
                      Comunidad
                    </span>
                  </div>
                  <h3 class="project-title">{{ proy.titulo }}</h3>
                  <p v-if="proy.descripcion" class="project-desc">{{ proy.descripcion }}</p>
                </div>

                <div class="project-actions">
                  <select
                    class="status-select"
                    :value="proy.estado"
                    @change="onEstadoChange(proy.id, ($event.target as HTMLSelectElement).value)"
                    title="Cambiar estado de seguimiento"
                  >
                    <option value="por_ver">Por ver / Idea</option>
                    <option value="en_progreso">En progreso</option>
                    <option value="en_revision">En revisión</option>
                    <option value="terminado">Terminado</option>
                  </select>

                  <button
                    type="button"
                    class="icon-btn icon-btn--whatsapp"
                    @click="compartirProyectoWhatsApp(proy)"
                    title="Enviar resumen por WhatsApp"
                  >
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/>
                    </svg>
                  </button>

                  <button
                    type="button"
                    class="icon-btn icon-btn--edit"
                    @click="abrirModalEditar(proy)"
                    title="Editar proyecto"
                  >
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                    </svg>
                  </button>

                  <button
                    type="button"
                    class="icon-btn icon-btn--delete"
                    @click="confirmarEliminar(proy.id)"
                    title="Eliminar proyecto"
                  >
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <path d="M3 6h18"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"/>
                      <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                    </svg>
                  </button>
                </div>
              </div>

              <!-- Galería de imágenes del proyecto -->
              <div v-if="proy.imagenes.length > 0" class="project-gallery">
                <div
                  v-for="img in proy.imagenes"
                  :key="img.id"
                  class="gallery-thumb"
                  @click="imagenLightbox = img"
                >
                  <img :src="img.url" :alt="img.titulo || proy.titulo" loading="lazy" />
                  <span v-if="img.titulo" class="gallery-caption">{{ img.titulo }}</span>
                </div>
              </div>

              <!-- Enlaces / URLs de seguimiento -->
              <div v-if="proy.enlaces.length > 0" class="project-links">
                <a
                  v-for="link in proy.enlaces"
                  :key="link.id"
                  :href="normalizarUrl(link.url)"
                  target="_blank"
                  rel="noopener noreferrer"
                  class="link-chip"
                >
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/>
                    <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>
                  </svg>
                  <span>{{ link.titulo || link.url }}</span>
                  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>
                    <polyline points="15 3 21 3 21 9"/><line x1="10" x2="21" y1="14" y2="3"/>
                  </svg>
                </a>
              </div>

              <!-- Notas rápidas / qué falta ver -->
              <div v-if="proy.notas" class="project-notes">
                <div class="notes-label">
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                    <polyline points="14 2 14 8 20 8"/>
                  </svg>
                  Notas de seguimiento
                </div>
                <p class="notes-content">{{ proy.notas }}</p>
              </div>

              <!-- Checklist interactivo de seguimiento -->
              <div v-if="proy.items.length > 0" class="project-checklist">
                <div class="checklist-header">
                  <span>Pendientes de revisión ({{ proy.items.filter(i => i.completado).length }}/{{ proy.items.length }})</span>
                  <span class="checklist-pct">{{ getProgresoItems(proy) }}%</span>
                </div>
                <div class="progress-bar">
                  <div class="progress-fill" :style="{ width: getProgresoItems(proy) + '%' }"></div>
                </div>
                <div class="checklist-items">
                  <button
                    v-for="item in proy.items"
                    :key="item.id"
                    type="button"
                    class="checklist-row"
                    :class="{ 'checklist-row--done': item.completado }"
                    @click="toggleItemSeguimiento(proy.id, item.id)"
                  >
                    <span class="check-box" :class="{ 'check-box--done': item.completado }">
                      <svg v-if="item.completado" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3">
                        <path d="M20 6 9 17l-5-5"/>
                      </svg>
                    </span>
                    <span class="check-text">{{ item.texto }}</span>
                  </button>
                </div>
              </div>

              <!-- Recordatorios del proyecto -->
              <div v-if="proy.recordatorios.length > 0" class="project-reminders">
                <div v-for="rec in proy.recordatorios" :key="rec.id" class="reminder-banner">
                  <div class="reminder-info">
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/>
                      <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/>
                    </svg>
                    <span class="reminder-msg">{{ rec.mensaje || 'Recordatorio de proyecto' }}</span>
                    <span class="reminder-time">{{ formatDate(rec.fecha) }} {{ rec.hora }}</span>
                  </div>
                  <a
                    :href="buildWhatsAppUrl(`📌 *Recordatorio Tiramisu (${proy.titulo})*: ${rec.mensaje} — Fecha: ${formatDate(rec.fecha)} ${rec.hora}`, rec.telefonoWhatsapp)"
                    target="_blank"
                    rel="noopener noreferrer"
                    class="btn-wa-mini"
                    title="Enviar este recordatorio por WhatsApp"
                  >
                    WhatsApp
                  </a>
                </div>
              </div>

              <!-- Footer de tarjeta -->
              <div class="project-footer">
                <span class="updated-label">Actualizado: {{ formatShortDate(proy.updatedAt) }}</span>
                <div class="footer-btns">
                  <button
                    type="button"
                    class="btn-blog"
                    @click="abrirBlog(proy)"
                  >
                    📖 Blog de avances ({{ (proy.blog || []).length }})
                  </button>
                  <button
                    type="button"
                    class="btn-toggle-public"
                    :class="{ 'btn-toggle-public--active': proy.esPublico }"
                    @click="togglePublicar(proy)"
                  >
                    {{ proy.esPublico ? 'Publicado en Comunidad' : 'Compartir en Comunidad' }}
                  </button>
                </div>
              </div>
            </article>
          </TransitionGroup>

          <!-- Empty State -->
          <div v-else class="empty-state">
            <div class="empty-icon">
              <svg width="72" height="72" viewBox="0 0 72 72" fill="none">
                <circle cx="36" cy="36" r="36" fill="rgba(111,207,151,0.12)"/>
                <rect x="20" y="20" width="32" height="32" rx="6" stroke="#2FA084" stroke-width="2"/>
                <path d="M28 32h16M28 38h10" stroke="#6FCF97" stroke-width="2" stroke-linecap="round"/>
              </svg>
            </div>
            <h3 class="empty-title">No hay proyectos en esta vista</h3>
            <p class="empty-desc">
              Crea un proyecto o tema pendiente por ver (ej. "Página web de marca X") con sus URLs, imágenes, notas y recordatorios.
            </p>
            <button type="button" class="btn-primary" @click="abrirModalNuevo">
              Crear primer proyecto o idea
            </button>
          </div>
        </template>
      </div>
    </main>

    <!-- Modal Crear / Editar Proyecto -->
    <Transition name="modal">
      <div v-if="modalAbierto" class="modal-overlay" @click.self="cerrarModal">
        <div class="modal-dialog">
          <div class="modal-header">
            <div>
              <h3 class="modal-title">{{ editandoId ? 'Editar proyecto / seguimiento' : 'Nuevo proyecto o tema por ver' }}</h3>
              <p class="modal-subtitle">Agrega URLs, imágenes de referencia, checklist y recordatorios</p>
            </div>
            <button type="button" class="btn-close" @click="cerrarModal">✕</button>
          </div>

          <form class="modal-body" @submit.prevent="guardarProyecto">
            <div class="form-grid">
              <div class="field field--full">
                <label class="field-label">Nombre del proyecto o tema <span class="req">*</span></label>
                <input
                  v-model="form.titulo"
                  type="text"
                  class="field-input"
                  placeholder="Ej: Página web de Marca X / Rediseño E-commerce"
                  required
                />
              </div>

              <div class="field">
                <label class="field-label">Marca / Categoría</label>
                <input
                  v-model="form.marcaOCategoria"
                  type="text"
                  class="field-input"
                  placeholder="Ej: Marca X · Desarrollo Web"
                />
              </div>

              <div class="field">
                <label class="field-label">Estado actual</label>
                <select v-model="form.estado" class="field-input">
                  <option value="por_ver">Por ver / Idea pendiente</option>
                  <option value="en_progreso">En progreso</option>
                  <option value="en_revision">En revisión / esperando feedback</option>
                  <option value="terminado">Terminado</option>
                </select>
              </div>

              <div class="field field--full">
                <label class="field-label">Descripción breve</label>
                <input
                  v-model="form.descripcion"
                  type="text"
                  class="field-input"
                  placeholder="Objetivo general del proyecto..."
                />
              </div>

              <div class="field field--full">
                <label class="field-label">Notas de seguimiento / Ideas / Qué falta ver</label>
                <textarea
                  v-model="form.notas"
                  rows="3"
                  class="field-input field-textarea"
                  placeholder="Apunta ideas, detalles técnicos, feedback del cliente o temas que faltan revisar..."
                ></textarea>
              </div>
            </div>

            <!-- Sección URLs -->
            <div class="sub-block">
              <div class="sub-block-header">
                <span class="sub-block-title">🔗 Enlaces y URLs de seguimiento</span>
                <button type="button" class="btn-sub-add" @click="agregarEnlace">+ Añadir URL</button>
              </div>
              <div v-for="link in form.enlaces" :key="link.id" class="inline-row">
                <input v-model="link.titulo" type="text" class="field-input" placeholder="Etiqueta (ej. Figma, Web, Repo)" />
                <input v-model="link.url" type="text" class="field-input" placeholder="https://ejemplo.com" />
                <button type="button" class="btn-row-del" @click="quitarEnlace(link.id)">✕</button>
              </div>
              <p v-if="form.enlaces.length === 0" class="sub-empty">Sin enlaces agregados.</p>
            </div>

            <!-- Sección Imágenes (Archivo desde PC + Link externo) -->
            <div class="sub-block">
              <div class="sub-block-header">
                <span class="sub-block-title">🖼️ Imágenes y capturas de referencia</span>
                <div class="img-actions">
                  <label class="btn-upload">
                    📁 Subir desde mi PC
                    <input type="file" accept="image/*" multiple hidden @change="onSubirArchivos" />
                  </label>
                  <button type="button" class="btn-sub-add" @click="mostrarInputUrlImagen = !mostrarInputUrlImagen">
                    + Pegar link de imagen
                  </button>
                </div>
              </div>

              <div v-if="mostrarInputUrlImagen" class="inline-row">
                <input v-model="nuevaImagenUrl.titulo" type="text" class="field-input" placeholder="Descripción de la imagen" />
                <input v-model="nuevaImagenUrl.url" type="text" class="field-input" placeholder="https://.../captura.png" />
                <button type="button" class="btn-sub-confirm" @click="agregarImagenPorUrl">Añadir</button>
              </div>

              <div v-if="form.imagenes.length > 0" class="modal-thumbs">
                <div v-for="img in form.imagenes" :key="img.id" class="modal-thumb-card">
                  <img :src="img.url" :alt="img.titulo" />
                  <input v-model="img.titulo" type="text" class="thumb-caption-input" placeholder="Nota de imagen..." />
                  <button type="button" class="thumb-del" @click="quitarImagen(img.id)">✕</button>
                </div>
              </div>
              <p v-else class="sub-empty">Puedes subir capturas desde tu dispositivo o pegar links de imágenes.</p>
            </div>

            <!-- Sección Checklist / Puntos por ver -->
            <div class="sub-block">
              <div class="sub-block-header">
                <span class="sub-block-title">✅ Checklist / Puntos pendientes por ver</span>
                <button type="button" class="btn-sub-add" @click="agregarItem">+ Añadir pendiente</button>
              </div>
              <div v-for="item in form.items" :key="item.id" class="inline-row">
                <input type="checkbox" v-model="item.completado" />
                <input v-model="item.texto" type="text" class="field-input" placeholder="Ej: Revisar paleta de colores con la marca" />
                <button type="button" class="btn-row-del" @click="quitarItem(item.id)">✕</button>
              </div>
              <p v-if="form.items.length === 0" class="sub-empty">Sin pendientes registrados.</p>
            </div>

            <!-- Sección Recordatorios del proyecto -->
            <div class="sub-block">
              <div class="sub-block-header">
                <span class="sub-block-title">🔔 Recordatorios (Notificación + WhatsApp)</span>
                <button type="button" class="btn-sub-add" @click="agregarRecordatorio">+ Añadir recordatorio</button>
              </div>
              <div v-for="rec in form.recordatorios" :key="rec.id" class="reminder-edit-card">
                <div class="inline-row">
                  <input v-model="rec.mensaje" type="text" class="field-input" placeholder="¿Qué deseas recordar sobre este proyecto?" />
                  <button type="button" class="btn-row-del" @click="quitarRecordatorio(rec.id)">✕</button>
                </div>
                <div class="inline-row">
                  <input v-model="rec.fecha" type="date" class="field-input" />
                  <input v-model="rec.hora" type="time" class="field-input" />
                  <input
                    :value="rec.telefonoWhatsapp"
                    type="tel"
                    class="field-input"
                    placeholder="+504 9999-9999"
                    maxlength="14"
                    @focus="!rec.telefonoWhatsapp && (rec.telefonoWhatsapp = '+504 ')"
                    @input="rec.telefonoWhatsapp = formatPhoneHN(($event.target as HTMLInputElement).value)"
                  />
                </div>
              </div>
              <p v-if="form.recordatorios.length === 0" class="sub-empty">Sin recordatorios configurados.</p>
            </div>

            <!-- Opción Comunidad -->
            <label class="community-toggle-box">
              <input type="checkbox" v-model="form.esPublico" />
              <div>
                <strong>Compartir este proyecto en la Comunidad Tiramisu</strong>
                <p>Otros usuarios podrán ver tus avances o resultado final y dejarte feedback, notas e ideas.</p>
              </div>
            </label>

            <div class="modal-footer">
              <button type="button" class="btn-cancel" @click="cerrarModal">Cancelar</button>
              <button type="submit" class="btn-primary" :disabled="guardando">
                {{ guardando ? 'Guardando...' : (editandoId ? 'Guardar cambios' : 'Crear proyecto') }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </Transition>

    <!-- Modal Blog de Avances del Proyecto -->
    <Transition name="modal">
      <div v-if="proyectoBlogActivo" class="modal-overlay" @click.self="proyectoBlogActivo = null">
        <div class="modal-dialog">
          <div class="modal-header">
            <div>
              <h3 class="modal-title">📖 Blog de avances · {{ proyectoBlogActivo.titulo }}</h3>
              <p class="modal-subtitle">Documenta paso a paso tus avances, decisiones y bitácora del proyecto</p>
            </div>
            <button type="button" class="btn-close" @click="proyectoBlogActivo = null">✕</button>
          </div>

          <!-- Formulario nueva entrada del blog -->
          <form class="sub-block" @submit.prevent="publicarEntradaBlog">
            <span class="sub-block-title">✍️ Nueva entrada de avance</span>
            <input
              v-model="nuevaEntrada.titulo"
              type="text"
              class="field-input"
              placeholder="Título del avance (ej. Día 1: Estructura y diseño inicial)"
              required
            />
            <textarea
              v-model="nuevaEntrada.contenido"
              rows="3"
              class="field-input field-textarea"
              placeholder="Escribe qué avanzaste hoy, cambios realizados, ideas o siguientes pasos..."
              required
            ></textarea>
            <div class="inline-row">
              <input
                v-model="nuevaEntrada.imagenUrl"
                type="text"
                class="field-input"
                placeholder="URL de imagen opcional o sube desde tu PC 👉"
              />
              <label class="btn-upload">
                📷 Subir foto
                <input type="file" accept="image/*" hidden @change="onSubirImagenBlog" />
              </label>
              <button type="submit" class="btn-primary">Publicar avance</button>
            </div>
          </form>

          <!-- Línea de tiempo de entradas -->
          <div class="blog-timeline">
            <div
              v-for="post in (proyectoBlogActivo.blog || [])"
              :key="post.id"
              class="blog-entry-card"
            >
              <div class="blog-entry-header">
                <div>
                  <h4 class="blog-entry-title">{{ post.titulo }}</h4>
                  <span class="blog-entry-date">{{ formatFullDate(post.createdAt) }}</span>
                </div>
                <button
                  type="button"
                  class="btn-row-del"
                  @click="eliminarPostBlog(proyectoBlogActivo.id, post.id)"
                  title="Eliminar entrada"
                >
                  ✕
                </button>
              </div>
              <p class="blog-entry-content">{{ post.contenido }}</p>
              <img
                v-if="post.imagenUrl"
                :src="post.imagenUrl"
                :alt="post.titulo"
                class="blog-entry-img"
                @click="imagenLightbox = { id: post.id, url: post.imagenUrl, titulo: post.titulo, origen: 'url' }"
              />
            </div>

            <p v-if="!proyectoBlogActivo.blog || proyectoBlogActivo.blog.length === 0" class="sub-empty">
              Aún no hay entradas en el blog de este proyecto. ¡Escribe tu primer avance arriba!
            </p>
          </div>
        </div>
      </div>
    </Transition>

    <!-- Lightbox de imagen -->
    <Transition name="modal">
      <div v-if="imagenLightbox" class="modal-overlay" @click="imagenLightbox = null">
        <div class="lightbox-card" @click.stop>
          <img :src="imagenLightbox.url" :alt="imagenLightbox.titulo" />
          <div class="lightbox-bar">
            <span>{{ imagenLightbox.titulo || 'Vista previa' }}</span>
            <button type="button" class="btn-cancel" @click="imagenLightbox = null">Cerrar</button>
          </div>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import AppSidebar from '../components/AppSidebar.vue'
import NotificationCenter from '../components/NotificationCenter.vue'
import {
  proyectosStore,
  initProyectos,
  addProyecto,
  updateProyecto,
  deleteProyecto,
  toggleItemSeguimiento,
  addEntradaBlog,
  deleteEntradaBlog,
  formatPhoneHN,
  buildWhatsAppUrl,
  type Proyecto,
  type EstadoProyecto,
  type EnlaceProyecto,
  type ImagenProyecto,
  type ItemSeguimiento,
  type RecordatorioProyecto,
} from '../store/proyectos'

const route = useRoute()

onMounted(async () => {
  await initProyectos()
  const qId = Number(route.query.id)
  if (qId) {
    const target = proyectosStore.proyectos.find(p => p.id === qId)
    if (target) {
      busqueda.value = target.titulo
    }
  }
})

// ── Estadísticas y filtros ──
const filtroEstado = ref<'todos' | EstadoProyecto>('todos')
const busqueda = ref('')

const tabsEstado: { label: string; value: 'todos' | EstadoProyecto }[] = [
  { label: 'Todos', value: 'todos' },
  { label: 'Por ver / Ideas', value: 'por_ver' },
  { label: 'En progreso', value: 'en_progreso' },
  { label: 'En revisión', value: 'en_revision' },
  { label: 'Terminados', value: 'terminado' },
]

const countPorVer = computed(() =>
  proyectosStore.proyectos.filter(p => p.estado === 'por_ver').length
)
const countEnProgreso = computed(() =>
  proyectosStore.proyectos.filter(p => p.estado === 'en_progreso' || p.estado === 'en_revision').length
)
const countTerminados = computed(() =>
  proyectosStore.proyectos.filter(p => p.estado === 'terminado').length
)

function getCountByTab(tab: 'todos' | EstadoProyecto): number {
  if (tab === 'todos') return proyectosStore.proyectos.length
  return proyectosStore.proyectos.filter(p => p.estado === tab).length
}

const proyectosFiltrados = computed(() => {
  const q = busqueda.value.trim().toLowerCase()
  return proyectosStore.proyectos.filter(p => {
    const matchEstado = filtroEstado.value === 'todos' || p.estado === filtroEstado.value
    if (!matchEstado) return false
    if (!q) return true
    return (
      p.titulo.toLowerCase().includes(q) ||
      p.marcaOCategoria.toLowerCase().includes(q) ||
      p.descripcion.toLowerCase().includes(q) ||
      p.notas.toLowerCase().includes(q)
    )
  })
})

// ── Helpers visuales ──
function getEstadoLabel(estado: EstadoProyecto): string {
  switch (estado) {
    case 'por_ver': return 'Por ver / Idea'
    case 'en_progreso': return 'En progreso'
    case 'en_revision': return 'En revisión'
    case 'terminado': return 'Terminado'
  }
}

function getProgresoItems(proy: Proyecto): number {
  if (!proy.items.length) return 0
  return Math.round((proy.items.filter(i => i.completado).length / proy.items.length) * 100)
}

function normalizarUrl(url: string): string {
  if (!url) return '#'
  return /^https?:\/\//i.test(url) ? url : `https://${url}`
}

function formatDate(dateStr: string): string {
  if (!dateStr) return ''
  const [y, m, d] = dateStr.split('-')
  return d && m && y ? `${d}/${m}/${y}` : dateStr
}

function formatShortDate(iso: string): string {
  if (!iso) return ''
  return new Date(iso).toLocaleDateString('es-HN', { day: '2-digit', month: 'short' })
}

async function onEstadoChange(id: number, nuevoEstado: string) {
  await updateProyecto(id, { estado: nuevoEstado as EstadoProyecto })
}

async function togglePublicar(proy: Proyecto) {
  await updateProyecto(proy.id, { esPublico: !proy.esPublico })
}

function compartirProyectoWhatsApp(proy: Proyecto) {
  const linksTxt = proy.enlaces.length
    ? `\n🔗 Links: ${proy.enlaces.map(l => l.url).join(' | ')}`
    : ''
  const msg = `🚀 *Proyecto Tiramisu: ${proy.titulo}*\nEstado: ${getEstadoLabel(proy.estado)}${proy.notas ? `\n📝 Notas: ${proy.notas}` : ''}${linksTxt}`
  window.open(buildWhatsAppUrl(msg), '_blank', 'noopener')
}

async function confirmarEliminar(id: number) {
  if (window.confirm('¿Eliminar este proyecto y su seguimiento?')) {
    await deleteProyecto(id)
  }
}

// ── Modal Crear / Editar ──
const modalAbierto = ref(false)
const editandoId = ref<number | null>(null)
const guardando = ref(false)
const mostrarInputUrlImagen = ref(false)
const imagenLightbox = ref<ImagenProyecto | null>(null)

const nuevaImagenUrl = reactive({ titulo: '', url: '' })

const form = reactive<{
  titulo: string
  marcaOCategoria: string
  descripcion: string
  notas: string
  estado: EstadoProyecto
  enlaces: EnlaceProyecto[]
  imagenes: ImagenProyecto[]
  items: ItemSeguimiento[]
  recordatorios: RecordatorioProyecto[]
  esPublico: boolean
}>({
  titulo: '',
  marcaOCategoria: '',
  descripcion: '',
  notas: '',
  estado: 'por_ver',
  enlaces: [],
  imagenes: [],
  items: [],
  recordatorios: [],
  esPublico: false,
})

function resetForm() {
  form.titulo = ''
  form.marcaOCategoria = ''
  form.descripcion = ''
  form.notas = ''
  form.estado = 'por_ver'
  form.enlaces = []
  form.imagenes = []
  form.items = []
  form.recordatorios = []
  form.esPublico = false
  mostrarInputUrlImagen.value = false
  nuevaImagenUrl.titulo = ''
  nuevaImagenUrl.url = ''
}

function abrirModalNuevo() {
  editandoId.value = null
  resetForm()
  modalAbierto.value = true
}

function abrirModalEditar(proy: Proyecto) {
  editandoId.value = proy.id
  form.titulo = proy.titulo
  form.marcaOCategoria = proy.marcaOCategoria
  form.descripcion = proy.descripcion
  form.notas = proy.notas
  form.estado = proy.estado
  form.enlaces = proy.enlaces.map(e => ({ ...e }))
  form.imagenes = proy.imagenes.map(i => ({ ...i }))
  form.items = proy.items.map(i => ({ ...i }))
  form.recordatorios = proy.recordatorios.map(r => ({ ...r }))
  form.esPublico = proy.esPublico
  modalAbierto.value = true
}

function cerrarModal() {
  modalAbierto.value = false
}

function uid(): string {
  return Date.now().toString(36) + Math.random().toString(36).substring(2, 6)
}

function agregarEnlace() {
  form.enlaces.push({ id: uid(), titulo: '', url: '' })
}
function quitarEnlace(id: string) {
  form.enlaces = form.enlaces.filter(e => e.id !== id)
}

function agregarImagenPorUrl() {
  if (!nuevaImagenUrl.url.trim()) return
  form.imagenes.push({
    id: uid(),
    url: nuevaImagenUrl.url.trim(),
    titulo: nuevaImagenUrl.titulo.trim(),
    origen: 'url',
  })
  nuevaImagenUrl.titulo = ''
  nuevaImagenUrl.url = ''
  mostrarInputUrlImagen.value = false
}

function onSubirArchivos(event: Event) {
  const input = event.target as HTMLInputElement
  if (!input.files) return
  Array.from(input.files).forEach(file => {
    const reader = new FileReader()
    reader.onload = () => {
      const img = new Image()
      img.onload = () => {
        const canvas = document.createElement('canvas')
        const maxDim = 900
        let w = img.width
        let h = img.height
        if (w > maxDim || h > maxDim) {
          if (w > h) {
            h = Math.round((h * maxDim) / w)
            w = maxDim
          } else {
            w = Math.round((w * maxDim) / h)
            h = maxDim
          }
        }
        canvas.width = w
        canvas.height = h
        const ctx = canvas.getContext('2d')
        ctx?.drawImage(img, 0, 0, w, h)
        const dataUrl = canvas.toDataURL('image/jpeg', 0.82)
        form.imagenes.push({
          id: uid(),
          url: dataUrl,
          titulo: file.name.replace(/\.[^.]+$/, ''),
          origen: 'archivo',
        })
      }
      img.src = reader.result as string
    }
    reader.readAsDataURL(file)
  })
  input.value = ''
}

function quitarImagen(id: string) {
  form.imagenes = form.imagenes.filter(i => i.id !== id)
}

function agregarItem() {
  form.items.push({ id: uid(), texto: '', completado: false })
}
function quitarItem(id: string) {
  form.items = form.items.filter(i => i.id !== id)
}

function agregarRecordatorio() {
  form.recordatorios.push({
    id: uid(),
    mensaje: '',
    fecha: new Date().toISOString().split('T')[0],
    hora: '09:00',
    telefonoWhatsapp: '+504 ',
  })
}
function quitarRecordatorio(id: string) {
  form.recordatorios = form.recordatorios.filter(r => r.id !== id)
}

// ── Blog por proyecto ──
const proyectoBlogId = ref<number | null>(null)
const proyectoBlogActivo = computed(() =>
  proyectoBlogId.value !== null
    ? proyectosStore.proyectos.find(p => p.id === proyectoBlogId.value) ?? null
    : null
)
const nuevaEntrada = reactive({
  titulo: '',
  contenido: '',
  imagenUrl: '',
})

function abrirBlog(proy: Proyecto) {
  proyectoBlogId.value = proy.id
  nuevaEntrada.titulo = ''
  nuevaEntrada.contenido = ''
  nuevaEntrada.imagenUrl = ''
}

function onSubirImagenBlog(event: Event) {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]
  if (!file) return
  const reader = new FileReader()
  reader.onload = () => {
    const img = new Image()
    img.onload = () => {
      const canvas = document.createElement('canvas')
      const maxDim = 900
      let w = img.width
      let h = img.height
      if (w > maxDim || h > maxDim) {
        if (w > h) {
          h = Math.round((h * maxDim) / w)
          w = maxDim
        } else {
          w = Math.round((w * maxDim) / h)
          h = maxDim
        }
      }
      canvas.width = w
      canvas.height = h
      canvas.getContext('2d')?.drawImage(img, 0, 0, w, h)
      nuevaEntrada.imagenUrl = canvas.toDataURL('image/jpeg', 0.82)
    }
    img.src = reader.result as string
  }
  reader.readAsDataURL(file)
  input.value = ''
}

async function publicarEntradaBlog() {
  if (!proyectoBlogId.value || !nuevaEntrada.titulo.trim()) return
  await addEntradaBlog(proyectoBlogId.value, {
    titulo: nuevaEntrada.titulo,
    contenido: nuevaEntrada.contenido,
    imagenUrl: nuevaEntrada.imagenUrl,
  })
  nuevaEntrada.titulo = ''
  nuevaEntrada.contenido = ''
  nuevaEntrada.imagenUrl = ''
}

async function eliminarPostBlog(proyectoId: number, entradaId: string) {
  await deleteEntradaBlog(proyectoId, entradaId)
}

function formatFullDate(iso: string): string {
  if (!iso) return ''
  return new Date(iso).toLocaleString('es-HN', {
    day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
  })
}

async function guardarProyecto() {
  if (!form.titulo.trim()) return
  guardando.value = true

  const payload = {
    titulo: form.titulo.trim(),
    marcaOCategoria: form.marcaOCategoria.trim(),
    descripcion: form.descripcion.trim(),
    notas: form.notas.trim(),
    estado: form.estado,
    enlaces: form.enlaces.filter(e => e.url.trim()),
    imagenes: [...form.imagenes],
    items: form.items.filter(i => i.texto.trim()),
    recordatorios: form.recordatorios.filter(r => r.mensaje.trim() || r.fecha),
    esPublico: form.esPublico,
  }

  if (editandoId.value !== null) {
    await updateProyecto(editandoId.value, payload)
  } else {
    await addProyecto(payload)
  }

  guardando.value = false
  modalAbierto.value = false
}
</script>

<style scoped>
.page-layout { display: flex; min-height: 100vh; background: var(--color-bg); }
.main { flex: 1; margin-left: 220px; display: flex; flex-direction: column; min-height: 100vh; }

/* Topbar compacta estilo red social */
.topbar {
  height: 52px;
  display: flex; align-items: center; justify-content: space-between; gap: 12px;
  padding: 0 20px; background: rgba(255,255,255,0.95);
  backdrop-filter: blur(8px);
  border-bottom: 1px solid var(--color-border);
  position: sticky; top: 0; z-index: 50;
}
.topbar-right { display: flex; align-items: center; gap: 10px; }

.btn-primary {
  display: inline-flex; align-items: center; gap: 5px;
  padding: 6px 14px;
  background: var(--color-mid);
  color: white; border: none; border-radius: var(--radius-full);
  font-size: 0.78rem; font-weight: 600; cursor: pointer;
  transition: background var(--transition);
}
.btn-primary:hover:not(:disabled) { background: var(--color-dark); }

.content-area { padding: 16px 20px; display: flex; flex-direction: column; gap: 14px; max-width: 1080px; width: 100%; margin: 0 auto; }

/* Loading */
.loading-state { display: flex; flex-direction: column; align-items: center; gap: 10px; padding: 60px 20px; color: var(--color-text-muted); font-size: 0.8rem; }
.loading-spinner { width: 28px; height: 28px; border: 2.5px solid rgba(47,160,132,0.15); border-top-color: var(--color-mid); border-radius: 50%; animation: spin 0.8s linear infinite; }
@keyframes spin { to { transform: rotate(360deg); } }

/* Composer estilo Facebook / LinkedIn */
.social-composer-card {
  background: white;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  padding: 12px 14px;
  box-shadow: var(--shadow-sm);
  display: flex; flex-direction: column; gap: 10px;
}
.composer-top { display: flex; align-items: center; gap: 10px; }
.composer-avatar {
  width: 34px; height: 34px; border-radius: 50%;
  background: linear-gradient(135deg, #2FA084, #1F6F5F);
  color: white; font-size: 0.8rem; font-weight: 700;
  display: flex; align-items: center; justify-content: center; flex-shrink: 0;
}
.composer-trigger {
  flex: 1; text-align: left;
  padding: 8px 14px; border-radius: var(--radius-full);
  background: #f0f2f5; border: 1px solid transparent;
  color: var(--color-text-muted); font-size: 0.8rem;
  transition: background var(--transition);
}
.composer-trigger:hover { background: #e4e6eb; }
.composer-bottom {
  display: flex; align-items: center; justify-content: space-between;
  padding-top: 8px; border-top: 1px solid rgba(0,0,0,0.06);
  flex-wrap: wrap; gap: 8px;
}
.composer-shortcuts { display: flex; gap: 4px; }
.shortcut-btn {
  padding: 5px 10px; border-radius: var(--radius-sm);
  background: transparent; border: none;
  color: var(--color-text-muted); font-size: 0.75rem; font-weight: 600;
}
.shortcut-btn:hover { background: #f0f2f5; color: var(--color-text); }
.mini-counters { display: flex; gap: 6px; font-size: 0.74rem; color: var(--color-text-muted); }
.mini-counters strong { color: var(--color-dark); }

/* Filters bar */
.filters-bar {
  display: flex; align-items: center; justify-content: space-between;
  gap: 10px; flex-wrap: wrap;
}
.filter-tabs { display: flex; gap: 6px; flex-wrap: wrap; }
.filter-tab {
  display: inline-flex; align-items: center; gap: 5px;
  padding: 5px 12px; border-radius: var(--radius-full);
  background: white; border: 1px solid var(--color-border);
  color: var(--color-text-muted); font-size: 0.76rem; font-weight: 600;
  transition: all var(--transition);
}
.filter-tab--active {
  background: var(--color-dark); color: white; border-color: var(--color-dark);
}
.tab-count {
  padding: 0 6px; border-radius: var(--radius-full);
  background: rgba(0,0,0,0.07); font-size: 0.68rem;
}
.filter-tab--active .tab-count { background: rgba(255,255,255,0.2); }

.search-box {
  flex: 1; max-width: 440px;
  display: flex; align-items: center; gap: 8px;
  background: #f0f2f5; border-radius: var(--radius-full);
  padding: 6px 14px; color: var(--color-text-muted);
}
.search-input { border: none; outline: none; width: 100%; font-size: 0.8rem; color: var(--color-text); background: transparent; }

/* Projects Grid */
.projects-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(340px, 1fr)); gap: 14px; }

.project-card {
  background: white; border-radius: var(--radius-md);
  border: 1px solid var(--color-border);
  padding: 14px 16px; box-shadow: var(--shadow-sm);
  display: flex; flex-direction: column; gap: 10px;
  transition: box-shadow var(--transition);
}
.project-card:hover { box-shadow: var(--shadow-md); }

.project-header { display: flex; justify-content: space-between; align-items: flex-start; gap: 10px; }
.project-title-group { display: flex; flex-direction: column; gap: 3px; min-width: 0; flex: 1; }
.project-badges { display: flex; align-items: center; gap: 5px; flex-wrap: wrap; }

.brand-pill {
  padding: 2px 8px; border-radius: var(--radius-full);
  background: #f0f2f5; color: var(--color-text-muted);
  font-size: 0.68rem; font-weight: 600;
}
.status-pill {
  padding: 2px 8px; border-radius: var(--radius-full);
  font-size: 0.68rem; font-weight: 600;
}
.status--por_ver { background: rgba(142,68,173,0.1); color: #8e44ad; }
.status--en_progreso { background: rgba(255,193,7,0.14); color: #9c6d00; }
.status--en_revision { background: rgba(41,128,185,0.1); color: #2980b9; }
.status--terminado { background: rgba(47,160,132,0.12); color: #1F6F5F; }

.community-pill {
  padding: 2px 8px; border-radius: var(--radius-full);
  background: rgba(47,160,132,0.12);
  color: var(--color-dark); font-size: 0.66rem; font-weight: 700;
}

.project-title { font-size: 0.92rem; font-weight: 700; color: var(--color-text); line-height: 1.3; }
.project-desc { font-size: 0.78rem; color: var(--color-text-muted); line-height: 1.38; }

.project-actions { display: flex; align-items: center; gap: 4px; flex-shrink: 0; }
.status-select {
  padding: 4px 6px; border-radius: var(--radius-sm);
  border: 1px solid var(--color-border); font-size: 0.72rem;
  font-weight: 500; color: var(--color-text); background: #f7f8fa; cursor: pointer;
}
.icon-btn {
  width: 26px; height: 26px; border-radius: var(--radius-sm); border: none;
  display: flex; align-items: center; justify-content: center; transition: all var(--transition);
}
.icon-btn--whatsapp { background: rgba(37,211,102,0.12); color: #1da851; }
.icon-btn--whatsapp:hover { background: #25d366; color: white; }
.icon-btn--edit { background: rgba(47,160,132,0.1); color: var(--color-dark); }
.icon-btn--edit:hover { background: rgba(47,160,132,0.2); }
.icon-btn--delete { background: rgba(217,79,79,0.08); color: #c0392b; }
.icon-btn--delete:hover { background: rgba(217,79,79,0.18); }

/* Galería */
.project-gallery {
  display: flex; gap: 10px; overflow-x: auto; padding-bottom: 4px;
}
.gallery-thumb {
  position: relative; width: 120px; height: 82px; border-radius: var(--radius-sm);
  overflow: hidden; flex-shrink: 0; cursor: pointer;
  border: 1px solid rgba(47,160,132,0.2);
}
.gallery-thumb img { width: 100%; height: 100%; object-fit: cover; transition: transform 0.25s ease; }
.gallery-thumb:hover img { transform: scale(1.06); }
.gallery-caption {
  position: absolute; bottom: 0; inset-inline: 0;
  background: rgba(0,0,0,0.6); color: white; font-size: 0.65rem;
  padding: 2px 6px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
}

/* Enlaces */
.project-links { display: flex; gap: 8px; flex-wrap: wrap; }
.link-chip {
  display: inline-flex; align-items: center; gap: 6px;
  padding: 5px 11px; border-radius: var(--radius-full);
  background: #f2fbf8; border: 1px solid rgba(47,160,132,0.25);
  color: var(--color-dark); font-size: 0.76rem; font-weight: 600;
  transition: all var(--transition);
}
.link-chip:hover { background: var(--color-mid); color: white; }

/* Notas */
.project-notes {
  background: rgba(238,238,238,0.45); border-left: 3px solid var(--color-mid);
  padding: 10px 12px; border-radius: 0 var(--radius-sm) var(--radius-sm) 0;
}
.notes-label { display: flex; align-items: center; gap: 5px; font-size: 0.72rem; font-weight: 700; color: var(--color-dark); text-transform: uppercase; margin-bottom: 4px; }
.notes-content { font-size: 0.82rem; color: var(--color-text); white-space: pre-line; line-height: 1.45; }

/* Checklist */
.project-checklist { display: flex; flex-direction: column; gap: 6px; }
.checklist-header { display: flex; justify-content: space-between; font-size: 0.76rem; font-weight: 600; color: var(--color-text-muted); }
.checklist-pct { color: var(--color-mid); font-weight: 700; }
.progress-bar { height: 6px; background: rgba(238,238,238,0.9); border-radius: var(--radius-full); overflow: hidden; }
.progress-fill { height: 100%; background: linear-gradient(90deg, #6FCF97, #2FA084); transition: width 0.3s ease; }
.checklist-items { display: flex; flex-direction: column; gap: 4px; margin-top: 2px; }
.checklist-row {
  display: flex; align-items: center; gap: 8px; padding: 6px 8px;
  background: #f9fffe; border: 1px solid rgba(47,160,132,0.1);
  border-radius: var(--radius-sm); text-align: left;
}
.checklist-row--done { opacity: 0.6; }
.checklist-row--done .check-text { text-decoration: line-through; }
.check-box {
  width: 16px; height: 16px; border-radius: 4px;
  border: 1.5px solid var(--color-mid); display: flex; align-items: center; justify-content: center; flex-shrink: 0;
}
.check-box--done { background: var(--color-mid); color: white; }
.check-text { font-size: 0.8rem; color: var(--color-text); }

/* Recordatorios */
.project-reminders { display: flex; flex-direction: column; gap: 6px; }
.reminder-banner {
  display: flex; align-items: center; justify-content: space-between; gap: 8px;
  padding: 7px 10px; background: rgba(255,193,7,0.1);
  border: 1px solid rgba(255,193,7,0.28); border-radius: var(--radius-sm);
}
.reminder-info { display: flex; align-items: center; gap: 6px; font-size: 0.76rem; color: #7d5a00; min-width: 0; flex-wrap: wrap; }
.reminder-msg { font-weight: 600; }
.reminder-time { opacity: 0.8; }
.btn-wa-mini {
  padding: 3px 9px; border-radius: var(--radius-full);
  background: #25d366; color: white; font-size: 0.7rem; font-weight: 700; flex-shrink: 0;
}
.btn-wa-mini:hover { background: #1da851; color: white; }

/* Footer tarjeta */
.project-footer {
  display: flex; align-items: center; justify-content: space-between;
  padding-top: 10px; border-top: 1px solid rgba(47,160,132,0.1); margin-top: auto;
}
.updated-label { font-size: 0.74rem; color: var(--color-text-muted); }
.footer-btns { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }
.btn-blog {
  padding: 5px 12px; border-radius: var(--radius-full);
  background: rgba(47,160,132,0.12); border: 1px solid rgba(47,160,132,0.3);
  color: var(--color-dark); font-size: 0.74rem; font-weight: 700;
  transition: all var(--transition);
}
.btn-blog:hover { background: var(--color-mid); color: white; }
.btn-toggle-public {
  padding: 5px 12px; border-radius: var(--radius-full);
  border: 1px solid rgba(47,160,132,0.3); background: transparent;
  color: var(--color-dark); font-size: 0.74rem; font-weight: 600;
}
.btn-toggle-public--active {
  background: rgba(111,207,151,0.18); border-color: var(--color-mid); color: var(--color-dark);
}

/* Empty state */
.empty-state { display: flex; flex-direction: column; align-items: center; gap: 12px; padding: 60px 20px; text-align: center; }
.empty-title { font-size: 1.15rem; font-weight: 700; color: var(--color-dark); }
.empty-desc { font-size: 0.875rem; color: var(--color-text-muted); max-width: 420px; }

/* Modal */
.modal-overlay {
  position: fixed; inset: 0; background: rgba(0,0,0,0.45);
  backdrop-filter: blur(4px); display: flex; align-items: center; justify-content: center;
  z-index: 1000; padding: 20px;
}
.modal-dialog {
  background: white; border-radius: var(--radius-lg);
  max-width: 680px; width: 100%; max-height: 90vh; overflow-y: auto;
  box-shadow: 0 24px 60px rgba(0,0,0,0.2); padding: 26px 28px;
  display: flex; flex-direction: column; gap: 18px;
}
.modal-header { display: flex; justify-content: space-between; align-items: flex-start; gap: 12px; }
.modal-title { font-size: 1.15rem; font-weight: 700; color: var(--color-dark); }
.modal-subtitle { font-size: 0.8rem; color: var(--color-text-muted); }
.btn-close { background: none; border: none; font-size: 1.1rem; color: var(--color-text-muted); }

.modal-body { display: flex; flex-direction: column; gap: 16px; }
.form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }
.field { display: flex; flex-direction: column; gap: 5px; }
.field--full { grid-column: 1 / -1; }
.field-label { font-size: 0.78rem; font-weight: 600; color: var(--color-dark); }
.req { color: #e05c5c; }
.field-input {
  width: 100%; padding: 9px 12px; border-radius: var(--radius-sm);
  border: 1.5px solid var(--color-border); background: #fafafa;
  font-size: 0.86rem; color: var(--color-text); outline: none;
}
.field-input:focus { border-color: var(--color-mid); background: white; }
.field-textarea { resize: vertical; }

.sub-block {
  background: #f8fbfa; border: 1px solid rgba(47,160,132,0.16);
  border-radius: var(--radius-md); padding: 14px;
  display: flex; flex-direction: column; gap: 10px;
}
.sub-block-header { display: flex; justify-content: space-between; align-items: center; gap: 8px; flex-wrap: wrap; }
.sub-block-title { font-size: 0.82rem; font-weight: 700; color: var(--color-dark); }
.img-actions { display: flex; gap: 8px; align-items: center; }
.btn-sub-add, .btn-upload {
  padding: 5px 10px; border-radius: var(--radius-sm);
  background: rgba(47,160,132,0.12); color: var(--color-dark);
  border: none; font-size: 0.76rem; font-weight: 600; cursor: pointer;
}
.btn-sub-confirm {
  padding: 8px 12px; border-radius: var(--radius-sm);
  background: var(--color-mid); color: white; border: none; font-size: 0.8rem; font-weight: 600;
}
.inline-row { display: flex; gap: 8px; align-items: center; }
.btn-row-del { background: none; border: none; color: #c0392b; font-weight: 700; padding: 0 6px; }
.sub-empty { font-size: 0.76rem; color: var(--color-text-muted); font-style: italic; }

.modal-thumbs { display: grid; grid-template-columns: repeat(auto-fill, minmax(130px, 1fr)); gap: 10px; }
.modal-thumb-card {
  position: relative; background: white; border: 1px solid var(--color-border);
  border-radius: var(--radius-sm); overflow: hidden; display: flex; flex-direction: column;
}
.modal-thumb-card img { width: 100%; height: 80px; object-fit: cover; }
.thumb-caption-input { border: none; border-top: 1px solid #eee; padding: 5px 7px; font-size: 0.72rem; outline: none; }
.thumb-del {
  position: absolute; top: 4px; right: 4px; width: 20px; height: 20px;
  border-radius: 50%; border: none; background: rgba(192,57,43,0.85); color: white; font-size: 0.7rem;
}

.reminder-edit-card {
  background: white; padding: 10px; border-radius: var(--radius-sm);
  border: 1px solid rgba(47,160,132,0.15); display: flex; flex-direction: column; gap: 8px;
}

.community-toggle-box {
  display: flex; align-items: flex-start; gap: 10px;
  padding: 12px 14px; border-radius: var(--radius-md);
  background: rgba(111,207,151,0.12); border: 1px solid rgba(47,160,132,0.25);
  cursor: pointer; font-size: 0.82rem; color: var(--color-dark);
}
.community-toggle-box p { font-size: 0.75rem; color: var(--color-text-muted); margin-top: 2px; }

.modal-footer { display: flex; justify-content: flex-end; gap: 10px; padding-top: 6px; }
.btn-cancel {
  padding: 9px 18px; border-radius: var(--radius-md);
  border: 1px solid var(--color-border); background: white;
  color: var(--color-text-muted); font-size: 0.85rem; font-weight: 600;
}

/* Blog Timeline */
.blog-timeline {
  display: flex; flex-direction: column; gap: 12px;
  max-height: 360px; overflow-y: auto; padding-right: 4px;
}
.blog-entry-card {
  background: white; border: 1px solid rgba(47,160,132,0.18);
  border-left: 4px solid var(--color-mid);
  border-radius: var(--radius-md); padding: 14px 16px;
  display: flex; flex-direction: column; gap: 8px;
}
.blog-entry-header { display: flex; justify-content: space-between; align-items: flex-start; gap: 8px; }
.blog-entry-title { font-size: 0.94rem; font-weight: 700; color: var(--color-dark); }
.blog-entry-date { font-size: 0.72rem; color: var(--color-text-muted); }
.blog-entry-content { font-size: 0.84rem; color: var(--color-text); white-space: pre-line; line-height: 1.5; }
.blog-entry-img {
  max-height: 180px; width: fit-content; max-width: 100%;
  border-radius: var(--radius-sm); object-fit: cover; cursor: pointer;
  border: 1px solid rgba(47,160,132,0.2);
}

/* Lightbox */
.lightbox-card {
  background: white; border-radius: var(--radius-lg); padding: 14px;
  max-width: 85vw; max-height: 88vh; display: flex; flex-direction: column; gap: 10px;
}
.lightbox-card img { max-width: 80vw; max-height: 75vh; object-fit: contain; border-radius: var(--radius-sm); }
.lightbox-bar { display: flex; justify-content: space-between; align-items: center; font-size: 0.85rem; font-weight: 600; }

@media (max-width: 900px) {
  .stats-row { grid-template-columns: repeat(2, 1fr); }
  .projects-grid { grid-template-columns: 1fr; }
}
@media (max-width: 768px) {
  .main { margin-left: 200px; }
  .content-area, .topbar { padding-left: 20px; padding-right: 20px; }
  .form-grid { grid-template-columns: 1fr; }
}
</style>
