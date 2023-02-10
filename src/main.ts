import { createApp } from 'vue'
import App from './App.vue'

// 初始化 CSS
import 'normalize.css'
// 全局 css
import '@/assets/style.scss'
// 创建 App 实例
const app = createApp(App)

// 挂载
app.mount('#app')
