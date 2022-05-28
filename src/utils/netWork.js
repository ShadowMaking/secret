import web3 from 'web3';

const ADDRESS = {
  "ethERC20Bridge": "0xddDB69B8C41C93215F4d6912eA378a92a4A1EB9B",
  "arbTokenBridge": "0x5fe46790aE8c6Af364C2f715AB6594A370089B35",
};

const ethRPC = `https://rpc.eigen.cash/eth/`;
const arbRPC = `https://rpc.eigen.cash/eig/`;

const l1l2Bridge = {
  l1Address: ADDRESS.ethERC20Bridge,
  l2Address: ADDRESS.arbTokenBridge
};

const L1ChainID = '0xabea';         // 44010
const L2ChainID = '0xac1f442f2a46'; // 189250287905350


const NETWORKS = {
  [web3.utils.hexToNumberString(L1ChainID)]: {
    chainID: '44010',
    name: 'SecretL1',
    url: ethRPC,
    explorerUrl: '',
    partnerChainID: web3.utils.hexToNumberString(L2ChainID),
    netType: 'l1',
    tokenBridge: l1l2Bridge,
    // confirmPeriodBlocks: 6545
  },
  [web3.utils.hexToNumberString(L2ChainID)]: {
    chainID: '189250287905350',
    name: 'SecretL2',
    url: arbRPC,
    explorerUrl: '',
    partnerChainID: web3.utils.hexToNumberString(L1ChainID),
    netType: 'l2',
    tokenBridge: l1l2Bridge,
    // confirmPeriodBlocks: 6545
  }
}

export { ethRPC, arbRPC, NETWORKS, L1ChainID, L2ChainID }
