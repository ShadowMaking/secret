import {
  searchSigner,
  addWallet,
  getWalletList,
  addSigner,
  getSignerList,
  updateSigner,
  deleteSigner, 
  getWalletListAsSign,
  uploadSignmessage,
  updateOwnerAddress,
  getSignMessage,
} from '@/api/ncwallet'


const ncWallet = {
  state: {
    // searchList: null,
  },

  mutations: {
    
  },
  actions: {
    searchSigner({ commit }, params) {
      return new Promise((resolve, reject) => {
        searchSigner(params).then(response => {
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
    addWallet({ commit }, params) {
      return new Promise((resolve, reject) => {
        addWallet(params).then(response => {
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
    getWalletList({ commit }, params) {
      return new Promise((resolve, reject) => {
        getWalletList(params).then(response => {
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
    getWalletListAsSign({ commit }, params) {
      return new Promise((resolve, reject) => {
        getWalletListAsSign(params).then(response => {
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
    addSigner({ commit }, params) {
      return new Promise((resolve, reject) => {
        addSigner(params).then(response => {
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
    getSignerList({ commit }, params) {
      return new Promise((resolve, reject) => {
        getSignerList(params).then(response => {
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
    updateSigner({ commit }, params) {
      return new Promise((resolve, reject) => {
        updateSigner(params).then(response => {
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
    deleteSigner({ commit }, params) {
      return new Promise((resolve, reject) => {
        deleteSigner(params).then(response => {
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
    uploadSignmessage({ commit }, params) {
      return new Promise((resolve, reject) => {
        uploadSignmessage(params).then(response => {
          const { errno, data, message } = response.data
          if (errno === 0) {
            resolve({ hasError: false, totalSignMessage: data })
          }
          resolve({ hasError: true, error: message });
        }).catch(error => {
          resolve({ hasError: true, error });
        })
      })
    },
    updateOwnerAddress({ commit }, params) {
      return new Promise((resolve, reject) => {
        updateOwnerAddress(params).then(response => {
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
    getSignMessage({ commit }, params) {
      return new Promise((resolve, reject) => {
        getSignMessage(params).then(response => {
          const { errno, data, message } = response.data
          if (errno === 0) {
            resolve({ hasError: false, data: data })
          }
          resolve({ hasError: true, error: message });
        }).catch(error => {
          resolve({ hasError: true, error });
        })
      })
    },
  }
}

export default ncWallet
