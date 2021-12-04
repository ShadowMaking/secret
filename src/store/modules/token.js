import _ from 'lodash'
import { utils, ethers } from 'ethers'
import web3 from 'web3';
import { BigNumber } from "bignumber.js";
import { saveUserAllowanceForToken, getUserAllowanceForToken } from '@/api/token';
import { TOKEN_L1, TOKEN_L2, getAvailableTokenAssets } from '@/utils/token';
import { ajaxGetRequestByEtherscan } from '@/utils/index'
import TOKENLISTJSON from '@/assets/token/tokenList.json'

// For SecretL1 Test
import DEFAULTTOKENABIJSONForL1 from '@/assets/token/defaultTokenForL1.json'
import DEFAULTTOKENLISTForL1 from '@/assets/token/tokenListDefaultForL1.json'

// For Ropsten Test
import DEFAULTTOKENLISTForRopsten from '@/assets/token/Ropsten/tokenList.json'
import DAIABIJSONFORROPSTEN from '@/assets/token/Ropsten/ABIJSON/IERC20.json'
// import WETHABIJSONFORROPSTEN from '@/assets/token/Ropsten/ABIJSON/IWETH.json'
import WETHABIJSONFORROPSTEN from '@/assets/token/Ropsten/ABIJSON/WETH9.json'

import TOKENLISTJSONTest from '@/assets/token/tokenList_test.json'
import { CHAINIDMAP } from '@/utils/netWorkForToken'
import { transTickerObject } from '@/utils/ccxt';


