import Vue from 'vue';
import Vuex from 'vuex';
import metamask from './modules/metamask';
import getters from './getters'

Vue.use(Vuex);

/* export default new Vuex.Store({
  state: {
  },
  mutations: {
  },
  actions: {
  },
  modules: {
  },
}); */

const store = new Vuex.Store({
  modules: {
    metamask
  },
  getters
})

export default store
