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
        <span class="balance">L1 Total Assets(ETH)：{{ balanceL1|showAvailableBalance }}</span>
        <span class="balance">L2 Total Assets(ETH)：{{ balanceL2|showAvailableBalance }}</span>
      </div>
      <div class="flex page-home-opt-wrap">
        <mt-button type="default" size="large" class="button button-with-radius" @click="toPage('deposit')">Deposit</mt-button>
        <mt-button type="primary" size="large" class="button button-with-radius" @click="toPage('send')">Send</mt-button>
        <mt-button type="default" size="large" class="button button-with-radius" @click="toPage('withdraw')">Withdraw</mt-button>
      </div>
    </div>
    <div v-show="walletIsLock" class="unlock-wallet-button-wrapper">
      <v-unlockwallet key="unlockWalletButton" />
    </div>
    <v-exchangeList key="comon-exchangeList" type="all" v-show="!walletIsLock" />
    <v-netTipPopup :show="showNetTip" key="netTipModal" :showType="expectNetType" @childEvent="closeNetTip" />
    <v-walletstatus :show="installWalletModal" key="installWalletModal" @childEvent="closeWalletstatusPop" :installOtherWallet="installOtherWallet" />
    <van-notify v-model="showNotify" type="warning" class="back-up-home-tip">
      <div class="home-top-tip">
        <span>
          <van-icon name="bell" style="margin-right: 4px;" />
        Create recovery now <a @click="backUp">Back up</a>
        </span>
        <van-icon name="close" @click="closeNotify" class="close-icon"/>
      </div>
    </van-notify>
    <v-backupModal :show="showBackupMethod" @childEvent="showBackupMethod=false" />
  </div>
</template>

<script>
import Vue from 'vue';
import { Button, Cell, Popup } from 'mint-ui';
import { Col, Row, Tag, Notify } from 'vant';
import ExchangeList from '@/components/ExchangeList';
import UnlockWallet from '@/components/UnlockWallet';
import WalletStatus from '@/components/WalletStatus';
import { utils } from 'ethers'
import { DEFAULTIMG } from '@/utils/global';
import { getSelectedChainID, getNetMode, initBrideByNetType, installWeb3Wallet, installWeb3WalletMetamask } from '@/utils/web3'
import NetTipModal from '@/components/NetTipModal';
import BackUpMethodModal from '@/components/BackUpMethod';
import { retainDecimals } from '@/utils/number'
import { getQueryString, getLocationParam } from '@/utils/index'

Vue.component(Button.name, Button)
Vue.component(Cell.name, Cell)
Vue.component(Popup.name, Popup)
Vue.use(Col);
Vue.use(Row);
Vue.use(Tag);
Vue.use(Notify);

export default {
  name: 'Home',
  components: {
    "v-exchangeList": ExchangeList,
    "v-unlockwallet": UnlockWallet,
    "v-netTipPopup": NetTipModal,
    "v-walletstatus": WalletStatus,
    "v-backupModal": BackUpMethodModal,
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
      installOtherWallet: false,
      showNotify: false,
      showBackupMethod: false,
    }
  },
  filters: {
    showAvailableBalance(amount) {
      if (!isNaN(amount)) {
        return retainDecimals(amount, 6)
      }
      return amount
    }
  },
  computed: {
    walletIsLock() {
      return this.$store.state.metamask.walletIsLock;
    },
    metamaskInstall() {
      return this.$store.state.metamask.metamaskInstall || installWeb3WalletMetamask();
    },
    showUnlockWalletButton() {
      return !this.metamaskInstall || this.walletIsLock;
    },
  },
  watch: {
    '$store.state.metamask.walletIsLock': function (res) {
      this.showNotify = false
      if (!this.walletIsLock) {
        this.showNotify = true
        this.$eventBus.$emit('updateAvailableBanlanceForL1L2');
      }
    }
  },
  
  methods: {
    closeWalletstatusPop() {
      this.installWalletModal = false;
    },
    closeNetTip() {
      this.showNetTip = false;
    },
    getExchangeDetail() {
      this.popupVisible = true;
    },
    async toPage(pageType) {
      this.showNetTip = false;

      if (!installWeb3Wallet()) {
        this.installWalletModal = true;
        this.installOtherWallet = false
        return
      }

      // exist install other web3 wallet
      if (installWeb3Wallet() && !this.metamaskInstall) {
        console.log('already install other web3 wallet')
        this.installWalletModal = true;
        this.installOtherWallet = true
        return
      }

      if (this.showUnlockWalletButton) {
        this.$router.push({ name: pageType });
        return
      }
      const networkId = getSelectedChainID();
      const netMode = getNetMode(networkId);
      switch(pageType) {
        case "deposit":
          if (netMode !== 'l1') {
            this.expectNetType = 'l1';
            this.showNetTip = true;
            return
          }
          this.$router.push({ name: 'deposit' })
          break;
        case "send":
          if (netMode !== 'l2') {
            this.expectNetType = 'l2';
            this.showNetTip = true;
            return
          }
          this.$router.push({ name: 'send' })
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
    async updateAvailableBanlanceForL1L2(balanceObj) {
      const netMode = getNetMode();
      if (!netMode) { return; }
      this.balanceL1 = '...';
      this.balanceL2 = '...';
      const bridge = initBrideByNetType(netMode)['bridge'];
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
    closeNotify() {
      this.showNotify = false
    },
    backUp() {
      // this.showBackupMethod = true
      this.$router.push({ name: 'backup' });
    },
  },
  async mounted() {
    const googleUserId = getLocationParam('id')
    const googleAuthToken = getLocationParam('auth_token')
    if (googleUserId) {
      await this.$store.dispatch('StoreGoogleUserId', {userId: googleUserId })
      await this.$store.dispatch('StoreGoogleAuthToken', {authToken: googleAuthToken })
      const { hasError, data: userInfo } = await this.$store.dispatch('GetUserInfoById', { userId: googleUserId })
      this.$eventBus.$emit('thirdLogin', { success: !hasError, userInfo });
    }
    this.$eventBus.$on('chainChanged', this.handleChainChanged);

    if (!this.walletIsLock) {
      await this.updateAvailableBanlanceForL1L2();
    }
    this.$eventBus.$on('updateAvailableBanlanceForL1L2', this.updateAvailableBanlanceForL1L2);
    this.$eventBus.$on('chainChanged', this.handleWatchResetStatus);
    this.$eventBus.$on('accountsChanged', this.handleWatchResetStatus);
    this.$eventBus.$on('disconnect', this.handleWatchResetStatus);
  },
  created() {
    const token = getQueryString('access_token', window.location.href.split('#')[1])
    console.log('token', token)
  },
  
};
</script>
<style lang="scss" scoped>
  @import 'index';
</style>
