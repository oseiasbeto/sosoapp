import { createApp } from 'vue'
import App from './App.vue'
import './registerServiceWorker'
import store from './store'
import "vue3-toastify/dist/index.css"
import './assets/tailwind.css' // Importe o arquivo CSS aqui
import VueLazyload from 'vue-lazyload'
import router from './router'

const app = createApp(App)
app.use(router)
app.use(VueLazyload)
app.use(store)

.mount('#app')
