
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
  }
}


