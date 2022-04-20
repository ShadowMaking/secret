<template>
  <div style="width:100%">
    <div class="left-header">
      
      <div class="header-right">
        <div v-show="showConnectWallet">
          <div v-if="currentUserAddress!==''">
            <van-popover
              key="leftloginPopover"
              close-on-click-outside
              :overlay="true"
              :get-container="getContainer"
              v-model="showAccountSetPopover"
              trigger="click"
              placement="bottom-start">
              <div class="account-popover">
                <div class="van-hairline--bottom account-header">
                  <span>Multisig Wallet</span>
                </div>
                <div class="accountlist" v-if="currentUserAddress||gUName">
                  <ul v-if="ownWalletList.length>0">
                    <li :class="[{'active': item.wallet_address===currentshowAddress}]" v-for="(item,index) in ownWalletList" :key="index" @click.stop="changeAccount(item, 'wallet')">
                      <div class="account-text">
                        <span class="wallet-account-name">{{item.name}}-{{ `${item.wallet_address}` }}</span>
                        <span class="account-text-banlance">${{ item.balance ? item.balance.slice(0,6) : '- - -'  }}</span>
                      </div>
                      <div class="account-more-box">
                        <van-popover
                          key="leftMorePopover"
                          close-on-click-outside
                          :overlay="true"
                          :get-container="getContainer"
                          v-model="showAccountMorePopover[item.wallet_address]"
                         placement="bottom-start">
                          <div class="account-more-list">
                            <ul>
                              <li class="account-more-address">{{item.wallet_address}}</li>
                              <li @click.stop="copyAddress(item.wallet_address)">
                                <i class="el-icon-document-copy more-pop-icon"></i>Copy Address
                              </li>
                              <!-- <li class="redColor">
                                <i class="el-icon-remove-outline more-pop-icon"></i>断开
                              </li> -->
                            </ul>
                          </div>
                          <template #reference>
                            <span class="account-more" @click.stop="accountMore(item.wallet_address)" :id="'more-' + item.wallet_address">...</span>
                          </template>
                        </van-popover>
                      </div>

                      <van-icon name="success" class="active-status-icon"/>
                    </li>
                  </ul>
                  <ul v-else>
                    <li>
                      <div class="account-text" @click="toPage('ncWalletCreate')">Create your wallet</div>
                    </li>
                  </ul>
                </div>
                <div class="van-hairline--bottom account-header">
                  <span>My Account</span>
                </div>
                <ul class="accountlist" v-if="currentUserAddress||gUName">
                  <li :class="[{'active': item.address===currentshowAddress}]" v-for="(item,index) in userList" :key="index" @click.stop="changeAccount(item, 'user')">
                    <div class="account-text">
                      <span>{{ `${item.address.slice(0,14)}...${item.address.slice(-4)}` }}</span>
                      <span class="account-text-banlance">${{ item.balance ? item.balance.slice(0,6) : '- - -'  }}</span>
                    </div>
                    <div class="account-more-box">
                      <van-popover
                        key="leftMorePopover"
                        close-on-click-outside
                        :overlay="true"
                        :get-container="getContainer"
                        v-model="showAccountMorePopover[item.address]"
                        trigger="click"
                        placement="bottom-start">
                        <div class="account-more-list">
                          <ul>
                            <li class="account-more-address">{{item.address}}</li>
                            <li @click.stop="copyAddress(item.address)">
                              <i class="el-icon-document-copy more-pop-icon"></i>Copy Address
                            </li>
                            <!-- <li class="redColor">
                              <i class="el-icon-remove-outline more-pop-icon"></i>断开
                            </li> -->
                          </ul>
                        </div>
                        <template #reference>
                          <span class="account-more" @click.stop="accountMore(item.address)" :id="'more-' + item.address">...</span>
                        </template>
                      </van-popover>
                    </div>
                    <van-icon name="success" class="active-status-icon"/>
                  </li>
                </ul>
                <div class="account-setting-wrapper van-hairline--top">
                  <div class="opt-item van-hairline--bottom" @click="toPage('ncWalletCreate')">
                    <router-link to="/ncWalletCreate">
                      <van-icon name="paid" class="opt-icon" />
                      <span>Create Wallet</span>
                    </router-link>
                  </div>
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
                  <div class="opt-item van-hairline--bottom" @click="disconnect" v-show="currentUserAddress">
                    <van-icon name="peer-pay" class="opt-icon redColor"/>
                    <span class="redColor">Logout</span>
                  </div>
                </div>
              </div>
              <template #reference>
                <div class="account-header-login-in">
                  <div class="account-info-left">
                    <img src="~@/assets/icon_logo.png">
                    <div class="account-info-address">
                      <p>{{currentshowAddress}}</p>
                      <p class="account-info-balance">${{currentBalance.slice(0,6)}}</p>
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
              <p class="account-weclome">Welcome onboard Eigen</p>
              <!-- <p class="account-manage-txt">Manage your asset safely and privately</p> -->
              <p class="account-login common-primary-btn" @click="loginIn"><el-button type="primary">Login</el-button></p>
            </div>
          </div>
        </div>
      </div>
    </div>
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
import InputPswModal from '@/components/InputPswModal'
import { getSelectedChainID, getNetMode, getExpectNetTypeByRouteName, metamaskIsConnect, installWeb3Wallet, installWeb3WalletMetamask } from '@/utils/web3'
import { copyTxt, isPc } from '@/utils/index';
import { initTokenTime, updateLoginTime, removeTokens, tokenIsExpires, logout, connectMetamask } from '@/utils/auth'
import { saveToStorage, getFromStorage, removeFromStorage, getInfoFromStorageByKey } from '@/utils/storage';
import { generateEncryptPrivateKeyByPublicKey, generateEncryptPswByPublicKey, generateCR1ByPublicKey, getDecryptPrivateKey } from '@/utils/relayUtils'

