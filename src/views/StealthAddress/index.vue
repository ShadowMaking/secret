<template>
  <div class="stealth-box">
    <v-navTitle title="Stealth Address" helpUrl="docs/usage/Overview"></v-navTitle >
    <div class="stealth-list">
      <el-row class="list-header">
        <el-col :span="4" class="list-header-item">Sender Address</el-col>
        <el-col :span="4" class="list-header-item">Stealth Address</el-col>
        <el-col :span="4" class="list-header-item">Time</el-col>
        <el-col :span="4" class="list-header-item">Detail</el-col>
        <el-col :span="4" class="list-header-item">Amount</el-col>
        <el-col :span="4" class="list-header-item">Operation</el-col>
      </el-row>
      <el-row 
        class="list-content" 
        v-for="(item, index) in addressList"
        :key="index">
        <el-col :span="4" class="list-item">{{item.address}}</el-col>
        <el-col :span="4" class="list-item">{{item.address}}</el-col>
        <el-col :span="4" class="list-item">{{item.time}}</el-col>
        <el-col :span="4" class="list-item list-detail">{{item.address}}</el-col>
        <el-col :span="4" class="list-item">{{item.amount}}</el-col>
        <el-col :span="4" class="list-item item-contract">
          <div class="item-con-right"><a @click="unHideClick(item)">Unhide</a></div>
        </el-col>
      </el-row>
      <van-popup v-model="showLoadingModal" round :close-on-click-overlay="false" class="waiting-modal flex flex-center flex-column">
        <div class="inner-wrapper">
          <van-loading type="spinner" />
        </div>
      </van-popup>
      <v-loading v-show="showLoading"/>
      <v-none v-if="!showLoading && addressList.length==0"/>
    </div>
    <v-inputPsw :show="showInputPswModal" @cancel="showInputPswModal=false" @ok="confirmPswOk" :btnLoading="confirmPswBtnLoading" />
  </div>
</template>
<script>
import Vue from 'vue'
import web3 from 'web3'
import { ethers } from 'ethers'
import { getFromStorage, getInfoFromStorageByKey } from '@/utils/storage';
import { NETWORKSFORTOKEN, CHAINMAP } from '@/utils/netWorkForToken';
import None from '@/components/None/index'
import VLoading from '@/components/Loading'
import InputPswModal from '@/components/InputPswModal'
import navTitle from '@/components/NavTitle/index'
import { Popup, Toast, Loading } from 'vant';
import { TRANSACTION_TYPE } from '@/api/transaction'
import { generateTokenList, getConnectedAddress, getContractAt, getEncryptKeyByAddressFromStore, getDecryptPrivateKeyFromStore,addTransHistory, getIsCanTransaction, getEstimateGas, getConnectedUserAddress } from '@/utils/dashBoardTools';
import { generateEncryptPswByPublicKey, generateCR1ByPublicKey, getDecryptPrivateKey } from '@/utils/relayUtils'
import { formatErrorContarct } from '@/utils/index'

Vue.use(Toast)
Vue.use(Popup)
Vue.use(Loading)

export default {
  name: 'Home',
  data() {
    return {
      addressList: [],
      netWorkList: _.cloneDeep(NETWORKSFORTOKEN),
      defaultNetWork: 1,
      showLoading: true,
      userId: getFromStorage('gUID'),
      currentChainInfo: null,

      showLoadingModal: false,
      

      overrides: {
        gasLimit: 8000000,
        gasPrice: 20000000000,//wei
      },

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
    'v-none': None,
    'v-loading': VLoading,
    'v-inputPsw': InputPswModal,
    "v-navTitle": navTitle,
  },
  
  methods: {
    async dealDataBeforeUnHide() {
      
    },
    async unHideClick(item) {
      // transaction need privateKey
      const privateKey = await getDecryptPrivateKeyFromStore(this)
      if (!privateKey) {
        this.showInputPswModal = true;
        return
      }
      await this.dealDataBeforeUnHide()
    },
    
    async getAddressList() {
      this.showLoading = false
      this.addressList = [{
        address: 'oxfsdfsdf',
        time: '2018-2-12',
        amount: 0,
      }]
    },

    async handleAccountChange(addressInfo) {
      this.showLoading = true;
      this.addressList = []
      await this.getAddressList()
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
      await this.dealDataBeforeUnHide()
    },
    async _handleNetworkChange({ chainInfo, from }) {
      if (from === 'sendMenu') { return }
      this.currentChainInfo = CHAINMAP[web3.utils.numberToHex(chainInfo.id)]
      this.showLoading = true;
      this.addressList = []
      await this.getAddressList()
    },
  },
  async created (){
    this.$eventBus.$on('changeAccout', this.handleAccountChange)
    this.$eventBus.$on('networkChange', this._handleNetworkChange)
    
    const { data: netInfo } = await this.$store.dispatch('GetSelectedNetwork')
    if (netInfo) {
      this.currentChainInfo = CHAINMAP[web3.utils.numberToHex(netInfo['id'])]
    } else {
      this.currentChainInfo = CHAINMAP[web3.utils.numberToHex(this.defaultNetWork)]
    }
    this.defaultNetWork = this.currentChainInfo['id']

    this.overrides.gasPrice = await getEstimateGas('gasPrice', 3000000000)

    await this.getAddressList()
  }
}
</script>
<style lang="scss" scoped>
  @import 'index';
</style>
