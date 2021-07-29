<template>
  <div style="width:100%">
    <mt-header title="" class="common-header">
      <img :src="DEFAULTIMG.LOGO" slot="left" class="logo"/>
      <span slot="right" v-if="address!==''" class="header-address">{{ address.slice(0,8)+"..." }}</span>
      <a slot="right" @click="chooseWallet" v-else>链接钱包</a>
    </mt-header>
    <mt-popup
      :visible.sync="popupVisible"
      v-model="popupVisible"
      position="bottom"
      popup-transition="popup-fade"
      class="common-bottom-popup">
      <div class="common-exchange-detail-wrap choose-wallet-popup">
        <div class="header"><h3>选择钱包</h3></div>
        <div class="choose-wallet" @click="connectWallet">
          <i></i><span>metamask</span>
        </div>
      </div>
    </mt-popup>
    <van-popup v-model="installWalletModal" closeable class="install-wallet-modal">
      <div class="flex flex-center flex-column">
        <a href="https://metamask.io/" target="_blank" class="install-button-outer">
          <van-button class="install-button" color="#AA2E26" plain >安装metamask</van-button>
        </a>
        <span class="install-guid">请先安装<a href="https://metamask.io/" target="_blank" >Metamask</a></span>
      </div>
    </van-popup>
    <div style="font-size:13px; display:none">
      <a @click="sendTrade" style="display:block;margin-bottom:10px">发送交易</a>
      <a @click="getTransiton">发送交易22</a>
    </div>
  </div>
</template>

<script>
import Vue from 'vue';
import { Header, Button } from 'mint-ui';
import { DEFAULTIMG } from '@/utils/global';
import { initWeb3 } from "@/utils/wb3";
import {
  checkMetamask, connectMetamask,
  setCookie, getCookie, getAccount } from "@/utils/auth";
import { Popup, Button as VanButton } from 'vant';
import ABI from './rnt.json'

Vue.use(Popup);
Vue.use(VanButton);
Vue.component(Header.name, Header)
Vue.component(Button.name, Button)

