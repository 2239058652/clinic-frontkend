import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import { createPinia } from 'pinia'
import 'element-plus/dist/index.css' // 引入全局样式
import './style.css' // 你的自定义全局样式

const app = createApp(App)

app.use(createPinia())
app.use(router)

app.mount('#app')