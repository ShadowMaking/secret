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
      <span slot="right" v-if="address!==''"  class="header-address"  @click="showAccoutAddress">
        {{ `${address.slice(0,6)}...${address.slice(-4)}` }}
        <i class="link-icon"></i>
      </span>
      <div slot="right" v-else >
        <a @click="chooseWallet" class="linkWallet">
          <span>Connect Wallet</span>
          <i class="link-icon"></i>
        </a>
        <i class="icon night" style="display:none"></i>
        <i class="icon language" style="display:none"></i>
      </div>
    </mt-header>
    <van-popup v-model="popupVisible" round :position="checkBrower()" :style="{ minHeight: '30%' }" class="common-bottom-popup">
      <div class="common-exchange-detail-wrap choose-wallet-popup">
        <div class="header"><h3>Choose Wallet</h3></div>
        <div class="choose-wallet" @click="connectWallet">
          <i></i><span>metamask</span>
        </div>
      </div>
    </van-popup>
    <van-popup v-model="showAccountPopup" round key="showAccount">
      <div class="show-accrout-address-popup">
        <div class="header"><h3>Account</h3></div>
        <div class="inner-wraper">
          <div class="flex flex-content-between">
            <span>Connected to Metamask</span>
            <a class="disconnect" @click="disconnect">Disconnect</a>
          </div>
          <div class="address">{{ address }}</div>
          <div class="flex">
            <a class="copy-a" @click="copyAddress"><i class="a-icon "></i>Copy Address</a>
            <a class="view-in-explorer-a" @click="toExplorer"><i class="a-icon"></i>View in Explorer</a>
          </div>
        </div>
      </div>
    </van-popup>
    <v-walletstatus :show="installWalletModal" key="installWalletModal" :installOtherWallet="installOtherWallet" />
    <v-netTipPopup :show="showNetTip" key="netTipModal" :showType="expectNetType" />
  </div>
</template>

<script>
import Vue from 'vue';
import { Header, Button } from 'mint-ui';
import { DEFAULTIMG } from '@/utils/global';
import { Popup, Button as VanButton, Toast, Icon } from 'vant';
import WalletStatus from '@/components/WalletStatus';
import NetTipModal from '@/components/NetTipModal';
import { getSelectedChainID, getNetMode, getExpectNetTypeByRouteName, metamaskIsConnect, installWeb3Wallet, installWeb3WalletMetamask } from '@/utils/web3'
import { copyTxt, isPc } from '@/utils/index';
import { initTokenTime, updateLoginTime, removeTokens, tokenIsExpires } from '@/utils/auth'

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
      showAccountPopup: false,
      installOtherWallet: false,
    }
  },
  components: {
    "v-walletstatus": WalletStatus,
    "v-netTipPopup": NetTipModal,
  },
  computed: {
    metamaskInstall() {
      return this.$store.state.metamask.metamaskInstall || installWeb3WalletMetamask()
    },
    expectNetType() {
      return getExpectNetTypeByRouteName(this.$route.name)
    },
  },
  watch: {
    '$store.state.metamask.accountsArr': function (res) {
      this.address = res.length&&res[0] || ''
    }
  },
  methods: {
    checkBrower() {
      if (isPc()) { return 'center' };
      return 'bottom';
    },
    navTxt() {
      const routeName = this.$route.name;
      switch(routeName) {
        case 'deposit':
          return 'Deposit';
        case 'send':
          return 'Send';
        case 'withdraw':
          return 'Withdraw';
      }
    },
    showAccoutAddress() {
      this.showAccountPopup = true;
    },
    copyAddress() {
      if (copyTxt(this.address)) {
        Toast.success('Success');
      }
    },
    toExplorer() {
      window.open(`//explorer.ieigen.com/#/address?adr=${this.address}`)
    },
    async disconnect() {
      await this.$store.dispatch("WalletAccountsAddress", {accounts:[]})
      await this.$store.dispatch('WalletLockStatus', {isLock: true});
      this.$eventBus.$emit('disconnect');
      removeTokens();
      this.showAccountPopup = false;
    },
    back() {
      this.$router.go(-1);
    },
    toPageHome() {
      if (this.$route.name ==='home') {return;}
      this.$router.push({ name: 'home' });
    },
    chooseWallet() {
      this.popupVisible = true;
      this.installWalletModal = false;
    },

    // unlock wallet and sign
    async connectWallet() {
      this.popupVisible = false;

      if (this.metamaskInstall) {
        // check netType
        const networkId = getSelectedChainID();
        const netMode = getNetMode(networkId);
        const disabled = this.expectNetType === 'l1' && netMode !== "l1" || this.expectNetType === 'l2' && netMode !== "l2"
        if (netMode !== "l1" && netMode !== "l2" || disabled) {
          this.showNetTip = true;
          return
        }
        if (!metamaskIsConnect()) {
          await ethereum.request({
            method: 'wallet_requestPermissions',
            params:  [{ "eth_accounts": {} }]
          })
        }
        const accounts = await ethereum.request({ method: 'eth_requestAccounts' })
        const selectedAccountAddress = window.ethereum.selectedAddress;
        await this.$store.dispatch("WalletAccountsAddress", {accounts})
        console.log('currentSelectedAccountAddress', selectedAccountAddress)

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
        console.log('signRes', signRes)
        this.walletIsLock = _isLock;
        await this.$store.dispatch('WalletLockStatus', {isLock: _isLock});
        this.$eventBus.$emit('updateAddress', {address: selectedAccountAddress});
        this.checkNetPair()
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
    updateAddress(info) {
      this.address = info.address;
    },
    checkNetPair() {
      const netId = getSelectedChainID();
      console.log('netId', netId)
    },
    handleDisconnect() {
      this.address = '';
      this.walletIsLock = true;
    },
    handleAccountsChanged(data) {
      this.address = data.accounts.length&&data.accounts[0] || ''
    },
    handleChainChanged() {
      this.walletIsLock = true;
    },
  },
  async mounted() {
    this.$eventBus.$on('updateAddress', this.updateAddress);
    this.$eventBus.$on('chainChanged', this.handleChainChanged);
    this.$eventBus.$on('accountsChanged', this.handleAccountsChanged);
    this.$eventBus.$on('disconnect', this.handleDisconnect);
  },
};
</script>
<style lang="scss" scoped>
  @import "index";
</style>
