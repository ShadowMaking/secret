import Cookies from 'js-cookie';
import { DOMAIN } from '@/utils/global';
import { utils} from 'ethers'
import web3 from 'web3'

let expiresAddTime = 120;   // token will lose efficacy after 120 minutes

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

export const getCookieFromDocument = (key) => {
  const documentCookie = document.cookie
  let str
  if (documentCookie) {
    const cookieList = documentCookie.split(';')
    cookieList.some(item=>{
      if(item.split('=')[0]===key) {
        str = item.split('=')[1]
        return true
      }
    })
    return str
  }
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

// get default accout address
export const getDefaultAddress = (store) => {
  return store.state.metamask.accountsArr[0] || ''
}

export async function getAvailableBalanceByAddress (address, self) {
  const balance = await self.web3.eth.getBalance(address); // wei
  return balance || 0;
}

export const tokenIsExpires = (type='sign') => {
  return true; // if you want to set timeout for sign, you can delete this
  const tokenName = type === 'sign' ? window.TOKEN_NAME : window.TOKEN_NAME_LOCK
  return !!!Cookies.get(tokenName)
}

export const initTokenTime = (type='sign') => {
  const tokenName = type === 'sign' ? window.TOKEN_NAME : window.TOKEN_NAME_LOCK
  let expiresTime = new Date();
  expiresTime.setMinutes(expiresTime.getMinutes() + expiresAddTime)
  const tokenValue = web3.utils.randomHex(32);
  Cookies.set(tokenName, tokenValue, { expires: expiresTime })
}

export const updateLoginTime = (type='sign') => {
  const tokenName = type === 'sign' ? window.TOKEN_NAME : window.TOKEN_NAME_LOCK
	const token = Cookies.get(tokenName);
	if (token) {
		let expiresTime = new Date();
		expiresTime.setMinutes(expiresTime.getMinutes() + expiresAddTime)
    Cookies.set(window.TOKEN_NAME, token, { expires: expiresTime })
	}
}

export const removeTokens = () => {
  Cookies.remove(window.TOKEN_NAME)
  Cookies.remove(window.TOKEN_NAME_LOCK)
}