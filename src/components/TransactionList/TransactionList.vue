<template>
  <div class="transactions-container-outer">
    <div class="transactions-container">
      <el-row class="list-header">
        <el-col
          class="list-header-item"
          v-for="(item,index) in headerList" :key="index"
          :span="(index==1) ? 4 : (index==5||index==6) ? 2 : 3">
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
              <p v-if="item.status=='pending'" class="speed-box">
                <a class="up-btn speed-common" @click="changeTransClick(item, 'speed')">Speed Up</a>
                <a class="cancel-btn speed-common" v-if="item.value !==0" @click="changeTransClick(item, 'cancel')">Cancel</a>
              </p>
            </div>
          </el-col>
          <el-col :span="3" :class="['transaction-list-item', `address`]">
            <el-tooltip  effect="dark" placement="top-start">
              <div slot="content" class="table-item-tip-tooltip" @click="copyAddress(item.hash)">{{ item.hash }}</div>
              <a @click="toPageDetail(item, 'hash')">{{ showAddress(item.hash) }}</a>
            </el-tooltip>
          </el-col>
          <el-col :span="3" :class="['transaction-list-item', `address`]" v-if="!hideFrom">
            <el-tooltip effect="dark" placement="top-start">
              <div slot="content" class="table-item-tip-tooltip" @click="copyAddress(item.from)">{{ item.from }}</div>
              <a @click="toPageDetail(item, 'from')">
                <span class="from"></span>{{ showAddress(item.from) }}
              </a>
            </el-tooltip>
          </el-col>
          <el-col :span="3" :class="['transaction-list-item', `address`]" v-if="!hideTo">
            <el-tooltip effect="dark" placement="top-start">
              <div slot="content" class="table-item-tip-tooltip" @click="copyAddress(item.to)">{{ item.to }}</div>
              <a @click="toPageDetail(item, 'to')">
                <span class="to"></span>{{ showAddress(item.to) }}
              </a>
            </el-tooltip>
          </el-col>
          <el-col :span="2" class="transaction-list-item">
            <a @click="toPageDetail(item, 'block')">{{ dealValue(item) }}</a>
          </el-col>
          <el-col :span="2" class="transaction-list-item">
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
      :type="operateType"
      :metadata="sendMetadata"
      @close="showTradeConfirm=false"
      @reject="cancelModal"
      @confirm="confirmModal" />
    <v-loadingPopup :show="showSubmitLoading" :showSpinner="false" />
    <v-statusPop
      :status="popStatus"
      :title="statusPopTitle"
      :timeTxt="timeTxt"
      tip=""
      :show="showStatusPop"
      @childEvent="changeVisible" />
    <v-speedModal
    :show.sync="showSpeedModal"
    @close="showSpeedModal=false"
    @confirm="confirmSpeedModal" />
  </div>
</template>
<script>
import Vue from 'vue';
import { Toast, Dialog } from 'vant';
import { subStrAddress, getRouteNameAndQuery  } from '@/utils/index';
import None from '@/components/None/index';
import Loading from '@/components/Loading';
import Empty from '@/components/Empty/index';
// import { getCurrentProvider } from '@/utils/web3';
import { copyTxt } from '@/utils/index';
import {  getConnectedNet } from '@/utils/dashBoardTools'

/****speed and cancel start****/
import {
  generateTokenList, getDefaultETHAssets, getConnectedAddress,
  getContractWallet, isLogin, getDATACode, getContractAt, 
  getDecryptPrivateKeyFromStore, getEncryptKeyByAddressFromStore, getEstimateGas, getConnectedUserAddress, getSupportNet, getBalanceByAddress, getThisProvider } from '@/utils/dashBoardTools';
import InputPswModal from '@/components/InputPswModal'
import { generateEncryptPswByPublicKey, generateCR1ByPublicKey, getDecryptPrivateKey } from '@/utils/relayUtils'
import { getInfoFromStorageByKey, getFromStorage } from '@/utils/storage';
import ConfirmModal from '@/components/ConfirmModal';
import web3 from 'web3'
import LoadingPopup from '@/components/LoadingPopup';
import { CHAINMAP } from '@/utils/netWorkForToken';
import { ethers, utils } from 'ethers'
import StatusPop from '@/components/StatusPop';
import { formatErrorContarct } from '@/utils/index'
import SpeedModal from '@/components/SpeedModal';
import { TRANSACTION_TYPE } from '@/api/transaction'

