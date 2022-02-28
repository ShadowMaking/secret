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
          <div v-if="address!==''" >
            <van-popover
              key="accountSetpopover"
              close-on-click-outside
              :overlay="true"
              :get-container="getContainer"
              v-model="showAccountInfo"
              trigger="click"
              placement="bottom-end">
              <div class="show-accrout-address-popup" :style="showAccroutAddressPopupStyle()">
                <div class="header"><h3>Account</h3></div>
                <div class="inner-wraper">
                  <div class="flex flex-content-between" style="display: none">
                    <span>Connected to Metamask</span>
                    <a class="disconnect" @click="disconnect">Logout</a>
                  </div>
                  <div class="address">{{ address }}</div>
                  <div class="flex">
                    <a class="copy-a" @click="copyAddress"><i class="a-icon "></i>{{ copyAddressTxt }}</a>
                    <a class="view-in-explorer-a" @click="toExplorer"><i class="a-icon"></i>View in Explorer</a>
                  </div>
                </div>
              </div>
              <template #reference>
                <span @click="showAccoutAddress" class="header-address" id="header-address-popup" v-if="address!==''" >
                  {{ `${address.slice(0,6)}...${address.slice(-4)}` }}
                  <i class="link-icon"></i>
                </span>
              </template>
            </van-popover>
          </div>
          <div slot="right" v-else >
            <!-- <a @click="chooseWallet" class="linkWallet">
              <span>Connect Wallet</span>
              <i class="link-icon"></i>
            </a>
            <i class="icon night" style="display:none"></i>
            <i class="icon language" style="display:none"></i> -->
            <van-popover
              key="loginPopover"
              close-on-click-outside
              :overlay="true"
              :get-container="getContainer"
              v-model="showLoginPopover"
              trigger="click"
              placement="bottom-end">
              <div class="login-popover">
                <div class="van-hairline--bottom account-header">
                  <span>Choose</span>
                </div>
                <div class="account-setting-wrapper van-hairline--top">
                  <div class="opt-item van-hairline--bottom" @click="login('google')">
                    <i class="login-icon logo-google"></i>
                    <span>Continue with Google</span>
                  </div>
                   <div class="opt-item van-hairline--bottom" @click="login('metamask')">
                    <i class="login-icon logo-metamsk"></i>
                    <span>Continue with Metamask</span>
                  </div>
                </div>
              </div>
              <template #reference>
                <a class="linkWallet">
                  <span>Connect Wallet</span>
                  <i class="link-icon"></i>
                </a>
              </template>
            </van-popover>
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
              <van-button plain type="info" class="lockbutton" size="small" @click="disconnect" v-show="address">Logout</van-button>
            </div>
            <ul class="accountlist" v-if="address||gUName">
              <!-- <li class="active">
                <van-icon name="success" class="active-status-icon"/>
                <div class="account-text">
                  <span>{{ address||gUName }}</span>
                </div>
              </li> -->
              <li :class="[{'active': item.address===address}]" v-for="(item,index) in userList" :key="index" @click="changeAccount(item)">
                <van-icon name="success" class="active-status-icon"/>
                <div class="account-text">
                  <span>{{ item.address }}</span>
                </div>
              </li>
            </ul>
            <div class="account-setting-wrapper van-hairline--top">
              <div class="opt-item van-hairline--bottom" @click="toPage('createAccount', 'create')">
               <!--  <van-icon name="plus" class="opt-icon" />
                <span>Create Account</span> -->
                <router-link to="/backup?type=create">
                  <van-icon name="plus" class="opt-icon" />
                  <span>Create Account</span>
                </router-link>
              </div>
              <div class="opt-item van-hairline--bottom" @click="toPage('importAccount')">
                <!-- <van-icon name="down" class="opt-icon" />
                <span>Import Account</span> -->
                <router-link to="/importAccount">
                  <van-icon name="down" class="opt-icon" />
                  <span>Import Account</span>
                </router-link>
              </div>
              <div class="opt-item van-hairline--bottom" @click="toPage('exportAccount')">
                <!-- <van-icon name="down" class="opt-icon" />
                <span>Import Account</span> -->
                <router-link to="/exportAccount">
                  <van-icon name="peer-pay" class="opt-icon" />
                  <span>Export Account</span>
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
              <div class="opt-item van-hairline--bottom" @click="toPage('srecovery')" style="display: none">
                <van-icon name="cluster-o" class="opt-icon" />
                <span>Recover Secret</span>
              </div>
              <div class="opt-item van-hairline--bottom" @click="toPage('addfriends')" style="display: none">
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
    <van-popup v-model="showAccountPopup" round key="showAccount" get-container="#header-address-popup" :style="{ top: '134px', border: '1px solid #ccc' }">
      <div class="show-accrout-address-popup">
        <div class="header"><h3>Account</h3></div>
        <div class="inner-wraper">
          <div class="flex flex-content-between" style="display: none">
            <span>Connected to Metamask</span>
            <a class="disconnect" @click="disconnect">Logout</a>
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
    <v-inputPsw :show="showInputPswModal" :canCloseByBtn="true" @cancel="showInputPswModal=false" @ok="confirmPswOk" :btnLoading="confirmPswBtnLoading" />
  </div>
