import { DEFAULTIMG } from '@/utils/defaultImg';
import { getConnectedNet } from '@/utils/dashBoardTools';

const TOKEN_NAME = 'secret-token'
const TOKEN_NAME_LOCK = 'lock-token'
window.TOKEN_NAME = TOKEN_NAME
window.TOKEN_NAME_LOCK = TOKEN_NAME_LOCK

// L1 tip
const RECHAERGE_TIP = "Transfer assets from the Layer1 wallet to the EigenSecret l2 wallet, or directly deposit through the Layer2 wallet.";
// L2 tip
const TRANSFER_TIP = "Used for asset transfer between EigenSectet Layer2 wallets, you will enjoy gas-free and real-time transfer.";

const dev_host = "http://dev-deliver-secret.eigen.com:8090"
const hostName = window.location.hostname;
const DOMAIN = hostName;


const etherscanAPIKeyToken = 'JKUUBYKV6BFS2J4BIV41IKF1QFZRN758TK';

const SWAPADDRESS = '0x243B775Ec2dbDD7AC8982bDFa56c2d7316dD089d';


const supportNetContractRouter = [
  {
    chainId: 3,
    name: 'Ropsten',
    securityModuleRouter: '0x9237d557F819544cacDA100Fe047DC7251dA9914',//0x3b5Ad456e8B9118331A2FD0D6a09A592E0F6651F
    proxyRouter: '0xDB8688fcB11ba03aa359C0d808877013323E34C5',//0x20E14B268Cd763d286536EF100eFf433C5f0E43E
    walletTransactionRouter: '0xaE7f9267632e24294fAD4E4DC32173309Edb0Ee0',//0xa0861f705Cf3996fB6993810A82D5053de8ED3a9
    GovernanceTokenRouter: '0xC91ecf9581701707658e21D3b04dc5E6c67575bD',
    GovernorAlphaRouter: '0xb9e341Fb309A6E642e3630E47bE5A26159c648C4',
    rollupNCRouter: '0xf1219A6278726542541e7AA837F14374859325D0',//0x2945E9D4Af9d2da23Ba3B14c1bb4AC45f4E22017
  },
  {
    chainId: 588,
    name: 'Stardust',//metis test
    securityModuleRouter: '0xF3cc50709d747AB5B6B4De7979069eaFF3Eb2FD1',
    proxyRouter: '0xD63C73b3CeF421794fe8464F7Bf27CAED6F79846',
    walletTransactionRouter: '0x09B6fB6F13E574179c3d649Bd2D39b5d073349A9',
  },
  {
    chainId: 80001,
    name: 'Mumbai',//polygon test
    securityModuleRouter: '0x9A1b486c65A4163876F4BEcDcC5Db1bd88AaA08e',
    proxyRouter: '0x00E21A31b27450d0CE653dfA1558F72662d76299',
    walletTransactionRouter: '0x85C9c72A99F1a4ae0E18D47a2E3A1906a2c6370C',
  },
  {
    chainId: 97,
    name: 'BSCTestnet',//BSC Test
    securityModuleRouter: '0x04Bc674c91D100a9d0B08Ed1999Ad470ed368F3e',
    proxyRouter: '0xA89550E7B289CA9c2637379792F87E67d29641f3',
    walletTransactionRouter: '0xFc4C0aD1a23fE36E7ee322D7E48Ca98E8Ba05137',
  },
  {
    chainId: 10,
    name: 'Eigen',//Eigen Test
    securityModuleRouter: '0x3cf158E9ae76be833EB36340191245778fD84A03',
    proxyRouter: '0xbC8b63F0720CB087A8EC8f71145cAE4b2dCEFAb5',
    walletTransactionRouter: '0xc33f3eE638Ac2C8ac24B3E76c1FA2BBfAa60F962',
    GovernanceTokenRouter: '0xd1b79d74CC6d9aD1bC3c6FBDe3E09f4e5b25c920',
    GovernorAlphaRouter: '0x0fAFB71cda268De764BEf6E12e93ccA3715F92e3',
  },
]
let securityModuleRouter = supportNetContractRouter[0].securityModuleRouter;
let proxyRouter = supportNetContractRouter[0].proxyRouter;
let walletTransactionRouter = supportNetContractRouter[0].walletTransactionRouter;
let GovernanceTokenRouter = supportNetContractRouter[0].GovernanceTokenRouter;
let GovernorAlphaRouter = supportNetContractRouter[0].GovernorAlphaRouter;
let rollupNCRouter = supportNetContractRouter[0].rollupNCRouter;

let currentChainId = getConnectedNet().id
for (let i = 0; i < supportNetContractRouter.length; i++) {
  if (currentChainId == supportNetContractRouter[i].chainId) {
    securityModuleRouter = supportNetContractRouter[i].securityModuleRouter
    proxyRouter = supportNetContractRouter[i].proxyRouter
    walletTransactionRouter = supportNetContractRouter[i].walletTransactionRouter
    GovernanceTokenRouter = supportNetContractRouter[i].GovernanceTokenRouter
    GovernorAlphaRouter = supportNetContractRouter[i].GovernorAlphaRouter
    rollupNCRouter = supportNetContractRouter[i].rollupNCRouter
  }
}

console.log(securityModuleRouter)
const signerStatus = {
	'confirmed': 1,
	'rejected': 2,
	'active': 3,
	'freeze': 4,
	'startRecover': 5,
	'agreeRecover': 6,
	'ignoreRecover': 7,
	'triggerRecover': 8,
  'agreeMult': 9,
  'ignoreMult': 10,
}

const walletStatus = {
  'init': 0,
  'Creating': 1,
  'Active': 2,
  'Recovering': 3,
  'Fail': 4,
  // 'Freezing': 5,
  // 'Locked': 6,
  // 'Unlocking': 7,
}

const multOperation = {
  'None': 0,
  'Recovery': 1,
  'LargeTransaction': 2,
  'setMaxPerParametar': 3,
  'setSecurityPeriod': 4,
}

const lockType = {
  'noLock': 0,
  'GlobalLock': 1,//can unlock
  'signerChangeLock': 2,
  'GlobalAndSigner': 3, //can unlock
}

const proposalStatus = {
  '0': 'Pending',
  '1': 'Active',
  '2': 'Canceled',
  '3': 'Defeated',
  '4': 'Succeeded',
  '5': 'Queued',
  '6': 'Expired',
  '7': 'Executed',
}


export {
  DEFAULTIMG,
  RECHAERGE_TIP,
  TRANSFER_TIP,
  dev_host,
  DOMAIN,
  TOKEN_NAME,
  TOKEN_NAME_LOCK,
  etherscanAPIKeyToken,
  SWAPADDRESS,
  signerStatus,
  securityModuleRouter,
  proxyRouter,
  walletTransactionRouter,
  walletStatus,
  multOperation,
  lockType,
  GovernanceTokenRouter,
  GovernorAlphaRouter,
  proposalStatus,
  rollupNCRouter,
}