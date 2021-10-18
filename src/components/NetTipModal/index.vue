<template>
  <div>
    <van-popup
      round
      v-model="showPopup"
      :closeable="showCloseIcon"
      :close-on-click-overlay="false"
      @close="closeNetTipPopup"
      class="net-tip-modal" >
      <h4>Wrong Network</h4>
      <div class="tip-content">Please change the Metamask's network to the next steps:</div>
      <div class="tip-content" v-show="checkType('l1')">Deposit: Connect to<a @click="addAndSwitchNet('l1')">L1 Network</a></div>
      <div class="tip-content" v-show="checkType('l2')">Withdraw: Connect to<a @click="addAndSwitchNet('l2')">L2 Network</a></div>
      <v-walletstatus :show="installWalletModal" key="installWalletModal" @childEvent="closeWalletstatusPop" :installOtherWallet="installOtherWallet" />
    </van-popup>
    <van-dialog
      v-model="showTokenTipPopup"
      title="Token Tip"
      show-cancel-button
      confirmButtonText="Switch Network"
      cancelButtonText="Add Token"
      @confirm="switchNet"
      @cancel="confirmAddToken"
      confirmButtonColor="#495ABE">
      <div class="token-tip-modal">
        <div class="tip-content">We provide Token on this Network</div>
        <div class="tip-content">You can click to add, or ignore if you already add</div>
      </div>
    </van-dialog>
    <a class="hide" ref="addTokenRef" @click="addToken"></a>
  </div>
</template>
<script>
import Vue from 'vue';
import { Popup, Dialog } from 'vant';
import { ethRPC, arbRPC, L1ChainID, L2ChainID } from '@/utils/netWork'
import { installWeb3Wallet, installWeb3WalletMetamask, getNetMode, getSelectedChainID, initBrideByNetType } from '@/utils/web3'
import WalletStatus from '@/components/WalletStatus';
import { TOKEN_L1, TOKEN_L2 }  from '@/utils/token';
import { wait }  from '@/utils/index';
// import { ethRPC, arbRPC, NETWORKS, L1ChainID, L2ChainID } from '@/utils/netWork_arb'

Vue.use(Popup);
Vue.use(Dialog);

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
      return this.$store.state.metamask.metamaskInstall || installWeb3WalletMetamask();
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
      installOtherWallet: false,
      showTokenTipPopup: false,
      expectSwitchNetType: '', // l1 || l2
    }
  },
  methods: {
    closeWalletstatusPop() {
      this.installWalletModal = false;
    },
    closeNetTipPopup() {
      this.showPopup = false;
      this.$emit('childEvent',{show: false});
    },
    closeTokenPopup() {
      this.showTokenTipPopup = false;
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
    async switchNet(callback) {
      this.closeTokenPopup();
      this.closeNetTipPopup();
      const netType = this.expectSwitchNetType;
      const params = [];
      let chainId;
      if (netType === 'l1') {
        chainId = L1ChainID
        params.push({
          "chainId": L1ChainID, // Hexadecimal
          "chainName": "SecretL1",
          "rpcUrls": [ ethRPC ],
          // "blockExplorerUrls": []
        })
      }
      if (netType === 'l2') {
        chainId = L2ChainID
        params.push({
          "chainId": L2ChainID,
          "chainName": "SecretL2",
          "rpcUrls": [ arbRPC ],
          "blockExplorerUrls": ["https://explorer.ieigen.com"]
        })
      }
      ethereum.request({
        jsonrpc: "2.0",
        method: 'wallet_addEthereumChain',
        params,
        id: 0
      })
      .then(res=>{
        callback && callback(res, this.web3.utils.hexToNumberString(chainId))
      })
      .catch(err=>console.log(err))
    },
    async addToken() {
      const netType = this.expectSwitchNetType;
      const list = _.cloneDeep([].concat(netType === 'l1' ? TOKEN_L1 : TOKEN_L2))
      for(let i = 0; i < list.length; i += 1) {
        await ethereum.request({
          jsonrpc: "2.0",
          method: 'wallet_watchAsset',
          params: {
            "type": list[i]['tokenType'],
            "options": {
              "address": list[i]['tokenAddress'],
              "symbol": list[i]['symbol'],
              "decimals": list[i]['decimals'],
            }
          },
          id: Math.random()
        })
      }
    },
    // TODO
    async confirmAddToken() {
      this.switchNet((res, chainId) => {
        // confirm already switch net
        const mode = getNetMode(chainId || getSelectedChainID())
        const netType = this.expectSwitchNetType;
        if (netType !== mode) { return }
        wait()
        this.$refs.addTokenRef.click()
      })
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

      this.showTokenTipPopup = true;
      this.expectSwitchNetType = netType;
      this.closeNetTipPopup();
    },
  },
}
</script>
<style lang="scss" scoped>
  @import 'index';
</style>