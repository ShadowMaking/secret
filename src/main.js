import Vue from 'vue';
import App from './App.vue';
import router from './router';
import store from './store';
// import '@/assets/style/reset.scss';
import { initWeb3 } from "@/utils/wb3";

Vue.config.productionTip = false;
Vue.prototype.web3 = initWeb3()
Vue.prototype.$eventBus = new Vue()

new Vue({
  router,
  store,
  render: (h) => h(App),
}).$mount('#app');
