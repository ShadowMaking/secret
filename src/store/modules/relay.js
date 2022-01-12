import _ from 'lodash'
import { getAllPublicKey, encryptPrivateKeyByEcies, decryptPrivateKeyByEcies } from '@/api/relay';
import {
  saveToStorage,
  getFromStorage,
  removeFromStorage,
  getInfoFromStorageByKey,
  getStringInfoFromStorageByKey } from '@/utils/storage';

const token = {
  state: {
    privateKeyInfoForAddress: '',
  },

  mutations: {
    SET_PRIVATEKEY_ADDRESS: (state, privateKeyInfo) => {
      state.privateKeyInfoForAddress = privateKeyInfo;
    },
  },
  actions: {
    SaveDecryptPrivateKeyInStore({ commit }, params) {
      return new Promise((resolve, reject) => {
        const userId = params.userId;
        const { encryptKey, privateKey } = params
        const address = params.address.toLocaleLowerCase()
        if (userId) {
          const privateKeyInfo = {}
          const key = `${userId}||${address}||${encryptKey}`
          privateKeyInfo[key] = privateKey
          commit('SET_PRIVATEKEY_ADDRESS', privateKeyInfo)
          saveToStorage({...privateKeyInfo}, 'session')
          resolve({ hasError: false })
        } else {
          resolve({ hasError: true  })
        }
      })
    },
    GetDecryptPrivateKeyFromStore({ commit, ...rootStore }, params) {
      return new Promise((resolve, reject) => {
        const userId = params.userId;
        const { encryptKey } = params
        const address = params.address.toLocaleLowerCase()
        if (userId) {
          const  privateKeyInfo = rootStore.state['privateKeyInfoForAddress']
          let privateKey
          if (privateKeyInfo) {
            privateKey = privateKeyInfo && privateKeyInfo[`${userId}||${address}||${encryptKey}`]
          } else {
            const key = `${userId}||${address}||${encryptKey}`
            privateKey = getStringInfoFromStorageByKey(key, 'session')
          }
          resolve({ hasError: false, data: privateKey })
        } else {
          resolve({ hasError: true, data: ''  })
        }
      })
    },
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
