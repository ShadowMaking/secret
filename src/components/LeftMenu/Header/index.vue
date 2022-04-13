<template>
  <div style="width:100%">
    <div class="left-header">
      
      <div class="header-right">
        <div v-show="showConnectWallet">
          <div v-if="address!==''" >
            <van-popover
              key="leftloginPopover"
              close-on-click-outside
              :overlay="true"
              :get-container="getContainer"
              v-model="showLoginPopover"
              trigger="click"
              placement="bottom-start">
              <div class="account-popover">
                <div class="van-hairline--bottom account-header">
                  <span>My Wallet</span>
                </div>
                <ul class="accountlist" v-if="address||gUName">
                  <li :class="[{'active': item.wallet_address===address}]" v-for="(item,index) in ownWalletList" :key="index" @click="changeAccount(item, 'wallet')">
                    <van-icon name="success" class="active-status-icon"/>
                    <div class="account-text">
                      <span>{{ item.wallet_address }}</span>
                    </div>
                  </li>
                </ul>
                <div class="van-hairline--bottom account-header">
                  <span>My Account</span>
                </div>
                <ul class="accountlist" v-if="address||gUName">
                  <li :class="[{'active': item.address===address}]" v-for="(item,index) in userList" :key="index" @click="changeAccount(item, 'user')">
                    <van-icon name="success" class="active-status-icon"/>
                    <div class="account-text">
                      <span>{{ item.address }}</span>
                    </div>
                  </li>
                </ul>
                <div class="account-setting-wrapper van-hairline--top">
                  <div class="opt-item van-hairline--bottom" @click="toPage('createAccount', 'create')">
                    <router-link to="/backup?type=create">
                      <van-icon name="plus" class="opt-icon" />
                      <span>Create Account</span>
                    </router-link>
                  </div>
                  <div class="opt-item van-hairline--bottom" @click="toPage('importAccount')">
                    <router-link to="/importAccount">
                      <van-icon name="down" class="opt-icon" />
                      <span>Import Account</span>
                    </router-link>
                  </div>
                  <div class="opt-item van-hairline--bottom" @click="disconnect" v-show="address">
                    <van-icon name="peer-pay" class="opt-icon redColor"/>
                    <span class="redColor">Logout</span>
                  </div>
                  <div class="opt-item van-hairline--bottom" @click="toPage('backup', 'import')" style="display: none">
                    <router-link to="/backup?type=import">
                      <van-icon name="down" class="opt-icon" />
                      <span>Import Account</span>
                    </router-link>
                  </div>
                </div>
              </div>
              <template #reference>
                <div class="account-header-login-in">
                  <div class="account-info-left">
                    <img src="~@/assets/icon_logo.png">
                    <div class="account-info-address">
                      <p>{{address}}</p>
                      <p class="account-info-balance">￥15.250</p>
                    </div>
                  </div>
                  <div class="account-info-right">
                    <van-icon name="arrow-up" v-if="showAccountSetPopover"/>
                    <van-icon name="arrow-down" v-if="!showAccountSetPopover"/>
                  </div>
                </div>
              </template>
            </van-popover>
          </div>
          <div slot="right" v-else >
            <div class="account-header-login-out">
              <p class="account-logo"><img src="~@/assets/icon_logo.png"></p>
              <p class="account-weclome">欢迎来到Eigen</p>
              <p class="account-manage-txt">登录Eigen账号以管理你的资产</p>
              <p class="account-login common-primary-btn" @click="loginIn"><el-button type="primary">登录账号</el-button></p>
            </div>
          </div>
        </div>
      </div>
    </div>
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

import { getConnectedAddress, getConnectedNet } from '@/utils/dashBoardTools';

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
      ownWalletList: [],
      showAddress: '',//user address or wallet owner address
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
    loginIn() {
      this.$router.push({ path: '/loginIn' })
    },
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
      if (info.success) {
        this.gUName = info['userInfo'].name
        saveToStorage({ 'metamaskFakeEmail': info['userInfo'].email })
      }
    },
    async handleBindingUserInfoAferThirdLogin(thirdloginInfo) {
      const userId  = thirdloginInfo.thirdUserId
      const { data: userInfo } = await this.$store.dispatch('GetBindingGoogleUserInfo', { userId })
      this.address = userInfo.address
      await this.getUserList(userId)
      await this.getWalletAsOwner(userId)
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
        await this.getWalletAsOwner(userId)
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
    async changeAccount(record, type) {
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
      // console.log(`GetPublicKey result is: ${publicKey}`)
      
      // const password = ecies.crypto.randomBytes(16).toString("base64");
      const encryptPsw = generateEncryptPswByPublicKey(publicKey, psw); // generate cc1
      const { cr1: encryptCr1, aesKey } = generateCR1ByPublicKey(this.publicKey); // generate cr1
      // console.log('aesKey:', aesKey)
      this.aesKey = aesKey
      this.encryptPsw = encryptPsw
      this.encryptCr1 = encryptCr1
      // console.log(`encryptPsw: ${encryptPsw}, \n encryptCr1: ${encryptCr1}`)

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
        // console.log('aesKey-recover:', this.aesKey)
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
      let Logindata = { address: thisAccount }
      const metamaskRes = await this.$store.dispatch('metamaskLogin', Logindata)
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
      
      const { hasError, data } = await this.$store.dispatch('metamaskVerify', {
        signature: signature,
        address: thisAccount,
        email: thisEmail
      });
      if (hasError) {
        Toast('login failed')
        return
      }
      let backUrl = data.data
      saveToStorage({ 'metamaskFakeEmail': thisEmail })
      window.location.href = backUrl
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
    async getWalletAsOwner(userId) {
      let data = {
        network_id: getConnectedNet().id,
        user_id: userId,
      }
      const { hasError, list } = await this.$store.dispatch('getWalletListAsOwner', data)
      this.ownWalletList = list
      console.log(this.ownWalletList)
      if (hasError) {
        Toast('Get wallet Error')
      }
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
