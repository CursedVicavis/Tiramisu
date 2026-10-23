<template>
  <div class="login-page">
    <!-- Background decoration -->
    <div class="bg-orb bg-orb--1"></div>
    <div class="bg-orb bg-orb--2"></div>
    <div class="bg-orb bg-orb--3"></div>

    <div class="login-container">
      <!-- Logo / Brand -->
      <div class="brand">
        <div class="brand-icon">
          <AppLogo :size="40" />
        </div>
        <h1 class="brand-name">Tiramisu</h1>
      </div>

      <!-- Card -->
      <div class="card">
        <div class="card-header">
          <h2 class="card-title">{{ isSignUp ? 'Crea tu cuenta' : 'Bienvenido de nuevo' }}</h2>
          <p class="card-subtitle">{{ isSignUp ? 'Ingresa tus datos para registrarte' : 'Ingresa tus credenciales para continuar' }}</p>
        </div>

        <form class="form" @submit.prevent="handleLogin">
          <!-- Email -->
          <div class="field" :class="{ 'field--error': errors.email, 'field--focused': focused === 'email' }">
            <label class="field-label" for="email">Correo electrónico</label>
            <div class="field-wrapper">
              <span class="field-icon">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <rect x="2" y="4" width="20" height="16" rx="2"/>
                  <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>
                </svg>
              </span>
              <input
                id="email"
                v-model="form.email"
                type="email"
                class="field-input"
                placeholder="tu@correo.com"
                autocomplete="email"
                @focus="focused = 'email'"
                @blur="focused = null"
              />
            </div>
            <span v-if="errors.email" class="field-error">{{ errors.email }}</span>
          </div>

          <!-- Password -->
          <div class="field" :class="{ 'field--error': errors.password, 'field--focused': focused === 'password' }">
            <label class="field-label" for="password">Contraseña</label>
            <div class="field-wrapper">
              <span class="field-icon">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                  <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                </svg>
              </span>
              <input
                id="password"
                v-model="form.password"
                :type="showPassword ? 'text' : 'password'"
                class="field-input"
                placeholder="••••••••"
                autocomplete="current-password"
                @focus="focused = 'password'"
                @blur="focused = null"
              />
              <button type="button" class="field-toggle" @click="showPassword = !showPassword" aria-label="Mostrar contraseña">
                <svg v-if="!showPassword" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/>
                  <circle cx="12" cy="12" r="3"/>
                </svg>
                <svg v-else width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M9.88 9.88a3 3 0 1 0 4.24 4.24"/>
                  <path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68"/>
                  <path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61"/>
                  <line x1="2" x2="22" y1="2" y2="22"/>
                </svg>
              </button>
            </div>
            <span v-if="errors.password" class="field-error">{{ errors.password }}</span>
          </div>

          <!-- Error general -->
          <Transition name="fade">
            <div v-if="loginError" class="alert-error">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="12" cy="12" r="10"/>
                <line x1="12" x2="12" y1="8" y2="12"/>
                <line x1="12" x2="12.01" y1="16" y2="16"/>
              </svg>
              {{ loginError }}
            </div>
          </Transition>

          <!-- Submit -->
          <button
            id="btn-login"
            type="submit"
            class="btn-submit"
            :class="{ 'btn-submit--loading': loading }"
            :disabled="loading"
          >
            <span v-if="!loading">{{ isSignUp ? 'Registrarse' : 'Iniciar sesión' }}</span>
            <span v-else class="spinner"></span>
          </button>
        </form>

        <div class="auth-toggle">
          <span class="toggle-text">
            {{ isSignUp ? '¿Ya tienes cuenta?' : '¿No tienes cuenta?' }}
          </span>
          <button type="button" class="btn-toggle" @click="isSignUp = !isSignUp; loginError = ''">
            {{ isSignUp ? 'Inicia sesión' : 'Regístrate' }}
          </button>
        </div>
      </div>

      <p class="footer-note">© 2026 Tiramisu. Todos los derechos reservados.</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import AppLogo from '../components/AppLogo.vue'
import { supabase } from '../utils/supabase'
import { initEventos } from '../store/eventos'

const router = useRouter()

