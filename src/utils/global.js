import { DEFAULTIMG } from '@/utils/defaultImg';

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

const securityModuleRouter = '0xd7b8790EdB2de8A00906cc22086951601958E20B';
const proxyRouter = '0xFe392b0150d1014df430D17EE3E09f500454bB0B';
const walletTransactionRouter = '0x1587Cc57910A40058785cd5C198741dA74e808a2';

const signerStatus = {
	'confirmed': 1,
	'rejected': 2,
	'active': 3,
	'freeze': 4,
	'startRecover': 5,
	'agreeRecover': 6,
	'ignoreRecover': 7,
	'triggerRecover': 8,
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
}