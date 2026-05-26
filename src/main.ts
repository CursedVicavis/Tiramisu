import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import { initEventos } from './store/eventos'
import './style.css'

const app = createApp(App)
app.use(router)
app.mount('#app')

// Inicializar datos desde Supabase en background
initEventos()