const isSignUp = ref(false)
const form = reactive({ email: '', password: '' })
const errors = reactive({ email: '', password: '' })
const focused = ref<string | null>(null)
const showPassword = ref(false)
const loading = ref(false)
const loginError = ref('')

function validate(): boolean {
  errors.email = ''
  errors.password = ''
  let valid = true

  if (!form.email) {
    errors.email = 'El correo es requerido'
    valid = false
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
    errors.email = 'Ingresa un correo válido'
    valid = false
  }

  if (!form.password) {
    errors.password = 'La contraseña es requerida'
    valid = false
  } else if (form.password.length < 6) {
    errors.password = 'Mínimo 6 caracteres'
    valid = false
  }

  return valid
}

async function handleLogin() {
  loginError.value = ''
  if (!validate()) return

  loading.value = true

  if (isSignUp.value) {
    // El registro no está conectado a Supabase aún por decisión del usuario
    loginError.value = 'El registro está deshabilitado por ahora. Inicia sesión.'
    loading.value = false
    return
  }

  const { error } = await supabase.auth.signInWithPassword({
    email: form.email,
    password: form.password,
  })

  if (error) {
    loginError.value = 'Credenciales incorrectas o error en inicio de sesión.'
    loading.value = false
  } else {
    await initEventos(true)
    router.push({ name: 'home' })
  }
}
</script>

<style scoped>
/* ── Layout ── */
.login-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #e8f5ee 0%, #d4ede4 40%, #c2e6da 100%);
  position: relative;
  overflow: hidden;
  padding: 24px;
}

/* ── Decorative orbs ── */
.bg-orb {
  position: absolute;
  border-radius: 50%;
  filter: blur(80px);
  pointer-events: none;
  animation: float 8s ease-in-out infinite;
}
.bg-orb--1 {
  width: 500px; height: 500px;
  background: rgba(111, 207, 151, 0.3);
  top: -200px; left: -150px;
  animation-delay: 0s;
}
.bg-orb--2 {
  width: 400px; height: 400px;
  background: rgba(47, 160, 132, 0.2);
  bottom: -150px; right: -100px;
  animation-delay: 3s;
}
.bg-orb--3 {
  width: 300px; height: 300px;
  background: rgba(31, 111, 95, 0.15);
  top: 50%; left: 60%;
  animation-delay: 5s;
}

@keyframes float {
  0%, 100% { transform: translateY(0px) scale(1); }
  50%       { transform: translateY(-30px) scale(1.05); }
}

/* ── Container ── */
.login-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 24px;
  width: 100%;
  max-width: 420px;
  position: relative;
  z-index: 1;
}

/* ── Brand ── */
.brand {
  display: flex;
  align-items: center;
  gap: 12px;
}
.brand-icon {
  filter: drop-shadow(0 4px 12px rgba(31, 111, 95, 0.3));
  animation: pulse 3s ease-in-out infinite;
}
@keyframes pulse {
  0%, 100% { filter: drop-shadow(0 4px 12px rgba(31, 111, 95, 0.3)); }
  50%       { filter: drop-shadow(0 6px 20px rgba(31, 111, 95, 0.5)); }
}
.brand-name {
  font-size: 2rem;
  font-weight: 800;
  background: linear-gradient(135deg, #2FA084, #1F6F5F);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  letter-spacing: -0.5px;
}

/* ── Card ── */
.card {
  width: 100%;
  background: rgba(255, 255, 255, 0.88);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: 1px solid rgba(111, 207, 151, 0.3);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-lg);
  padding: 40px 36px;
  animation: slideUp 0.5s cubic-bezier(0.4, 0, 0.2, 1) both;
}

@keyframes slideUp {
  from { opacity: 0; transform: translateY(30px); }
  to   { opacity: 1; transform: translateY(0); }
}

.card-header {
  text-align: center;
  margin-bottom: 32px;
}
.card-title {
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--color-dark);
  margin-bottom: 6px;
}
.card-subtitle {
  font-size: 0.875rem;
  color: var(--color-text-muted);
  font-weight: 400;
}

