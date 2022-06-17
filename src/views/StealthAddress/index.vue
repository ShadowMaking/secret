<template>
  <div class="stealth-box">
    <v-navTitle title="Stealth Address" helpUrl="docs/usage/Overview"></v-navTitle >
    <div class="stealth-list">
      <el-row class="list-header">
        <el-col :span="4" class="list-header-item">Sender Address</el-col>
        <el-col :span="4" class="list-header-item">Stealth Address</el-col>
        <el-col :span="4" class="list-header-item">Time</el-col>
        <el-col :span="4" class="list-header-item">Token</el-col>
        <el-col :span="4" class="list-header-item">Amount</el-col>
        <el-col :span="4" class="list-header-item">Operation</el-col>
      </el-row>
      <el-row 
        class="list-content" 
        v-for="(item, index) in addressList"
        :key="index">
        <el-col :span="4" class="list-item">
         <span @click="copyAddress(item.sender_address)">{{ `${item.sender_address.slice(0,6)}...${item.sender_address.slice(-4)}`}}</span>
        </el-col>
        <el-col :span="4" class="list-item">
          <span @click="copyAddress(item.stealth_address)">{{`${item.stealth_address.slice(0,6)}...${item.stealth_address.slice(-4)}`}}</span>
        </el-col>
        <el-col :span="4" class="list-item">{{formatterTime(item.createdAt)}}</el-col>
        <el-col :span="4" class="list-item">{{item.token_name || 'ETH'}}</el-col>
        <el-col :span="4" class="list-item">{{item.amount || 0}}</el-col>
        <el-col :span="4" class="list-item item-contract">
          <div class="item-con-right">
            <a @click="unHideClick(item)" v-if="item.status !==2">Unhide</a>
            <span v-else>UnHided</span>
          </div>
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
    <v-statusPop
      :status="popStatus"
      :title="statusPopTitle"
      :timeTxt="timeTxt"
      tip=""
      :show="showStatusPop"
      @childEvent="changeVisible" />
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
import { generateTokenList, getConnectedAddress, getContractAt, getEncryptKeyByAddressFromStore, getDecryptPrivateKeyFromStore,addTransHistory, getIsCanTransaction, getEstimateGas, getConnectedUserAddress, getContractWallet  } from '@/utils/dashBoardTools';
import { generateEncryptPswByPublicKey, generateCR1ByPublicKey, getDecryptPrivateKey, generateEncryptPrivateKeyByPublicKey } from '@/utils/relayUtils'
import { copyTxt, formatErrorContarct } from '@/utils/index'
import { Verify, PrivateKey } from '@/utils/anonymousAddress'
import { timeSericeFormat } from '@/utils/str'
import StatusPop from '@/components/StatusPop';

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

      currentClickItem: null,

      popStatus: "success",
      statusPopTitle: 'Unhide Submitted',
      timeTxt: 'The temporary address has been imported into the account. You can switch by clicking the account in the upper left corner',
      showStatusPop: false,
      
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
    'v-statusPop': StatusPop,
  },
  
  methods: {
    copyAddress(str) {
      console.log(str)
      if (copyTxt(str)) {
        Toast.success('Copied');
      }
    },
    changeVisible(eventInfo) {
      this.showStatusPop = eventInfo.show;
    },
    formatterTime(time) {
      return timeSericeFormat(time)
    },
    async dealDataBeforeUnHide() {
      this.showLoadingModal = true
      if (!this.verifyAddress()) {
        this.showLoadingModal = false
        Toast('Verify Failed')
        return
      }
      const newPrivateKey = await this.getStealPrivateKey()
      if (!newPrivateKey) {
        this.showLoadingModal = false
        Toast('Get PrivateKey Failed')
        return
      }
      this.importAccount(newPrivateKey)
    },
    async importAccount(newPrivateKey) {
      console.log(newPrivateKey)
      const newWallet = new ethers.Wallet(newPrivateKey);
      const address = newWallet.address
      const encryptPrivateKeyPublicKey = generateEncryptPrivateKeyByPublicKey(this.publicKey, newPrivateKey)
      this.encryptPrivateKeyPublicKey = encryptPrivateKeyPublicKey
      let userpswHex = web3.utils.toHex(this.userPsw)
      const userId = getInfoFromStorageByKey('gUID')
      const { hasError: encryptError, data: encryptPrivateKey, error: errorMsg } = await this.$store.dispatch('EncryptPrivateKeyByEcies', { userId, c1: this.encryptPrivateKeyPublicKey, cc1: this.encryptPsw, hash: ethers.utils.sha256(userpswHex) }) 
      if (encryptError) {
        this.showLoadingModal = false
        if (errorMsg) {
          Toast(errorMsg, 5)
        } else {
          Toast('EncrpytKey Failed', 5)
        }
        return
      }
      const { hasError } = await this.$store.dispatch('UploadEncrpytKeyByAddress', { userId, address, encryptKey: encryptPrivateKey })
      if (hasError) {
        this.showLoadingModal = false
        console.log('Upload EncrpytKey Failed')
        Toast('Unhide Account Failed', 5)
        return
      }
      const { data } = await this.$store.dispatch('GetBindingGoogleUserInfo', { userId })
      // if (!data) {
      await this.$store.dispatch('StoreBindingGoogleUserInfo', { userId, encryptPrivateKey, address })
      await this.$store.dispatch('SaveDecryptPrivateKeyInStore', { userId, address, encryptKey: encryptPrivateKey, newPrivateKey })
      // }
      await this.$store.dispatch('StoreBindingGoogleUserInfoList', { userId, encryptPrivateKey, address })
      this.$eventBus.$emit('BindingUserInfoAferThirdLogin', { thirdUserId: userId });
      
      this.userPsw = '';
      this.updateStealStatus()
    },
    async updateStealStatus() {
      const status = 2
      const message = this.currentClickItem.message
      const { hasError } = await this.$store.dispatch('updateStealthStatus', { message, status })
      this.showLoadingModal = false
      if (hasError) {
        Toast('Unhide Account Failed', 5)
      } else {
        this.showStatusPop = true
        this.getAddressList()
      }
    },
    async verifyAddress() {
      const currentUserPrivateKey = await getDecryptPrivateKeyFromStore(this)
      const receicePublickey = this.currentClickItem.receiver_address
      const isVerify = Verify(this.currentClickItem.stealth_public_key, currentUserPrivateKey, Buffer.from(this.currentClickItem.message), this.currentClickItem.nonce, this.currentClickItem.sender_public_key)
      return isVerify
    },
    async getStealPrivateKey() {
      const currentUserPrivateKey = await getDecryptPrivateKeyFromStore(this)
      const stealPrivateSk = PrivateKey(currentUserPrivateKey, Buffer.from(this.currentClickItem.message), this.currentClickItem.nonce, this.currentClickItem.sender_public_key)
      const stealPrivate = stealPrivateSk.getPrivate().toString("hex")
      return stealPrivate
    },
    async unHideClick(item) {
      this.currentClickItem = item
      // transaction need privateKey
      this.showInputPswModal = true
    },
    
    async getAddressList() {
      this.showLoading = false
      const userId = getInfoFromStorageByKey('gUID')
      const { hasError, list} = await this.$store.dispatch('getStealthList',{user_id: userId})
      console.log(list)
      this.addressList = list
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
