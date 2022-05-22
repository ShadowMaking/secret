
import { CHAINIDMAP } from '@/utils/netWorkForToken'

// toekn address for network
export const TOKENMAP_NETWORK = {
  // ROPSTEN
  [CHAINIDMAP['ROPSTEN']]: {
    "0xad6d458402f60fd3bd25163575031acdce07538d": {
      "name": "DAI",
      "logo": "DAI.svg",
      "erc20": true,
      "symbol": "DAI",
      "decimals": 18
    },
    "0xc778417e063141139fce010982780140aa0cd5ab": {
      "name": "WETH",
      "logo": "WETH.png",
      "erc20": true,
      "symbol": "WETH",
      "decimals": 18
    },
    "0xb1a6511aC393886074b3DF012F4aa41b55DAc51a": {
      "name": "GT",
      "logo": "EIGEN.png",
      "erc20": true,
      "symbol": "GovernanceToken",
      "decimals": 18,
      // "localAbiJson": "GovernanceToken"
    },
  },
  // Stardust
  [CHAINIDMAP['STARDUST']]: {
    // "0x6E5791aD106fCADfba3115cdC21d1Ad3471D2e13": {
    "0xDeadDeAddeAddEAddeadDEaDDEAdDeaDDeAD0000": {
      "name": "tMetis",
      "logo": "DAI.svg",
      "erc20": true,
      "symbol": "tMetis",
      "decimals": 18,
      "abiTokenAddress": '0x9e32b13ce7f2e80a01932b42553652e053d6ed8e' // use this address to get abi
    },
  },
  // Andromeda
  [CHAINIDMAP['ANDRROMEDA']]: {
    // "0x9e32b13ce7f2e80a01932b42553652e053d6ed8e": {
    "0xDeadDeAddeAddEAddeadDEaDDEAdDeaDDeAD0000": {
      "name": "Metis",
      "logo": "DAI.svg",
      "erc20": true,
      "symbol": "tMetis",
      "decimals": 18,
      "abiTokenAddress": '0x9e32b13ce7f2e80a01932b42553652e053d6ed8e' // use this address to get abi
    },
  },
  // Polygon MATIC
  [CHAINIDMAP['POLYGON']]: {
    "0x8cc8538d60901d19692F5ba22684732Bc28F54A3": {
      "name": "WETH",
      "logo": "DAI.svg",
      "erc20": true,
      "symbol": "WETH",
      "decimals": 18,
      "abiTokenAddress": '0xa45b966996374E9e65ab991C6FE4Bfce3a56DDe8' // use this address to get abi
    },
  },
  // Mumbai
  [CHAINIDMAP['MUMBAI']]: {
    "0x4DfAe612aaCB5b448C12A591cD0879bFa2e51d62": {
      "name": "WETH",
      "logo": "DAI.svg",
      "erc20": true,
      "symbol": "WETH",
      "decimals": 18,
      "abiTokenAddress": '0xa45b966996374E9e65ab991C6FE4Bfce3a56DDe8' // use this address to get abi
    },
  },
  // Binance Smart Chain MATIC
  // [CHAINIDMAP['BSC']]: {
  //   "0x6cd2Bf22B3CeaDfF6B8C226487265d81164396C5": {
  //     "name": "USDT",
  //     "logo": "DAI.svg",
  //     "erc20": true,
  //     "symbol": "USDT",
  //     "decimals": 18,
  //     "abiTokenAddress": '0xdAC17F958D2ee523a2206206994597C13D831ec7' // use this address to get abi
  //   },
  // },
  // BSC Testnet
  [CHAINIDMAP['BSCTEST']]: {
    "0x6cd2Bf22B3CeaDfF6B8C226487265d81164396C5": {
      "name": "USDT",
      "logo": "DAI.svg",
      "erc20": true,
      "symbol": "USDT",
      "decimals": 18,
      "abiTokenAddress": '0xdAC17F958D2ee523a2206206994597C13D831ec7' // use this address to get abi
    },
  },
}