Vue.use(Toast)
Vue.use(Dialog)

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
      TRANSACTION_TYPE,
      newtransactionList: this.transactionList,

      sendMetadata: null,
      defaultNetWork: '',
      showTradeConfirm: false,
      currentChainInfo: null,

      showSubmitLoading: false,
      operateType: 'speed',

      overrides: {
        gasLimit: 8000000,
        gasPrice: 20000000000,//wei
      },

      popStatus: "success",
      statusPopTitle: 'Submitted Success',
      timeTxt: 'Will take effect in one minute',
      showStatusPop: false,

      showSpeedModal: false,


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
    'v-statusPop': StatusPop,
    'v-speedModal': SpeedModal,
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
    dealValue(item) {
      let viewValue
      if (item.type == this.TRANSACTION_TYPE['L1ToL1'] || item.type == this.TRANSACTION_TYPE['L1ToL2']) {
        viewValue = item.value
      } else {
        viewValue = web3.utils.fromWei((item.value).toString(), 'ether')
      }
      return viewValue
    },
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
    changeVisible(eventInfo) {
      this.showStatusPop = eventInfo.show;
      this.$router.push({
        path: `/history`,
      })
    },
    async dealTransactionList() {
      // const currentProvider = getCurrentProvider()
      // console.log('newtransactionList:', this.newtransactionList)
      // this.newtransactionList.map(async (item ,index)=> {
      //   let fromens = await currentProvider.lookupAddress(item.from)
      //   let toens = await currentProvider.lookupAddress(item.to)
      //   item.from = fromens || item.from
      //   item.to = toens || item.to
      // })
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
    changeTransClick(item, operateType) {
      console.log(item)
      this.currentTransItem = item
      this.operateType = operateType
      if (operateType == 'cancel') {
        if (item.value == 0) {
          Toast('Can not cancel this transaction')
          return
        }
        this.showDialogConfirm()
      } else {
        this.showSubmitLoading = true
        this.getIsHasPwd()
      }
    },
    showDialogConfirm() {
      Dialog.confirm({
        message: 'Are you sure to cancel?',
        confirmButtonText: 'Yes',
        confirmButtonColor: '#4375f1',
        cancelButtonText: 'Cancel'
      })
      .then(() => {
        this.showSubmitLoading = true
        this.getIsHasPwd()
      })
      .catch(() => {
        console.log('cancel')
      });
    },
    async getIsHasPwd() {
      // check privateKey whether is existed
      const privateKey = await getDecryptPrivateKeyFromStore(this)
      if (!privateKey) {
        this.showInputPswModal = true;
        return
      }
      if (this.operateType == 'cancel') {
        this.showConfirmModal()
      } else {
        this.showConfirmModal()
        // this.showSpeedModalBefore()
      }
    },
    async showSpeedModalBefore() {
      const isCanSubmit = await this.isCaSubmit()
      if (!isCanSubmit) {
        return
      }
      this.showSubmitLoading = false
      this.showSpeedModal = true
    },
    async showConfirmModal() {
      const isCanSubmit = await this.isCaSubmit()
      if (!isCanSubmit) {
        return
      }
      await this.getNewGasPrice()
      let thisGasPrice = this.overrides.gasPrice.toString()
      let gasPrice = web3.utils.fromWei(thisGasPrice, 'gwei')
      let estimatedGasFee = await getEstimateGas('gasUsed')
      this.sendMetadata = {
        from: this.currentTransItem.from,
        to: this.currentTransItem.to,
        gas: this.overrides.gasLimit,
        gasPrice: gasPrice,
        value: this.operateType == 'cancel' ? 0 : this.currentTransItem.value,
        symbolName: 'ETH',
        netInfo: this.currentChainInfo,
        DATA: '0x',
        estimatedGasFee: estimatedGasFee
      }
      this.showTradeConfirm = true
      this.showSubmitLoading = false
    },
    async getNewGasPrice() {
      const txResult = await this.getCurrentTxHash()
      if (!txResult) {return}
      const oldGasLimit = web3.utils.hexToNumber(txResult.gasLimit)
      const oldGasPrice = web3.utils.hexToNumber(txResult.gasPrice)
      console.log(oldGasPrice)
      if (this.overrides.gasPrice <= oldGasPrice) {
        this.overrides.gasPrice = oldGasPrice + 1000000000
      }

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
    async getCurrentTxHash() {
      const thisHash = this.currentTransItem.hash
      const contractProvider = await getThisProvider()
      const txResult = await contractProvider.getTransaction(thisHash)
      return txResult
    },
    async dealDataCancelContract() {
      const txResult = await this.getCurrentTxHash()

      const contractWallet = await getContractWallet(this)
      const transferAmount = utils.parseEther('0');
      console.log(transferAmount)
      const sendData = {
        from: txResult.from,
        to: txResult.from,
        gasLimit: this.overrides.gasLimit,
        gasPrice: web3.utils.toHex(this.overrides.gasPrice),
        value: transferAmount,
        chainId: txResult.chainId,
        nonce: txResult.nonce,
      }
      console.log(sendData)
      contractWallet.sendTransaction({...sendData})
      .then(async tx=>{
        console.log('cancel tx:', tx)
        this.updateHistoryStatus(this.currentTransItem.hash)
        tx.wait()
        .then(async res => {
          console.log('cancel tx wait res:', res)
        })
      })
      .catch(error=>{
        console.log(error)
        let errorValue = formatErrorContarct(error)
        this.sendFailed(errorValue)
      })
    },
    async dealDataSpeedContract() {
      const txResult = await this.getCurrentTxHash()
      console.log(txResult)
      if (!txResult) {
        this.showSubmitLoading = false
        return 
      }
      const contractWallet = await getContractWallet(this)
      const sendData = {
        from: txResult.from,
        to: txResult.to,
        gasLimit: this.overrides.gasLimit,
        gasPrice: web3.utils.toHex(this.overrides.gasPrice),
        value: txResult.value,
        chainId: txResult.chainId,
        nonce: txResult.nonce,
        data: txResult.data,
      }
      contractWallet.sendTransaction({...sendData})
      .then(async tx=>{
        console.log('Speed tx:', tx)
        this.addHistory(tx)
        tx.wait()
        .then(async res => {
          console.log('Speed tx wait res:', res)
        })
      })
      .catch(error=>{
        console.log(error)
        let errorValue = formatErrorContarct(error)
        this.sendFailed(errorValue)
      })
    },
    async addHistory(tx) {
      console.log(this.currentTransItem)
      const submitData = {
        txid: tx.hash,
        old_txid: this.currentTransItem.txid,
        from: this.currentTransItem.from,
        to: this.currentTransItem.to,
        type: this.currentTransItem.type,
        status: 0,
        value: this.currentTransItem.value,
        name: this.currentTransItem.name,
        operation: this.currentTransItem.operation,
        network_id: this.currentTransItem.network_id,
        from_type: this.currentTransItem.from_type,
      }
      const res = await this.$store.dispatch('AddTransactionHistory', {...submitData});
      this.showSubmitLoading = false
      if (res.hasError) {
        this.sendFailed(`Transaction success，but error when add history`)
      } else  {
        this.sendSuccess()
        this.$eventBus.$emit('transactionStatusChange')
        // this.$eventBus.$emit('addTransactionHistory')
      }
    },
    sendFailed(error) {
      this.showSubmitLoading = false
      this.statusPopTitle = error
      this.popStatus = 'fail'
      this.showStatusPop = true
    },
    sendSuccess() {
      this.showSubmitLoading = false
      this.statusPopTitle = 'Submitted Success'
      this.popStatus = 'success'
      this.showStatusPop = true
    },
    updateHistoryStatus(tx) {
      this.$store.dispatch('UpdateTransactionHistory', {
        txid: tx,
        status: 3,//3-cancel
      })
      .then(res=>{
        this.sendSuccess()
        this.$eventBus.$emit('transactionStatusChange');
      })
      .catch(err=>{
        this.sendFailed(`Cancel success，but error when update history`);
      })
    },
    cancelModal() {
      this.showTradeConfirm = false
      Toast('Cancel')
    },
    confirmModal({ overrides }) {
      this.overrides.gasLimit = overrides.gasLimit
      this.overrides.gasPrice = web3.utils.toWei(overrides.gasPrice, 'gwei')
      this.showSubmitLoading = true
      if (this.operateType == 'cancel') {
        this.dealDataCancelContract()
      } else if (this.operateType == 'speed') {
        this.dealDataSpeedContract()
      }
    },
    confirmSpeedModal({ overrides }) {
      console.log(overrides)
      this.overrides.gasLimit = Number(overrides.gasLimit)
      this.overrides.gasPrice = web3.utils.toWei(overrides.gasPrice, 'gwei')
      this.showSubmitLoading = true
      this.dealDataSpeedContract()
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
