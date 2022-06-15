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
        <el-col :span="4" class="list-item">{{ `${item.sender_address.slice(0,6)}...${item.sender_address.slice(-4)}`}}</el-col>
        <el-col :span="4" class="list-item">{{`${item.receiver_address.slice(0,6)}...${item.receiver_address.slice(-4)}`}}</el-col>
        <el-col :span="4" class="list-item">{{formatterTime(item.createdAt)}}</el-col>
        <el-col :span="4" class="list-item list-detail">{{`${item.message.slice(0,6)}...${item.message.slice(-4)}`}}</el-col>
        <el-col :span="4" class="list-item">{{item.amount || 0}}</el-col>
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
import { generateTokenList, getConnectedAddress, getContractAt, getEncryptKeyByAddressFromStore, getDecryptPrivateKeyFromStore,addTransHistory, getIsCanTransaction, getEstimateGas, getConnectedUserAddress, getContractWallet  } from '@/utils/dashBoardTools';
import { generateEncryptPswByPublicKey, generateCR1ByPublicKey, getDecryptPrivateKey, generateEncryptPrivateKeyByPublicKey } from '@/utils/relayUtils'
import { formatErrorContarct } from '@/utils/index'
import { Verify, PrivateKey } from '@/utils/anonymousAddress'
import { timeSericeFormat } from '@/utils/str'

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
        Toast('Unhide Account Successfully', 5)
      }
    },
    async verifyAddress() {
      const currentUserPrivateKey = await getDecryptPrivateKeyFromStore(this)
      const receicePublickey = this.currentClickItem.receiver_address
      const isVerify = Verify(this.currentClickItem.receiver_public_key, currentUserPrivateKey, Buffer.from(this.currentClickItem.message), this.currentClickItem.none, this.currentClickItem.sender_public_key)
      return isVerify
    },
    async getStealPrivateKey() {
      const currentUserPrivateKey = await getDecryptPrivateKeyFromStore(this)
      const stealPrivateSk = PrivateKey(currentUserPrivateKey, Buffer.from(this.currentClickItem.message), this.currentClickItem.none, this.currentClickItem.sender_public_key)
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
      // const currentWallet = await getContractWallet(this)
      // const senderPublicKey = currentWallet.publicKey
      // let currentUserAddress = getConnectedAddress()
      // let dataParams = {
      //   sender_public_key: senderPublicKey,
      //   // sender_address: currentUserAddress,
      // }
      const { hasError, list} = await this.$store.dispatch('getStealthList')
      console.log(list)
      this.addressList = list
      // this.addressList = [{
      //   receiver_public_key: '04347fea747191eab9e3c7bd7d01399114ccb3e1eea063a76111c550797aadf56b5d572650d373e83bb7febfe840b391f66703d9cf5f8a28c2700acade6a56125c',
      //   sender_address: '0x28ef362ba842842df918bae66ee02ab47185e358',
      //   sender_public_key: '0x04c653f4f110ea8429290dad6e4478da647eedf08c8150415d98afa99da78d7356f09d282312d7d770a836d10e97f9b5f083783541f1856b28855a98dcbc9f2d32',
      //   receiver_address: '0xc9B7cF0268d75b5bFFaB4B9F7EeeD847BfFa8640',
      //   message: 'cb909318580b243490ee18e47c4ffa7af9ba97f198092c1bbbd2314c4ac9d2be',
      //   createdAt: '2018-2-12',
      //   amount: '0.02',
      //   none: 120,
      // },{
      //   receiver_public_key: '04f30f98d2307bb68ccafc8dda9013511fe4f6f23748efd67cfadfbaffaa03b436205637beae3c7a1eb71b415f06846142c86c9e624c6cbf107e66c67567a80275',
      //   sender_address: '0x28ef362ba842842df918bae66ee02ab47185e358',
      //   sender_public_key: '0x04c653f4f110ea8429290dad6e4478da647eedf08c8150415d98afa99da78d7356f09d282312d7d770a836d10e97f9b5f083783541f1856b28855a98dcbc9f2d32',
      //   receiver_address: '0x6a83f33334Ce1Fdb1e9ecBd022118e1AC83D17e8',
      //   message: '660d277a06711b60715cae09671056cc947a99e2ef887768583f9783dd1b29c6',
      //   createdAt: '2018-2-12',
      //   amount: '0.01',
      //   none: 122,
      // }]
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
