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
  </van-popup>
</template>
<script>
import Vue from 'vue';
import { Popup, Button } from 'vant';
import { ethRPC, arbRPC, NETWORKS, L1ChainID, L2ChainID } from '@/utils/netWork'
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
  watch: {
    show() {
      this.showPopup = this.show
    },
  },
  data() {
    return {
      showPopup: false,
      showCloseIcon: this.showClose,
    }
  },
  methods: {
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