import web3 from 'web3';
const defaultNetWorkForMetamask = [1, 3]

const NETWORKSFORTOKEN = [
  {
    id: 1,
    chainId: web3.utils.numberToHex(1),
    chainName: "Ethereum",
    // rpcUrls: [ 'https://mainnet.infura.io/v3/9aa3d95b3bc440fa88ea12eaa4456161' ],
    // blockExplorerUrls: ["https://etherscan.io"]
    leftTitle: 'Ethereum',
    icon: 'https://zapper.fi/images/networks/ethereum-icon.png',
  }, {
    id: 42161,
    chainId: web3.utils.numberToHex(42161),
    chainName: "Arbitrum",
    rpcUrls: [ 'https://arb1.arbitrum.io/rpc' ],
    blockExplorerUrls: ["https://arbiscan.io"],
    leftTitle: 'Arbitrum',
    icon: 'https://zapper.fi/images/networks/arbitrum-icon.png',
  }, {
    id: 3,
    chainId: web3.utils.numberToHex(3),
    chainName: "Ropsten",
    // rpcUrls: [ 'https://ropsten.infura.io/v3/9aa3d95b3bc440fa88ea12eaa4456161' ],
    // blockExplorerUrls: ["https://ropsten.etherscan.io"],
    leftTitle: 'Ropsten',
    icon: '',
  }, {
    id: 44010,
    chainId: web3.utils.numberToHex(44010),
    chainName: "SecretL1",
    rpcUrls: [ `https://rpc.ieigen.com/eth/` ],
    // blockExplorerUrls: [],
    leftTitle: 'SecretL1',
    icon: '',
  }, {
    id: 189250287905350,
    chainId: web3.utils.numberToHex(189250287905350),
    chainName: "SecretL2",
    rpcUrls: [ `https://rpc.ieigen.com/eig/` ],
    blockExplorerUrls: ['https://explorer.ieigen.com/'],
    leftTitle: 'SecretL2',
    icon: '',
  }
]

export { NETWORKSFORTOKEN, defaultNetWorkForMetamask }
