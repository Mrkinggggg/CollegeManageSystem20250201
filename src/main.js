// import './assets/main.css'

// import { createApp } from 'vue'
// import App from './App.vue'
// import router from './router'
// import ElementPlus from 'element-plus'
// import 'element-plus/dist/index.css' 
// import axios from 'axios'
// import './mock/mock.js';

// axios.defaults.baseURL = 'http://locallhost:8080';
// axios.defaults.withCredentials = true; 
// Vue.prototype.$axios = axios;

// const app = createApp(App)

// app.use(router)
// app.use(ElementPlus)
// app.mount('#app')
import './assets/main.css';

import { createApp } from 'vue';
import App from './App.vue';
import router from './router';
import ElementPlus from 'element-plus';
import 'element-plus/dist/index.css';
import axios from 'axios';
//import './mock/mock.js'; 

axios.defaults.baseURL = 'https://tangsong.viphk.nnhk.cc';
axios.defaults.withCredentials = true;

const app = createApp(App);

app.config.globalProperties.$axios = axios;

app.use(router);
app.use(ElementPlus);

app.mount('#app');