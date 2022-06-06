<template>
  <div class="transactions-container-outer">
    <div class="transactions-container">
      <el-row class="list-header">
        <el-col
          class="list-header-item"
          v-for="(item,index) in headerList" :key="index"
          :span="(index==1 || index==3|| index==4) ? 4 : 3">
          {{ item }}
        </el-col>
      </el-row>
      <div class="transaction-list-wrapper" v-if="newtransactionList.length">
        <el-row class="transaction-list" v-for="(item,index) in newtransactionList" :key="index">
          <el-col :span="3" :class="['transaction-list-item', `status-${item.status}`]">
            <span class="mult-span" v-if="item.from_type == 1">Multisig Wallet</span>
            <i></i>{{ item.status }}
          </el-col>
          <el-col :span="4" class="transaction-list-item">
            <div class="opre-type-item">
              <a>{{ item.operation }}</a>
              <p><a class="trans-detail-btn" v-if="item.mtxid" @click="goTransDetail(item)">View transaction details</a></p>
              <!-- <p v-if="item.status=='pending' && item.operation=='Send'" class="speed-box">
                <a class="up-btn speed-common">Speed Up</a>
                <a class="cancel-btn speed-common" @click="cancelTrans(item)">Cancel</a>
              </p> -->
            </div>
          </el-col>
          <el-col :span="3" :class="['transaction-list-item', `address`]">
            <el-tooltip  effect="dark" placement="top-start">
              <div slot="content" class="table-item-tip-tooltip" @click="copyAddress(item.hash)">{{ item.hash }}</div>
              <a @click="toPageDetail(item, 'hash')">{{ showAddress(item.hash) }}</a>
            </el-tooltip>
          </el-col>
          <el-col :span="4" :class="['transaction-list-item', `address`]" v-if="!hideFrom">
            <el-tooltip effect="dark" placement="top-start">
              <div slot="content" class="table-item-tip-tooltip" @click="copyAddress(item.from)">{{ item.from }}</div>
              <a @click="toPageDetail(item, 'from')">
                <span class="from"></span>{{ showAddress(item.from) }}
              </a>
            </el-tooltip>
          </el-col>
          <el-col :span="4" :class="['transaction-list-item', `address`]" v-if="!hideTo">
            <el-tooltip effect="dark" placement="top-start">
              <div slot="content" class="table-item-tip-tooltip" @click="copyAddress(item.to)">{{ item.to }}</div>
              <a @click="toPageDetail(item, 'to')">
                <span class="to"></span>{{ showAddress(item.to) }}
              </a>
            </el-tooltip>
          </el-col>
          <el-col :span="3" class="transaction-list-item">
            <a @click="toPageDetail(item, 'block')">{{ item.blockNumber }}</a>
          </el-col>
          <el-col :span="3" class="transaction-list-item">
            {{ item.time }}
          </el-col>
        </el-row>
      </div>
      <v-none v-if="!showLoading && newtransactionList.length==0" />
    </div>
    <div class="transactions-container-mobile">
      <div class="transaction-list-item" v-for="(item,index) in newtransactionList" :key="index">
        <div class="grid grid-1">
          <div class="header">TX HASH</div>
          <div class="value"><a @click="toPageDetail(item, 'hash')">{{ item.hash }}</a></div>
        </div>
        <div class="grid grid-1">
          <div class="header"><span class="address from"></span>FROM</div>
          <div class="value">
            <a @click="toPageDetail(item, 'from')">
              <span>{{ item.from }}</span>
            </a>
          </div>
        </div>
        <div class="grid grid-1">
          <div class="header"><span class="address to"></span>TO</div>
          <div class="value">
            <a @click="toPageDetail(item, 'to')">
              <span>{{ item.to }}</span>
            </a>
          </div>
        </div>
        <div class="grid grid-2">
          <div class="header">
            <span>STATUS</span>
            <span>BLOCK NUMBER</span>
          </div>
          <div class="value">
            <div :class="[`status status-${item.status}`]"><i></i>{{ item.status }}</div>
            <div><a @click="toPageDetail(item, 'block')">{{ item.blockNumber }}</a></div>
          </div>
        </div>
        <div class="grid grid-1">
          <div class="header">TIMESTAMP</div>
          <div class="value">{{ item.time }}</div>
        </div>
      </div>
      <v-empty v-if="!showLoading && newtransactionList.length==0" />
    </div>
    <v-loading v-show="showLoading" />
    <div v-show="_showNoMore" class="no-more">no more</div>
    <v-inputPsw :show="showInputPswModal" @cancel="showInputPswModal=false" @ok="confirmPswOk" :btnLoading="confirmPswBtnLoading" />
    <v-confirmModal
      :show="showTradeConfirm"
      :type="modalTitle"
      :metadata="sendMetadata"
      @close="showTradeConfirm=false"
      @reject="cancelModal"
      @confirm="confirmModal" />
    <v-loadingPopup :show="showSubmitLoading" :showSpinner="false" />
  </div>
