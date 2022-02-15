import web3 from 'web3';
const defaultNetWorkForMetamask = [1, 3, 4, 5, 42]
const supportNetWorkForContract = [3, 588, 80001, 97]
const CHAINMAP  = {
  [web3.utils.numberToHex(1)]: {
                                id: 1,
                                name: 'Ethereum',
                                rpcUrls: ['https://mainnet.infura.io/v3/9aa3d95b3bc440fa88ea12eaa4456161'],
                                blockExplorerUrls: ["https://etherscan.io"],
                                icon: 'https://zapper.fi/images/networks/ethereum-icon.png',
                              },
  [web3.utils.numberToHex(3)]: {
                                id: 3,
                                name: 'Ropsten',
                                rpcUrls: ['https://ropsten.infura.io/v3/9aa3d95b3bc440fa88ea12eaa4456161'],
                                blockExplorerUrls: ["https://ropsten.etherscan.io"],
                                icon: require('@/assets/network/Ropsten.png'),
                              },
  [web3.utils.numberToHex(4)]: {
                                 id: 4,
                                 name: 'Rinkeby',
                                rpcUrls: ['https://rinkeby.infura.io/v3/9aa3d95b3bc440fa88ea12eaa4456161'],
                                blockExplorerUrls: ["https://rinkeby.etherscan.io"],
                                icon: require('@/assets/network/Rinkeby.png'),
                              },
  [web3.utils.numberToHex(5)]: {
                                id: 5,
                                name: 'Goerli',
                                rpcUrls: ['https://goerli.infura.io/v3/9aa3d95b3bc440fa88ea12eaa4456161'],
                                blockExplorerUrls: ["https://goerli.etherscan.io"],
                                icon: require('@/assets/network/Goerli.png'),
                              },
  [web3.utils.numberToHex(42)]: {
                                id: 42,
                                name: 'Kovan',
                                rpcUrls: ['https://kovan.infura.io/v3/9aa3d95b3bc440fa88ea12eaa4456161'],
                                blockExplorerUrls: ["https://kovan.etherscan.io"],
                                icon: require('@/assets/network/Kovan.png'),
                              },
  [web3.utils.numberToHex(42161)]: {
                                id: 42161,
                                name: 'Arbitrum',
                                rpcUrls: ['https://arb1.arbitrum.io/rpc'],
                                blockExplorerUrls: ["https://arbiscan.io"],
                                icon: 'https://zapper.fi/images/networks/arbitrum-icon.png',
                              },
  // [web3.utils.numberToHex(44010)]: {
  //                               id: 44010,
  //                               name: 'SecretL1',
  //                               rpcUrls: ['https://rpc.ieigen.com/eth/'],
  //                               blockExplorerUrls: [],
  //                               icon: require('@/assets/network/defaultNetwork.png'),
  //                             },
  // [web3.utils.numberToHex(189250287905350)]: {
  //                               id: 189250287905350,
  //                               name: 'SecretL2',
  //                               rpcUrls: ['https://rpc.ieigen.com/eig/'],
  //                               blockExplorerUrls: ['https://explorer.ieigen.com/'],
  //                               icon: require('@/assets/network/defaultNetwork.png'),
  //                             },
  // https://docs.metis.io/building-on-metis/connection-details                    
  [web3.utils.numberToHex(588)]: {
                                id: 588,
                                name: 'Stardust',
                                rpcUrls: ['https://stardust.metis.io/?owner=588'],
                                blockExplorerUrls: ['https://stardust-explorer.metis.io/'],
                                icon: 'https://zapper.fi/images/networks/ethereum-icon.png',
                              },                
  [web3.utils.numberToHex(1088)]: {
                                id: 1088,
                                name: 'Andromeda',
                                rpcUrls: ['https://andromeda.metis.io/?owner=1088'],
                                blockExplorerUrls: ['https://andromeda-explorer.metis.io/'],
                                icon: 'https://zapper.fi/images/networks/ethereum-icon.png',
                              }, 
  [web3.utils.numberToHex(137)]: {//Polygon mainnet https://docs.polygon.technology/docs/develop/network-details/network/
                                id: 137,
                                name: 'Polygon',
                                rpcUrls: ['https://polygon-rpc.com/'],
                                blockExplorerUrls: ['https://polygonscan.com/'],
                                icon: 'https://zapper.fi/images/networks/ethereum-icon.png',
                              },   
  [web3.utils.numberToHex(80001)]: {
                                id: 80001,
                                name: 'Mumbai',
                                rpcUrls: ['https://matic-mumbai.chainstacklabs.com/'],
                                blockExplorerUrls: ['https://mumbai.polygonscan.com/'],
                                icon: 'https://zapper.fi/images/networks/ethereum-icon.png',
                              },                   
  [web3.utils.numberToHex(56)]: {//bsc binance smartcontrat mainnet https://docs.binance.org/smart-chain/wallet/trezor.html#unlock-your-metamask
                                id: 56,
                                name: 'Binance Smart Chain',
                                rpcUrls: ['https://bsc-dataseed.binance.org'],
                                blockExplorerUrls: ['https://bscscan.com/'],
                                icon: 'https://zapper.fi/images/networks/ethereum-icon.png',
                              },
  [web3.utils.numberToHex(97)]: {
                                id: 97,
                                name: 'BSC Testnet',
                                rpcUrls: ['https://data-seed-prebsc-1-s1.binance.org:8545'],
                                blockExplorerUrls: ['https://testnet.bscscan.com/'],
                                icon: 'https://zapper.fi/images/networks/ethereum-icon.png',
                              },                            
}
const CHAINIDMAP  = {
  ETHEREUM: web3.utils.numberToHex(1),
  ROPSTEN: web3.utils.numberToHex(3),
  RINKEBY: web3.utils.numberToHex(4),
  GOERLI: web3.utils.numberToHex(5),
  KOVAN: web3.utils.numberToHex(42),

  ARBITRUM: web3.utils.numberToHex(42161),
  // SECRETL1: web3.utils.numberToHex(44010),
  // SECRETL2: web3.utils.numberToHex(189250287905350),

  STARDUST: web3.utils.numberToHex(588),
  ANDRROMEDA: web3.utils.numberToHex(1088),
  POLYGON: web3.utils.numberToHex(137),
  MUMBAI: web3.utils.numberToHex(80001),
  BSC: web3.utils.numberToHex(56),
  BSCTEST: web3.utils.numberToHex(97),
}

const NETWORKSFORTOKEN = Object.keys(CHAINMAP).map(chainId => {
  const { id, name, rpcUrls, blockExplorerUrls, icon } = CHAINMAP[chainId]
  const data = { id, chainId, chainName: name, rpcUrls, blockExplorerUrls, leftTitle: name, icon }
  if (defaultNetWorkForMetamask.includes(web3.utils.hexToNumber(chainId))) {
    delete data['rpcUrls']
    delete data['blockExplorerUrls']
  }
  return data
})

export { CHAINMAP, NETWORKSFORTOKEN, defaultNetWorkForMetamask, CHAINIDMAP, supportNetWorkForContract }
