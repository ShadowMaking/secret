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