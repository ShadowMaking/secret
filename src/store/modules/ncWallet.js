import {
  searchSigner,
  addWallet,
  getWalletList,
  getWalletListAsOwner,
  addSigner,
  getSignerList,
  updateSigner,
  deleteSigner, 
  getWalletListAsSign,
  uploadSignmessage,
  updateOwnerAddress,
  getSignMessage,
  updateWalletStatus,
  addMultTx,
  getMultTxInfo,
  getSigerMessages,
  addSignerMultMessages,
  updateTransTx,
  cancelRecoverWallet,
  storeProxyInfo,
  getProxyInfo,
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
    getWalletListAsOwner({ commit }, params) {
      return new Promise((resolve, reject) => {
        getWalletListAsOwner(params).then(response => {
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
    updateWalletStatus({ commit }, params) {
      return new Promise((resolve, reject) => {
        updateWalletStatus(params).then(response => {
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
    cancelRecoverWallet({ commit }, params) {
      return new Promise((resolve, reject) => {
        cancelRecoverWallet(params).then(response => {
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
    addMultTx({ commit }, params) {
      return new Promise((resolve, reject) => {
        addMultTx(params).then(response => {
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
    getMultTxInfo({ commit }, params) {
      return new Promise((resolve, reject) => {
        getMultTxInfo(params).then(response => {
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
    getSigerMessages({ commit }, params) {
      return new Promise((resolve, reject) => {
        getSigerMessages(params).then(response => {
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
    addSignerMultMessages({ commit }, params) {
      return new Promise((resolve, reject) => {
        addSignerMultMessages(params).then(response => {
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
    updateTransTx({ commit }, params) {
      return new Promise((resolve, reject) => {
        updateTransTx(params).then(response => {
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
    storeProxyInfo({ commit }, params) {
      return new Promise((resolve, reject) => {
        storeProxyInfo(params).then(response => {
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
    getProxyInfo({ commit }, params) {
      return new Promise((resolve, reject) => {
        getProxyInfo(params).then(response => {
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
  }
}

export default ncWallet
