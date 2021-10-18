'use strict';
import _ from 'lodash'
import Web3 from "web3";
import * as ethers from 'ethers'
import { Bridge } from 'arb-ts';
import { MessageBox } from 'mint-ui';
import { dev_host } from '@/utils/global';
import { NETWORKS } from '@/utils/netWork'
// import { NETWORKS } from '@/utils/netWork_arb'
import { initTokenTime, updateLoginTime } from '@/utils/auth'


const NETWORK_VERSION = {
  "mian_ethernet": 1, // ETH main
  "Morden": 2,        // Morden Test Net
  "ropsten": 3,       // Ropsten Test Net
  "rinkeby": 4,       // Rinkeby Test Net
  "kovan": 42,        // Kovan Test Net
}

export const getWeb3 = () =>
  new Promise((resolve, reject) => {
    // Wait for loading completion to avoid race conditions with web3 injection timing.
    window.addEventListener("load", async () => {
      // Modern dapp browsers...
      if (window.ethereum) {
        const web3 = new Web3(window.ethereum);
        try {
          // Request account access if needed
          await window.ethereum.enable();
          // Acccounts now exposed
          resolve(web3);
        } catch (error) {
          reject(error);
        }
      }
      // Legacy dapp browsers...
      else if (window.web3) {
        // Use Mist/MetaMask's provider.
        const web3 = window.web3;
        console.log("Injected web3 detected.");
        resolve(web3);
      }
      // Fallback to localhost; use dev console port by default...
      else {
        const provider = new Web3.providers.HttpProvider(dev_host); // http://127.0.0.1:8090
        const web3 = new Web3(provider);
        console.log("No web3 instance injected, using Local web3.");
        resolve(web3);
      }
    });
});

export const initWeb3 = () => {
  let web3;
  if (window.ethereum) {
    web3 = new Web3(window.ethereum);
  }
  // Legacy dapp browsers...
  else if (window.web3) {
    // Use Mist/MetaMask's provider.
    web3 = window.web3;
    console.log("Injected web3 detected.");
  }
  // Fallback to localhost; use dev console port by default...
  else {
    const provider = new Web3.providers.HttpProvider(
      "http://127.0.0.1:8080"
    );
    web3 = new Web3(provider);
    console.log("No web3 instance injected, using Local web3.");
  }
  return web3
}

// test code
export const init = (callback) =>{
  if (typeof window.ethereum === "undefined") {
    MessageBox('Tip', 'Install MetaMask');
  } else {
    ethereum.enable()
      .catch(function (reason) {
        if (reason === "User rejected provider access") {
        } else {
          MessageBox('Tip', "There was a problem signing you in");
        }
      }).then(function (accounts) {
        // if (ethereum.networkVersion !== NETWORK_VERSION['mian_ethernet]) { }
        getWeb3().then(res=>{
          let web3 = res
          let currentProvider = web3.currentProvider;
          web3.setProvider(currentProvider);
          web3.eth.defaultAccount = accounts[0];

          // myContract = new web3.eth.Contract(ABI, metaMaskAddress);
          callback(accounts[0]);
        })
      });
  }
}

// get metamask connect chainID（Decimal） 
export const getSelectedChainID = () => {
  return window.ethereum.networkVersion;
}

export const getInjectedWeb3 = () => {
  return new Promise( async (resolve, reject) => {
    if (window.ethereum) {
      try {
        await window.ethereum.request({ method: 'eth_requestAccounts' });
        console.warn('No window.ethereum.enable function')
      } catch (e) {
        console.warn('Failed to enable window.ethereum: ' + e.message)
        return []
      }
      resolve({
        provider: new ethers.providers.Web3Provider(window.ethereum),
        networkId: window.ethereum.networkVersion
      })
    }
    resolve([])
  })
}

export const getNetMode = (nId) => {
  const netId = nId || getSelectedChainID();
  if (NETWORKS[netId+'']) {
    return NETWORKS[netId+'']['netType'];
  }
  return ''
}

// netType - l1||l2
export const initBrideByNetType = (netType='l1') => {
  const connectAddress = window.ethereum.selectedAddress;
  const metamaskProvider = new ethers.providers.Web3Provider(window.ethereum);
  const netId = getSelectedChainID();
  const currentNet = NETWORKS[netId];
  if (!currentNet) {
    return null
  }
  const partnerNet = NETWORKS[currentNet['partnerChainID']];
  const tokenBridge = currentNet['tokenBridge'];
  
  let ethProvider;
  let arbProvider;
  let l1Signer;
  let l2Signer;
  if (netType === 'l1') {
    ethProvider = metamaskProvider
    arbProvider = new ethers.providers.JsonRpcProvider(
      partnerNet['url'] // 8547
    )
    l1Signer = ethProvider.getSigner(0);
    l2Signer = arbProvider.getSigner(connectAddress);
  } else if (netType === 'l2') {
    ethProvider = new ethers.providers.JsonRpcProvider(
      partnerNet['url'] // 7545
    )
    arbProvider = metamaskProvider
    l1Signer = ethProvider.getSigner(connectAddress)
    l2Signer = arbProvider.getSigner(0)
  }
  const bridge = new Bridge(
    tokenBridge['l1Address'],
    tokenBridge['l2Address'],
    l1Signer,
    l2Signer,
  )
  // return bridge
  return { bridge, ethProvider, arbProvider, l1Signer, l2Signer }
}

export const metamaskIsConnect = () => {
  return window.ethereum && window.ethereum.isMetaMask && window.ethereum.selectedAddress
}

export const installWeb3Wallet = () => {
  return typeof window.ethereum !== "undefined"
}
export const installWeb3WalletMetamask = () => {
  return typeof window.ethereum !== "undefined" && window.ethereum.isMetaMask
}

export const getExpectNetTypeByRouteName = (routeName) => {
  let type = '';
  switch (routeName) {
    case 'deposit':
      type = 'l1';
      break;
    case 'send':
    case 'withdraw':
      type = 'l2';
      break;
    default:
      type = '';
      break;
  }
  return type
}