</template>

<script>
import Vue from 'vue';
import _ from 'lodash'
import { ethers } from 'ethers'
import { Header, Button } from 'mint-ui';
import { DEFAULTIMG } from '@/utils/global';
import { Popup, Button as VanButton, Toast, Icon, Popover, Dialog } from 'vant';
import WalletStatus from '@/components/WalletStatus';
import NetTipModal from '@/components/NetTipModal';
import InputPswModal from '@/components/InputPswModal'
import { getSelectedChainID, getNetMode, getExpectNetTypeByRouteName, metamaskIsConnect, installWeb3Wallet, installWeb3WalletMetamask } from '@/utils/web3'
import { copyTxt, isPc } from '@/utils/index';
import { initTokenTime, updateLoginTime, removeTokens, tokenIsExpires, logout, connectMetamask } from '@/utils/auth'
import { saveToStorage, getFromStorage, removeFromStorage, getInfoFromStorageByKey } from '@/utils/storage';
import { generateEncryptPrivateKeyByPublicKey, generateEncryptPswByPublicKey, generateCR1ByPublicKey, getDecryptPrivateKey } from '@/utils/relayUtils'

import { getConnectedAddress } from '@/utils/dashBoardTools';

Vue.use(Popup);
Vue.use(VanButton);
Vue.use(Toast);
Vue.use(Icon);
Vue.use(Popover);
Vue.use(Dialog);
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
      userList: [],

      changeTargetAccountInfo: null,
      userPsw: '',
      publicKey: '',
      aesKey: '', // every decrypt has the same aesKey
      encryptPsw: '',
      encryptPrivateKeyPublicKey: '',
      encryptCr1: '',
      confirmPswBtnLoading: false,
      showInputPswModal: false,

      copyAddressTxt: 'Copy Address',
      showAccountInfo: false,

      showLoginPopover: false,
    }
  },
  components: {
    "v-walletstatus": WalletStatus,
    "v-netTipPopup": NetTipModal,
    'v-inputPsw': InputPswModal
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
    showAccroutAddressPopupStyle() {
      if (isPc()) {
        return { minWidth: '300px' }
      }
      return { maxWidth: '300px' }
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
      // this.showAccountPopup = true;
    },
    copyAddress() {
      if (copyTxt(this.address)) {
        // Toast.success('Success');
        this.copyAddressTxt = 'Copied'
        setTimeout(()=>{ this.copyAddressTxt = 'Copy Address'}, 500)
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
      if (pageName === 'backup' || pageName === 'importAccount') {
        return
        // this.$router.push({ name: pageName, query: {type: queryStr, sid: Math.ceil(Math.random()*100)} });
        // this.$router.push({ path: `/backup`, query: {type: queryStr, sid: Math.ceil(Math.random()*100)} });
        this.$router.push({ path: `/backup?type=${queryStr}`, query: {type: queryStr, sid: Math.ceil(Math.random()*100)} });
      }
      this.$router.push({ name: pageName });
    },
    chooseWallet() {
      this.$router.push({ name: 'tlogin' })
      return
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
        const dashBoardRouteName = ['overview', 'sendMenu', 'exchange']
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
        const selectedAccountAddress = getConnectedAddress();
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
      this.userList = [];
      this.walletIsLock = true;
      this.showAccountSetPopover = false
      logout();
      this.$router.push({ name: 'overview' })
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
    async handleBindingUserInfoAferThirdLogin(thirdloginInfo) {
      const userId  = thirdloginInfo.thirdUserId
      const { data: userInfo } = await this.$store.dispatch('GetBindingGoogleUserInfo', { userId })
      this.address = userInfo.address
      await this.getUserList(userId)
    },
    async getUserList(uId) {
      const userId = uId || getInfoFromStorageByKey('gUID')
      const { data: userList } = await this.$store.dispatch('GetBindingGoogleUserInfoList', { userId })
      this.userList = _.cloneDeep(userList)
    },
    getContainer() {
      return document.getElementById('header');
    },
    async setInitData() {
      const userId = getInfoFromStorageByKey('gUID')
      if (userId) {
        const { data: userInfo } = await this.$store.dispatch('GetBindingGoogleUserInfo', { userId  })
        this.address = userInfo && userInfo.address||'';
        await this.getUserList(userId)
      }
    },
    async handleChangeAccount(record, privateKey) {
      const address = record.address
      if (this.address.toLocaleLowerCase() === address.toLocaleLowerCase()) {
        this.showAccountSetPopover = false
        return
      }
      this.address = address
      const userId = getInfoFromStorageByKey('gUID')
      const addressInfo = _.find(this.userList, { address })
      const encryptPrivateKey = addressInfo.encryptPrivateKey
      await this.$store.dispatch('StoreBindingGoogleUserInfo', { userId, encryptPrivateKey, address })
      await this.$store.dispatch('SaveDecryptPrivateKeyInStore', { userId, address, encryptKey: encryptPrivateKey, privateKey })
      this.$eventBus.$emit('changeAccout', addressInfo)
      this.showAccountSetPopover = false
    },
    async changeAccount(record) {
      this.changeTargetAccountInfo  = _.cloneDeep(record)
      this.showInputPswModal = true
    },
    async confirmPswOk({ show, psw }) {
      this.userPsw = psw; // password of user input for encrypt privateKey
      this.confirmPswBtnLoading = true
      const { hasError, data: publicKey} = await this.$store.dispatch('GetAllPublicKey')
      if (hasError||!publicKey) {
        Toast('Get PublickKey fasiled! Retry')
        this.confirmPswBtnLoading = false
        return
      }
      this.publicKey = publicKey;
      console.log(`GetPublicKey result is: ${publicKey}`)
      
      // const password = ecies.crypto.randomBytes(16).toString("base64");
      const encryptPsw = generateEncryptPswByPublicKey(publicKey, psw); // generate cc1
      const { cr1: encryptCr1, aesKey } = generateCR1ByPublicKey(this.publicKey); // generate cr1
      console.log('aesKey:', aesKey)
      this.aesKey = aesKey
      this.encryptPsw = encryptPsw
      this.encryptCr1 = encryptCr1
      console.log(`encryptPsw: ${encryptPsw}, \n encryptCr1: ${encryptCr1}`)

      // decrpyt privateKey for target address
      const { hasError: getPrivateKeyError, privateKey, msg } = await this.getPrivateKeyForAddress()
      if (getPrivateKeyError) {
        this.confirmPswBtnLoading = false
        Toast(msg, 5)
        return
      }

      this.confirmPswBtnLoading = false
      this.showInputPswModal = false
      this.$eventBus.$emit('resetValueAfterInputPsw')
      await this.handleChangeAccount(this.changeTargetAccountInfo, privateKey)
    },
    async getPrivateKeyForAddress() {
      let privateKey;
      const info = _.cloneDeep(this.changeTargetAccountInfo)
      const address = info.address
      const userId = getInfoFromStorageByKey('gUID')
      const { data: userList } = await this.$store.dispatch('GetBindingGoogleUserInfoList', { userId })
      const targetInfoInStorage = _.find(userList, { address })
      if (targetInfoInStorage) {
        const encryptKey = targetInfoInStorage.encryptPrivateKey
        const decryptInfo = await this.$store.dispatch('DecryptPrivateKeyByEcies', {userId, cr1: this.encryptCr1, c1: this.encryptPsw, cc2: encryptKey })
        const { hasError, data: decryptedPrivateKey } = decryptInfo
        if(hasError) {
          return { hasError: true, msg:  'DecryptPrivateKeyByEcies failed! Retry!'}
        }
        console.log('aesKey-recover:', this.aesKey)
        privateKey = getDecryptPrivateKey(decryptedPrivateKey, this.aesKey)
      }
      return { hasError: false, privateKey}
    },
    async login(type) {
      Toast.loading({
        duration: 0,
        message: 'loading...',
        forbidClick: true,
        loadingType: 'spinner',
      });
      if (type === 'google') {
        this.googleLogin()
      } else if (type === 'metamask') {
        this.metamaskLogin()
      }
      
      
    },
    async googleLogin() {
      const loginRes = await this.$store.dispatch('GoogleLogin');
      Toast.clear()
      const { hasError, url } = loginRes;
      if (hasError) {
        this.showError = true
        return
      }
      window.location.href = url
    },
    async metamaskLogin() {
      if (!installWeb3WalletMetamask) {
        this.openDialogInstallMetamask()
        return
      }
      await ethereum.request({
        method: 'wallet_requestPermissions',
        params:  [{ "eth_accounts": {} }]
      })
      const accounts = await ethereum.request({ method: 'eth_requestAccounts' })
      const thisAccount = accounts[0]
      let data = { address: thisAccount }
      const metamaskRes = await this.$store.dispatch('metamaskLogin', data)
      const metaMaskData = metamaskRes.data
      if (metamaskRes.hasError) {
        let toastMsg = metaMaskData && metaMaskData.message
        Toast(toastMsg) 
        return
      }
      const provider = new ethers.providers.Web3Provider(
          window.ethereum,
      )
      const thisSigner = provider.getSigner()
      const signNonce = metaMaskData && metaMaskData.data
      const signature = await thisSigner.signMessage(signNonce)

      const storageEmail = getFromStorage('metamaskFakeEmail')
      const nowTime = new Date()
      const fakeEmail = nowTime.getTime() + '@gmail.com.test'
      let thisEmail = storageEmail ? storageEmail : fakeEmail
      console.log(signature)
      
      const metamaskVerifyRes = await this.$store.dispatch('metamaskVerify', {
        signature: signature,
        address: thisAccount,
        email: thisEmail
      });
      if (metamaskVerifyRes.hasError) {
        return
      }
      saveToStorage('metamaskFakeEmail', fakeEmail)
      console.log(metamaskVerifyRes)
    },
    openDialogInstallMetamask() {
      Dialog.confirm({
        message: 'Install Metamask?',
        confirmButtonText: 'Confirm',
        confirmButtonColor: '#4375f1',
        cancelButtonText: 'Cancel'
      })
      .then(() => {
        let url = 'https://metamask.io/'
        window.open(url, '_blank');
      })
      .catch((error) => {
        console.log(error)
      });
    },
  },
  async mounted() {
    /* this.$nextTick(() => { })
    setTimeout(()=>{
      console.log(this.walletIsLock)
      if (this.metamaskInstall && window.ethereum && window.ethereum.selectedAddress && !this.walletIsLock) {
        this.address = window.ethereum && window.ethereum.selectedAddress
      }
    },800) */
    await this.setInitData();
   
    this.$eventBus.$on('thirdLogin', this.handleThirdLoginCallback);
    this.$eventBus.$on('updateAddress', this.updateAddress);
    this.$eventBus.$on('chainChanged', this.handleChainChanged);
    this.$eventBus.$on('accountsChanged', this.handleAccountsChanged);
    this.$eventBus.$on('disconnect', this.handleDisconnect);
    this.$eventBus.$on('BindingUserInfoAferThirdLogin', this.handleBindingUserInfoAferThirdLogin);
  },
};
</script>
<style lang="scss" scoped>
  @import "index";
</style>
