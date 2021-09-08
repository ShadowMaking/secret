<template>
  <div class="page-home">
    <div class="page-home-account flex flex-center flex-column ">
      <a class="button button-with-radius button-update" @click="refresh">
        <i :class="['icon','ico-ipdate', {'spin': refreshLoading}]"></i>
        Refresh
      </a>
      <!-- <van-row gutter="20">
        <van-col span="12">
          <div class="flex flex-column account-info">
            <span class="balance">{{ balanceL1 }}</span>
            <span class="tip">L1 Total Assets</span>
          </div>
        </van-col>
        <van-col span="12">
          <div class="flex flex-column account-info">
            <span class="balance">{{ balanceL2 }}</span>
            <span class="tip">L2 Total Assets</span>
          </div>
        </van-col>
      </van-row> -->
      <div class="flex flex-column account-info" style="display:none">
        <span class="balance">{{ balance }}</span>
        <span class="tip">L2 Total Assets($)</span>
      </div>
      <div class="account-balance">
        <span class="balance">L1 Total Assets(ETH)：{{ balanceL1 }}</span>
        <span class="balance">L2 Total Assets(ETH)：{{ balanceL2 }}</span>
      </div>
      <div class="flex page-home-opt-wrap">
        <mt-button type="default" size="large" class="button button-with-radius" @click="toPage('recharge')">Deposit</mt-button>
        <mt-button type="primary" size="large" class="button button-with-radius" @click="toPage('transfer')">Send</mt-button>
        <mt-button type="default" size="large" class="button button-with-radius" @click="toPage('withdraw')">Withdraw</mt-button>
      </div>
    </div>
    <div v-show="walletIsLock" class="unlock-wallet-button-wrapper">
      <v-unlockwallet key="unlockWalletButton" />
    </div>
    <v-exchangeList key="comon-exchangeList" type="all" v-show="!walletIsLock" />
    <v-netTipPopup :show="showNetTip" key="netTipModal" :showType="expectNetType"/>
    <v-walletstatus :show="installWalletModal" key="installWalletModal" @childEvent="closeWalletstatusPop" />
  </div>
</template>

<script>
import Vue from 'vue';
import { Button, Cell, Popup } from 'mint-ui';
import { Col, Row } from 'vant';
import ExchangeList from '@/components/ExchangeList';
import UnlockWallet from '@/components/UnlockWallet';
import WalletStatus from '@/components/WalletStatus';
import { providers, utils, Wallet, BigNumber, constants } from 'ethers'
import { DEFAULTIMG } from '@/utils/global';
import { getSelectedChainID, getInjectedWeb3, getNetMode, initBrideByTransanctionType } from '@/utils/web3'
import NetTipModal from '@/components/NetTipModal';

Vue.component(Button.name, Button)
Vue.component(Cell.name, Cell)
Vue.component(Popup.name, Popup)
Vue.use(Col);
Vue.use(Row);
const { parseEther } = utils;

