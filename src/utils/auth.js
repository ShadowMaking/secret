import Cookies from 'js-cookie';
import { DOMAIN } from '@/utils/global';
import { saveToStorage, getFromStorage, removeFromStorage } from '@/utils/storage';
import { utils} from 'ethers'

export const getCookie = (key) => {
  return Cookies.get(key) || Cookies.get(key, {
    domain: DOMAIN,
    path: '/'
  })
}

export const setCookie = (key, data) => {
  // Cookies.set(key, data);
  Cookies.set(key, data, {
    domain: DOMAIN,
    path: '/'
  });
}

// accountInfo = { address:'' }
export const getAccount = () => {
  if (getCookie('account')) {
    const accountInfo = Cookies.getJSON("account")
    return accountInfo
  }
  return null
}


// check install metamask wether or not
export const checkMetamask = () => {
  return new Promise((resolve, reject) => {
    if (typeof window.ethereum !== "undefined") {
      resolve({
        installStatus: window.ethereum.isMetaMask,
        ethereum: window.ethereum
      });
    } else {
      resolve({
        installStatus: false
      })
    }
  })
}

export async function connectMetamask () {
  const awaitFun = await checkMetamask()
  const { installStatus } = awaitFun
  installStatus && awaitFun.ethereum.enable();
}

// 获取默认账户地址，
export const getDefaultAddress = (store) => {
  return store.state.metamask.accountsArr[0] || ''
}

// 根据address获取可用余额
export async function getAvailableBalanceByAddress (address, self) {
  // 其解析值为指定账户地址的余额字符串，以wei为单位
  const balance = await self.web3.eth.getBalance(address);
  return balance || 0;
}
export async function getAvailableBalanceByAddressFromProvider (address, self) { }

// 清除缓存中的钱包等相关信息
export const removeWallet = () => {
  if (getFromStorage('walletInfo')) {
    removeFromStorage(['walletInfo', 'walletAccount']);
  }
}



