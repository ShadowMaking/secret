import { DEFAULTIMG } from '@/utils/defaultImg';

// L1 tip
const RECHAERGE_TIP = "Transfer assets from the Layer1 wallet to the EigenSecret l2 wallet, or directly recharged through the Layer2 wallet.";
// L2 tip
const TRANSFER_TIP = "Used for asset transfer between EigenSectet Layer2 wallets, you will enjoy gas-free and real-time transfer.";

const dev_host = "http://dev-deliver-secret.eigen.com:8090"
const hostName = window.location.hostname;
const DOMAIN = hostName;

export {
  DEFAULTIMG,
  RECHAERGE_TIP,
  TRANSFER_TIP,
  dev_host,
  DOMAIN,
}