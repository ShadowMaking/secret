import web3 from 'web3';
const defaultNetWorkForMetamask = [1, 3, 4, 5, 42]
const CHAINIDMAP  = {
  ETHEREUM: web3.utils.numberToHex(1),
  ROPSTEN: web3.utils.numberToHex(3),
  RINKEBY: web3.utils.numberToHex(4),
  GOERLI: web3.utils.numberToHex(5),
  KOVAN: web3.utils.numberToHex(42),

  ARBITRUM: web3.utils.numberToHex(42161),
  SECRETL1: web3.utils.numberToHex(44010),
  SECRETL2: web3.utils.numberToHex(189250287905350),
}

const NETWORKSFORTOKEN = [
  {
    id: 1,
    chainId: CHAINIDMAP['ETHEREUM'],
    chainName: "Ethereum",
    // rpcUrls: [ 'https://mainnet.infura.io/v3/9aa3d95b3bc440fa88ea12eaa4456161' ],
    // blockExplorerUrls: ["https://etherscan.io"]
    leftTitle: 'Ethereum',
    icon: 'https://zapper.fi/images/networks/ethereum-icon.png',
  }, {
    id: 3,
    chainId: CHAINIDMAP['ROPSTEN'],
    chainName: "Ropsten",
    // rpcUrls: [ 'https://ropsten.infura.io/v3/9aa3d95b3bc440fa88ea12eaa4456161' ],
    // blockExplorerUrls: ["https://ropsten.etherscan.io"],
    leftTitle: 'Ropsten',
    icon: '',
  }, {
    id: 4,
    chainId: CHAINIDMAP['RINKEBY'],
    chainName: "Rinkeby",
    // rpcUrls: [ 'https://rinkeby.infura.io/v3/9aa3d95b3bc440fa88ea12eaa4456161' ],
    // blockExplorerUrls: ["https://rinkeby.etherscan.io"],
    leftTitle: 'Rinkeby',
    icon: '',
  }, {
    id: 5,
    chainId: CHAINIDMAP['GOERLI'],
    chainName: "Goerli",
    // rpcUrls: [ 'https://goerli.infura.io/v3/9aa3d95b3bc440fa88ea12eaa4456161' ],
    // blockExplorerUrls: ["https://goerli.etherscan.io"],
    leftTitle: 'Goerli',
    icon: '',
  }, {
    id: 42,
    chainId: CHAINIDMAP['KOVAN'],
    chainName: "Kovan",
    // rpcUrls: [ 'https://kovan.infura.io/v3/9aa3d95b3bc440fa88ea12eaa4456161' ],
    // blockExplorerUrls: ["https://kovan.etherscan.io"],
    leftTitle: 'Kovan',
    icon: '',
  }, {
    id: 42161,
    chainId: CHAINIDMAP['ARBITRUM'],
    chainName: "Arbitrum",
    rpcUrls: [ 'https://arb1.arbitrum.io/rpc' ],
    blockExplorerUrls: ["https://arbiscan.io"],
    leftTitle: 'Arbitrum',
    icon: 'https://zapper.fi/images/networks/arbitrum-icon.png',
  }, {
    id: 44010,
    chainId: CHAINIDMAP['SECRETL1'],
    chainName: "SecretL1",
    rpcUrls: [ `https://rpc.ieigen.com/eth/` ],
    // blockExplorerUrls: [],
    leftTitle: 'SecretL1',
    icon: require('@/assets/token/tokenImages/defaultToken.png'),
  }, {
    id: 189250287905350,
    chainId: CHAINIDMAP['SECRETL2'],
    chainName: "SecretL2",
    rpcUrls: [ `https://rpc.ieigen.com/eig/` ],
    blockExplorerUrls: ['https://explorer.ieigen.com/'],
    leftTitle: 'SecretL2',
    icon: require('@/assets/token/tokenImages/defaultToken.png'),
  }
]

export { NETWORKSFORTOKEN, defaultNetWorkForMetamask, CHAINIDMAP }
