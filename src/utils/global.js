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


const ropstenSecurityModuleRouter = '0x8Bc077bc51018A7c1fCc587B8B0245cC2d58Ce4D';
const ropstenProxyRouter = '0x5323e93a4daf116dCDE437583c6806360CB9cfed';
const ropstenWalletTransactionRouter = '0xb191d9A4baA491A18e61A3B413c1658deA11fB2a';

const metisSecurityModuleRouter = '0xF3cc50709d747AB5B6B4De7979069eaFF3Eb2FD1';
const metisProxyRouter = '0xD63C73b3CeF421794fe8464F7Bf27CAED6F79846';
const metisWalletTransactionRouter = '0x09B6fB6F13E574179c3d649Bd2D39b5d073349A9';

const polygonSecurityModuleRouter = '0x9A1b486c65A4163876F4BEcDcC5Db1bd88AaA08e';
const polygonProxyRouter = '0x00E21A31b27450d0CE653dfA1558F72662d76299';
const polygonWalletTransactionRouter = '0x85C9c72A99F1a4ae0E18D47a2E3A1906a2c6370C';

let securityModuleRouter = ropstenSecurityModuleRouter;
let proxyRouter = ropstenProxyRouter;
let walletTransactionRouter = ropstenWalletTransactionRouter;

if (getConnectedNet().id == 588) {
  securityModuleRouter = metisSecurityModuleRouter
  proxyRouter = metisProxyRouter
  walletTransactionRouter = metisWalletTransactionRouter
} else if (getConnectedNet().id == 80001) {
  securityModuleRouter = polygonSecurityModuleRouter
  proxyRouter = polygonProxyRouter
  walletTransactionRouter = polygonWalletTransactionRouter
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
  'agreeSend': 9,
  'ignoreSend': 10,
}

const walletStatus = {
  'init': 0,
  'Creating': 1,
  'Active': 2,
  'Recovering': 3,
  'Fail': 4,
  'Freezing': 5,
  'Frozen': 6,
  'Unlocking': 7,
}

const multOperation = {
  'None': 0,
  'Recovery': 1,
  'LargeTransaction': 2,
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
}