/* ── Form ── */
.form {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.field {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.field-label {
  font-size: 0.8125rem;
  font-weight: 600;
  color: var(--color-dark);
  letter-spacing: 0.02em;
}

.field-wrapper {
  position: relative;
  display: flex;
  align-items: center;
}

.field-icon {
  position: absolute;
  left: 14px;
  color: var(--color-mid);
  display: flex;
  align-items: center;
  transition: color var(--transition);
  pointer-events: none;
}

.field-input {
  width: 100%;
  padding: 12px 44px;
  background: rgba(238, 238, 238, 0.5);
  border: 1.5px solid var(--color-border);
  border-radius: var(--radius-md);
  font-size: 0.9375rem;
  color: var(--color-text);
  outline: none;
  transition: border-color var(--transition), background var(--transition), box-shadow var(--transition);
}

.field-input::placeholder {
  color: #b0b0c0;
}

.field--focused .field-input {
  border-color: var(--color-mid);
  background: white;
  box-shadow: 0 0 0 3px rgba(47, 160, 132, 0.12);
}

.field--error .field-input {
  border-color: #e05c5c;
  background: #fff8f8;
}

.field--focused .field-icon {
  color: var(--color-dark);
}

.field-toggle {
  position: absolute;
  right: 14px;
  background: none;
  border: none;
  color: var(--color-text-muted);
  display: flex;
  align-items: center;
  padding: 0;
  transition: color var(--transition);
}
.field-toggle:hover {
  color: var(--color-mid);
}

.field-error {
  font-size: 0.78rem;
  color: #d94f4f;
  font-weight: 500;
}

/* ── Alert ── */
.alert-error {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 16px;
  background: rgba(217, 79, 79, 0.08);
  border: 1px solid rgba(217, 79, 79, 0.25);
  border-radius: var(--radius-sm);
  color: #c0392b;
  font-size: 0.875rem;
  font-weight: 500;
}

/* ── Button ── */
.btn-submit {
  width: 100%;
  padding: 14px;
  background: linear-gradient(135deg, #2FA084, #1F6F5F);
  color: white;
  border: none;
  border-radius: var(--radius-md);
  font-size: 1rem;
  font-weight: 600;
  letter-spacing: 0.02em;
  transition: transform var(--transition), box-shadow var(--transition), opacity var(--transition);
  box-shadow: 0 4px 20px rgba(31, 111, 95, 0.35);
  position: relative;
  overflow: hidden;
  margin-top: 4px;
}

.btn-submit::before {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(135deg, #6FCF97, #2FA084);
  opacity: 0;
  transition: opacity var(--transition);
}

.btn-submit:hover:not(:disabled)::before {
  opacity: 1;
}

.btn-submit:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 8px 28px rgba(31, 111, 95, 0.45);
}

.btn-submit:active:not(:disabled) {
  transform: translateY(0);
}

.btn-submit:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.btn-submit span {
  position: relative;
  z-index: 1;
}

/* ── Spinner ── */
.spinner {
  display: inline-block;
  width: 20px;
  height: 20px;
  border: 2.5px solid rgba(255,255,255,0.3);
  border-top-color: white;
  border-radius: 50%;
  animation: spin 0.7s linear infinite;
  position: relative;
  z-index: 1;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

/* ── Footer ── */
.footer-note {
  font-size: 0.8rem;
  color: rgba(31, 111, 95, 0.6);
  text-align: center;
  margin-top: 10px;
}

/* ── Auth Toggle ── */
.auth-toggle {
  margin-top: 24px;
  text-align: center;
  font-size: 0.875rem;
}
.toggle-text {
  color: var(--color-text-muted);
}
.btn-toggle {
  background: none;
  border: none;
  color: var(--color-mid);
  font-weight: 600;
  cursor: pointer;
  margin-left: 6px;
  padding: 0;
}
.btn-toggle:hover {
  text-decoration: underline;
}

/* ── Transitions ── */
.fade-enter-active, .fade-leave-active {
  transition: opacity 0.2s ease;
}
.fade-enter-from, .fade-leave-to {
  opacity: 0;
}

/* ── Responsive ── */
@media (max-width: 480px) {
  .card {
    padding: 28px 20px;
  }
  .brand-name {
    font-size: 1.6rem;
  }
}
</style>
