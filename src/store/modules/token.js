
import _ from 'lodash'
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
        resolve({ tokenList })
      })
    },
    SearchToken({ commit }, params) {
      return new Promise((resolve, reject) => {
        const netType = params.netType
        const tokenList = [].concat([{symbol:'ETH'}], netType === 'l1' ? TOKEN_L1 : TOKEN_L2)
        const list = _.filter(tokenList, (item, index, arr) => {
          const listSet = new Set([item['symbol'].toLowerCase()])
          const targetTokenSet = new Set([params.token.toLowerCase()])
          const intersectionSet = new Set([...listSet].filter(x => targetTokenSet.has(x)));
          return item['symbol'].toLowerCase().indexOf(params.token.toLowerCase()) > -1
        }) || []
        resolve(list)
      })
    },
  }
}

export default token
