import { TOKEN_L1, TOKEN_L2 } from '@/utils/token';

const token = {
  state: {
    // tokenList: null,
  },

  mutations: {
    SET_TOKEN_LIST: (state, list) => {
      state.tokenList = list;
    },
  },
  actions: {
    GetTokenByNetType({ commit }, params) {
      return new Promise((resolve, reject) => {
        const netType = params.netType
        const tokenList = netType === 'l1' ? TOKEN_L1 : TOKEN_L2
        // const json = netType === 'l1' ? L1TokenABIJSON : L2TokenABIJSON
        resolve({ tokenList })
      })
    },
  }
}

export default token
