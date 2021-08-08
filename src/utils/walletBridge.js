import { providers, utils, Wallet, BigNumber, constants } from 'ethers'
import { Bridge } from 'arb-ts';
import { address, DEVNET_PRIVKEY, ethRPC, arbRPC } from '@/utils/global';
const { parseEther } = utils;

export const rpcProvider = () => {
  const ethProvider = new providers.JsonRpcProvider(ethRPC);
  const arbProvider = new providers.JsonRpcProvider(arbRPC);
  return { ethProvider, arbProvider }
}

export const walletForRPC = () => {
  const { ethProvider, arbProvider } = rpcProvider();
  const l1Wallet= new Wallet(DEVNET_PRIVKEY, ethProvider);
  const l2Wallet = new Wallet(DEVNET_PRIVKEY, arbProvider);
  return { l1Wallet, l2Wallet }
}

export const bridgeAboutWalletForRPC = () => {
  const { l1Wallet, l2Wallet } = walletForRPC();
  const bridge = new Bridge(
    address.ethERC20Bridge,
    address.arbTokenBridge,
    l1Wallet,
    l2Wallet
  )
  return bridge;
}

// 获取 L1 资产 (单位是 wei)
export async function getAvailableBalanceForL1() {
  const bridge = bridgeAboutWalletForRPC();
  const walletL1EthBalance = await bridge.getAndUpdateL1EthBalance();
  // console.log('L1可用余额(wei): ',walletL1EthBalance.toString())
  return walletL1EthBalance
}

// 获取 L2 资产 (单位是 wei)
export async function getAvailableBalanceForL2() {
  const bridge = bridgeAboutWalletForRPC();
  const walletL2EthBalance = await bridge.getAndUpdateL2EthBalance();
  // console.log('L2可用余额(wei): ',walletL2EthBalance.toString())
  return walletL2EthBalance
}



