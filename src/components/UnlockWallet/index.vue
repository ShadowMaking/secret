<template>
  <div class="component-unlockwallet">
    <div class="no-connect-wallet">
      <div :class="['flex', 'flex-center', {'margin10':!showLockIcon}]"><img :src="DEFAULTIMG.LOCK" v-show="showLockIcon"/></div>
      <mt-button type="primary" size="large" class="button button-large" @click="unlockWallet">Unlock Wallet</mt-button>
    </div>
    <v-walletstatus :show="installWalletModal" key="installWalletModal" @childEvent="closeWalletstatusPop" :installOtherWallet="installOtherWallet" />
    <v-netTipPopup :show="showNetTip" key="netTipModal-1" :showType="netTipPopupShowType" @childEvent="closeNetTip"/>
  </div>
</template>

<script>
import Vue from 'vue';
import { Button } from 'mint-ui';
import { DEFAULTIMG } from '@/utils/global';
import WalletStatus from '@/components/WalletStatus';
import NetTipModal from '@/components/NetTipModal';
import { getSelectedChainID, getNetMode, metamaskIsConnect, installWeb3Wallet, installWeb3WalletMetamask } from '@/utils/web3'
import { initTokenTime, updateLoginTime, tokenIsExpires } from '@/utils/auth'

Vue.component(Button.name, Button)

export default {
  name: 'ComponentForUnlockWallet',
  props: {
    showLockIcon: {
      default: true
    },
    expectNetType: {
      default: ''
    }
  },
  components: {
    "v-walletstatus": WalletStatus,
    "v-netTipPopup": NetTipModal,
  },
  data() {
    return {
      DEFAULTIMG,
      installWalletModal: false,
      showNetTip: false,
      installOtherWallet: false
    }
  },
  computed: {
    walletIsLock() {
      return this.$store.state.metamask.walletIsLock;
    },
    metamaskInstall() {
      return this.$store.state.metamask.metamaskInstall || installWeb3WalletMetamask();
    },
    netTipPopupShowType() {
      return this.expectNetType
    },
  },
  methods: {
    closeNetTip() {
      this.showNetTip = false;
    },
    closeWalletstatusPop() {
      this.installWalletModal = false;
    },
    async unlockWallet() {
      if (this.metamaskInstall) {
        // check netType
        const networkId = getSelectedChainID();
        const netMode = getNetMode(networkId);
        const disabled = this.expectNetType === 'l1' && netMode !== "l1" || this.expectNetType === 'l2' && netMode !== "l2"
        if (netMode !== "l1" && netMode !== "l2" || disabled) {
          this.showNetTip = true;
          return
        }
        this.showNetTip = false;
        if (!metamaskIsConnect()) {
          await ethereum.request({
            method: 'wallet_requestPermissions',
            params:  [{ "eth_accounts": {} }]
          })
        }
        const accounts = await ethereum.request({ method: 'eth_requestAccounts' })
        const selectedAccountAddress = window.ethereum.selectedAddress;
        await this.$store.dispatch("WalletAccountsAddress", {accounts})
        let signRes;
        let _isLock = true;
        if (tokenIsExpires()) {
          const message = `
            Access Eigen account.
            Only sign this message for a trusted client!
          `;
          // when signRes has value declare sign sucess
          signRes = await this.web3.eth.personal.sign(this.web3.utils.fromUtf8(message), selectedAccountAddress);
          signRes!==undefined && (_isLock = false)
          signRes!==undefined && (initTokenTime())
        } else {
          _isLock = false
          updateLoginTime()
        }
        await this.$store.dispatch('WalletLockStatus', {isLock: _isLock});
        this.$eventBus.$emit('updateAddress', {address: selectedAccountAddress});
        this.$eventBus.$emit('updateAvailableBanlanceForL1L2');
        return
      }

      this.installWalletModal = true;

      // exist install other web3 wallet
      if (!installWeb3Wallet()) {
        this.installOtherWallet = false
      } else {
        console.log('already install other web3 wallet')
        this.installOtherWallet = true
      }
    },
    async handleChainChanged({netId, showTip}) {
      const netMode = getNetMode(netId);
      if (netMode !== "l1" && netMode !== "l2") {
        !showTip && (this.showNetTip = true)
      } else {
        this.closeNetTip();
      }
    },
  },
  async mounted() {
    this.$eventBus.$on('chainChanged', this.handleChainChanged);
  },
  
};
</script>
<style lang="scss" scoped>
  @import 'index';
</style>
