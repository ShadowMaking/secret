<template>
  <div class="ncWallet-signer-page">
    <v-navTitle :title="currentTitle" helpUrl="docs/usage/MultisigWallet"></v-navTitle>
    <div class="page-section-border">
      <!-- <van-tabs color="#4375f1" title-active-color="#4375f1" line-width="50%" :before-change="beforeChange">
        <van-tab :title="tabTitle" title-style="font-weight: bold; border-bottom: 2px solid #dfdfdf;"> -->
          <v-signerList v-if="currentAccountType=='wallet'" :dataList="dataList" :signerPercent="signerPercent" @signerChange="getSignerList"></v-signerList>
          <v-walletList v-if="currentAccountType=='normal'" :dataList="dataList" @signChild="getWalletAsSigner"></v-walletList>
          
          <div class="no-data-container" v-if="!initShowLoading && dataList.length==0">
            <v-none />
          </div>
          <v-loading v-show="initShowLoading" />
        <!-- </van-tab>
        <van-tab title="" title-style="border-bottom: 2px solid #dfdfdf;"></van-tab>
      </van-tabs> -->
    </div>
    <v-inputPsw :show="showInputPswModal" @cancel="showInputPswModal=false" @ok="confirmPswOk" :btnLoading="confirmPswBtnLoading" />
  </div>
</template>

<script>
import Vue from 'vue'
import { Toast, Tab, Tabs } from 'vant'
import { ethers } from 'ethers'

import navTitle from '@/components/NavTitle/index'
import Loading from '@/components/Loading'
import None from '@/components/None/index'
import SignerList from './signerList/index'
import WalletList from './walletList/index'
import InputPswModal from '@/components/InputPswModal'


import { isLogin, getEncryptKeyByAddressFromStore, getDecryptPrivateKeyFromStore, getConnectedAccountType, getConnectedNet,
  getConnectedAddress, getContractAt, getSupportNet, getConnectedUserAddress } from '@/utils/dashBoardTools';
import { signerStatus, securityModuleRouter, lockType, walletStatus } from '@/utils/global';
import SecurityModule from "@/assets/contractJSON/SecurityModule.json";
import { getFromStorage, getInfoFromStorageByKey } from '@/utils/storage';
import { CHAINMAP } from '@/utils/netWorkForToken';
import { generateEncryptPswByPublicKey, generateCR1ByPublicKey, getDecryptPrivateKey } from '@/utils/relayUtils'
import web3 from 'web3'
import { formatErrorContarct } from '@/utils/index'
import { supportNetWorkForContract } from '@/utils/netWorkForToken'

Vue.use(Toast);
Vue.use(Tab);
Vue.use(Tabs);

