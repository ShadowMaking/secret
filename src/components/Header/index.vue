<template>
  <div style="width:100%">
    <mt-header title="" class="common-header">
      <img :src="DEFAULTIMG.LOGO" slot="left" class="logo" @click="toPageHome" />
      <span slot="right" v-if="address!==''"  class="header-address"  @click="copyHash()">{{ `${address.slice(0,6)}...${address.slice(-4)}` }}</span>
      <div slot="right" v-else >
        <a @click="chooseWallet" class="linkWallet">wallet</a>
        <i class="icon night"></i>
        <i class="icon language"></i>
      </div>
    </mt-header>
    <van-popup v-model="popupVisible" round position="bottom" :style="{ minHeight: '30%' }" class="common-bottom-popup">
      <div class="common-exchange-detail-wrap choose-wallet-popup">
        <div class="header"><h3>Choose Wallet</h3></div>
        <div class="choose-wallet" @click="connectWallet">
          <i></i><span>metamask</span>
        </div>
      </div>
    </van-popup>
    <v-walletstatus :show="installWalletModal" key="installWalletModal" />
    <v-netTipPopup :show="showNetTip" key="netTipModal" />
  </div>
</template>

<script>
import Vue from 'vue';
import { Header, Button } from 'mint-ui';
import { DEFAULTIMG } from '@/utils/global';
import { Popup, Button as VanButton, Toast } from 'vant';
import WalletStatus from '@/components/WalletStatus';
import NetTipModal from '@/components/NetTipModal';
import { getSelectedChainID } from '@/utils/web3'
import { copyTxt } from '@/utils/index';

Vue.use(Popup);
Vue.use(VanButton);
Vue.use(Toast);
Vue.component(Header.name, Header)
Vue.component(Button.name, Button)

export default {
  name: 'Header',
  data() {
    return {
      DEFAULTIMG,
      popupVisible: false,
      installWalletModal: false,
      address: '',
      addressArr: [],
      walletIsLock: true,
    }
  },
  components: {
    "v-walletstatus": WalletStatus,
    "v-netTipPopup": NetTipModal,
  },
  computed: {
    metamaskInstall() {
      return this.$store.state.metamask.metamaskInstall
    },
    showNetTip() {
      return false
    },
  },
  watch: {
    '$store.state.metamask.accountsArr': function (res) { }
  },
  methods: {
    copyHash() {
      if (copyTxt(this.address)) {
        Toast.success('copy success');
      }
    },
    toPageHome() {
      if (this.$route.name ==='Home') {return;}
      this.$router.push({ name: 'Home' });
    },
    chooseWallet() {
      this.popupVisible = true;
      this.installWalletModal = false;
    },

    // unlock wallet and sign
    async connectWallet() {
      this.popupVisible = false;
      if (!this.metamaskInstall) {
        this.installWalletModal = true;
      } else {
        await ethereum.request({
          method: 'wallet_requestPermissions',
          params:  [{ "eth_accounts": {} }]
        })
        const accounts = await ethereum.request({ method: 'eth_requestAccounts' })
        const selectedAccountAddress = accounts[0];
        console.log('currentSelectedAccountAddress', selectedAccountAddress)
        const message = `
          Access Eigen account.
          Only sign this message for a trusted client!
        `;
        const signRes = await this.web3.eth.personal.sign(this.web3.utils.fromUtf8(message), selectedAccountAddress);
        console.log('signRes', signRes)
        let _isLock = true;
        // when signRes has value declare sign sucess
        signRes!==undefined && (_isLock = false);

        this.walletIsLock = _isLock;
        await this.$store.dispatch('WalletLockStatus', {isLock: _isLock});
        this.$eventBus.$emit('updateAddress', {address: selectedAccountAddress});
        this.updateAddress({address: selectedAccountAddress})
        // await ethereum.request({ method: 'eth_personalSign' });
        this.checkNetPair()
      }
    },
    updateAddress(info) {
      this.address = info.address;
    },
    checkNetPair() {
      const netId = getSelectedChainID();
      console.log('netId', netId)
    },
  },
  async mounted() {
    this.$eventBus.$on('updateAddress', this.updateAddress);
  },
};
</script>
<style lang="scss" scoped>
  @import "index";
</style>
