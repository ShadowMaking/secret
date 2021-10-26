import Vue from 'vue';
import Vuex from 'vuex';
import persistedState from 'vuex-persistedstate'

import metamask from './modules/metamask';
import transaction from './modules/transaction';
import token from './modules/token';
import thirdLogin from './modules/thirdLogin';
import socailRecovery from './modules/socailRecovery';
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
    metamask,
    transaction,
    thirdLogin,
    socailRecovery,
    token,
  },
  getters,
  // plugins: [persistedState()]
})

export default store
