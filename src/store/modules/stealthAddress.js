import {
  addStealth,
  getStealthList,
  updateStealthStatus,
  zkzruAccout,
  getZkzruAccountInfo,
  zkzruTx,
  getZkzruTxStatus,
  getWithdrawInfo,
  updateAccountNonce,
  getAccountNonce,
  getWithdrawList,
  updateWithdrawStatus
} from '@/api/stealthAddress'


const stealthAddress = {
  state: {
    // searchList: null,
  },

  mutations: {
    
  },
  actions: {
    getStealthList({ commit }, params) {
      return new Promise((resolve, reject) => {
        getStealthList(params).then(response => {
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
    addStealth({ commit }, params) {
      return new Promise((resolve, reject) => {
        addStealth(params).then(response => {
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
    updateStealthStatus({ commit }, params) {
      return new Promise((resolve, reject) => {
        updateStealthStatus(params).then(response => {
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
    zkzruAccout({ commit }, params) {
      return new Promise((resolve, reject) => {
        zkzruAccout(params).then(response => {
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
    zkzruTx({ commit }, params) {
      return new Promise((resolve, reject) => {
        zkzruTx(params).then(response => {
          const { errno, data, message } = response.data
          if (errno === 0) {
            resolve({ hasError: false, data: data })
          }
          resolve({ hasError: true, data: null, error: message });
        }).catch(error => {
          resolve({ hasError: true, data: null, error });
        })
      })
    },
    getZkzruAccountInfo({ commit }, params) {
      return new Promise((resolve, reject) => {
        getZkzruAccountInfo(params).then(response => {
          const { errno, data, message } = response.data
          if (errno === 0) {
            resolve({ hasError: false, data: data })
          }
          resolve({ hasError: true, data: null, error: message });
        }).catch(error => {
          resolve({ hasError: true, data: null, error });
        })
      })
    },
    getZkzruTxStatus({ commit }, params) {
      return new Promise((resolve, reject) => {
        getZkzruTxStatus(params).then(response => {
          const { errno, data, message } = response.data
          if (errno === 0) {
            resolve({ hasError: false, data: data })
          }
          resolve({ hasError: true, data: null, error: message });
        }).catch(error => {
          resolve({ hasError: true, data: null, error });
        })
      })
    },
    getWithdrawInfo({ commit }, params) {
      return new Promise((resolve, reject) => {
        getWithdrawInfo(params).then(response => {
          const { errno, data, message } = response.data
          if (errno === 0) {
            resolve({ hasError: false, data: data })
          }
          resolve({ hasError: true, data: null, error: message });
        }).catch(error => {
          resolve({ hasError: true, data: null, error });
        })
      })
    },
    updateAccountNonce({ commit }, params) {
      return new Promise((resolve, reject) => {
        updateAccountNonce(params).then(response => {
          const { errno, data, message } = response.data
          if (errno === 0) {
            resolve({ hasError: false, data: data })
          }
          resolve({ hasError: true, data: null, error: message });
        }).catch(error => {
          resolve({ hasError: true, data: null, error });
        })
      })
    },
    getAccountNonce({ commit }, params) {
      return new Promise((resolve, reject) => {
        getAccountNonce(params).then(response => {
          const { errno, data, message } = response.data
          if (errno === 0) {
            resolve({ hasError: false, data: data })
          }
          resolve({ hasError: true, data: null, error: message });
        }).catch(error => {
          resolve({ hasError: true, data: null, error });
        })
      })
    },
    getWithdrawList({ commit }, params) {
      return new Promise((resolve, reject) => {
        getWithdrawList(params).then(response => {
          const { errno, data, message } = response.data
          if (errno === 0) {
            resolve({ hasError: false, data: data })
          }
          resolve({ hasError: true, data: null, error: message });
        }).catch(error => {
          resolve({ hasError: true, data: null, error });
        })
      })
    },
    updateWithdrawStatus({ commit }, params) {
      return new Promise((resolve, reject) => {
        updateWithdrawStatus(params).then(response => {
          const { errno, data, message } = response.data
          if (errno === 0) {
            resolve({ hasError: false, data: data })
          }
          resolve({ hasError: true, data: null, error: message });
        }).catch(error => {
          resolve({ hasError: true, data: null, error });
        })
      })
    },
  }
}

export default stealthAddress
