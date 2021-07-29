

const metamask = {
  state: {
    metamaskInstall: false,
    accountsArr: [],
    walletIsLock: true,
  },

  mutations: {
    SET_METAMASK_INSTALL: (state, installStatus) => {
      state.metamaskInstall = installStatus;
    },
    SET_WALLET_ACCOUNTS_ADDRESS: (state, accountsArr) => {
      state.accountsArr = accountsArr;
    },
    SET_WALLET_LOCK_STATUS: (state, status) => {
      state.walletIsLock = status;
    },
  },

  actions: {
    // store status for metamask wether install
    MetamaskInstall({ commit }, statusInfo) {
      return new Promise(resolve => {
        commit('SET_METAMASK_INSTALL', statusInfo.metamaskInstall)
        resolve()
      })
    },
    // staore accountsAddress
    WalletAccountsAddress({ commit }, accountsAddressArr) {
      return new Promise(resolve => {
        commit('SET_WALLET_ACCOUNTS_ADDRESS', accountsAddressArr.accounts)
        resolve()
      })
    },
    // wallet status （lock or unlock）
    WalletLockStatus({ commit }, status) {
      return new Promise(resolve => {
        commit('SET_WALLET_LOCK_STATUS', status.isLock)
        resolve()
      })
    },
  }
}

export default metamask
