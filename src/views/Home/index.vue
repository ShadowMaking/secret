<template>
  <div class="page-home">
    <div class="page-home-account flex flex-center flex-column ">
      <a class="button button-with-radius button-update"><i class="icon ico-ipdate"></i>刷新</a>
      <div class="flex flex-column account-info">
        <span class="balance">{{ balance }}</span>
        <span class="tip">L2 资产总额($)</span>
      </div>
      <div class="flex page-home-opt-wrap">
        <mt-button type="default" size="large" class="button button-with-radius" @click="toPage('recharge')">充值到 L2</mt-button>
        <mt-button type="primary" size="large" class="button button-with-radius" @click="toPage('transfer')">L2 转账</mt-button>
        <mt-button type="default" size="large" class="button button-with-radius" @click="toPage('withdraw')">提现到 L1</mt-button>
      </div>
    </div>
    <v-unlockwallet :show="showUnlockWalletButton" key="unlockWalletButton" v-show="walletIsLock" />
    <v-exchangeList key="comon-exchangeList" type="all" v-show="!walletIsLock" />
  </div>
</template>

<script>
import Vue from 'vue';
import { Button, Cell, Popup } from 'mint-ui';
import { DEFAULTIMG } from '@/utils/global';
import ExchangeList from '@/components/ExchangeList';
import UnlockWallet from '@/components/UnlockWallet';

import { providers, utils, Wallet, BigNumber, constants } from 'ethers'
import { Bridge } from 'arb-ts';
import {
  // DEFAULTIMG,
  address,
  DEVNET_PRIVKEY,
  ethRPC,
  arbRPC
} from '@/utils/global';

const { parseEther } = utils;


Vue.component(Button.name, Button)
Vue.component(Cell.name, Cell)
Vue.component(Popup.name, Popup)

export default {
  name: 'Home',
  components: {
    "v-exchangeList": ExchangeList,
    "v-unlockwallet": UnlockWallet,
  },
  data() {
    return {
      DEFAULTIMG,
      popupVisible: false,
      installWalletModal: false,
      exchangeListData: [],
      balance: '0'
    }
  },
  computed: {
    walletIsLock() {
      return this.$store.state.metamask.walletIsLock;
    },
    metamaskInstall() {
      return this.$store.state.metamask.metamaskInstall;
    },
    showUnlockWalletButton() {
      return !this.metamaskInstall || this.walletIsLock;
    },
  },
  watch: {
    /* '$store.state.metamask.walletIsLock': function (res) {
      this.walletIsLock = res;
    } */
  },
  
  methods: {
    wait(ms) {
      return new Promise(res => setTimeout(res, ms || this.defaultWait))
    },
    prettyLog(text) {
      // console.log(chalk.blue(`    *** ${text}`))
      console.log(`%c------------- ${text} ------------- \n`, 'background: #333; color: #8dc63f');
      console.log()
    },
    getExchangeDetail() {
      this.popupVisible = true;
    },
    toPage(pageType) {
      switch(pageType) {
        // 充值
        case "recharge":
          this.$router.push({ name: 'recharge' })
          break;
        // 转账
        case "transfer":
          this.$router.push({ name: 'transfer' })
          break;
        // 提现
        case "withdraw":
          this.$router.push({ name: 'withdraw' })
          break;
      }
    },
    async unlockWallet() {
      if (this.metamaskInstall) {
        const message = `
          Access Eigen account.
          Only sign this message for a trusted client!
        `;
        const accounts = this.$store.state.metamask.accountsArr;
        if (accounts.length === 0) { // 没有登录
          await ethereum.request({ method: 'eth_requestAccounts' });
          const accounts = await this.web3.eth.getAccounts();
          const coinbaseAddress = await this.web3.eth.coinbase;
          const lockStatus = this.$store.state.metamask.walletIsLock;
          await this.$store.dispatch("WalletAccountsAddress", {accounts})
          const message = `
            Access Eigen account.
            Only sign this message for a trusted client!
          `;
          const signAdress = this.$store.state.metamask.accountsArr[0]||accounts[0];
          const signRes = await this.web3.eth.personal.sign(this.web3.utils.fromUtf8(message), signAdress);
          // when signRes has value declare sign sucess
          let _isLock = true;
          signRes!==undefined && (_isLock = false) 
          await this.$store.dispatch('WalletLockStatus', {isLock:_isLock});
          this.walletIsLock = _isLock;
          this.$eventBus.$emit('updateAddress', {address: signAdress});
        }
      } else {
        this.installWalletModal = true;
      }
    },
  },
  async mounted() {
    // ------------------------ 公用数据 ------------------------------//

      const ethProvider = new providers.JsonRpcProvider(ethRPC)
      const arbProvider = new providers.JsonRpcProvider(arbRPC)

      const ethToL2DepositAmount = parseEther('0.0001')
      const ethFromL2WithdrawAmount = parseEther('0.00001')
      
      const testPk = DEVNET_PRIVKEY;

      const l1TestWallet= new Wallet(testPk, ethProvider)
      const l2TestWallet = new Wallet(testPk, arbProvider)
      
      console.log(address.ethERC20Bridge)
      console.log(address.arbTokenBridge)

      const testBridge = new Bridge(
        address.ethERC20Bridge,
        address.arbTokenBridge,
        l1TestWallet,
        l2TestWallet
      )

      // const preFundedSignerPK = process.env['DEVNET_PRIVKEY']
      const preFundedSignerPK = testPk;
      if (!preFundedSignerPK) throw new Error('Missing l2 priv key')
      const preFundedWallet = new Wallet(preFundedSignerPK, ethProvider)

      // ------------------------ 公用数据 ------------------------------//

      // 判断账户是否有余额
      // const accounts = await ethers.getSigners();
      // accounts.forEach(function(acc,index){
      //   console.log(index, acc.address)
      // })

      const balance = await preFundedWallet.getBalance()
      const depositAmount = '0.01';
      const hasBalance = balance.gt(utils.parseEther(depositAmount))

      if (!hasBalance) {
        this.prettyLog(
          `${preFundedWallet.address} 
          not pre-funded; set a funded wallet via env-var DEVNET_PRIVKEY. exiting.`)
        return
      }

      this.prettyLog('Using preFundedWallet: ' + preFundedWallet.address);
      this.prettyLog('Randomly generated test wallet: ' + l1TestWallet.address);


      const testWalletL1EthBalance = await testBridge.getAndUpdateL1EthBalance()
      const testWalletL2EthBalance = await testBridge.getAndUpdateL2EthBalance()
      console.log(testWalletL1EthBalance.toString(), testWalletL2EthBalance.toString()) 

      this.balance = utils.formatEther(testWalletL2EthBalance);
        
      /* const res = await preFundedWallet.sendTransaction({
        to: l1TestWallet.address,
        value: utils.parseEther(depositAmount),
      })
      const rec = await res.wait()
      const testWalletBalance = await l1TestWallet.getBalance()
      console.log(testWalletBalance.toString())

      this.wait(10000 * 5);
      const testWalletL1EthBalance = await testBridge.getAndUpdateL1EthBalance()
      const testWalletL2EthBalance = await testBridge.getAndUpdateL2EthBalance()
      console.log(testWalletL1EthBalance.toString(), testWalletL2EthBalance.toString()) */

      //expect(testWalletL1EthBalance.eq(parseEther(depositAmount))).to.be.true
      //expect(testWalletL2EthBalance.eq(Zero)).to.be.true
  },
  
};
</script>
<style lang="scss" scoped>
  @import 'index';
</style>
