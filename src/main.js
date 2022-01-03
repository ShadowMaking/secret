import Vue from 'vue';
import App from './App.vue';
import router from './router';
import store from './store';
import { initWeb3 } from "@/utils/web3";
import * as echarts from 'echarts';
import ElementUI from "element-ui"
import "element-ui/lib/theme-chalk/index.css"
import locale from 'element-ui/lib/locale/lang/en'


Vue.use(ElementUI, { locale });

Vue.config.productionTip = false;
Vue.prototype.web3 = initWeb3();
Vue.prototype.$eventBus = new Vue();
Vue.prototype.$echarts = echarts;

new Vue({
  router,
  store,
  render: (h) => h(App),
}).$mount('#app');
