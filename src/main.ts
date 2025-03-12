import { primaryColor } from '@roku-ui/vue'
import { createApp } from 'vue'
import App from './App.vue'
import { router } from './router/router'

import '@unocss/reset/tailwind.css'
import 'virtual:uno.css'

primaryColor.value = '#9b95b8'
const app = createApp(App)
app.use(router)
app.mount('#app')