export default {
  name: 'Home',
  components: {
    "v-exchangeList": ExchangeList,
    "v-unlockwallet": UnlockWallet,
    "v-netTipPopup": NetTipModal,
    "v-walletstatus": WalletStatus,
  },
  data() {
    return {
      DEFAULTIMG,
      popupVisible: false,
      installWalletModal: false,
      exchangeListData: [],
      balance: '0.0',
      showNetTip: false,
      expectNetType: '', // L1 || l2
      balanceL1: '0.0',
      balanceL2: '0.0',
      refreshLoading: false,
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
        this.$eventBus.$emit('updateAvailableBanlanceForL1L2');
      }
    }
  },
  
  methods: {
    closeWalletstatusPop() {
      this.installWalletModal = false;
    },
    getExchangeDetail() {
      this.popupVisible = true;
    },
    async toPage(pageType) {
      this.showNetTip = false;
      if (!this.metamaskInstall) {
        this.installWalletModal = true;
        return
      }
      if (this.showUnlockWalletButton) {
        this.$router.push({ name: pageType });
        return
      }
      const { provider, networkId } = await getInjectedWeb3();
      const netMode = getNetMode(networkId);
      switch(pageType) {
        case "recharge":
          if (netMode !== 'l1') {
            this.expectNetType = 'l1';
            this.showNetTip = true;
            return
          }
          this.$router.push({ name: 'recharge' })
          break;
        case "transfer":
          if (netMode !== 'l2') {
            this.expectNetType = 'l2';
            this.showNetTip = true;
            return
          }
          this.$router.push({ name: 'transfer' })
          break;
        case "withdraw":
          if (netMode !== 'l2') {
            this.expectNetType = 'l2';
            this.showNetTip = true;
            return
          }
          this.$router.push({ name: 'withdraw' })
          break;
      }
    },
    async refresh() {
      if (this.walletIsLock) {
        return
      }
      console.log('refresh...')
      this.refreshLoading = true;
      this.$eventBus.$emit('handleUpdateTransactionHistory', {type: 'all'});
      await this.updateAvailableBanlanceForL1L2();
      console.log('refresh done!!!');
      this.refreshLoading = false;
    },
    handleWatchResetStatus() {
      this.balance = '0.0'
      this.balanceL1 = '0.0'
      this.balanceL2 = '0.0'
    },
    async unlockWallet() {
      if (this.metamaskInstall) {
        const accounts = this.$store.state.metamask.accountsArr;
        if (accounts.length === 0) { // not login
          // await ethereum.request({ method: 'eth_requestAccounts' });
          await ethereum.request({
            method: 'wallet_requestPermissions',
            params:  [{ "eth_accounts": {} }]
          })
          const accounts = await ethereum.request({ method: 'eth_requestAccounts' })
          const selectedAccountAddress = accounts[0];
          const message = `
            Access Eigen account.
            Only sign this message for a trusted client!
          `;
          const signRes = await this.web3.eth.personal.sign(this.web3.utils.fromUtf8(message), selectedAccountAddress);

          await this.$store.dispatch("WalletAccountsAddress", {accounts})
          let _isLock = true;
          // when signRes has value declare sign sucess
          signRes!==undefined && (_isLock = false);

          this.walletIsLock = _isLock;
          await this.$store.dispatch('WalletLockStatus', {isLock: _isLock});
          this.$eventBus.$emit('updateAddress', {address: selectedAccountAddress});
          // this.checkNetPair()
          return
        }
      }
      this.installWalletModal = true;
    },
    async updateAvailableBanlanceForL1L2(balanceObj) {
      const netMode = getNetMode();
      if (!netMode) { return; }
      this.balanceL1 = '...';
      this.balanceL2 = '...';
      const bridge = initBrideByTransanctionType(netMode);
      const balanceForL1 = await bridge.getAndUpdateL1EthBalance();
      const balanceForL2 = await bridge.getAndUpdateL2EthBalance();
      this.balanceL1 = utils.formatEther(balanceForL1);
      this.balanceL2 = utils.formatEther(balanceForL2);
    },
    async handleChainChanged({netId, showTip}) {
      if (showTip) {
        this.showNetTip = false;
        return
      }
      const mode = getNetMode(netId)
      if (this.expectNetType && mode !== this.expectNetType) {
        this.showNetTip = true;
        this.balanceL1 = '0.0';
        this.balanceL2 = '0.0';
        await this.$store.dispatch('WalletLockStatus', {isLock: true});
      } else {
        this.showNetTip = false;
      }
    },
  },
  async mounted() {
    this.$eventBus.$on('chainChanged', this.handleChainChanged);

    if (!this.walletIsLock) {
      await this.updateAvailableBanlanceForL1L2();
    }
    this.$eventBus.$on('updateAvailableBanlanceForL1L2', this.updateAvailableBanlanceForL1L2);
    this.$eventBus.$on('resetStatus', this.handleWatchResetStatus);
  },
  
};
</script>
<style lang="scss" scoped>
  @import 'index';
</style>
