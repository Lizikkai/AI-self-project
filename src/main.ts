import { createApp } from 'vue'
import router from './router';
import Antd from 'ant-design-vue';
import 'ant-design-vue/dist/reset.css';
import { createPinia } from 'pinia'
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate'
import App from './App.vue'
import './style.css'
import 'virtual:uno.css';
import { MotionPlugin } from '@vueuse/motion'
import 'highlight.js/styles/stackoverflow-light.css'
import 'highlight.js/lib/common';
import hljsVuePlugin from "@highlightjs/vue-plugin";


const app = createApp(App);
const pinia = createPinia();
pinia.use(piniaPluginPersistedstate)
app.use(MotionPlugin);
app.use(pinia);
app.use(router);
app.use(Antd);
app.use(hljsVuePlugin);
app.mount('#app')
// setupCacheClear()
