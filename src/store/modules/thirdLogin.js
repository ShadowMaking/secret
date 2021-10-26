import { googleLogin } from '@/api/thirdLogin'
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
  }
}

export default thirdLogin
