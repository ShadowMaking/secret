import { ethers, utilss } from 'ethers'
import web3 from 'web3'
import { BigNumber } from "bignumber.js";
import { defaultNetWorkForMetamask, CHAINMAP } from '@/utils/netWorkForToken';
import { CHAINIDMAP } from '@/utils/netWorkForToken'
import { saveToStorage, getFromStorage, removeFromStorage, getInfoFromStorageByKey } from '@/utils/storage';

/**
 * @description: 
 * @param {*} list
 * @param {*} self
 * @param {*} isDefault Boolean  identification token is deployed on L1
 * @return {*}
 */
export const generateTokenList = async (list, self, isDefault) => {
  // const selectedConnectAddress = window.ethereum.selectedAddress;
  const selectedConnectAddress = getConnectedAddress();
  const GetTokenBalanceMthodName = isDefault ? 'GetTokenBalanceByContract' : 'GetTokenBalanceByEtherscan'
  for(let i=0; i<list.length;i+=1) {
    const tokenAddress = list[i].tokenAddress
    let abi = list[i].abiJson || []
    if (!isDefault || abi.length === 0) {
      const { hasError: abiResError, data } = await self.$store.dispatch('GetTokenABIByTokenAddress', {tokenAddress});
      abi = [].concat(data||[])
    }
    const { hasError: balanceResError, data: balance, balanceFormatString } = await self.$store.dispatch(GetTokenBalanceMthodName, {
      tokenAddress,
      abi,
      accountAddress: selectedConnectAddress
    });
    const changeType = `${list[i]['symbol']}/USDT`
    const {hasError: USResError, forUsdt: exchangeForUS} = await self.$store.dispatch('GetTokenAxchangeForUS', {tokenAddress, changeType});
    list[i]['abiJson'] = _.cloneDeep(abi)
    list[i]['balance'] = balance
    list[i]['balanceNumberString'] = balanceFormatString
    list[i]['exchangeForUS'] = exchangeForUS
    
    list[i]['rightVal'] = `US$${(balanceFormatString*exchangeForUS).toFixed(2)}`
    list[i]['leftTitle'] = list[i].tokenName
    // list[i]['leftDes'] = `${balanceFormatString}${list[i].tokenName} US$${exchangeForUS}`
    list[i]['leftDes'] = `${balanceFormatString} US$${exchangeForUS}`
    // list[i]['icon'] = 'https://s3.amazonaws.com/token-icons/0x6b175474e89094c44da98b954eedeac495271d0f.png'
    list[i]['icon'] = require("@/assets/" + list[i].icon)
  }
  return list
}

export const getDefaultETHAssets = async (self, rpcUrl) => {
  // const selectedConnectAddress = window.ethereum.selectedAddress;
  const selectedConnectAddress = getConnectedAddress()
  // const metamaskProvider = new ethers.providers.Web3Provider(window.ethereum);
  const metamaskProvider = initRPCProvider(rpcUrl);
  const signer = metamaskProvider.getSigner(0);
  const balance = await metamaskProvider.getBalance(selectedConnectAddress);
  const decimalsNumber = BigNumber(10).pow(18) // .toNumber() 1000000000000000000
  const balanceNumber = BigNumber(Number(web3.utils.hexToNumberString(balance)))
  const balanceFormatString = balanceNumber.div(decimalsNumber).toFixed(4,1)
  const { forUsdt } = await self.$store.dispatch('GetTokenAxchangeForUS', {changeType: 'ETH/USDT'});
  const exchangeForUS = forUsdt;
  const ethInfo = {
    id: 'ETH',
    tokenName: 'ETH',
    balance,
    balanceNumberString: balanceFormatString,
    exchangeForUS,

    rightVal: `US$${(balanceFormatString*exchangeForUS).toFixed(2)}`,
    leftTitle: 'ETH',
    // leftDes: `${balanceFormatString}ETH US$${exchangeForUS}`,
    leftDes: `${balanceFormatString} US$${exchangeForUS}`,
    icon: 'https://s3.amazonaws.com/token-icons/eth.png'
  }
  return ethInfo
}

