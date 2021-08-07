<template>
  <div class="component-unlockwallet">
    <div class="no-connect-wallet">
      <div :class="['flex', 'flex-center', {'margin10':!showLockIcon}]"><img :src="DEFAULTIMG.LOCK" v-show="showLockIcon"/></div>
      <mt-button type="primary" size="large" class="button button-large" @click="unlockWallet">解锁钱包</mt-button>
    </div>
    <v-walletstatus :show="installWalletModal" key="installWalletModal" />
  </div>
</template>

<script>
import Vue from 'vue';
import { Button } from 'mint-ui';
import { DEFAULTIMG, address } from '@/utils/global';
import WalletStatus from '@/components/WalletStatus';
import { getAvailableBalanceByAddress } from '@/utils/auth';
import { utils } from 'ethers';

Vue.component(Button.name, Button)

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
  methods: {
    async unlockWallet() {
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
          
          const addressForL2 = address.arbTokenBridge;
          const balanceForL2 = await getAvailableBalanceByAddress(addressForL2, this);  // 获得L2的资产
          this.walletIsLock = _isLock;
          this.$eventBus.$emit('updateAddress', {address: signAdress});
          this.$eventBus.$emit('updateAvailableBanlance', {balance: balanceForL2});
        }
      } else {
        this.installWalletModal = true;
      }
    },
  },
  async mounted() { },
  
};
</script>
<style lang="scss" scoped>
  @import 'index';
</style>
