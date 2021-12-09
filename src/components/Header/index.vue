<template>
  <div style="width:100%" id="header">
    <mt-header title="" class="common-header" v-show="!$route.meta.hideHeader">
      <div slot="left" class="header-left">
        <!-- <div v-show="showBackIcon" class="flex flex-center" @click="back">
          <van-icon name="arrow-left" class="back-icon" size="18"/>
          <span>{{ navTxt() }}</span>
        </div>
        <img :src="DEFAULTIMG.LOGO" class="logo" @click="toPage('home')" v-show="$route.name==='home'"/> -->
      </div>
      <div slot="right" class="header-right">
        <div v-show="showConnectWallet">
          <span @click="showAccoutAddress" class="header-address" id="header-address-popup" v-if="address!==''" >
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
        </div>
        <van-popover
          key="accountSetpopover"
          close-on-click-outside
          :overlay="true"
          :get-container="getContainer"
          v-model="showAccountSetPopover"
          trigger="click"
          placement="bottom-end">
          <div class="account-popover">
            <div class="van-hairline--bottom account-header">
              <span>My Account</span>
              <van-button plain type="info" class="lockbutton" size="small" @click="disconnect" v-show="address">Disconnect</van-button>
            </div>
            <ul class="accountlist" v-if="address||gUName">
              <li class="active">
                <van-icon name="success" class="active-status-icon"/>
                <div class="account-text">
                  <span>{{ address||gUName }}</span>
                </div>
              </li>
            </ul>
            <div class="account-setting-wrapper van-hairline--top">
              <div class="opt-item van-hairline--bottom" @click="toPage('backup', 'create')">
               <!--  <van-icon name="plus" class="opt-icon" />
                <span>Create Account</span> -->
                <router-link to="/backup?type=create">
                  <van-icon name="plus" class="opt-icon" />
                  <span>Create Secret</span>
                </router-link>
              </div>
              <div class="opt-item van-hairline--bottom" @click="toPage('backup', 'import')" style="display: none">
                <!-- <van-icon name="down" class="opt-icon" />
                <span>Import Account</span> -->
                <router-link to="/backup?type=import">
                  <van-icon name="down" class="opt-icon" />
                  <span>Import Account</span>
                </router-link>
              </div>
              <div class="opt-item van-hairline--bottom" @click="toPage('srecovery')">
                <van-icon name="cluster-o" class="opt-icon" />
                <span>Recover Secret</span>
              </div>
              <div class="opt-item van-hairline--bottom" @click="toPage('addfriends')">
                <van-icon name="friends-o" class="opt-icon" />
                <span>Friends</span>
              </div>
              <!-- <div class="opt-item van-hairline--bottom" @click="toPage('home')">
                <router-link to="/introduction">
                  <i class="opt-icon icon-bridge"></i>
                  <span>Bridge</span>
                </router-link>
              </div> -->
            </div>
          </div>
          <template #reference><div class="account"></div></template>
        </van-popover>
      </div>
    </mt-header>
    <van-popup v-model="popupVisible" round :position="checkBrower()" :style="{ minHeight: '30%' }" class="common-bottom-popup" get-container="body">
      <div class="common-exchange-detail-wrap choose-wallet-popup">
        <div class="header"><h3>Choose Wallet</h3></div>
        <div class="choose-wallet" @click="connectWallet">
          <i></i><span>metamask</span>
        </div>
      </div>
    </van-popup>
    <van-popup v-model="showAccountPopup" round key="showAccount" get-container="#header-address-popup" :style="{ top: '134px' }">
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
import { Popup, Button as VanButton, Toast, Icon, Popover } from 'vant';
import WalletStatus from '@/components/WalletStatus';
import NetTipModal from '@/components/NetTipModal';
import { getSelectedChainID, getNetMode, getExpectNetTypeByRouteName, metamaskIsConnect, installWeb3Wallet, installWeb3WalletMetamask } from '@/utils/web3'
import { copyTxt, isPc } from '@/utils/index';
import { initTokenTime, updateLoginTime, removeTokens, tokenIsExpires } from '@/utils/auth'
import { getLocationParam } from '@/utils/index'

Vue.use(Popup);
Vue.use(VanButton);
Vue.use(Toast);
Vue.use(Icon);
Vue.use(Popover);
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
      gUName: '',
      showAccountSetPopover: false,
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
    showBackIcon() {
      return this.$route.name!=='home' && this.$route.name!=='introduction'
    },
    showConnectWallet() {
      return this.$route.name!=='introduction'
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
    toPage(pageName, queryStr) {
      this.showAccountSetPopover = false
      // if (this.$route.name === pageName) {return;}
      if (pageName === 'backup') {
        return
        // this.$router.push({ name: pageName, query: {type: queryStr, sid: Math.ceil(Math.random()*100)} });
        // this.$router.push({ path: `/backup`, query: {type: queryStr, sid: Math.ceil(Math.random()*100)} });
        this.$router.push({ path: `/backup?type=${queryStr}`, query: {type: queryStr, sid: Math.ceil(Math.random()*100)} });
      }
      this.$router.push({ name: pageName });
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

        // dashBoard don not need L1 or L2 netWork
        const dashBoardRouteName = ['overView', 'sendMenu', 'exchange']
        const isDashBoardFun = dashBoardRouteName.includes(this.$route.name)
        if (!isDashBoardFun && (netMode !== "l1" && netMode !== "l2" || disabled)) {
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
      this.showAccountSetPopover = false
    },
    handleAccountsChanged(data) {
      this.address = data.accounts.length&&data.accounts[0] || ''
      this.showAccountSetPopover = false
    },
    handleChainChanged() {
      this.walletIsLock = true;
      this.showAccountSetPopover = false
    },
    handleThirdLoginCallback(info) {
      info.success && (this.gUName = info['userInfo'].name)
    },
    getContainer() {
      return document.getElementById('header');
    },
  },
  async mounted() {
    this.$nextTick(() => { })
    setTimeout(()=>{
      console.log(this.walletIsLock)
      if (this.metamaskInstall && window.ethereum && window.ethereum.selectedAddress && !this.walletIsLock) {
        this.address = window.ethereum && window.ethereum.selectedAddress
      }
    },800)
   
    this.$eventBus.$on('thirdLogin', this.handleThirdLoginCallback);
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