export const metamaskNetworkChange = (data, callback) => {
  const paramsValue = _.cloneDeep(data.value)
  delete paramsValue.leftTitle
  delete paramsValue.id
  delete paramsValue.icon
  const params = [paramsValue];
  let method = 'wallet_addEthereumChain'
  if (defaultNetWorkForMetamask.includes(web3.utils.hexToNumber(paramsValue.chainId))) {
    method = 'wallet_switchEthereumChain'
    delete paramsValue.chainName
  }
  ethereum.request({
    jsonrpc: "2.0",
    method: method,
    params,
    id: 0
  })
  .then(res=>{
    callback && callback()
  })
  .catch(err=>{callback && callback(err)})
}

export const getEtherscanAPIBaseUrl = () => {
  let etherscanAPIBaseUrl = `https://api.etherscan.io`
  // const chainId = window.ethereum && window.ethereum.chainId
  const connectedNetInfo = getConnectedNet()
  const chainId = web3.utils.numberToHex(connectedNetInfo.id)
  if (chainId) {
    switch(chainId) {
      case CHAINIDMAP['ETHEREUM']:
        etherscanAPIBaseUrl = `https://api.etherscan.io`
        break;
      case CHAINIDMAP['GOERLI']:
        etherscanAPIBaseUrl = `https://api-goerli.etherscan.io`
        break
      case CHAINIDMAP['RINKEBY']:
        etherscanAPIBaseUrl = `https://api-goerli.etherscan.io`
        break
      case CHAINIDMAP['KOVAN']:
        etherscanAPIBaseUrl = `https://api-kovan.etherscan.io`
        break
      case CHAINIDMAP['ROPSTEN']:
        etherscanAPIBaseUrl = `https://api-ropsten.etherscan.io`
        break
    }
  }
  return etherscanAPIBaseUrl
}

export const getDefaultETH = async (self) => { // TODO
  // const selectedConnectAddress = window.ethereum.selectedAddress;
  const selectedConnectAddress = getConnectedAddress();
  const metamaskProvider = new ethers.providers.Web3Provider(window.ethereum);
  const balance = await metamaskProvider.getBalance(selectedConnectAddress);
  return ethers.utils.formatEther(balance)
}

export const getContractWallet = async (self) => {
  const network = getConnectedNet()
  const rpcUrl = network['rpcUrls'][0]
  const provider = initRPCProvider(rpcUrl)
  const userId = getInfoFromStorageByKey('gUID')
  const { data: userInfo } = await self.$store.dispatch('GetBindingGoogleUserInfo', {userId})
  const encryptKey = userInfo.encryptPrivateKey
  const decryptInfo = await self.$store.dispatch('DecryptPrivateKey', {userId, encryptKey })
  const { hasError, data: privateKey } = decryptInfo

  const wallet = new ethers.Wallet(privateKey, provider);
  return wallet
}

export const getContractAt = async ({ tokenAddress, abi }, self) => {
  const contractWallet = await getContractWallet(self)
  let contractWithSigner = new ethers.Contract(tokenAddress, abi, contractWallet)
  await contractWithSigner.attach(tokenAddress)
  console.log("Contract: ", contractWithSigner.address);
  return contractWithSigner
}

export const getConnectedAddress = (byMetamask=false) => {
  if (byMetamask) {
    return window.ethereum && window.ethereum.selectedAddress
  }
  const userId = getFromStorage('gUID')
  if (userId) {
    const userMap = getInfoFromStorageByKey('userMap');
    const userData = userMap[userId]
    return userData['address']
  }
  return ''
}

export const getConnectedNet = (byMetamask=false) => {
  const chainInfo = getInfoFromStorageByKey('netInfo')
  const numberChainId = chainInfo && chainInfo['id']
  let chainId = numberChainId && web3.utils.numberToHex(numberChainId)
  if (byMetamask) {
    chainId = window.ethereum && window.ethereum.chainId
  }
  return CHAINMAP[chainId]
}

export const initWeb3Provider = (rpcUrl) => {
  const provider = new web3.providers.HttpProvider(rpcUrl);
  const web3Provider = new web3(provider);
  return web3Provider;
}

export const initRPCProvider = (rpcUrl) => {
  return  new ethers.providers.JsonRpcProvider(rpcUrl);
}

export const isLogin = () => {
  const userId = getFromStorage('gUID')
  if (!userId) {
    // Toast('Need Login')
    return false
  }
  return true
}

// DATA fro Transaction
// params is Array
export const getDATACode = (abi, functionName, params) => {
  const iface = new ethers.utils.Interface(abi);
  const datacode = iface.encodeFunctionData(`${functionName}`, params)
  return datacode
}
