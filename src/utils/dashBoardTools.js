import { ethers, utilss } from 'ethers'
import web3 from 'web3'
import { BigNumber } from "bignumber.js";
import { defaultNetWorkForMetamask } from '@/utils/netWorkForToken';

/**
 * @description: 
 * @param {*} list
 * @param {*} self
 * @param {*} isDefault Boolean  identification token is deployed on L1
 * @return {*}
 */
export const generateTokenList = async (list, self, isDefault) => {
  const selectedConnectAddress = window.ethereum.selectedAddress;
  const GetTokenBalanceMthodName = isDefault ? 'GetTokenBalanceByContract' : 'GetTokenBalanceByEtherscan'
  for(let i=0; i<list.length;i+=1) {
    const tokenAddress = list[i].tokenAddress
    let abi = list[i].abiJson || []
    if (!isDefault) {
      const { hasError: abiResError, data } = await self.$store.dispatch('GetTokenABIByTokenAddress', {tokenAddress});
      abi = [].concat(data)
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
    list[i]['icon'] = list[i].icon
  }
  return list
}

export const getDefaultETHAssets = async (self) => {
  const selectedConnectAddress = window.ethereum.selectedAddress;
  const metamaskProvider = new ethers.providers.Web3Provider(window.ethereum);
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

