<template>
  <van-popup
    round
    v-model="show"
    :closeable="showCloseIcon"
    :close-on-click-overlay="false"
    class="net-tip-modal" >
    <h4>Wrong NetWork</h4>
    <div class="tip-content">Please change the Metamask's network to the next step</div>
    <div class="tip-content">click to<a @click="addAndSwitchNet('l1')">L1 network</a>for deposit</div>
    <div class="tip-content">click to<a @click="addAndSwitchNet('l2')">L2 network</a>for withdraw</div>
  </van-popup>
</template>
<script>
import Vue from 'vue';
import { Popup, Button } from 'vant';
import { ethRPC, arbRPC, NETWORKS, L1ChainID, L2ChainID } from '@/utils/netWork'

Vue.use(Popup);
Vue.use(Button);

export default {
  name: "NetTipPopUp",
  props: ['show', 'showClose'],
  data() {
    return {
      showCloseIcon: this.showClose,
    }
  },
  methods: {
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
    },
  },
}
</script>
<style lang="scss" scoped>
  @import 'index';
</style>