export default {
  name: 'header',
  data() {
    return {
      DEFAULTIMG,
      popupVisible: false,
      installMetamask: false,
      installWalletModal: false,
      address: '',
      addressArr: [],
      walletIsLock: true,
    }
  },
  methods: {
    chooseWallet() { this.popupVisible = true; },
    async connectWallet() {
      this.popupVisible = false;
      if (!this.installMetamask) {
        this.installWalletModal = true;
      } else {
        await ethereum.request({ method: 'eth_requestAccounts' });
        const accounts = await this.web3.eth.getAccounts();
        // await ethereum.request({ method: 'eth_personalSign' });
        const coinbaseAddress = this.web3.eth.coinbase;
        const message = `
          Access Eigen account.
          Only sign this message for a trusted client!
        `;
        const signRes = await this.web3.eth.personal.sign(this.web3.utils.fromUtf8(message), accounts[0]);
        // when signRes has value declare sign sucess
        this.walletIsLock = true;
        signRes && (this.walletIsLock = false)
        this.$store.dispatch('WalletLockStatus', {lock: this.walletIsLock});
      }
    },
    sendTrade() {
      // 如果from没有的话，他就会用当前的默认账号， 如果是转账to和value是必选的两个字段。
      // 在发送交易的时候弹出来MetaMask的一个授权的窗口，如果我们gas和gasPrice没有设置的话，就可以在MetaMask里面去设置。如果这两个gas和gas Price设置了的话，MetaMask就会使用我们设置的gas。
      if (!window.ethereum) { return }
      ethereum
        .request({
          method: 'eth_sendTransaction',
          params: [
            // 发送交易的时候，关键是构造这样一个交易对象
            {
              // 就是从哪个账号发送金额
              from: '0xDCc1614667ECF280cb2938405f339bFbC3Ab833D', // accounts[0]
              // to : 发动到到哪个账号
              to: '0x2f318C334780961FB129D2a6c30D0763d9a5C970',
              // value 是发送的金额
              // value: '0x29a2241af62c0000',
              value: 'a',
              // gasPrice: 设置gas 价格
              gasPrice: '0x09184e72a000',
              // gas: 设置gas limit
              gas: '0x2710',
            },
          ],
        })
        .then((txHash) => console.log(txHash))
        .catch((error) => console.error);
    },
    getTransiton() {
      /* const wb3 = initWeb3();
      var addr = "0xbfb2e296d9cf3e593e79981235aed29ab9984c0f"
      var filter = wb3.eth.filter({fromBlock:0, toBlock:'latest', address: addr});
      filter.get(function (err, transactions) {
        transactions.forEach(function (tx) {
          var txInfo = wb3.eth.getTransaction(tx.transactionHash);
          //这时可以将交易信息txInfo存入数据库
        });
      }); */

      // var abi = require("./rnt.json");
      /* const wb3 = initWeb3();
      var abi = ABI;
      var address = "0xff603f43946a3a28df5e6a73172555d8c8b02386";
      var contract = new wb3.eth.Contract(abi,address); //合约实例
      //查询合约名称
      contract.methods.name().call().then(
          function(result){
              console.log(result);
          }
      );
      //查询某一地址交易记录
      contract.getPastEvents('Transfer', {
          filter: {_from: '0x6cc5f688a315f3dc28a7781717a9a798a59fda7b'},
          // fromBlock: 230813,
          fromBlock: 0,
          toBlock: 'latest'
      }, (error, events) => { console.log(events); }); */

      const wb3 = initWeb3();

      // wb3.eth.personal.unlockAccount("0xDCc1614667ECF280cb2938405f339bFbC3Ab833D", "metamasktest", 600)
      // .then(console.log('Account unlocked!'));
      
      wb3.eth.getTransactionCount("0x961356cff29d8ad65417a7592d0d90b1cdd6b4e5")
      .then(res=>{
        console.log('交易数量',res)
      });

      wb3.eth.getPastLogs({
        address: "0x961356cff29d8ad65417a7592d0d90b1cdd6b4e5",
        // topics: ["0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef"]
        // "topics": [
        //   "0xf63780e752c6a54a94fc52715dbc5518a3b4c3c2833d301a204226548a2a8545",
        //   "0x72657075746174696f6e00000000000000000000000000000000000000000000",
        //   "0x000000000000000000000000d9b2f59f3b5c7b3c67047d2f03c3e8052470be92"
        // ],
        // topics: [],
      }).then(res=>{
        console.log(res)
      });

      wb3.eth.subscribe('logs', {
          // address: '0xDAd3EEc06A36e6f45815D453e33E2D25AE6C279F',
          address: '0x961356cff29d8ad65417a7592d0d90b1cdd6b4e5',
          // topics: ['0x12345...']
          topics: ["0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef", "0x000000000000000000000000076979a0b3c87334e5d72e3afcafaa80f7888cac", "0x000000000000000000000000cd9f286ba6a3d2df7885f4a2be267fc524d32bd3"],
      }, function(error, result){
          if (!error)
              console.log(log);
      }).on("data", function(log){
          console.log(log);
      })
      .on("changed", function(log){
        console.log(log);
      });;
    },
  },
  async mounted() {
    const $this = this;
    // Wait for loading completion to avoid race conditions with web3 injection timing.
    window.addEventListener("load", async () => {
      // check metamask install status
      const info = await checkMetamask();
      const { installStatus } = info;
      await this.$store.dispatch('MetamaskInstall', { metamaskInstall: installStatus });
      // console.log("store", this.$store.state.metamask.metamaskInstall)
      this.installMetamask = installStatus;

      if (installStatus) {
        const accounts = await this.web3.eth.getAccounts();
        const address = await this.web3.eth.getCoinbase();
        await this.$store.dispatch("WalletAccountsAddress", {accounts})
        // console.log(this.$store.state.metamask)
        this.addressArr = accounts;
        this.address = accounts[0]||'';
      }

      if (window.ethereum) {
        ethereum.on('connect',  (connectInfo) => {
          if(window.ethereum.isConnected()){
            console.log(1)
          }
        });
        ethereum.on('disconnect', (error) => {
          console.log(2)
        });
        ethereum.on('chainChanged', (chainId) => {
          console.log(4, chainId)
          // 需要重新解锁钱包
          this.walletIsLock = true;
          this.$store.dispatch('WalletLockStatus', {isLock: this.walletIsLock});
        });
        ethereum.on('accountsChanged', async (accounts) => {
          await this.$store.dispatch("WalletAccountsAddress", {accounts})
          if (accounts.length > 0) {
            this.addressArr = accounts;
            this.address = accounts[0]||'';
          } else {
            this.addressArr = [];
            this.address = '';
          }
        });
      }
    })
    
  },
};
</script>
<style lang="scss" scoped>
  @import "index";
</style>
