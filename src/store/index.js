import Vue from 'vue';
import Vuex from 'vuex';
import persistedState from 'vuex-persistedstate'

import metamask from './modules/metamask';
import auth from './modules/auth';
import net from './modules/net';
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
    auth,
    net,
    metamask
  },
  getters,
  // plugins: [persistedState()]
})

export default store
