import { createApp } from 'vue'
import './style.css'
import App from './App.vue'
import { createPinia } from 'pinia'
import { createRouter, createWebHashHistory } from 'vue-router';
import { routes } from './routes';

const pinia = createPinia();
const router = createRouter({ history: createWebHashHistory(), routes });
const app = createApp(App);

app.use(pinia);
app.use(router);
app.mount('#app');