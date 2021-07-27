import Cookies from 'js-cookie';
import { DOMAIN } from '@/utils/global';

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
      reject({
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

