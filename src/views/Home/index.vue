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
import ExchangeList from '@/components/ExchangeList';
import UnlockWallet from '@/components/UnlockWallet';
import {
  getAvailableBalanceByAddress,
  getAvailableBalanceByAddressFromProvider } from '@/utils/auth';

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
    '$store.state.metamask.walletIsLock': function (res) {
      if (!this.walletIsLock) {
        this.$eventBus.$emit('updateAvailableBanlance');
      }
    }
  },
  
  methods: {
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
    async updateAvailableBanlance (balanceObj) {
      let balanceForL2 = this.balance;
      if (balanceObj) {
        balanceForL2 = balanceObj.balance;
      } else {
        const addressForL2 = address.arbTokenBridge;
        balanceForL2 = await getAvailableBalanceByAddress(addressForL2, this);  // 获得L2的资产
        // balanceForL2 = await getAvailableBalanceByAddressFromProvider(addressForL2, this);  // 获得L2的资产
      }
      this.balance = utils.formatEther(balanceForL2)
    },
  },
  async mounted() {
    const balance = await this.updateAvailableBanlance();
    this.$eventBus.$on('updateAvailableBanlance', this.updateAvailableBanlance);
  },
  
};
</script>
<style lang="scss" scoped>
  @import 'index';
</style>
