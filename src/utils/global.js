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

export {
  DEFAULTIMG,
  RECHAERGE_TIP,
  TRANSFER_TIP,
  dev_host,
  DOMAIN,
}