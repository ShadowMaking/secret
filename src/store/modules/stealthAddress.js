import {
  addStealth,
  getStealthList,
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
  }
}

export default stealthAddress
