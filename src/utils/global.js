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
    securityModuleRouter: '0x2BEB112f770217D7DE38D3318F12A3Fd1029CB94',
    proxyRouter: '0x92cf222caC805442a026E8A6bD7C5FAa0C60e468',
    walletTransactionRouter: '0x97743DB5484830ac4E7b0be1cbAEBCbE059Dd2f8',
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
    securityModuleRouter: '0x69bd9795fB03B3EC641e115a42C56F3AE2b626F8',
    proxyRouter: '0xF3cc50709d747AB5B6B4De7979069eaFF3Eb2FD1',
    walletTransactionRouter: '0xFbbD72a7766a896203c059272DCB25C95385C5fa',
  },
]
let securityModuleRouter = supportNetContractRouter[0].securityModuleRouter;
let proxyRouter = supportNetContractRouter[0].proxyRouter;
let walletTransactionRouter = supportNetContractRouter[0].walletTransactionRouter;
let currentChainId = getConnectedNet().id
for (let i = 0; i < supportNetContractRouter.length; i++) {
  if (currentChainId == supportNetContractRouter[i].chainId) {
    securityModuleRouter = supportNetContractRouter[i].securityModuleRouter
    proxyRouter = supportNetContractRouter[i].proxyRouter
    walletTransactionRouter = supportNetContractRouter[i].walletTransactionRouter
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
  // 'Recovering': 3,
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
}