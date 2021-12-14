import _ from 'lodash'
import { utils, ethers } from 'ethers'
import web3 from 'web3';
import { BigNumber } from "bignumber.js";
import { saveUserAllowanceForToken, getUserAllowanceForToken,
  encryptPrivateKey, decryptPrivateKey,uploadEncrpytKey,downloadEncrpytKey, } from '@/api/token';
import { TOKEN_L1, TOKEN_L2, getAvailableTokenAssets } from '@/utils/token';
import { ajaxGetRequestByEtherscan } from '@/utils/index'
import { initRPCProvider } from '@/utils/dashBoardTools'
import { saveToStorage, getFromStorage, removeFromStorage, getInfoFromStorageByKey } from '@/utils/storage';

import TOKENLISTJSON from '@/assets/token/tokenList.json'

// For SecretL1 Test
import DEFAULTTOKENABIJSONForL1 from '@/assets/token/defaultTokenForL1.json'
import DEFAULTTOKENLISTForL1 from '@/assets/token/tokenListDefaultForL1.json'

// For Ropsten Test
import DEFAULTTOKENLISTForRopsten from '@/assets/token/Ropsten/tokenList.json'
import DAIABIJSONFORROPSTEN from '@/assets/token/Ropsten/ABIJSON/IERC20.json'
// import WETHABIJSONFORROPSTEN from '@/assets/token/Ropsten/ABIJSON/IWETH.json'
import WETHABIJSONFORROPSTEN from '@/assets/token/Ropsten/ABIJSON/WETH9.json'

