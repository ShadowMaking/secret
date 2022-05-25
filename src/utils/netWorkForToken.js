import web3 from 'web3';
const defaultNetWorkForMetamask = [1, 3, 4, 5, 42]
const supportNetWorkForContract = [3, 588, 80001, 97, 10]
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
                                icon: 'https://www.gitbook.com/cdn-cgi/image/width=40,height=40,fit=contain,dpr=1,format=auto/https%3A%2F%2F3353191897-files.gitbook.io%2F~%2Ffiles%2Fv0%2Fb%2Fgitbook-x-prod.appspot.com%2Fo%2Fspaces%252F-McQf9YqnjTLsZKxr_aB%252Ficon%252F9jHAvyUWR0fLZzPFIk9m%252FScreen%2520Shot%25202021-11-17%2520at%25209.19.52%2520AM.png%3Falt%3Dmedia%26token%3Dc32041fa-cdea-4691-8ba0-216d0ddd03f1',
                              },                
  [web3.utils.numberToHex(1088)]: {
                                id: 1088,
                                name: 'Andromeda',
                                rpcUrls: ['https://andromeda.metis.io/?owner=1088'],
                                blockExplorerUrls: ['https://andromeda-explorer.metis.io/'],
                                icon: 'https://www.gitbook.com/cdn-cgi/image/width=40,height=40,fit=contain,dpr=1,format=auto/https%3A%2F%2F3353191897-files.gitbook.io%2F~%2Ffiles%2Fv0%2Fb%2Fgitbook-x-prod.appspot.com%2Fo%2Fspaces%252F-McQf9YqnjTLsZKxr_aB%252Ficon%252F9jHAvyUWR0fLZzPFIk9m%252FScreen%2520Shot%25202021-11-17%2520at%25209.19.52%2520AM.png%3Falt%3Dmedia%26token%3Dc32041fa-cdea-4691-8ba0-216d0ddd03f1',
                              }, 
  [web3.utils.numberToHex(137)]: {//Polygon mainnet https://docs.polygon.technology/docs/develop/network-details/network/
                                id: 137,
                                name: 'Polygon',
                                rpcUrls: ['https://polygon-rpc.com/'],
                                blockExplorerUrls: ['https://polygonscan.com/'],
                                icon: 'https://zapper.fi/images/networks/polygon-icon.png',
                              },   
  [web3.utils.numberToHex(80001)]: {
                                id: 80001,
                                name: 'Mumbai',
                                rpcUrls: ['https://matic-mumbai.chainstacklabs.com/'],
                                blockExplorerUrls: ['https://mumbai.polygonscan.com/'],
                                icon: 'https://zapper.fi/images/networks/polygon-icon.png',
                              },                   
  [web3.utils.numberToHex(56)]: {//bsc binance smartcontrat mainnet https://docs.binance.org/smart-chain/wallet/trezor.html#unlock-your-metamask
                                id: 56,
                                name: 'Binance Smart Chain',
                                rpcUrls: ['https://bsc-dataseed.binance.org'],
                                blockExplorerUrls: ['https://bscscan.com/'],
                                icon: 'https://zapper.fi/images/networks/binance-smart-chain-icon.png',
                              },
  [web3.utils.numberToHex(97)]: {
                                id: 97,
                                name: 'BSC Testnet',
                                rpcUrls: ['https://data-seed-prebsc-1-s1.binance.org:8545'],
                                blockExplorerUrls: ['https://testnet.bscscan.com/'],
                                icon: 'https://zapper.fi/images/networks/binance-smart-chain-icon.png',
                              },  
  [web3.utils.numberToHex(10)]: {
                                id: 10,
                                name: 'Eigen Testnet',
                                rpcUrls: ['https://node.eigen.cash'],
                                blockExplorerUrls: ['https://explorer.eigen.cash/'],
                                icon: 'data:image/png;base64,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',
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
  EIGENTEST: web3.utils.numberToHex(10),
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
