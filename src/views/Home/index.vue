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
    <v-exchangeList key="comon-exchangeList" type="all" v-show="!walletIsLock" />
  </div>
</template>

<script>
import Vue from 'vue';
import { Button, Cell, Popup } from 'mint-ui';
import { DEFAULTIMG } from '@/utils/global';
import ExchangeList from '@/components/ExchangeList';

Vue.component(Button.name, Button)
Vue.component(Cell.name, Cell)
Vue.component(Popup.name, Popup)

export default {
  name: 'Home',
  components: {
    'v-exchangeList': ExchangeList,
  },
  data() {
    return {
      DEFAULTIMG,
      popupVisible: false,
      exchangeListData: [1],
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
      console.log(res)
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
        const signRes = await this.web3.eth.personal.sign(this.web3.utils.fromUtf8(message), accounts[0]);
        let success = false;
        signRes && (success = true);
        this.walletIsLock = success;
        await this.$store.dispatch('WalletLockStatus', {isLock: !success});
        // console.log(this.$store.state.metamask.walletIsLock)
      }
    },
  },
  mounted() {
    window.addEventListener("load", async () => {
      this.walletIsLock = this.$store.state.metamask.walletIsLock;
    })
  },
  
};
</script>
<style lang="scss" scoped>
  @import 'index';
</style>