const token = {
  state: {
    // tokenList: null,
  },

  mutations: {
    SET_TOKEN_LIST: (state, list) => {
      state.tokenList = list;
    },
  },
  actions: {
    GetTokenByNetType({ commit }, params) {
      return new Promise((resolve, reject) => {
        const netType = params.netType
        const tokenList = netType === 'l1' ? TOKEN_L1 : TOKEN_L2
        resolve({ tokenList })
      })
    },
    SearchToken({ commit }, params) {
      return new Promise((resolve, reject) => {
        const netType = params.netType
        const tokenList = [].concat([{symbol:'ETH'}], netType === 'l1' ? TOKEN_L1 : TOKEN_L2)
        const list = _.filter(tokenList, (item, index, arr) => {
          const listSet = new Set([item['symbol'].toLowerCase()])
          const targetTokenSet = new Set([params.token.toLowerCase()])
          const intersectionSet = new Set([...listSet].filter(x => targetTokenSet.has(x)));
          return item['symbol'].toLowerCase().indexOf(params.token.toLowerCase()) > -1
        }) || []
        resolve(list)
      })
    },
    SaveUserAllowanceForToken({ commit }, params) {
      return new Promise((resolve, reject) => {
        saveUserAllowanceForToken(params).then(response => {
          const { errno, data, message } = response.data
          if (errno === 0) {
            resolve({ hasError: false, message})
          } else {
            resolve({ hasError: true, error: message });
          }
        }).catch(error => {
          resolve({ hasError: true, error });
        })
      })
    },
    GetUserAllowanceForToken({ commit }, params) {
      return new Promise((resolve, reject) => {
        getUserAllowanceForToken(params).then(response => {
          const { errno, data, message } = response.data
          const isApprove = data && data.approve
          if (errno === 0 && isApprove) {
            resolve({ hasError: false, isApprove: true })
          } else {
            resolve({ hasError: true, isApprove: false, error: message });
          }
        }).catch(error => {
          resolve({ hasError: true, isApprove: false, error });
        })
      })
    },
    /***************************** send ***************************/
    // TODO need interface from afterEnd
    /* GetAvailableTokenAssets({ commit }, params) {
      return new Promise((resolve, reject) => {
        getAvailableTokenAssets(params).then(response => {
          const list = response.data||[];
          resolve({ hasError: false, list })
        }).catch(error => {
          resolve({ hasError: true });
        })
      })
    }, */
    // TODO
    GetAllTokenList({ commit }, params) {
      return new Promise((resolve, reject) => {
        const tokenListJson = _.cloneDeep(TOKENLISTJSONTest)
        const tokenList = Object.keys(tokenListJson).map(tokenAddress => {
          const { name, logo, erc20, symbol, decimals } = tokenListJson[tokenAddress]
          return {
            id: name,
            tokenName: name,
            tokenAddress,
            erc20, symbol, decimals,
            icon: `@/assets/token/tokenImages/${logo}` // TODO
          }
        })
        resolve({ hasError: false,  list: tokenList })
      })
    },
    GetAvailableTokenAssets({ commit, ...store }, params) {
      return new Promise(async (resolve, reject) => {
        let chainID = window.ethereum.chainId
        params.chainInfo && (chainID = params.chainInfo.chainId)
        
        let tokenList = []
        switch(chainID) {
          case CHAINIDMAP['SECRETL1']:
            tokenList = Object.keys(DEFAULTTOKENLISTForL1).map(tokenAddress => {
              const { name, logo, erc20, symbol, decimals } = DEFAULTTOKENLISTForL1[tokenAddress]
              return {
                id: name,
                tokenName: name,
                tokenAddress,
                erc20, symbol, decimals,
                icon: `@/assets/token/tokenImages/${logo}`, // TODO
                abiJson: DEFAULTTOKENABIJSONForL1.abi
              }
            })
            break;
          case CHAINIDMAP['ROPSTEN']:
            const tokenAddressList = Object.keys(DEFAULTTOKENLISTForRopsten)
            const _tokenList = []
            for(let i = 0; i<tokenAddressList.length; i+=1) {
              const tokenAddress = tokenAddressList[i]
              const { name, logo, erc20, symbol, decimals } = DEFAULTTOKENLISTForRopsten[tokenAddress]
              const { hasError, data } = await store.dispatch('GetTokenABIByTokenAddress', { tokenAddress })
              _tokenList.push({
                id: name,
                tokenName: name,
                tokenAddress,
                erc20, symbol, decimals,
                icon: `@/assets/token/tokenImages/${logo}`, // TODO
                abiJson: data
              })
            }
            tokenList = [].concat(_tokenList)
            break;
          default:
            const { hasError, list } = await store.dispatch('GetAllTokenList')
            tokenList =  [].concat(list)
            break
        }
        // const list = [{id: 'Zks',tokenName: 'Zks',tokenAddress: '0xe4815AE53B124e7263F08dcDBBB757d41Ed658c6'},{id: 'BitBase',tokenName: 'BitBase',tokenAddress: '0x32E6C34Cd57087aBBD59B5A4AECC4cB495924356'}]
        resolve({ hasError: false,  list: tokenList })
      })
    },
    GetTokenABIByTokenAddress({ commit }, params) {
      const tokenAddress = params.tokenAddress
      const data = {
        module: 'contract',
        action: 'getabi',
        address: tokenAddress,
      }
      return new Promise((resolve, reject) => {
        ajaxGetRequestByEtherscan({ method: 'get', data })
        .then(res=>{
          const abi = res['data'] && window.JSON.parse(res['data'])
          resolve({ hasError: false, data: abi })
        })
        .catch(error=>{
          resolve({ hasError: false, data: null })
        })
      })
    },
    GetTokenBalanceByContract({ commit }, params) {
      return new Promise((resolve, reject) => {
        const { tokenAddress, abi, accountAddress } = params
        if (!abi) {
          resolve({ hasError: true, data: 0, balanceFormatString: 0 })
          return
        }
        const metamaskProvider = new ethers.providers.Web3Provider(window.ethereum);
        const signer = metamaskProvider.getSigner(0);
        const myContract = new ethers.Contract(tokenAddress, abi, signer)
        if(!myContract.balanceOf) {
          resolve({ hasError: true, data: 0, balanceFormatString: 0 })
          return
        }
        myContract.balanceOf(accountAddress)
          .then(async res => {
            const decimals = await myContract.decimals()
            const decimalsNumber = BigNumber(10).pow(web3.utils.isBigNumber(decimals)?decimals.toNumber():decimals) // .toNumber() 1000000000000000000
            const balanceNumber = BigNumber(Number(web3.utils.hexToNumberString(res)))
            
            const balanceFormatString = balanceNumber.div(decimalsNumber).toFixed(4,1)
            resolve({
              hasError: false,
              data: res,
              balanceFormatString
            })
          })
          .catch(error => {
            resolve({
              hasError: false,
              data: 0,
              balanceFormatString: 0
            })
          })
      })
    },
    GetTokenBalanceByEtherscan({ commit }, params) {
      const { tokenAddress, accountAddress } = params
      const data = {
        module: 'account',
        action: 'tokenbalance',
        contractaddress: tokenAddress,
        address: accountAddress,
        tag: 'latest'
      }
      return new Promise((resolve, reject) => {
        ajaxGetRequestByEtherscan({ method: 'get', data })
        .then(res=>{
          const decimals = 18 // The result is returned in the token's smallest decimal representation.
          const decimalsNUmberStr = BigNumber(10).pow(decimals).toString() // .toNumber() 1000000000000000000
          const balanceHex = web3.utils.numberToHex(res.data)
          const balance = BigNumber(res.data).div(decimalsNUmberStr)
          resolve({ hasError: false, data: balanceHex, balanceFormatString: balance })
        })
        .catch(error=>{
          resolve({ hasError: false, data: 0, balanceFormatString: 0 })
        })
      })
    },
    GetTokenAxchangeForUS({ commit }, params) {
      return new Promise(async (resolve, reject) => {
        const { changeType } = params
        const fetchTicker = await transTickerObject(changeType)
        if (fetchTicker) {
          const forUsdt = fetchTicker.close;
          const percentage = fetchTicker.percentage;
          const change = fetchTicker.change;
          resolve({ hasError: false, forUsdt, percentage, change })
        }
        resolve({ hasError: true, forUsdt: 0 })
      })
    },
    GetGasPriceConfirmationTimeByEtherscan({ commit }, params) {
      const { gasprice } = params
      const data = {
        module: 'gastracker',
        action: 'gasestimate',
        gasprice,
      }
      return new Promise((resolve, reject) => {
        ajaxGetRequestByEtherscan({ method: 'get', data })
        .then(res=>{
          resolve({ hasError: false, data: res.data })
        })
        .catch(error=>{
          resolve({ hasError: false, data: '~~' })
        })
      })
    },
    GetGasPriceByEtherscan({ commit, ...store }, params) {
      const data = {
        module: 'gastracker',
        action: 'gasoracle',
      }
      return new Promise((resolve, reject) => {
        ajaxGetRequestByEtherscan({ method: 'get', data })
        .then(async res=>{
          const list  = {}
          if (res.data) {
            const fastGasPrice = res.data['FastGasPrice']  // GWEI
            const getFastTime = await store.dispatch('GetGasPriceConfirmationTimeByEtherscan', { gasprice: fastGasPrice })
            const averageGasPrice = res.data['ProposeGasPrice']  // GWEI
            const getAverageTime = await store.dispatch('GetGasPriceConfirmationTimeByEtherscan', { gasprice: averageGasPrice })
            list['Fast'] = { gasPrice: fastGasPrice, confirmationTime: getFastTime.data }
            list['Average'] = { gasPrice: averageGasPrice, confirmationTime: getAverageTime.data }
          }
          resolve({ hasError: false, data: list })
        })
        .catch(error=>{
          resolve({ hasError: false, data: null })
        })
      })
    },
    GetNormalTransByEtherscan({ commit }, params) {
      const { address } = params
      const data = {
        module: 'account',
        action: 'txlist',
        startblock: '0',
        endblock: '99999999',
        page: '1',
        offset: '100',
        sort: 'asc',
        address,
      }
      return new Promise((resolve, reject) => {
        ajaxGetRequestByEtherscan({ method: 'get', data })
        .then(res=>{
          resolve({ hasError: false, data: res.data })
        })
        .catch(error=>{
          resolve({ hasError: false, data: '~~' })
        })
      })
    },
    GetBalanceBytagByEtherscan({ commit }, params) {
      const { address,tag } = params
      const data = {
        module: 'account',
        action: 'balance',
        tag,
        address,
      }
      return new Promise((resolve, reject) => {
        ajaxGetRequestByEtherscan({ method: 'get', data })
        .then(res=>{
          resolve({ hasError: false, data: res.data })
        })
        .catch(error=>{
          resolve({ hasError: false, data: '~~' })
        })
      })
    },
  }
}

export default token