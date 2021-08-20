'use strict';
import _ from 'lodash'
import Web3 from "web3";
import * as ethers from 'ethers'
import { Bridge } from 'arb-ts';
import { MessageBox } from 'mint-ui';
import { dev_host } from '@/utils/global';
import { NETWORKS } from '@/utils/netWork'

// 区块链的网络ID
const NETWORK_VERSION = {
  "mian_ethernet": 1, // 以太坊主网
  "Morden": 2,        // Morden测试链
  "ropsten": 3,       // Ropsten测试链
  "rinkeby": 4,       // Rinkeby测试链
  "kovan": 42,        // Kovan测试链
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
  //判断用户是否安装MetaMask钱包插件
  if (typeof window.ethereum === "undefined") {
    //没安装MetaMask钱包进行弹框提示
    MessageBox('提示', '请安装MetaMask');
  } else {
    //如果用户安装了MetaMask，你可以要求他们授权应用登录并获取其账号
    ethereum.enable()
      .catch(function (reason) {
        //如果用户拒绝了登录请求
        if (reason === "User rejected provider access") {
          // 用户拒绝登录后执行语句；
        } else {
          // 本不该执行到这里，但是真到这里了，说明发生了意外
          MessageBox('提示', "There was a problem signing you in");
        }
      }).then(function (accounts) {
        // 判断是否连接以太
        // if (ethereum.networkVersion !== NETWORK_VERSION['mian_ethernet]) { }
        getWeb3().then(res=>{
          let web3 = res
          let currentProvider = web3.currentProvider;
          web3.setProvider(currentProvider);
          //如果用户同意了登录请求，你就可以拿到用户的账号
          web3.eth.defaultAccount = accounts[0];

          // myContract = new web3.eth.Contract(ABI, metaMaskAddress);
          //这里返回用户钱包地址
          callback(accounts[0]);
        })
      });
  }
}

// 获取metamask连接的网络ID（10进制形式）
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

// transanctionType - l1||l2
export const initBrideByTransanctionType = (transanctionType='l1') => {
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
  if (transanctionType === 'l1') {
    ethProvider = metamaskProvider
    arbProvider = new ethers.providers.JsonRpcProvider(
      // partnerNet['url']  // 'http://43.128.80.242:8547'
      'http://43.128.80.242:8547' // TODO
    )
    l1Signer = ethProvider.getSigner(0);
    l2Signer = arbProvider.getSigner(connectAddress);
  } else if (transanctionType === 'l2') {
    ethProvider = new ethers.providers.JsonRpcProvider(
      // partnerNet['url']   // 'http://43.128.80.242:7545'
      'http://43.128.80.242:7545' // TODO
    )
    arbProvider = metamaskProvider
    l1Signer = ethProvider.getSigner(connectAddress)
    l2Signer = arbProvider.getSigner(0)
  }
  const bridge = new Bridge(
    tokenBridge['l1Address'], // "0x7feAe6550487B59Cb903d977c18Ea16c4CC8D89e",
    tokenBridge['l2Address'], // "0x5fe46790aE8c6Af364C2f715AB6594A370089B35",
    l1Signer,
    l2Signer,
  )
  return bridge
}
