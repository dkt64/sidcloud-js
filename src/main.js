import Vue from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
import vuetify from './plugins/vuetify';
import axios from "axios";

if (process.env.NODE_ENV == "development") {
//   axios.defaults.baseURL = "http://localhost";
  axios.defaults.baseURL = "https://sidcloud.net";
}

Vue.config.productionTip = false

new Vue({
  router,
  store,
  vuetify,
  axios,
  render: h => h(App)
}).$mount('#app')
