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
  rejectForAddFrined,
  getRecoveryData,
  saveRecoveryData,
  getOTPAuthUrl,
  verifyCode,
  saveOTPSecret, } from '@/api/socailRecovery';

import TOTP from 'totp.js'

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
    SET_OTP_SECRET: (state, info) => {
      state.OTPSecretMap = {
        [info.userId]: info.secret
      }
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
    SaveRecoveryData({ commit }, params) {
      return new Promise((resolve, reject) => {
        saveRecoveryData(params).then(response => {
          const { errno, data, message } = response.data
          if (errno === 0) {
            resolve({ hasError: false  })
          }
          resolve({ hasError: true, error: message });
        }).catch(error => {
          resolve({ hasError: true, error });
        })
      })
    },
    GetRecoveryData({ commit }, params) {
      return new Promise((resolve, reject) => {
        getRecoveryData(params).then(response => {
          const { errno, data, message } = response.data
          const friendsList = data && data.friends && window.JSON.parse(data.friends) || []
          if (errno === 0) {
            resolve({ hasError: false, list: friendsList, recoveryNumber: data.total_shared_num })
          }
          resolve({ hasError: true, list: [], error: message });
        }).catch(error => {
          resolve({ hasError: true, list: [], error });
        })
      })
    },
    GetOTPAuthUrl({ commit }, params) {
      return new Promise((resolve, reject) => {
        getOTPAuthUrl(params).then(response => {
          const { errno, data, message } = response.data
          if (errno === 0) {
            resolve({ hasError: false, data })
          }
          resolve({ hasError: true, error: message });
        }).catch(error => {
          resolve({ hasError: true, error });
        })
      })
    },
    VerifyCode({ commit }, params) {
      return new Promise((resolve, reject) => {
        verifyCode(params).then(response => {
          const { errno, data, message } = response.data
          if (errno === 0 && data) {
            resolve({ hasError: false  })
          }
          resolve({ hasError: true, error: 'Error Code' });
        }).catch(error => {
          resolve({ hasError: true, error: 'Error Code' });
        })
      })
    },
    // https://github.com/wuyanxin/totp.js
    GenerateOTPAuthUrl({ commit, rootState }, params) {
      return new Promise(resolve => {
        const needDestroy = params.needDestroy
        const userId = params.userId
        const key = rootState['socailRecovery']['OTPSecretMap'] && rootState['socailRecovery']['OTPSecretMap'][userId]
        const keyInStorage = getFromStorage('usmap') && window.JSON.parse(getFromStorage('usmap'))[userId]
        let secret;
        if (needDestroy) {
          secret = TOTP.randomKey(); // generate a base32 secret key('GAXGGYT2OU2DEOJR')
        } else {
          secret = key || keyInStorage || TOTP.randomKey();
        }
        const totp = new TOTP(secret);
        // generate Google Authenticator supported URL
        // const url = totp.gaURL('handsome@totp.js', 'Totp.js') // 'otpauth://totp/handsome@totp.js?issuer=Totp.js&secret=GAXGGYT2OU2DEOJR'
        const url = `otpauth://totp/${userId}?issuer=EigenNetwork&secret=${secret}`
        commit('SET_OTP_SECRET', {userId, secret })
        saveToStorage({ usmap: {[userId]: secret}})
        resolve({ secret, url })
      })
    },
    VerifyOTPCode({ commit, rootState }, params) {
      return new Promise(resolve => {
        const userId = params.userId
        const secret = rootState['socailRecovery']['OTPSecretMap'][userId]
        const inputCode = params.code
        const totp = new TOTP(secret);
        const code = totp.genOTP();
        if (inputCode === code) {
          resolve({ hasError: false })
        } else {
          resolve({ hasError: true, error: 'Error Code' })
        }
      })
    },
    SaveOTPSecret({ commit }, params) {
      return new Promise((resolve, reject) => {
        saveOTPSecret(params).then(response => {
          const { errno, data, message } = response.data
          if (errno === 0 && data) {
            resolve({ hasError: false  })
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
