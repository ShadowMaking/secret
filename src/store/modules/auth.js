import { saveToStorage, getFromStorage, removeFromStorage } from '@/utils/storage';

const auth = {
  state: {
    loginAccountAddress: '',
    walletIsLock: true,
    walletInfo: null,
    walletAccounts: [],
  },

  mutations: {
    SET_LOGIN_ADDRESS: (state, address) => {
      state.loginAccountAddress = address;
    },
    SET_WALLET_STATUS: (state, lockStatus) => {
      state.walletIsLock = lockStatus;
    },
    SET_WALLET_INFO: (state, walletInfo) => {
      state.walletInfo = walletInfo;
    },
    SET_WALLET_ACCOUNT: (state, accounts) => {
      state.walletAccounts = accounts.accounts;
    },
  },

  actions: {
    login({ commit }, accountInfo) {
      return new Promise(resolve => {
        commit('SET_LOGIN_ADDRESS', accountInfo.address)
        const loginInfo = {
          login: true,
          address: accountInfo.address
        }
        saveToStorage({'loginInfo': window.JSON.stringify(loginInfo)})
        resolve()
      })
    },
    logout({ commit }) {
      return new Promise(resolve => {
        commit('SET_LOGIN_ADDRESS', '')
        removeFromStorage(['loginInfo'])
        resolve()
      })
    },
    // 存储钱包信息
    storeWalletInfo({ commit }, walletInfo) {
      return new Promise(resolve => {
        commit('SET_WALLET_INFO', {...walletInfo.walletInfo})
        saveToStorage({ 'walletInfo': window.JSON.stringify(Object.assign({}, {...walletInfo.walletInfo})) });
        resolve()
      })
    },
    // 存储账户信息
    storeWalletAccount({ commit }, accounts) {
      return new Promise(resolve => {
        commit('SET_WALLET_ACCOUNT', {accounts});
        const list = getFromStorage('walletAccounts')
        let accoutArr = [].concat(accounts.accounts);
        if (list) {
          accoutArr = [].concat(window.JSON.parse(list), accoutArr);
        }
        saveToStorage({ 'walletAccounts': window.JSON.stringify(accoutArr) });
        resolve()
      })
    },
    // 钱包解锁状态
    updateWalletLockStatus({ commit }, walletStatus) {
      return new Promise(resolve => {
        const  walletInfo = window.JSON.parse(getFromStorage('walletInfo'));
        walletInfo['isLock'] = walletStatus.walletIsLock;
        removeFromStorage(['walletInfo'])
        saveToStorage({ 'walletInfo': window.JSON.stringify(Object.assign({}, walletInfo)) });
        commit('SET_WALLET_STATUS', walletStatus.walletIsLock)
        resolve()
      })
    },
  }
}

export default auth
