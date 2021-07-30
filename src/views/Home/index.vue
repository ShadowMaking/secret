<template>
  <div class="page-home">
    <div class="page-home-account flex flex-center flex-column">
      <a class="button button-with-radius button-update"><i class="icon ico-ipdate"></i>刷新</a>
      <div class="flex flex-column account-info">
        <span class="balance">4.22</span>
        <span class="tip">L2 资产总额($)</span>
      </div>
      <div class="flex page-home-opt-wrap">
        <mt-button type="default" size="large" class="button button-with-radius" @click="toPage('recharge')">充值到 L2</mt-button>
        <mt-button type="primary" size="large" class="button button-with-radius" @click="toPage('transfer')">L2 转账</mt-button>
        <mt-button type="default" size="large" class="button button-with-radius" @click="toPage('withdraw')">提现到 L1</mt-button>
      </div>
    </div>
    <div class="page-home-no-connect-wallet" v-show="walletIsLock">
      <div class="flex flex-center"><img :src="DEFAULTIMG.LOCK" /></div>
      <mt-button type="primary" size="large" class="button button-large" @click="unlockWallet">解锁钱包</mt-button>
    </div>
    <v-walletstatus :show="installWalletModal" key="installWalletModal" />
    <v-exchangeList key="comon-exchangeList" type="all" v-show="!walletIsLock" />
  </div>
</template>

<script>
import Vue from 'vue';
import { Button, Cell, Popup } from 'mint-ui';
import { DEFAULTIMG } from '@/utils/global';
import ExchangeList from '@/components/ExchangeList';
import WalletStatus from '@/components/WalletStatus';

Vue.component(Button.name, Button)
Vue.component(Cell.name, Cell)
Vue.component(Popup.name, Popup)

export default {
  name: 'Home',
  components: {
    "v-exchangeList": ExchangeList,
    "v-walletstatus": WalletStatus,
  },
  data() {
    return {
      DEFAULTIMG,
      popupVisible: false,
      installWalletModal: false,
      exchangeListData: [],
      detailList: [
        {
          title: '时间',
          value: '13/07/2021 12:54:35'
        },
        {
          title: '操作',
          value: '充值 54.6958 ZKS'
        },
      ],
      // walletIsLock: true,
    }
  },
  computed: {
    walletIsLock() {
      return this.$store.state.metamask.walletIsLock;
    },
    metamaskInstall() {
      return this.$store.state.metamask.metamaskInstall;
    },
  },
  watch: {
    '$store.state.metamask.walletIsLock': function (res) {
      this.walletIsLock = res;
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
    updateWalletLockStatus(status) {
      // const that = this;
      // console.log(this.$store.state.metamask)
      // this.walletIsLock = status
      this.$store.dispatch('WalletLockStatus', {isLock: status});
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
          const coinbaseAddress = this.web3.eth.coinbase;
          const lockStatus = this.$store.state.metamask.walletIsLock;
          console.log('钱包账户状态1', lockStatus)
          const message = `
            Access Eigen account.
            Only sign this message for a trusted client!
          `;
          const signAdress = this.$store.state.metamask.accountsArr[0];
          const signRes = await this.web3.eth.personal.sign(this.web3.utils.fromUtf8(message), signAdress);
          // when signRes has value declare sign sucess
          let _isLock = true;
          signRes!==undefined && (_isLock = false) 
          await this.$store.dispatch('WalletLockStatus', {isLock:_isLock});
          console.log('钱包账户状态', this.$store.state.metamask.walletIsLock)
        }
      } else {
        this.installWalletModal = true;
      }
    },
  },
  mounted() {
    window.addEventListener("load", async () => {
      // this.walletIsLock = this.$store.state.metamask.walletIsLock;
      console.log('钱包账户是否锁定', this.$store.state.metamask.walletIsLock)
      console.log('1111',this.$store.state.metamask)

      this.$eventBus.$on('updateWalletLockStatus',this.updateWalletLockStatus);
    })
  },
  
};
</script>
<style lang="scss" scoped>
  @import 'index';
</style>
