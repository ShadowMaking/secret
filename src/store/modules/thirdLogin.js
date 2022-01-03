import {
  googleLogin, 
  getUserBindingInfoForThirdLogin,
} from '@/api/thirdLogin'
import {
  saveToStorage,
  getFromStorage,
  removeFromStorage,
  getInfoFromStorageByKey } from '@/utils/storage';

const thirdLogin = {
  state: {
    // searchList: null,
  },

  mutations: {
    SET_HISTORY_LIST: (state, list) => {
      state.searchList = list;
    },
  },
  actions: {
    GoogleLogin({ commit }, params) {
      return new Promise((resolve, reject) => {
        googleLogin(params).then(response => {
          const loginUrl = response.data;
          // const loginUrl_my = 'https://accounts.google.com/o/oauth2/auth?client_id=1012137303359-sr6326jclcoqula7jsgm0mdnqtchler6.apps.googleusercontent.com&response_type=token&redirect_uri=http://dev-deliver-secret.eigen.com:8090&scope=https%3A%2F%2Fwww.googleapis.com%2Fauth%2Fuserinfo.email+https%3A%2F%2Fwww.googleapis.com%2Fauth%2Fuserinfo.profile'
          // const loginUrl = https://accounts.google.com/o/oauth2/v2/auth/oauthchooseaccount?redirect_uri=https%3A%2F%2Frpc.ieigen.com%2Fapi%2Fauth%2Fgoogle&client_id=413535929013-us3b0rnd2l3uj85c17osktvv7e6o4o3t.apps.googleusercontent.com&access_type=offline&response_type=code&prompt=consent&scope=https%3A%2F%2Fwww.googleapis.com%2Fauth%2Fuserinfo.profile%20https%3A%2F%2Fwww.googleapis.com%2Fauth%2Fuserinfo.email&flowName=GeneralOAuthFlow
          resolve({ hasError: false, url: loginUrl })
        }).catch(error => {
          resolve({ hasError: true,  error });
        })
      })
    },
    // TODO
    GetUserBindingInfoForThirdLogin({ commit }, params) {
      return new Promise((resolve, reject) => {
        getUserBindingInfoForThirdLogin(params).then(response => {
          const isNewUser = false
          const encrpyKey = isNewUser ? 'kjkajdjksjdsd' : ''
          console.log('isNewUser', isNewUser)
          resolve({ hasError: false, token: '2a5c678111c43b169', publicKey: '58bb94c4a', isNewUser, encrpyKey })
        }).catch(error => {
          resolve({ hasError: true,  error });
        })
      })
    },
    StoreGoogleUserId({ commit }, params) {
      return new Promise((resolve, reject) => {
        const userId = params.userId;
        if (userId) {
          saveToStorage({ 'gUID': userId }) // google userID after google auth login
          resolve({ hasError: false })
        } else {
          resolve({ hasError: true  })
        }
      })
    },
    StoreGoogleAuthToken({ commit }, params) {
      return new Promise((resolve, reject) => {
        const authToken = params.authToken;
        if (authToken) {
          saveToStorage({ 'gtoken': authToken })
          resolve({ hasError: false })
        } else {
          resolve({ hasError: true  })
        }
      })
    },
    StoreBindingGoogleUserInfo({ commit }, params) {
      return new Promise((resolve, reject) => {
        const userId = params.userId;
        const { address, encryptPrivateKey } = params
        if (userId) {
          const userMap = {}
          userMap[userId] = {
            address: address,
            encryptPrivateKey
          }
          saveToStorage({ userMap })
          resolve({ hasError: false })
        } else {
          resolve({ hasError: true  })
        }
      })
    },
    GetBindingGoogleUserInfo({ commit }, params) {
      return new Promise((resolve, reject) => {
        const userId = params.userId;
        if (userId) {
          const userData = getInfoFromStorageByKey('userMap');
          resolve({ hasError: false, data: userData && userData[userId] })
        } else {
          resolve({ hasError: true, data: '' })
        }
      })
    },
    StoreBindingGoogleUserInfoList({ commit }, params) {
      return new Promise((resolve, reject) => {
        const userId = params.userId;
        const { address, encryptPrivateKey } = params
        if (userId) {
          const addressListInStorage = getInfoFromStorageByKey('userList') || [];
          const addressTarget = _.find(addressListInStorage, { address })
          if (addressTarget) {
            resolve({ hasError: false })
            return
          }
          const userAddressList = [].concat(addressListInStorage, [{ address, encryptPrivateKey }])
          saveToStorage({ userList: [...new Set(userAddressList)] })
          resolve({ hasError: false })
        } else {
          resolve({ hasError: true  })
        }
      })
    },
    GetBindingGoogleUserInfoList({ commit }, params) {
      return new Promise((resolve, reject) => {
        const userId = params.userId;
        if (userId) {
          const list = getInfoFromStorageByKey('userList');
          resolve({ hasError: false, data: list||[] })
        } else {
          resolve({ hasError: true, data: [] })
        }
      })
    },
  }
}

export default thirdLogin
