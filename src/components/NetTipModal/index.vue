<template>
  <van-popup
    round
    v-model="showPopup"
    :closeable="showCloseIcon"
    :close-on-click-overlay="false"
    @close="closePopup"
    class="net-tip-modal" >
    <h4>Wrong Network</h4>
    <div class="tip-content">Please change the Metamask's network to the next steps:</div>
    <div class="tip-content" v-show="checkType('l1')">Deposit: Connect to<a @click="addAndSwitchNet('l1')">L1 Network</a></div>
    <div class="tip-content" v-show="checkType('l2')">Withdraw: Connect to<a @click="addAndSwitchNet('l2')">L2 Network</a></div>
    <v-walletstatus :show="installWalletModal" key="installWalletModal" @childEvent="closeWalletstatusPop" :installOtherWallet="installOtherWallet" />
  </van-popup>
</template>
<script>
import Vue from 'vue';
import { Popup, Button } from 'vant';
import { ethRPC, arbRPC, L1ChainID, L2ChainID } from '@/utils/netWork'
import { installWeb3Wallet } from '@/utils/web3'
import WalletStatus from '@/components/WalletStatus';
// import { ethRPC, arbRPC, NETWORKS, L1ChainID, L2ChainID } from '@/utils/netWork_arb'

Vue.use(Popup);
Vue.use(Button);

export default {
  name: "NetTipPopUp",
  props: {
    'show': {
      type: Boolean,
    },
    'showClose': {
      type: Boolean,
      default: true
    },
    'showType': {
      type: String,
      default: '', // l1 || l2
    }
  },
  components: {
    "v-walletstatus": WalletStatus,
  },
  computed: {
    metamaskInstall() {
      return this.$store.state.metamask.metamaskInstall;
    },
  },
  watch: {
    show() {
      this.showPopup = this.show
    },
  },
  data() {
    return {
      showPopup: false,
      showCloseIcon: this.showClose,
      installWalletModal: false,
      installOtherWallet: false
    }
  },
  methods: {
    closeWalletstatusPop() {
      this.installWalletModal = false;
    },
    closePopup() {
      this.showPopup = false;
      this.$emit('childEvent',{show: false});
    },
    checkType(type) {
      return this.showType === type || this.showType === '';
    },
    // Test for arb
    async addAndSwitchNetForArb(netType) {
      if (netType === 'l1') {
        await ethereum.request({
          jsonrpc: "2.0",
          method: 'wallet_switchEthereumChain',
          params: [{
            "chainId": L1ChainID
          }],
          id: 0
        })
      }
      if (netType === 'l2') {
        await ethereum.request({
          jsonrpc: "2.0",
          method: 'wallet_addEthereumChain',
          params: [{
            "chainId": L2ChainID,
            // "chainName": "SecretL2",
            "chainName": "Arbitrum Testnet",
            "rpcUrls": [ arbRPC ],
            // "blockExplorerUrls": []
          }],
          id: 0
        })
      }
    },
    async addAndSwitchNet(netType) {
      this.installWalletModal = false;
      if (!installWeb3Wallet()) {
        this.installWalletModal = true;
        this.installOtherWallet = false
        return
      }

      if (installWeb3Wallet() && !this.metamaskInstall) {
        this.installWalletModal = true;
        this.installOtherWallet = true
        return
      }

      const params = [];
      if (netType === 'l1') {
        params.push({
          "chainId": L1ChainID, // Hexadecimal
          "chainName": "SecretL1",
          "rpcUrls": [ ethRPC ],
          // "blockExplorerUrls": []
        })
      } 
      if (netType === 'l2') {
        params.push({
          "chainId": L2ChainID,
          "chainName": "SecretL2",
          "rpcUrls": [ arbRPC ],
          // "blockExplorerUrls": []
        })
      }
      await ethereum.request({
        jsonrpc: "2.0",
        method: 'wallet_addEthereumChain',
        params,
        id: 0
      })
      this.closePopup()
    },
  },
}
</script>
<style lang="scss" scoped>
  @import 'index';
</style>