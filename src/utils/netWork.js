
const ADDRESS = {
  "ethERC20Bridge": "0x87652F9a7aa954399109e084fC0416e8e98ea38C",
  "arbTokenBridge": "0x3eF17De788348Ab455D17ec4FF8c0B130A547049",
};

const ethRPC = `https://rpc.ieigen.com/eth/`;
const arbRPC = `https://rpc.ieigen.com/eig/`;

const l1l2Bridge = {
  l1Address: ADDRESS.ethERC20Bridge,
  l2Address: ADDRESS.arbTokenBridge
};

const L1ChainID = '0xabea';         // 44010
const L2ChainID = '0xac1f442f2a46'; // 189250287905350


const NETWORKS = {
  // 0xabea -> 44010
  '44010': {
    chainID: '44010',
    name: 'SecretL1',
    url: ethRPC,
    explorerUrl: '',
    partnerChainID: '189250287905350',
    netType: 'l1',
    tokenBridge: l1l2Bridge,
    // confirmPeriodBlocks: 6545
  },
  // 0xac1f442f2a46->189250287905350
  '189250287905350': {
    chainID: '189250287905350',
    name: 'SecretL2',
    url: arbRPC,
    explorerUrl: '',
    partnerChainID: '44010',
    netType: 'l2',
    tokenBridge: l1l2Bridge,
    // confirmPeriodBlocks: 6545
  }
}

export { ethRPC, arbRPC, NETWORKS, L1ChainID, L2ChainID }
