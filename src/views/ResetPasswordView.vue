<template>
  <div class="reset-page">
    <div class="bg-orb bg-orb--1"></div>
    <div class="bg-orb bg-orb--2"></div>

    <div class="reset-container">
      <div class="brand">
        <AppLogo :size="40" />
        <h1 class="brand-name">Tiramisu</h1>
      </div>

      <div class="card">
        <div class="card-header">
          <h2 class="card-title">Nueva contraseña</h2>
          <p class="card-subtitle">Ingresa y confirma tu nueva contraseña de acceso</p>
        </div>

        <form class="form" @submit.prevent="handleReset">
          <div class="field">
            <label class="field-label" for="new-password">Nueva contraseña</label>
            <input
              id="new-password"
              v-model="password"
              type="password"
              class="field-input"
              placeholder="Mínimo 6 caracteres"
              required
            />
          </div>

          <div class="field">
            <label class="field-label" for="confirm-password">Confirmar contraseña</label>
            <input
              id="confirm-password"
              v-model="confirmPassword"
              type="password"
              class="field-input"
              placeholder="Repite tu nueva contraseña"
              required
            />
          </div>

          <div v-if="errorMsg" class="alert-error">{{ errorMsg }}</div>
          <div v-if="successMsg" class="alert-success">{{ successMsg }}</div>

          <button type="submit" class="btn-submit" :disabled="loading">
            <span v-if="!loading">Actualizar contraseña</span>
            <span v-else class="spinner"></span>
          </button>
        </form>

        <div class="auth-toggle">
          <RouterLink to="/login" class="btn-toggle">← Volver al inicio de sesión</RouterLink>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter, RouterLink } from 'vue-router'
import AppLogo from '../components/AppLogo.vue'
import { supabase } from '../utils/supabase'

const router = useRouter()
const password = ref('')
const confirmPassword = ref('')
const loading = ref(false)
const errorMsg = ref('')
const successMsg = ref('')

async function handleReset() {
  errorMsg.value = ''
  successMsg.value = ''

  if (password.value.length < 6) {
    errorMsg.value = 'La contraseña debe tener al menos 6 caracteres.'
    return
  }
  if (password.value !== confirmPassword.value) {
    errorMsg.value = 'Las contraseñas no coinciden.'
    return
  }

  loading.value = true
  const { error } = await supabase.auth.updateUser({
    password: password.value,
  })
  loading.value = false

  if (error) {
    const msg = error.message.toLowerCase()
    const code = (error as { code?: string }).code || ''
    if (code === 'same_password' || msg.includes('different from the old password')) {
      errorMsg.value = 'La nueva contraseña debe ser diferente a tu contraseña actual.'
    } else if (code === 'weak_password' || msg.includes('weak') || msg.includes('characters')) {
      errorMsg.value = 'La contraseña es muy débil. Usa al menos 6 caracteres combinando letras y números.'
    } else {
      errorMsg.value = `Error al actualizar: ${error.message}`
    }
  } else {
    successMsg.value = '¡Contraseña actualizada con éxito! Redirigiendo...'
    setTimeout(() => {
      router.push({ name: 'home' })
    }, 1500)
  }
}
</script>

<style scoped>
.reset-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #e8f5ee 0%, #d4ede4 40%, #c2e6da 100%);
  position: relative;
  overflow: hidden;
  padding: 24px;
}
.bg-orb {
  position: absolute;
  border-radius: 50%;
  filter: blur(80px);
  pointer-events: none;
}
.bg-orb--1 { width: 450px; height: 450px; background: rgba(111, 207, 151, 0.3); top: -180px; left: -120px; }
.bg-orb--2 { width: 380px; height: 380px; background: rgba(47, 160, 132, 0.2); bottom: -140px; right: -100px; }

.reset-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 24px;
  width: 100%;
  max-width: 420px;
  position: relative;
  z-index: 1;
}
.brand { display: flex; align-items: center; gap: 12px; }
.brand-name {
  font-size: 2rem; font-weight: 800;
  background: linear-gradient(135deg, #2FA084, #1F6F5F);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}
.card {
  width: 100%;
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(111, 207, 151, 0.3);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-lg);
  padding: 36px 32px;
}
.card-header { text-align: center; margin-bottom: 26px; }
.card-title { font-size: 1.4rem; font-weight: 700; color: var(--color-dark); margin-bottom: 6px; }
.card-subtitle { font-size: 0.85rem; color: var(--color-text-muted); }

.form { display: flex; flex-direction: column; gap: 18px; }
.field { display: flex; flex-direction: column; gap: 6px; }
.field-label { font-size: 0.8rem; font-weight: 600; color: var(--color-dark); }
.field-input {
  width: 100%; padding: 12px 14px;
  background: rgba(238, 238, 238, 0.5);
  border: 1.5px solid var(--color-border);
  border-radius: var(--radius-md);
  font-size: 0.92rem; color: var(--color-text); outline: none;
}
.field-input:focus { border-color: var(--color-mid); background: white; }

.alert-error {
  padding: 11px 14px; border-radius: var(--radius-sm);
  background: rgba(217, 79, 79, 0.08); border: 1px solid rgba(217, 79, 79, 0.25);
  color: #c0392b; font-size: 0.84rem; font-weight: 500;
}
.alert-success {
  padding: 11px 14px; border-radius: var(--radius-sm);
  background: rgba(47, 160, 132, 0.1); border: 1px solid rgba(47, 160, 132, 0.3);
  color: var(--color-dark); font-size: 0.84rem; font-weight: 500;
}
.btn-submit {
  width: 100%; padding: 13px;
  background: linear-gradient(135deg, #2FA084, #1F6F5F);
  color: white; border: none; border-radius: var(--radius-md);
  font-size: 0.95rem; font-weight: 600;
  box-shadow: 0 4px 20px rgba(31, 111, 95, 0.3);
}
.spinner {
  display: inline-block; width: 18px; height: 18px;
  border: 2.5px solid rgba(255,255,255,0.3); border-top-color: white;
  border-radius: 50%; animation: spin 0.7s linear infinite;
}
@keyframes spin { to { transform: rotate(360deg); } }

.auth-toggle { margin-top: 20px; text-align: center; }
.btn-toggle { color: var(--color-mid); font-size: 0.85rem; font-weight: 600; }
.btn-toggle:hover { text-decoration: underline; }
</style>
