import { DEFAULTIMG } from '@/utils/defaultImg';

// L2充值tip
const RECHAERGE_TIP = "ZKSwap 是建立在 Layer2 上的去中心化交易所，您需要先将 Layer1 钱包（即绑定的 Metamask ）上的资产充值到 Layer2 钱包中，才能进行零费用和瞬间到账的兑换和流动性操作，在 Layer2 中的资产由去中心化智能合约托管，您通过私钥自主掌控，安全可靠，可以随时提现到 Layer1 钱包。";
// L2转账tip
const TRANSFER_TIP = "您可以将资产发送至他人的 Layer2 钱包地址，享受零费用和瞬间到账的转账体验。收款方需要到 L2 钱包中查看账户余额。请务必确认地址正确，一旦交易提交将无法撤回。";


// TODO 需要根据运行环境配置
const dev_host = "http://dev-deliver-secret.eigen.com:8090"
const protocol = window.location.protocol;
const hostName = window.location.hostname;

const DOMAIN = hostName;


const address = {
  // 对应本地环境的数据
  // "l2ChainId": "0x29073a305c55",
  // "buddyDeployer": "0x5DfBB3D6775B7D0e702D6c9Ccd1fCF4Ba08DA97c",
  // "standardArbERC20": "0x895521964D724c8362A36608AAf09A3D7d0A0445",
  // "standardArbERC777": "0x3F5f9873Df8d5bCdC98d155644D45F9F9093DC1a",
  // "ethERC20Bridge": "0x9aE9c1aa40329e47937D377456a8DC558E2aB5A0",
  // "arbTokenBridge": "0x2EEBB8EE9c377caBC476654ca4aba016ECA1B9fc",
  // "inbox": "0xd3b925Dbd7272FA5a4aC88602923fD889616a1A9"

  // 对应云上的数据
  "l2ChainId": "0x29073a305c55",
  "buddyDeployer": "0x5DfBB3D6775B7D0e702D6c9Ccd1fCF4Ba08DA97c",
  "standardArbERC20": "0x895521964D724c8362A36608AAf09A3D7d0A0445",
  "standardArbERC777": "0x3F5f9873Df8d5bCdC98d155644D45F9F9093DC1a",
  "ethERC20Bridge": "0x9B0bbB332c01F3c81C1Bdd6AbB17649528f198D2",
  "arbTokenBridge": "0x2EEBB8EE9c377caBC476654ca4aba016ECA1B9fc",
  "inbox": "0xa7900396ad00Ef5E00181bB9D0F340814F4b6049"
};

const HOST_CLOUD = '43.128.80.242';   // 云上环境
const HOST_LOCAL = '192.168.0.194';   // 本地测试环境

const ethRPC = `http://${HOST_CLOUD}:7545`;
const arbRPC = `http://${HOST_CLOUD}:8547`;

const mnemonic = 'jar deny prosper gasp flush glass core corn alarm treat leg smart'; // 用户助记词

// const DEVNET_PRIVKEY = '0x302e383630333233363431323935353034390000000000000000000000000000' // 私钥
const DEVNET_PRIVKEY = '0xffb2b26161e081f0cdf9db67200ee0ce25499d5ee683180a9781e6cceb791c39' // 私钥

export {
  DEFAULTIMG,
  RECHAERGE_TIP,
  TRANSFER_TIP,
  dev_host,
  DOMAIN,

  address,
  ethRPC,
  arbRPC,
  DEVNET_PRIVKEY,
}