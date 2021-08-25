import Vue from 'vue';
import App from './App.vue';
import router from './router';
import store from './store';
import { initWeb3 } from "@/utils/web3";

Vue.config.productionTip = false;
Vue.prototype.web3 = initWeb3();
Vue.prototype.$eventBus = new Vue();

new Vue({
  router,
  store,
  render: (h) => h(App),
}).$mount('#app');
