
/* {
  "l2ChainId": "0xac1f442f2a46",
  "buddyDeployer": "0x95b6519235A41615CF56E9103642B79623Ccf35a",
  "standardArbERC20": "0x557AD04fa9DF9B0967e62ABdc85e598405e114b1",
  "standardArbERC777": "0x3F5f9873Df8d5bCdC98d155644D45F9F9093DC1a",
  "ethERC20Bridge": "0x87652F9a7aa954399109e084fC0416e8e98ea38C",
  "arbTokenBridge": "0x3eF17De788348Ab455D17ec4FF8c0B130A547049",
  "inbox": "0x52B1ebAB51864d760b8E298f6dEEfd9b21D4ff8E"
} */

// https://developer.offchainlabs.com/docs/public_testnet
// Important Addresses
/* L1:
Main L1 Rollup Contract: 0xFe2c86CF40F89Fe2F726cFBBACEBae631300b50c
Ethereum Inbox Contract: 0x578BAde599406A8fE3d24Fd7f7211c0911F5B29e
L1 Gateway Router: 0x70C143928eCfFaf9F5b406f7f4fC28Dc43d68380
L1 Standard ERC20 Gateway: 0x91169Dbb45e6804743F94609De50D511C437572E
L1 Custom Gateway: 0x917dc9a69F65dC3082D518192cd3725E1Fa96cA2
L1 WETH Gateway: 0x81d1a19cf7071732D4313c75dE8DD5b8CF697eFD
L1 WETH Address: 0xc778417E063141139Fce010982780140Aa0cD5Ab
L2:
L2 Gateway Router: 0x9413AD42910c1eA60c737dB5f58d1C504498a3cD
L2 Standard ERC20 Gateway: 0x195C107F3F75c4C93Eba7d9a1312F19305d6375f
L2 Custom Gateway: 0x9b014455AcC2Fe90c52803849d0002aeEC184a06
L2 WETH Gateway: 0xf94bc045c4E926CC0b34e8D1c41Cd7a043304ac9
L2 WETH Address: 0xB47e6A5f8b33b3F17603C83a0535A9dcD7E32681 */
const ADDRESS = {
  "ethERC20Bridge": "0x70C143928eCfFaf9F5b406f7f4fC28Dc43d68380",
  "arbTokenBridge": "0x9413AD42910c1eA60c737dB5f58d1C504498a3cD",
};

const ethRPC = `https://rinkeby.infura.io/v3/9aa3d95b3bc440fa88ea12eaa4456161`;
const arbRPC = `https://rinkeby.arbitrum.io/rpc`;

const l1l2Bridge = {
  l1Address: ADDRESS.ethERC20Bridge,
  l2Address: ADDRESS.arbTokenBridge
};

const L1ChainID = '0x4';         // 44010
const L2ChainID = '0x66eeb'; // 189250287905350


const NETWORKS = {
  // 0xabea -> 44010
  '4': {
    chainID: '4',
    name: 'Rinkeby 测试网络',
    url: ethRPC,
    explorerUrl: '',
    partnerChainID: '421611',
    netType: 'l1',
    tokenBridge: l1l2Bridge,
    // confirmPeriodBlocks: 6545
  },
  // 0xac1f442f2a46->189250287905350
  '421611': {
    chainID: '421611',
    name: 'Arbitrum Testnet',
    url: arbRPC,
    explorerUrl: '',
    partnerChainID: '4',
    netType: 'l2',
    tokenBridge: l1l2Bridge,
    // confirmPeriodBlocks: 6545
  }
}

export { ethRPC, arbRPC, NETWORKS, L1ChainID, L2ChainID }
