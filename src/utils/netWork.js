
const ADDRESS = {
  "l2ChainId": "0xac1f442f2a46",
  "buddyDeployer": "0xFd987e3cA0e9EbadF6Fd9F6651f62965F7CDc466",
  "standardArbERC20": "0x85C9c72A99F1a4ae0E18D47a2E3A1906a2c6370C",
  "standardArbERC777": "0x3F5f9873Df8d5bCdC98d155644D45F9F9093DC1a",
  "ethERC20Bridge": "0x7feAe6550487B59Cb903d977c18Ea16c4CC8D89e",
  "arbTokenBridge": "0x5fe46790aE8c6Af364C2f715AB6594A370089B35",
  "inbox": "0x52B1ebAB51864d760b8E298f6dEEfd9b21D4ff8E"
};

const HOST_CLOUD = '43.128.80.242';   // 云上环境
const HOST_LOCAL = '192.168.0.194';   // 本地测试环境

const ethRPC = `https://${HOST_CLOUD}:7545`;
const arbRPC = `https://${HOST_CLOUD}:8547`;

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
    name: 'Secret',
    url: ethRPC,
    explorerUrl: '',
    partnerChainID: '0xac1f442f2a46',
    netType: 'l1',
    tokenBridge: l1l2Bridge,
    // confirmPeriodBlocks: 6545
  },
  // 0xac1f442f2a46->189250287905350
  '189250287905350': {
    chainID: '189250287905350',
    name: 'Secret2',
    url: arbRPC,
    explorerUrl: '',
    partnerChainID: '44010',
    netType: 'l2',
    tokenBridge: l1l2Bridge,
    // confirmPeriodBlocks: 6545
  }
}

export { ethRPC, arbRPC, NETWORKS, L1ChainID, L2ChainID }