import { getConnectedAddress, getConnectedNet, getBalanceByAddress } from '@/utils/dashBoardTools';

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
      address: '',
      walletIsLock: true,
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

      ownWalletList: [],
      currentshowAddress: '',//user address or wallet address
      currentUserAddress: '',//user address or wallet owner address
      currentAccountType: 'wallet', //wallet or user
      showAccountMorePopover: {},
      moreActiveAddress: '',
      currentBalance: '- - -',
    }
  },
  components: {
    'v-inputPsw': InputPswModal
  },
  computed: {
    metamaskInstall() {
      return this.$store.state.metamask.metamaskInstall || installWeb3WalletMetamask()
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
      this.currentUserAddress = res.length&&res[0] || ''
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
    copyAddress(str) {
      if (copyTxt(str)) {
        Toast.success('Copied');
      }
    },
    toExplorer() {
      window.open(`//explorer.ieigen.com/#/address?adr=${this.currentshowAddress}`)
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
    
    updateAddress(info) {
      this.currentUserAddress = info.address;
      this.currentshowAddress = info.address;
      this.getCurrentBalance()
    },
    checkNetPair() {
      const netId = getSelectedChainID();
      console.log('netId', netId)
    },
    handleDisconnect() {
      this.currentshowAddress = '';
      this.currentUserAddress = '';
      this.getCurrentBalance();
      this.userList = [];
      this.walletIsLock = true;
      this.showAccountSetPopover = false
      logout();
      this.$router.push({ name: 'overview' })
    },
    handleAccountsChanged(data) {
      this.currentUserAddress = data.accounts.length&&data.accounts[0] || ''
      this.currentshowAddress = data.accounts.length&&data.accounts[0] || ''
      this.getCurrentBalance()
      this.showAccountSetPopover = false
    },
    async getCurrentBalance() {
      if (this.currentshowAddress) {
        this.currentBalance = await this.getBalance(this.currentshowAddress)
      } else {
        this.currentBalance = '- - -'
      }
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
      this.currentshowAddress = userInfo.walletAddress || userInfo.address;
      this.currentUserAddress = userInfo.address
      this.getCurrentBalance()
      await this.getUserList(userId)
      await this.getWalletAsOwner(userId)
    },
    async handleWalletAferCreateWallet() {
      const userId  = getInfoFromStorageByKey('gUID')
      await this.getWalletAsOwner(userId)
    },
    async getUserList(uId) {
      const userId = uId || getInfoFromStorageByKey('gUID')
      const { data: userList } = await this.$store.dispatch('GetBindingGoogleUserInfoList', { userId })
      this.userList = _.cloneDeep(userList)
      this.resetBalance(this.userList, 'address', 'userList')
    },
    getContainer() {
      return document.getElementById('leftHeaderBox');
    },
    async setInitData() {
      const userId = getInfoFromStorageByKey('gUID')
      if (userId) {
        const { data: userInfo } = await this.$store.dispatch('GetBindingGoogleUserInfo', { userId  })
        this.currentUserAddress = userInfo && userInfo.address||'';
        this.currentshowAddress = userInfo && userInfo.walletAddress || userInfo.address || '';
        this.getCurrentBalance()
        await this.getUserList(userId)
        await this.getWalletAsOwner(userId)
      }
    },
    async handleChangeAccount(record, privateKey) {
      const address = record.address
      const showAddress = (this.currentAccountType == 'user' ? record.address : record.wallet_address)
      if (this.currentshowAddress.toLocaleLowerCase() === showAddress.toLocaleLowerCase()) {
        this.showAccountSetPopover = false
        return
      }
      this.currentshowAddress = showAddress
      this.currentUserAddress = address
      this.getCurrentBalance()
      const userId = getInfoFromStorageByKey('gUID')
      const addressInfo = _.find(this.userList, { address })
      const encryptPrivateKey = addressInfo.encryptPrivateKey
      if (this.currentAccountType == 'user') {
        await this.$store.dispatch('StoreBindingGoogleUserInfo', { userId, encryptPrivateKey, address })
        removeFromStorage(['currentWalletInfo'])
      } else {
        const walletAddress = record.wallet_address
        await this.$store.dispatch('StoreBindingGoogleUserInfo', { userId, encryptPrivateKey, address, walletAddress })
        saveToStorage({ 'currentWalletInfo': record })
      }
      await this.$store.dispatch('SaveDecryptPrivateKeyInStore', { userId, address, encryptKey: encryptPrivateKey, privateKey })
      this.$eventBus.$emit('changeAccout', addressInfo)
      this.showAccountSetPopover = false
    },
    async changeAccount(record, type) {
      this.currentAccountType = type
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
    async getWalletAsOwner(userId) {
      let data = {
        network_id: getConnectedNet().id,
        user_id: userId,
      }
      const { hasError, list } = await this.$store.dispatch('getWalletListAsOwner', data)
      this.ownWalletList = list
      if (hasError) {
        Toast('Get wallet Error')
      }
      this.resetBalance(list, 'wallet_address', 'ownWalletList')
    },
    async resetBalance(list, itemName, dataName) {
      for(let i=0; i<list.length;i+=1) {
        let itemBalance = await this.getBalance(list[i][itemName])
        this.$set(list[i], 'balance', itemBalance)
      }
      this[dataName] = list
    },
    accountMore(address) {
      this.moreActiveAddress = address
      this.$set(this.showAccountMorePopover, `${address}`, true)
    },
    getMoreContainer() {
      const tar = `#more-${this.moreActiveAddress}`;
      return document.querySelector(tar);
    },
    async getBalance(address) {
      const balanceString = await getBalanceByAddress(address)
      return balanceString
    },
    _handleNetworkChange({ chainInfo, from }) {
      const userId  = getInfoFromStorageByKey('gUID')
      this.getWalletAsOwner(userId)
    },
  },
  async mounted() {
    await this.setInitData();
   
    this.$eventBus.$on('thirdLogin', this.handleThirdLoginCallback);
    this.$eventBus.$on('updateAddress', this.updateAddress);
    this.$eventBus.$on('chainChanged', this.handleChainChanged);
    this.$eventBus.$on('accountsChanged', this.handleAccountsChanged);
    this.$eventBus.$on('disconnect', this.handleDisconnect);
    this.$eventBus.$on('BindingUserInfoAferThirdLogin', this.handleBindingUserInfoAferThirdLogin);
    this.$eventBus.$on('BindingWalletAferCreateWallet', this.handleWalletAferCreateWallet);
    this.$eventBus.$on('networkChange', this._handleNetworkChange)
  },
};
</script>
<style lang="scss" scoped>
  @import "index";
</style>
