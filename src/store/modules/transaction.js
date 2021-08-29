import {
  addTransactionHistory,
  updateTransactionHistory,
  searchAllTransactionHistory,
  queryTransactionHistory,
} from '@/api/transaction'

const transaction = {
  state: {
    // searchList: null,
  },

  mutations: {
    SET_HISTORY_LIST: (state, list) => {
      state.searchList = list;
    },
  },
  actions: {
    // {"txid": "1", "from": "0x1", "to": "0x1", "type":0}
    AddTransactionHistory({ commit }, params) {
      return new Promise((resolve, reject) => {
        addTransactionHistory(params).then(response => {
          const data = response.data;
          resolve(data)
        }).catch(error => {
          // reject(error)
          resolve({ hasError: true });
        })
      })
    },
    // {"status": 1, "sub_txid": "2121"}
    UpdateTransactionHistory({ commit }, params) {
      return new Promise((resolve, reject) => {
        updateTransactionHistory(params).then(response => {
          const data = response.data.data;
          resolve(data)
        }).catch(error => {
          reject(error)
        })
      })
    },
    // from
    SearchAllTransactionHistory({ commit }, params) {
      return new Promise((resolve, reject) => {
        searchAllTransactionHistory(params).then(response => {
          const data = response.data.data;
          // commit('SET_HISTORY_LIST', data)
          resolve(data)
        }).catch(error => {
          reject(error)
        })
      })
    },
    QueryTransactionHistory({ commit }, params) {
      return new Promise((resolve, reject) => {
        queryTransactionHistory(params).then(response => {
          const data = response.data.data;
          resolve(data)
        }).catch(error => {
          reject(error)
        })
      })
    },
  }
}

export default transaction
