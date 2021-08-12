<template>
  <div style="font-size:13px; " class="children-block">
    <a @click="before">获取余额等信息</a>
    <a @click="depositEth">depositEth</a>
    <a @click="withDrawEth">withDrawEth</a>
    <a @click="testResult">测试</a>
    <a @click="provider">结果</a>
  </div>
</template>

<script>
import Vue from 'vue';
import { providers, utils, Wallet, BigNumber, constants } from 'ethers'
import { Bridge } from 'arb-ts';
import {
  DEFAULTIMG,
  address,
  DEVNET_PRIVKEY,
  ethRPC,
  arbRPC
} from '@/utils/global';

const { parseEther } = utils;

export default {
  name: 'Test',
  data() {
    return {
      defaultWait: 10000
    }
  },
  components: {},
  computed: {},
  methods: {
    wait(ms) {
      return new Promise(res => setTimeout(res, ms || this.defaultWait))
    },
    prettyLog(text) {
      console.log(`%c------------- ${text} ------------- \n`, 'background: #333; color: #8dc63f');
      console.log()
    },
    async before() {

    },
    async depositEth() {
      const accounts = await this.web3.eth.getAccounts();         // 节点所控制的账户列表
      const coinbaseAddress = await this.web3.eth.getCoinbase();  // 用来收取挖矿奖励的 coinbase 地址
      // const provider = this.web3.currentProvider 
      // const provider = this.web3.eth.currentProvider 

      // const ethSigner = provider.getSigner(coinbaseAddress);
      // console.log(provider, provider1, ethSigner)


      // https://learnblockchain.cn/docs/web3.js/web3-eth.html#eth-sendsignedtransaction
      // 签名交易，用来签名的账户需要首先解锁。
      // personal.unlockAccount('0x81183C9C61bdf79DB7330BBcda47Be30c0a85064')
      // L1-L2 当前账户到L1的合约地址进行交易
      const ethToL2DepositAmount = parseEther('0.0001')
      // const d = await this.web3.eth.personal.unlockAccount('0xDCc1614667ECF280cb2938405f339bFbC3Ab833D','metamasktest')
     
     const p = this.web3.currentProvider
     console.log('p',p)


     ethereum
      .request({
        method: 'eth_getLogs',
        // method: 'eth_signTransaction',
        params:[{
          filter:{
            address: ''
          }
        }],
      })
      .then((result) => {
        console.log('result',result)
        // The result varies by by RPC method.
        // For example, this method will return a transaction hash hexadecimal string on success.
      })
      .catch((error) => {
        // If the request fails, the Promise will reject with an error.
      });
      // return

    const params= [
  {
    // from: '0xb60e8dd61c5d32be8058bb8eb970870f07233155',
    // to: '0xd46e8dd67c5d32be8058bb8eb970870f07244567',
    // from: '0xDCc1614667ECF280cb2938405f339bFbC3Ab833D',
    from: '0x81183C9C61bdf79DB7330BBcda47Be30c0a85064',
    to: '0x9B0bbB332c01F3c81C1Bdd6AbB17649528f198D2',
    gas: '0x76c0', // 30400
    gasPrice: '0x9184e72a000', // 10000000000000
    value: '0x9184e72a', // 2441406250
    // data:'0xd46e8dd67c5d32be8d46e8dd67c5d32be8058bb8eb970870f072445675058bb8eb970870f072445675',
  },
];
     ethereum
      .request({
        method: 'eth_sendTransaction',
        params,
      })
      .then((result) => {
        // The result varies by by RPC method.
        // For example, this method will return a transaction hash hexadecimal string on success.
      })
      .catch((error) => {
        // If the request fails, the Promise will reject with an error.
      });
      return
     
    //  this.web3.eth.signTransaction({ // 测试代码
     this.web3.eth.sendTransaction({
        from: "0x81183C9C61bdf79DB7330BBcda47Be30c0a85064", // 测试账号 A
        // from: "0xDCc1614667ECF280cb2938405f339bFbC3Ab833D",  // 测试账号B（我的账号）
        gasPrice: "20000000000",
        gas: "21000",
        to: '0x9B0bbB332c01F3c81C1Bdd6AbB17649528f198D2', // ethERC20Bridge 地址
        value: ethToL2DepositAmount,
        data: ""
      },(res)=>{
        // {code: -32602, message: "Invalid parameters: must provide an Ethereum address."}  // 使用测试账号 A 报错  测试账号B则不会报错

        // 使用方法signTransaction 则提示{code: -32601, message: "The method 'eth_signTransaction' does not exist / is not available.
        // 实际在this.web3.eth下是有sendTransaction这个api的，是执行后报这个错
      })
      
    },
    async withDrawEth() {
      
    },
    async result() {
      
    },
    async testResult() {
      console.log('testResult');
      const path = "m/44'/60'/0'/0/0";
      const yy = await ethers.Wallet.fromMnemonic('jealous athlete kitchen what silly silk weapon casual tortoise hotel more surprise', path);
      console.log(yy.address)
    },
    async provider() {
      // 以metamask当前链接的network作为provider
      const provider = new this.ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner()
      console.log(provider, signer)
      const balance = await signer.getBalance() // 获取当前provider下的账户余额。
      console.log(utils.formatEther(balance.toString()))
      signer.sendTransaction({
        // "from": signer.getAddress(),
        "value": utils.parseEther('0.0001'),
        "to": '0xE68b0998d9Ff5009f18a57C89E3303a273f52BD1',
        // "chainId": signer.getChainId(),// 45111017757781
        "chainId": '45111017757781',// 45111017757781
        "gasLimit": utils.parseEther('21000'),
        // "maxFeePerGas": 0,
        "gasPrice": 0,
      }).then(res=>{
        debugger
      })
    },
  },
  async mounted() {

  },
};
</script>
<style lang="scss" scoped>
.children-block{
  margin-bottom: 50px;
  a{
    border: 1px solid #ccc;
    display: block;
    margin: 20px;
    padding: 5px 10px;
  }
}
</style>
