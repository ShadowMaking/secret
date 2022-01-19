import { ethers, utils } from 'ethers'
import web3 from 'web3'
import { BigNumber } from "bignumber.js";
import { defaultNetWorkForMetamask, CHAINMAP } from '@/utils/netWorkForToken';
import { CHAINIDMAP } from '@/utils/netWorkForToken'
import { saveToStorage, getFromStorage, removeFromStorage, getInfoFromStorageByKey } from '@/utils/storage';
import { getCurrentProvider } from '@/utils/web3';
import { TRANSACTION_TYPE } from '@/api/transaction';
/**
 * @description: 
 * @param {*} list
 * @param {*} self
 * @param {*} isDefault Boolean  identification token is deployed on L1
 * @return {*}
 */
export const generateTokenList = async (list, self, isDefault, connectAddress) => {
  // const selectedConnectAddress = window.ethereum.selectedAddress;
  const selectedConnectAddress = connectAddress ? connectAddress : getConnectedAddress();
  const GetTokenBalanceMthodName = isDefault || isDefault===undefined ? 'GetTokenBalanceByContract' : 'GetTokenBalanceByEtherscan'
  for(let i=0; i<list.length;i+=1) {
    const tokenAddress = list[i].tokenAddress
    let abiTokenAddress;
    if (list[i]['abiTokenAddress']) {
      abiTokenAddress = list[i]['abiTokenAddress']
    }

    let abi = list[i].abiJson || []
    if (!isDefault || abi.length === 0) {
      const { hasError: abiResError, data } = await self.$store.dispatch('GetTokenABIByTokenAddress', {tokenAddress: abiTokenAddress?abiTokenAddress:tokenAddress});
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

export const getDefaultETHAssets = async (self, rpcUrl, accountAddress) => {
  // const selectedConnectAddress = window.ethereum.selectedAddress;
  const selectedConnectAddress = accountAddress ? accountAddress : getConnectedAddress()
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
        etherscanAPIBaseUrl = `https://api-rinkeby.etherscan.io`
        break
      case CHAINIDMAP['KOVAN']:
        etherscanAPIBaseUrl = `https://api-kovan.etherscan.io`
        break
      case CHAINIDMAP['ROPSTEN']:
        etherscanAPIBaseUrl = `https://api-ropsten.etherscan.io`
        break
      case CHAINIDMAP['STARDUST']:
        // etherscanAPIBaseUrl = `https://stardust-explorer.metis.io/api`
        // etherscanAPIBaseUrl = `https://api-rinkeby.etherscan.io`
        etherscanAPIBaseUrl = `https://api.etherscan.io` // because contract source code not verified in Rinkeby
        break
      default:
        etherscanAPIBaseUrl = `https://api.etherscan.io`
        break;
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

export const getDecryptPrivateKeyFromStore = async (self) => {
  const userId = getInfoFromStorageByKey('gUID')
  const { data: userInfo } = await self.$store.dispatch('GetBindingGoogleUserInfo', {userId})
  const encryptKey = userInfo.encryptPrivateKey
  const address  = userInfo.address
  const decryptInfo = await self.$store.dispatch('GetDecryptPrivateKeyFromStore', {userId, address, encryptKey })
  const { hasError,  data: privateKey } = decryptInfo
  if (hasError || !privateKey) {  // TODO need get decrpyt privateKey by address
    self.$eventBus.$emit('hasNoPrivateKey')
    return null
  }
  return privateKey
}

export const getEncryptKeyByAddressFromStore = async (address, self) => {
  const userId = getInfoFromStorageByKey('gUID')
  const { data } = await self.$store.dispatch('GetBindingGoogleUserInfoList', {userId})
  const target = _.find(data, (item) => item.address.toLocaleLowerCase() === address.toLocaleLowerCase())
  if (target) {
    return target.encryptPrivateKey
  }
  return ''
}

export const getContractWallet = async (self) => {
  const network = getConnectedNet()
  const rpcUrl = network['rpcUrls'][0]
  const provider = initRPCProvider(rpcUrl)
  const privateKey = await getDecryptPrivateKeyFromStore(self)
  if (privateKey) {
    const wallet = new ethers.Wallet(privateKey, provider);
    return wallet
  }
  return null

  
}

export const getContractAt = async ({ tokenAddress, abi }, self) => {
  const contractWallet = await getContractWallet(self)
  if (!contractWallet) { return null }
  let contractWithSigner = new ethers.Contract(tokenAddress, abi, contractWallet)
  await contractWithSigner.attach(tokenAddress)
  console.log("Contract: ", contractWithSigner.address);
  return contractWithSigner
}

export const getConnectedAddress = (byMetamask=false) => {
  if (byMetamask) {
    return window.ethereum && window.ethereum.selectedAddress.toLocaleLowerCase()
  }
  const userId = getFromStorage('gUID')
  if (userId) {
    const userMap = getInfoFromStorageByKey('userMap');
    const userData = userMap && userMap[userId]
    return userData && userData['address'].toLocaleLowerCase() || ''
  }
  return ''
}

export const getConnectedNet = (byMetamask=false) => {
  const chainInfo = getInfoFromStorageByKey('netInfo')
  const numberChainId = chainInfo && chainInfo['id'] || 1
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
// params is Array or Object
export const getDATACode = (abi, functionName, params) => {
  const iface = new ethers.utils.Interface(abi);
  let paramsForFunctionName = Array.isArray(params) ? params : Object.values(params)
  // paramsForFunctionName is params to execute functionName
  const datacode = iface.encodeFunctionData(`${functionName}`, paramsForFunctionName)
  return datacode || '0x'
}

//get ENS or address
export async function getEns(address) {
  return new Promise((resolve, reject) => {
    const currentProvider = getCurrentProvider()
    if (currentProvider) {
      currentProvider.lookupAddress(address)
      .then(res=>{
        if (res) {
          resolve(res)
        } else {
          resolve(address)
        }
        
      })
      .catch(error => {
        resolve(address)
      })
    } else {
      resolve(address)
    }
  })
}

//get address banlance
export function getBalanceByAddress(address) {
  return new Promise((resolve, reject) => {
    const currentProvider = getCurrentProvider()
    console.log(currentProvider)
    if (currentProvider) {
      currentProvider.getBalance(address)
      .then(res=>{
        if (res) {
          console.log(res)
          let etherString = ethers.utils.formatEther(res);
          resolve(etherString)
        } else {
          resolve(null)
        }
        
      })
      .catch(error => {
        resolve(null)
      })
    } else {
      resolve(null)
    }
  })
}

export const addTransHistory = async (txInfo, taransType, self, value, name) => {
  const currentChainInfo = getConnectedNet()
  const chainId = currentChainInfo && currentChainInfo['id']
  const submitData = {
    txid: txInfo.hash,
    from: txInfo.from,
    to: (txInfo.to).toLocaleLowerCase(),
    type: TRANSACTION_TYPE['L2ToL2'],
    status: 0,//0-tobeconfirm 1-success 2-confirming -1-fail
    value: value ? value : 0,
    operation: taransType,
    network_id: chainId,
    name: name ? name: null
  }
  const res = await self.$store.dispatch('AddTransactionHistory', {...submitData});
  if (res.hasError) {
    console.log('Transaction success，but error when add history')
  } else  {
    self.$eventBus.$emit('addTransactionHistory')
    console.log('add history success')
  }
}