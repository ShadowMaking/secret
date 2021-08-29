<template>
  <div style="width:100%">
    <mt-header title="" class="common-header">
      <div slot="left" class="header-left">
        <div v-show="$route.name!=='home'" class="flex flex-center" @click="back">
          <van-icon name="arrow-left" class="back-icon" size="18"/>
          <span>{{ navTxt() }}</span>
        </div>
        <img :src="DEFAULTIMG.LOGO" class="logo" @click="toPageHome" v-show="$route.name==='home'"/>
      </div>
      <span slot="right" v-if="address!==''"  class="header-address"  @click="copyHash()">{{ `${address.slice(0,6)}...${address.slice(-4)}` }}</span>
      <div slot="right" v-else >
        <a @click="chooseWallet" class="linkWallet">Connect Wallet</a>
        <i class="icon night" style="display:none"></i>
        <i class="icon language" style="display:none"></i>
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
import { Popup, Button as VanButton, Toast, Icon } from 'vant';
import WalletStatus from '@/components/WalletStatus';
import NetTipModal from '@/components/NetTipModal';
import { getSelectedChainID, getInjectedWeb3, getNetMode, initBrideByTransanctionType } from '@/utils/web3'
import { copyTxt } from '@/utils/index';

Vue.use(Popup);
Vue.use(VanButton);
Vue.use(Toast);
Vue.use(Icon);
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
      walletIsLock: true,
      showNetTip: false,
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
  },
  watch: {
    '$store.state.metamask.accountsArr': function (res) { }
  },
  methods: {
    navTxt() {
      const routeName = this.$route.name;
      switch(routeName) {
        case 'recharge':
          return 'Deposit';
        case 'transfer':
          return 'Trasfer';
        case 'withdraw':
          return 'Withdraw';
      }
    },
    copyHash() {
      if (copyTxt(this.address)) {
        Toast.success('copy success');
      }
    },
    back() {
      this.$router.go(-1);
    },
    toPageHome() {
      if (this.$route.name ==='home') {return;}
      this.$router.push({ name: 'Home' });
    },
    chooseWallet() {
      this.popupVisible = true;
      this.installWalletModal = false;
    },

    // unlock wallet and sign
    async connectWallet() {
      this.popupVisible = false;
      
      // check netType
      const { networkId } = await getInjectedWeb3();
      const netMode = getNetMode(networkId);
      if (netMode !== "l1" && netMode !== "l2") {
        this.showNetTip = true;
        return
      }
      
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
    handleWatchResetStatus() {
      this.address = '';
      this.walletIsLock = true;
    },
  },
  async mounted() {
    this.$eventBus.$on('updateAddress', this.updateAddress);
    this.$eventBus.$on('resetStatus', this.handleWatchResetStatus);
  },
};
</script>
<style lang="scss" scoped>
  @import "index";
</style>