export default {
  name: 'NC-Wallet-Recover',
  data() {
    return {
      userId: getFromStorage('gUID'),

      currentChainInfo: null,
      defaultNetWork: '',
      
      initShowLoading: true,
      dataList: [],
      signerPercent: 0,
      
      tabTitle: 'who I protect',
      currentAccountType: 'normal',
      currentTitle: 'Wallets',

      securityModuleRouter,
      signerStatus,

      // ***************** inputPsw start ***************** //
      userPsw: '',
      publicKey: '',
      aesKey: '', // every decrypt has the same aesKey
      encryptPsw: '',
      encryptPrivateKeyPublicKey: '',
      encryptCr1: '',
      confirmPswBtnLoading: false,
      showInputPswModal: false,
      // ***************** inputPsw end ***************** //
    }
  },
  components: {
    "v-navTitle": navTitle,
    'v-loading': Loading,
    'v-none': None,
    'v-signerList': SignerList,
    'v-walletList': WalletList,
    'v-inputPsw': InputPswModal,
  },
  methods: {
    checkClick() {},
    beforeChange(index) {
      if(index == 1) {return false}
      return true
    },
    async getSignerList() {
      const walletInfo = getInfoFromStorageByKey('currentWalletInfo')
      const walletId = walletInfo && walletInfo['wallet_id']
      let data = {
        network_id: getConnectedNet().id,
        walletId: walletId
      }
      const { hasError, list } = await this.$store.dispatch('getSignerList', {...data})
      if (hasError) {
        Toast('get error')
        return
      }
      this.initShowLoading = false
      this.dataList = list
      const signerTotal = list.length
      this.signerPercent = Math.ceil(signerTotal/2)
    },
    async getWalletAsSigner() {
      console.log(getConnectedAddress())
      let data = {
        network_id: getConnectedNet().id,
        address: getConnectedAddress(),
      }
      const { hasError, list } = await this.$store.dispatch('getWalletListAsSign', data)
      // this.dataList = list
      
      this.dataList = await this.generateWalletStatus(list)
      this.initShowLoading = false
      if (hasError) {
        Toast('Get Error')
      }
    },
    async generateWalletStatus(list) {
      const securityModuleContract = await getContractAt({ tokenAddress: this.securityModuleRouter, abi: SecurityModule.abi }, this)
      const currentChainInfo = getConnectedNet()
      for(var i=0; i<list.length; i++) {
        if (list[i].wallet_status == walletStatus['Active']) {
          let lockStatus = await securityModuleContract.isLocked(list[i].wallet_address)
          let isLocked = (lockStatus == lockType['GlobalLock'] || lockStatus == lockType['GlobalAndSigner']) ? true : false
          isLocked && this.$set(list[i], 'wallet_status', 6)
        }
        if (list[i].status == signerStatus['agreeRecover']) {
          console.log(list[i])
          let isInRecovery = await securityModuleContract.isInRecovery(list[i].wallet_address)
          console.log("isInRecovery:" + isInRecovery)
          let thisIsInRecovery = isInRecovery ? isInRecovery : false
          this.$set(list[i], 'isInRecovery', thisIsInRecovery)
        }
      }
      return list
    },
    getInitWalltInfo() {
      this.tabTitle = 'who protect me'
      this.getSignerList()
    },
    getInitNormalData() {
      this.tabTitle = 'who I protect'
      this.getIsSupport()
    },
    getInitData() {
      this.initShowLoading = true
      this.dataList = []
      this.currentAccountType = getConnectedAccountType()
      if (this.currentAccountType == 'wallet') {
        this.currentTitle = 'Signers'
        this.getInitWalltInfo()
      } else if (this.currentAccountType == 'normal') {
        this.currentTitle = 'Wallets'
        this.getInitNormalData()
      }
    },
    getDefaultNetWork() {
      const info = getInfoFromStorageByKey('netInfo')
      return info && info['id'] || 1
    },
    _handleNetworkChange({ chainInfo, from }) {
      this.currentChainInfo = CHAINMAP[web3.utils.numberToHex(chainInfo.id)]
      this.getInitData()
    },
    handleAccountChange(addressInfo) {
      this.getInitData()
    },
    async getIsSupport() {
      if (!getSupportNet()) {
        return
      }
      const privateKey = await getDecryptPrivateKeyFromStore(this)
      if (!privateKey) {
        this.showInputPswModal = true;
        return
      }
      this.getWalletAsSigner()
    },
    async confirmPswOk({ show, psw }) {
      this.userPsw = psw; // password of user input for encrypt privateKey
      this.confirmPswBtnLoading = true
      const { hasError, data: publicKey} = await this.$store.dispatch('GetAllPublicKey')
      if (hasError) {
        Toast('Get PublickKey Failed! Retry')
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

      // to decrypt privatekey
      const userId = getInfoFromStorageByKey('gUID')
      const address = getConnectedUserAddress()
      const encryptKey = await getEncryptKeyByAddressFromStore(address, this)
      const decryptInfo = await this.$store.dispatch('DecryptPrivateKeyByEcies', {userId, cr1: this.encryptCr1, c1: this.encryptPsw, cc2: encryptKey })
      if(decryptInfo.hasError) {
        Toast('DecryptPrivateKeyByEcies failed! Retry!')
        this.confirmPswBtnLoading = false
        return
      }
      const decryptedPrivateKey = decryptInfo.data
      const privateKey = getDecryptPrivateKey(decryptedPrivateKey, this.aesKey)
      privateKey && (await this.$store.dispatch('SaveDecryptPrivateKeyInStore', { userId, address, encryptKey, privateKey }))

      this.confirmPswBtnLoading = false
      this.showInputPswModal = false

      this.getWalletAsSigner()
    },
  },
  async created() {
    if (!isLogin()) {
      Toast('Please Login')
      return
    }
    this.defaultNetWork = this.getDefaultNetWork()
    const { data: netInfo } = await this.$store.dispatch('GetSelectedNetwork')
    if (netInfo) {
      this.currentChainInfo = CHAINMAP[web3.utils.numberToHex(netInfo['id'])]
    } else {
      this.currentChainInfo = CHAINMAP[web3.utils.numberToHex(this.defaultNetWork)]
    }
    this.getInitData()
  },
  mounted() {
    this.$eventBus.$on('networkChange', this._handleNetworkChange)
    this.$eventBus.$on('changeAccout', this.handleAccountChange)
  },
};
</script>
<style lang="scss" scoped>
  @import "index";
  ::v-deep .setting-set .el-button {
    padding: 0.6rem 5rem;
    border-radius: 20px;
  }
</style>