// Other Default Token
import DEFAULTTOKENLISTForOther from '@/assets/token/tokenListDefaultForOther.json'

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
          // const isApprove = data && Number(data.allowance)
          const isApprove = data && data.allowance!=="0"
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
    GetAllTokenList({ commit, ...store }, params) {
      return new Promise(async (resolve, reject) => {
        const { hasError, list=[] } = await store.dispatch('GetDefaultTokenListForOther')
        const otherDefaultTokenList = list
        const tokenListJson = _.cloneDeep(TOKENLISTJSONTest)
        const tokenList = Object.keys(tokenListJson).map(tokenAddress => {
          const { name, logo, erc20, symbol, decimals } = tokenListJson[tokenAddress]
          return {
            id: name,
            tokenName: name,
            tokenAddress,
            erc20, symbol, decimals,
            icon: `token/tokenImages/${logo}` // TODO
          }
        })
        resolve({ hasError: false,  list: tokenList.concat(otherDefaultTokenList) })
      })
    },
    GetDefaultTokenListForOther({ commit }, params) {
      return new Promise((resolve, reject) => {
        const otherDefaultTokenList = Object.keys(DEFAULTTOKENLISTForOther).map(tokenAddress => {
          const { name, logo, erc20, symbol, decimals } = DEFAULTTOKENLISTForOther[tokenAddress]
          return {
            id: name,
            tokenName: name,
            tokenAddress,
            erc20, symbol, decimals,
            icon: `token/tokenImages/${logo}`, // TODO
            abiJson: DEFAULTTOKENABIJSONForL1.abi
          }
        })
        resolve({ hasError: false,  list: otherDefaultTokenList })
      })
    },
    GetAvailableTokenAssets({ commit, ...store }, params) {
      return new Promise(async (resolve, reject) => {
        // let chainID = window.ethereum.chainId
        let chainID = web3.utils.numberToHex('1')
        params.chainInfo && (chainID = web3.utils.numberToHex(params.chainInfo.id))
        let tokenList = []
        const { hasError, list=[] } = await store.dispatch('GetDefaultTokenListForOther')
        const otherDefaultTokenList = list
        console.log(otherDefaultTokenList)
        switch(chainID) {
          case CHAINIDMAP['SECRETL1']:
            tokenList =[].concat(Object.keys(DEFAULTTOKENLISTForL1).map(tokenAddress => {
              const { name, logo, erc20, symbol, decimals } = DEFAULTTOKENLISTForL1[tokenAddress]
              return {
                id: name,
                tokenName: name,
                tokenAddress,
                erc20, symbol, decimals,
                icon: `token/tokenImages/${logo}`, // TODO
                abiJson: DEFAULTTOKENABIJSONForL1.abi
              }
            }), otherDefaultTokenList)
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
                icon: `token/tokenImages/${logo}`, // TODO
                abiJson: data
              })
            }
            tokenList = [].concat(_tokenList, otherDefaultTokenList)
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
    GetTokenBalanceByContract({ commit, ...rootStore }, params) {
      return new Promise(async (resolve, reject) => {
        const { tokenAddress, abi, accountAddress } = params
        if (!abi) {
          resolve({ hasError: true, data: 0, balanceFormatString: '0.0000 '})
          return
        }
        /* const metamaskProvider = new ethers.providers.Web3Provider(window.ethereum);
        const signer = metamaskProvider.getSigner(0); */
        const { data: netInfo } = await rootStore.dispatch('GetSelectedNetwork')
        const url = netInfo['rpcUrls'][0]
        const metamaskProvider = initRPCProvider(url)
        // const signer = metamaskProvider.getSigner(0);
        const signer = metamaskProvider.getSigner(accountAddress);
        /* if (tokenAddress === '0xad6d458402f60fd3bd25163575031acdce07538d') {
        } */
        const myContract = new ethers.Contract(tokenAddress, abi, signer)
        if(!myContract.balanceOf) {
          resolve({ hasError: true, data: 0, balanceFormatString: '0.0000' })
          return
        }
        // accountAddress.toLocaleLowerCase()
        myContract.balanceOf(accountAddress)
          .then(async res => {
            const decimals = await myContract.decimals() // return type is Number(eg. 18) or BigNumber(eg. {_hex: '0x12', _isBigNumber: true})
            const decimalsIsBigNumber = web3.utils.isBigNumber(decimals)||web3.utils.isHexStrict(decimals)||!_.isFinite(decimals)
            const decimalsNumber = BigNumber(10).pow((decimalsIsBigNumber?decimals.toNumber():decimals)) // .toNumber() 1000000000000000000
            const balanceNumber = BigNumber(Number(web3.utils.hexToNumberString(res)))
            const balanceFormatString = balanceNumber.div(decimalsNumber).toFixed(4,1) || 0.0000
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
              balanceFormatString: '0.0000'
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
          const balance = BigNumber(res.data).div(decimalsNUmberStr).toFixed(4,1) || 0.0000
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
        offset: '1000',
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
    StoreSelectedNetwork({ commit }, params) {
      return new Promise((resolve, reject) => {
        const netInfo = params.netInfo;
        if (netInfo) {
          saveToStorage({ netInfo })
          resolve({ hasError: false })
        } else {
          resolve({ hasError: true  })
        }
      })
    },
    GetSelectedNetwork({ commit }, params) {
      return new Promise((resolve, reject) => {
        const netInfo = getInfoFromStorageByKey('netInfo');
        if (netInfo) {
          resolve({ hasError: false, data: netInfo })
        }
        resolve({ hasError: true, data: '' })
      })
    },
    EncryptPrivateKey({ commit }, params) {
      return new Promise((resolve, reject) => {
        encryptPrivateKey(params).then(response => {
          const { data, message, errno } = response.data;
          if (errno === 0) {
            resolve({ hasError: false, data })
          } else {
            resolve({ hasError: true, data: null });
          }
        }).catch(error => {
          resolve({ hasError: true, data: null });
        })
      })
    },
    DecryptPrivateKey({ commit }, params) {
      return new Promise((resolve, reject) => {
        decryptPrivateKey(params).then(response => {
          const { data, message, errno } = response.data;
          if (errno === 0) {
            resolve({ hasError: false, data })
          } else {
            resolve({ hasError: true, data: null });
          }
        }).catch(error => {
          resolve({ hasError: true, data: null });
        })
      })
    },
    UploadEncrpytKey({ commit }, params) {
      return new Promise((resolve, reject) => {
        uploadEncrpytKey(params).then(response => {
          const data = response.data;
          resolve({ hasError: false, data })
        }).catch(error => {
          resolve({ hasError: true, data: null });
        })
      })
    },
    DownloadEncrpytKey({ commit }, params) {
      return new Promise((resolve, reject) => {
        downloadEncrpytKey(params).then(response => {
          const { data, message, errno } = response.data;
          if (errno === 0) {
            resolve({ hasError: false, data })
          } else {
            resolve({ hasError: true, data: null });
          }
        }).catch(error => {
          resolve({ hasError: true, data: null });
        })
      })
    },
  }
}

export default token