import {
  saveToStorage,
  getFromStorage,
  removeFromStorage,
  getInfoFromStorageByKey } from '@/utils/storage';
import {
  getMyFriendsList,
  getStrangerFriendsList,
  addFrined,
  removeFriend,
  confirmForAddFrined,
  rejectForAddFrined } from '@/api/socailRecovery';

const socailRecovery = {
  state: {
    mnemonic: '',
    privateKey: '',
  },

  mutations: {
    SET_MNEMONIC_INFO: (state, mnemonic) => {
      state.mnemonic = mnemonic;
    },
    SET_PRIVATEKEY_INFO: (state, privateKey) => {
      state.privateKey = privateKey;
    },
  },
  actions: {
    UpdateMnemonicForStorage({ commit }, data) {
      return new Promise(resolve => {
        const { mnemonic, updateType } = data
        commit('SET_MNEMONIC_INFO', mnemonic)
        if (updateType === 'store') {
          saveToStorage({ 'mnemonic': mnemonic });
        } else {
          removeFromStorage(['mnemonic'])
        }
        resolve()
      })
    },
    UpdatePrivateKeyForStorage({ commit }, data) {
      return new Promise(resolve => {
        const { privateKey, updateType } = data
        commit('SET_PRIVATEKEY_INFO', privateKey)
        if (updateType === 'store') {
          saveToStorage({ 'privateKey': privateKey });
        } else {
          removeFromStorage(['privateKey'])
        }
        resolve()
      })
    },
    StoreSelectedFrindsInfo({ commit }, data) {
      return new Promise(resolve => {
        saveToStorage({ 'selectedFriendsInfo': data.list });
        resolve()
      })
    },
    GetMyFriendsList({ commit }, params) {
      return new Promise((resolve, reject) => {
        getMyFriendsList(params).then(response => {
          const { errno, data, message } = response.data
          if (errno === 0) {
            resolve({ hasError: false, list: data })
          }
          resolve({ hasError: true, list: [], error: message });
        }).catch(error => {
          resolve({ hasError: true, list: [], error });
        })
      })
    },
    GetStrangerFriendsList({ commit }, params) {
      return new Promise((resolve, reject) => {
        getStrangerFriendsList(params).then(response => {
          const { errno, data, message } = response.data
          if (errno === 0) {
            resolve({ hasError: false, list: data })
          }
          resolve({ hasError: true, list: [], error: message });
        }).catch(error => {
          resolve({ hasError: true, list: [], error });
        })
      })
    },
    AddFrined({ commit }, params) {
      return new Promise((resolve, reject) => {
        addFrined(params).then(response => {
          const { errno, data, message } = response.data
          if (errno === 0) {
            resolve({ hasError: false })
          }
          resolve({ hasError: true, error: message });
        }).catch(error => {
          resolve({ hasError: true, error });
        })
      })
    },
    RemoveFriend({ commit }, params) {
      return new Promise((resolve, reject) => {
        removeFriend(params).then(response => {
          const { errno, data, message } = response.data
          if (errno === 0) {
            resolve({ hasError: false })
          }
          resolve({ hasError: true, error: message });
        }).catch(error => {
          resolve({ hasError: true, error });
        })
      })
    },
    ConfirmForAddFrined({ commit }, params) {
      return new Promise((resolve, reject) => {
        confirmForAddFrined(params).then(response => {
          const { errno, data, message } = response.data
          if (errno === 0) {
            resolve({ hasError: false })
          }
          resolve({ hasError: true, error: message });
        }).catch(error => {
          resolve({ hasError: true, error });
        })
      })
    },
    RejectForAddFrined({ commit }, params) {
      return new Promise((resolve, reject) => {
        rejectForAddFrined(params).then(response => {
          const { errno, data, message } = response.data
          if (errno === 0) {
            resolve({ hasError: false })
          }
          resolve({ hasError: true, error: message });
        }).catch(error => {
          resolve({ hasError: true, error });
        })
      })
    },
  }
}

export default socailRecovery
