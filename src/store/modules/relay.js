import _ from 'lodash'
import { getAllPublicKey, encryptPrivateKeyByEcies, decryptPrivateKeyByEcies } from '@/api/relay';

const token = {
  state: {
    tokenABIMap: {},
  },

  mutations: {
    SET_TOKEN_LIST: (state, list) => {
    },
  },
  actions: {
    GetAllPublicKey({ commit }, params) {
      return new Promise((resolve, reject) => {
        // resolve({ hasError: false, data: PUBK })
        getAllPublicKey(params).then(response => {
          const { errno, data, message } = response.data
          const pbk = data && data.length && data[0].public_key
          if (errno === 0) {
            resolve({ hasError: false, data: pbk })
          } else {
            resolve({ hasError: true, data: null, error: message });
          }
        }).catch(error => {
          resolve({ hasError: true, data: null, error  });
        })
      })
    },
    EncryptPrivateKeyByEcies({ commit }, params) {
      return new Promise((resolve, reject) => {
        encryptPrivateKeyByEcies(params).then(response => {
          const { errno, data, message } = response.data
          if (errno === 0) {
            resolve({ hasError: false, data })
          } else {
            resolve({ hasError: true, data: null, error: message });
          }
        }).catch(error => {
          resolve({ hasError: true, data: null, error  });
        })
      })
    },
    DecryptPrivateKeyByEcies({ commit }, params) {
      return new Promise((resolve, reject) => {
        decryptPrivateKeyByEcies(params).then(response => {
          const { errno, data, message } = response.data
          if (errno === 0) {
            resolve({ hasError: false, data })
          } else {
            resolve({ hasError: true, data: null, error: message });
          }
        }).catch(error => {
          resolve({ hasError: true, data: null, error  });
        })
      })
    },
  }
}

export default token