</template>
<script>
import Vue from 'vue';
import { Toast } from 'vant';
import { subStrAddress, getRouteNameAndQuery  } from '@/utils/index';
import None from '@/components/None/index';
import Loading from '@/components/Loading';
import Empty from '@/components/Empty/index';
import { getCurrentProvider } from '@/utils/web3';
import { copyTxt } from '@/utils/index';
import {  getConnectedNet } from '@/utils/dashBoardTools'

/****speed and cancel start****/
import {
  generateTokenList, getDefaultETHAssets, getConnectedAddress,
  getContractWallet, isLogin, getDATACode, getContractAt, 
  getDecryptPrivateKeyFromStore, getEncryptKeyByAddressFromStore, getEstimateGas, getConnectedUserAddress, getSupportNet, getBalanceByAddress } from '@/utils/dashBoardTools';
import InputPswModal from '@/components/InputPswModal'
import { generateEncryptPswByPublicKey, generateCR1ByPublicKey, getDecryptPrivateKey } from '@/utils/relayUtils'
import { getInfoFromStorageByKey, getFromStorage } from '@/utils/storage';
import ConfirmModal from '@/components/ConfirmModal';
import web3 from 'web3'
import LoadingPopup from '@/components/LoadingPopup';
import { CHAINMAP } from '@/utils/netWorkForToken';
import { ethers, utils } from 'ethers'

Vue.use(Toast)

