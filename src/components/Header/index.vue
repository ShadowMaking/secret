<template>
  <div style="width:100%">
    <mt-header title="" class="common-header">
      <img :src="DEFAULTIMG.LOGO" slot="left" class="logo"/>
      <span slot="right" v-if="address!==''" class="header-address" @click="toMyWallet">{{ address.slice(0,8)+"..." }}</span>
      <div slot="right" v-else >
        <!-- <a @click="chooseWallet" class="linkWallet">链接钱包</a> -->
        <a @click="myWallet" class="linkWallet">我的钱包</a>
        <i class="icon night"></i>
        <i class="icon language"></i>
      </div>
    </mt-header>
    <van-popup v-model="popupVisible" round position="bottom" :style="{ minHeight: '30%' }" class="common-bottom-popup">
      <div class="common-exchange-detail-wrap choose-wallet-popup">
        <div class="header"><h3>选择钱包</h3></div>
        <div class="choose-wallet" @click="connectWallet">
          <i></i><span>metamask</span>
        </div>
      </div>
    </van-popup>
  </div>
</template>

<script>
import Vue from 'vue';
import { Header, Button } from 'mint-ui';
import { DEFAULTIMG } from '@/utils/global';
import { initWeb3 } from "@/utils/wb3";
import {
  checkMetamask, connectMetamask,
  setCookie, getCookie, getAccount } from "@/utils/auth";
import { Popup, Button as VanButton } from 'vant';
import { getFromStorage, getInfoFromStorageByKey } from '@/utils/storage';

Vue.use(Popup);
Vue.use(VanButton);
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
    }
  },
  components: {
  },
  computed: {
    loginInfo() {
      return getInfoFromStorageByKey('loginInfo');
    },
    metamaskInstall() {
      return this.$store.state.metamask.metamaskInstall
    }
  },
  watch: {
    '$store.state.metamask.accountsArr': function (res) { },
    '$store.state.auth.loginInfo': function (res) { },
  },
  methods: {
    chooseWallet() {
      this.popupVisible = true;
      this.installWalletModal = false;
    },
    toMyWallet() {
      if (this.$route.name === 'MyWallet') { return ;}
      this.$router.push({ name: 'MyWallet' });
    },
    myWallet() {
      if (this.$route.name === 'FirstIntoWallet') { return ;}
      this.$router.push({ name: 'FirstIntoWallet' });
    },

    // 解锁钱包，进行当前登录账户的授权签名
    async connectWallet() {
      this.popupVisible = false;
      if (!this.metamaskInstall) {
        this.installWalletModal = true;
      } else {
        await ethereum.request({ method: 'eth_requestAccounts' });
        await ethereum.request({
          method: 'wallet_requestPermissions',
          params:  [{ "eth_accounts": {} }]
        });
        const accounts = await this.web3.eth.getAccounts();
        const balance = await this.web3.eth.getBalance(accounts[0])
        
        // await ethereum.request({ method: 'eth_personalSign' });
        const coinbaseAddress = this.web3.eth.coinbase;
        const message = `
          Access Eigen account.
          Only sign this message for a trusted client!
        `;
        const signAdress = accounts[0];
        
        const signRes = await this.web3.eth.personal.sign(this.web3.utils.fromUtf8(message), signAdress);
        // when signRes has value declare sign sucess
        let _isLock = true;
        signRes!==undefined && (_isLock = false);
        this.walletIsLock = _isLock;
        await this.$store.dispatch('WalletLockStatus', {isLock: _isLock});
        this.$eventBus.$emit('updateAddress', {address: signAdress});
      }
    },
    updateAddress(info) {
      this.showAddress = info.address.slice(0,8)+"...";
    },
    handleUpdateLoginStatus(accountInfo) {
      this.address = accountInfo.address;
    },
  },
  created() {
    if (this.loginInfo) {
      this.address = this.loginInfo.address
    }
  },
  async mounted() {
    this.$eventBus.$on('updateLoginStatus', this.handleUpdateLoginStatus);
    // test
    // let currentProvider = new this.web3.providers.HttpProvider('http://localhost:8545');
    // let customHttpProvider = new ethers.providers.JsonRpcProvider('http://localhost:8545');
    
  },
};
</script>
<style lang="scss" scoped>
  @import "index";
</style>
