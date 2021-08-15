<template>
  <div class="component-unlockwallet">
    <div class="no-connect-wallet">
      <div :class="['flex', 'flex-center', {'margin10':!showLockIcon}]"><img :src="DEFAULTIMG.LOCK" v-show="showLockIcon"/></div>
      <mt-button type="primary" size="large" class="button button-large" @click="unlockWallet">解锁钱包</mt-button>
    </div>
    <v-walletstatus :showWalletTip="showWalletTip" title="应用检测到您还没有钱包账号" />
    <van-popup
      round
      :closeable="true"
      v-model="showAccoutList"
      :close-on-click-overlay="false">
      <ul class="account-list-for-wallet-modal">
        <span class="title van-hairline--bottom">该钱包下的账户</span>
        <li v-for="(item, index) in accountList" :key="index" @click="connectAccount(item)">
          <span class="name">{{ item.name }}</span>
          <a>连接到此账户</a>
        </li>
      </ul>
    </van-popup>
  </div>
</template>

<script>
import Vue from 'vue';
import { Button } from 'mint-ui';
import { DEFAULTIMG, address } from '@/utils/global';
import WalletStatus from '@/components/WalletStatusDialog';
import { getAvailableBalanceByAddress } from '@/utils/auth';
import { utils } from 'ethers';
import {
  rpcProvider, walletForRPC, bridgeAboutWalletForRPC,
  getAvailableBalanceForL2, } from '@/utils/walletBridge'
import { getInfoFromStorageByKey, removeFromStorage } from '@/utils/storage'
import { Dialog,Popup } from 'vant'

Vue.component(Button.name, Button)
Vue.use(Dialog)
Vue.use(Popup)

export default {
  name: 'ComponentForUnlockWallet',
  props: {
    showLockIcon: {
      default: true
    }
  },
  components: {
    "v-walletstatus": WalletStatus,
  },
  data() {
    return {
      DEFAULTIMG,
      installWalletModal: false,
      showWalletTip: false,
      showAccoutList: false,
    }
  },
  computed: {
    walletInfo() {
      return getInfoFromStorageByKey('walletInfo')
    },
    loginInfo() {
      return getInfoFromStorageByKey('loginInfo');
    },
    accountList() {
      return getInfoFromStorageByKey('walletAccounts')||[];
    },
    walletIsLock() {
      return this.$store.state.metamask.walletIsLock;
    },
    metamaskInstall() {
      return this.$store.state.metamask.metamaskInstall;
    },
    provider() {
      return rpcProvider()
    },
    wallet() {
      return walletForRPC()
    },
    bridge() {
      return bridgeAboutWalletForRPC()
    },
  },
  methods: {
    // 跟metamask联动效果的解锁
    async unlockWallet_origin() {
      if (this.metamaskInstall) {
        const message = `
          Access Eigen account.
          Only sign this message for a trusted client!
        `;
        const accounts = this.$store.state.metamask.accountsArr;
        if (accounts.length === 0) { // 没有登录
          // await ethereum.request({ method: 'eth_requestAccounts' });
          await ethereum.request({
            method: 'wallet_requestPermissions',
            params:  [{ "eth_accounts": {} }]
          });
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
          
          // const addressForL2 = address.arbTokenBridge;
          // const balanceForL2 = await getAvailableBalanceByAddress(addressForL2, this);  // 获得L2的资产

          let balanceForL2 = await getAvailableBalanceForL2();
          if (this.ethers.BigNumber.isBigNumber(balanceForL2)) {
            balanceForL2 = balanceForL2.toString()
          } else {
            balanceForL2 = 0;
          }
          
          this.walletIsLock = _isLock;
          this.$eventBus.$emit('updateAddress', {address: signAdress});
          this.$eventBus.$emit('updateAvailableBanlanceForL2', {balance: balanceForL2});
        }
      } else {
        this.installWalletModal = true;
      }
    },
    unlockWallet() {
      // 没有钱包账号
      if (!this.walletInfo) {
        this.showWalletTip = true;
        return
      }
      // 有钱包但是没有登录钱包
      if (!this.loginInfo) {
        this.showAccoutList = true;
        return
      }
      // 进入解锁授权页面
      this.$router.push({ name: 'SignWallet' });
    },
    // 登录账户
    async connectAccount(account) {
      console.log(account)
      removeFromStorage(['loginInfo']);
      const accountInfo = {
        login: true,
        address: account.address
      };
      const loginRes = await this.$store.dispatch('login', { ...accountInfo });
      this.showAccoutList = false;
      if (this.$route.name === 'Home') {
        this.$store.dispatch('updateWalletLockStatus', {walletIsLock: false})
        this.$emit('childEvent',{ login: true });
        return;
      }
      this.$router.push({ name: 'Home' });
    }
  },
  async mounted() { },
  
};
</script>
<style lang="scss" scoped>
  @import 'index';
</style>