export default {
  name: 'TransactionList',
  props: {
    headerList: {
      type: Array,
      default: () => []
    },
    transactionList: {
      type: Array,
      default: () => []
    },
    showLoading: {
      type: Boolean,
      default: true,
    },
    hideFrom: {
      type: Boolean,
      default: false,
    },
    hideTo: {
      type: Boolean,
      default: false,
    },
    showNoMore: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    return {
      newtransactionList: this.transactionList,

      sendMetadata: null,
      defaultNetWork: '',
      showTradeConfirm: false,
      modalTitle: 'cancel',
      currentChainInfo: null,

      showSubmitLoading: false,

      overrides: {
        gasLimit: 8000000,
        gasPrice: 20000000000,//wei
      },


      currentTransItem: null,
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
  watch: {
    transactionList(newval, oldval) {
      this.newtransactionList = newval
      this.dealTransactionList()
    },
  },
  components: {
    'v-none': None,
    'v-loading': Loading,
    'v-empty': Empty,
    'v-inputPsw': InputPswModal,
    'v-confirmModal': ConfirmModal,
    'v-loadingPopup': LoadingPopup,
  },
  computed: {
    _showNoMore() {
      return this.showNoMore && this.newtransactionList.length > 0
    },
  },
  methods: {
    copyAddress(str) {
      if (copyTxt(str)) {
        Toast.success('Copied');
      }
    },
    showAddress(txt) { return subStrAddress(txt)},
    toPageDetail(record, type) {
      let currentNetInfo = getConnectedNet()
      let blockExplorerUrls = currentNetInfo.blockExplorerUrls[0]
      const { routeName, query } = getRouteNameAndQuery(record, type);
      let routerInfo = { name: routeName };
      query && (routerInfo['query'] = query);
      let paramsStr = ''
      for(let k in routerInfo.query) {
        paramsStr += `&${k}=${routerInfo.query[k]}`
      }
      // const url = `https://explorer.eigen.cash/#/${routerInfo.name}?${paramsStr}`
      let paramsValue = this.getRouteValue(type, record)
      const url = `${blockExplorerUrls}/${routerInfo.name}/${paramsValue}`
      window.open(url, '_blank')
    },
    async dealTransactionList() {
      const currentProvider = getCurrentProvider()
      console.log('newtransactionList:', this.newtransactionList)
      this.newtransactionList.map(async (item ,index)=> {
        let fromens = await currentProvider.lookupAddress(item.from)
        let toens = await currentProvider.lookupAddress(item.to)
        item.from = fromens || item.from
        item.to = toens || item.to
      })
    },
    getRouteValue(type, record) {
      let paramsValue;
      switch(type) {
        case 'hash':
          paramsValue = record['hash']
          break;
        case 'block':
          paramsValue = record['blockNumber']
          break;
        case 'from':
          paramsValue = record['from']
          break;
        case 'to':
          paramsValue = record['to']
          break;
        default:
          paramsValue = record['hash']
          break;
      }
      return paramsValue
    },
    goTransDetail(row) {
      console.log(row)
      this.$router.push({
        path: `/transDetail/${row.mtxid}`
      })
    },
    /****speed and cancel start****/
    cancelTrans(item) {
      console.log(item)
      this.currentTransItem = item
      this.showSubmitLoading = true
      switch(item.operation) {
        case 'Send':
          this.cancelSend()
          break;
        default:
          break;
      }
    },
    async dealDataCancelContract() {
      const contractWallet = await getContractWallet(this)
      const transferAmount = utils.parseEther('0');
      console.log(transferAmount)
      const sendData = {
        from: this.currentTransItem.from,
        to: this.currentTransItem.from,
        gasLimit: this.overrides.gasLimit,
        gasPrice: web3.utils.toHex(this.overrides.gasPrice),
        value: transferAmount,
        chainId: this.currentChainInfo['id'],
        nonce: 57,
        // nonce: transactionCount + 1,
      }
      console.log(sendData)
      contractWallet.sendTransaction({...sendData})
      .then(async tx=>{
        console.log('cancel tx:', tx)
        tx.wait()
        .then(async res => {
          console.log('cancel tx wait res:', res)
          this.showLoading = false
        })
      })
      .catch(error=>{
        console.log(error)
        this.showLoading = false
      })
    },
    async cancelSend() {
     // check privateKey whether is existed
      const privateKey = await getDecryptPrivateKeyFromStore(this)
      if (!privateKey) {
        this.showInputPswModal = true;
        return
      }
      await this.showConfirmModal()
    },
    async showConfirmModal() {
      const isCanSubmit = await this.isCaSubmit()
      if (!isCanSubmit) {
        return
      }
      let thisGasPrice = this.overrides.gasPrice.toString()
      let gasPrice = web3.utils.fromWei(thisGasPrice, 'gwei')
      let estimatedGasFee = await getEstimateGas('gasUsed')
      this.sendMetadata = {
        from: this.currentTransItem.from,
        to: this.currentTransItem.from,
        gas: this.overrides.gasLimit,
        gasPrice: gasPrice,
        value: 0,
        symbolName: 'ETH',
        netInfo: this.currentChainInfo,
        DATA: '0x',
        estimatedGasFee: estimatedGasFee
      }
      console.log(this.sendMetadata)
      this.showTradeConfirm = true
      this.showSubmitLoading = false
    },
    async isCaSubmit() {
      const selectedConnectAddress = getConnectedAddress()
      const connectBalance = await getBalanceByAddress(selectedConnectAddress)
      let estimatedGasFee = await getEstimateGas('gasUsed')
      if (connectBalance < estimatedGasFee) {
        Toast('Insufficient Funds')
        this.showSubmitLoading = false
        return false
      }
      return true
    },
    cancelModal() {
      this.showTradeConfirm = false
      Toast('Cancel')
    },
    confirmModal({ overrides }) {
      this.overrides.gasLimit = overrides.gasLimit
      this.overrides.gasPrice = web3.utils.toWei(overrides.gasPrice, 'gwei')
      this.showSubmitLoading = true
      if (this.modalTitle == 'cancel') {
        this.dealDataCancelContract()
      }
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
      await this.showConfirmModal()
    },
    /****speed and cancel end****/
  },
  async created(){
    if (!isLogin()) {
      Toast('Please Login')
      return
    }
    const { data: netInfo } = await this.$store.dispatch('GetSelectedNetwork')
    this.currentChainInfo = CHAINMAP[web3.utils.numberToHex(netInfo['id'])]
    this.overrides.gasPrice = await getEstimateGas('gasPrice')
  },
}
</script>
<style lang="scss" scoped>
  .no-more {
    color: #ccc;
    font-size: 1rem;
    text-align: center;
    margin: 10px 0 0;
  }
  @import 'index.scss';
  @import '@/assets/style/media.scss';
</style>
