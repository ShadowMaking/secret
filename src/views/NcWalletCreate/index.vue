<template>
  <div class="ncWalletCreate-page">
    <v-navTitle title="Create Eigen Multi-Signature Wallet"></v-navTitle>
    <div class="page-content-box">
      <div class="create-top-des">
        <div class="create-top-des-show blueColor">
          <span class="create-top-des-title">About Eigen Multi-Signature Wallet?</span>
          <i :class="isComponse ? 'el-icon-arrow-up' : 'el-icon-arrow-down'" @click="stepComponseClick"></i>
        </div>
        <div class="page-section-border create-des-text" v-show="isComponse">You need to add at least one signer to create a multi-signature wallet,which can be recovered and locked to keep your assets safe. Any transaction requires 50%+ signer signatures</div>
      </div>
    </div>
    <div class="create-page-1" v-show="createPage1Visible">
      
      <div class="create-1-container">
        <p class="create-1-title">Set Wallet Name</p>
        <div class="create-1-box">
          <div class="wallet-list">
            <el-input v-model="createWalletName"></el-input>
          </div>
          <div class="create-1-next">
            <el-button type="primary" @click="setWalletNameClick" :loading="setNameLoading">Next</el-button>
          </div>
        </div>
      </div>
    </div>
    <div class="create-page-2" v-show="createPage2Visible">
      <div class="create-2-container">
        <p class="create-2-title">Add your Signer</p>
        <div class="create-2-signer-list">
          <div class="create-2-signer-item" v-for="(item,index) in createSignerList" :key="index">
            <div class="create-signer-left"><img :src="item.picture"></div>
            <div class="create-signer-right">
              <div class="create-sigern-name">{{item.name}}</div>
              <div class="create-signer-address">{{item.address}}</div>
            </div>
          </div>
        </div>
        <div class="create-2-add-signer">
          <v-searchSignerModal
          :dataSource="searchSignerList"
          @confirm="confirmSearchSigner"
          @addConfirm="confirmAddSigner" />
        </div>
        <div class="create-2-btn">
          <el-button type="primary" @click="createWalletClick" :loading="createSubmitLoading">Create</el-button>
        </div>
      </div>
    </div>
    <v-inputPsw :show="showInputPswModal" @cancel="showInputPswModal=false" @ok="confirmPswOk" :btnLoading="confirmPswBtnLoading" />
    <v-resultModal 
      :show="showResultModal" 
      :content="resuletContent" 
      :needColse="needBtnColse" 
      :needConfirm="needBtnConfirm"
      :resultStatus="resultStatus"
      :detailUrl="detailUrl"
      :showCloseIcon="showCloseIcon"
      :confirmText="confirmText"
      @confirm="confirmResultModal" 
      @close="cancelResultModal">
    </v-resultModal>
    <v-confirmModal
      :show="showTradeConfirm"
      type="Create Wallet"
      :metadata="sendMetadata"
      @close="showTradeConfirm=false"
      @reject="cancelTradeModal"
      @confirm="confirmTradeModal" />
      <v-loadingPopup :show="showLoading" :showSpinner="false" />
  </div>
</template>

<script>
import Vue from 'vue'
import { Toast, Dialog, Popup, Loading } from 'vant'
import { ethers } from 'ethers'

import navTitle from '@/components/NavTitle/index'
import searchSignerModal from '@/components/SearchSignerModal/index'
import ConfirmModal from '@/components/ConfirmModal';
import LoadingPopup from '@/components/LoadingPopup';
import InputPswModal from '@/components/InputPswModal'
import resultModal from '@/components/ResultModal'

import { getContractAt, getConnectedAddress, getEns, isLogin, getEncryptKeyByAddressFromStore, getDecryptPrivateKeyFromStore,addTransHistory, getBalanceByAddress, getSupportNet, getConnectedNet, initRPCProvider, getEstimateGas} from '@/utils/dashBoardTools';
import SecurityModule from "@/assets/contractJSON/SecurityModule.json";
import WalletJson from "@/assets/contractJSON/Wallet.json";
import ProxyJson from "@/assets/contractJSON/Proxy.json";
import WalletTransaction from "@/assets/contractJSON/TransactionModule.json";
import { BigNumber } from "bignumber.js";
import { getFromStorage, getInfoFromStorageByKey } from '@/utils/storage';
import { timeFormat } from '@/utils/str';
import { securityModuleRouter, proxyRouter, walletTransactionRouter } from '@/utils/global';
import { CHAINMAP } from '@/utils/netWorkForToken';
import { generateEncryptPswByPublicKey, generateCR1ByPublicKey, getDecryptPrivateKey } from '@/utils/relayUtils'
import web3 from 'web3'
import { formatErrorContarct } from '@/utils/index'

Vue.use(Toast);
Vue.use(Dialog);

export default {
  name: 'NC-Wallet-Recover',
  data() {
    return {
      createPage1Visible: true,
      createPage2Visible: false,
      setNameLoading: false,
      createSubmitLoading: false,
      isComponse: true,

      showResultModal: false,
      resuletContent: '',
      needBtnColse: false,
      needBtnConfirm: false,
      resultStatus: 'noresult',
      detailUrl: '',
      showCloseIcon: true,
      confirmText: 'Confirm',
      
      createWalletName: '',
      createSignerList: [],
      createSignerSubmit: [],
      signerTotal: 0,
      signerPercent: 0,//more than 1/2

      searchSignerList: [],

      showStatusPop: false,
      popStatus: "success",
      statusPopTitle: 'Submitted Successfully!',
      timeTxt: '',
      userId: getFromStorage('gUID'),

      showLoading: false,
      showTradeConfirm: false,

      securityModuleRouter,
      proxyRouter,
      walletTransactionRouter,

      overrides: {
        gasLimit: 8000000,
        gasPrice: 20000000000,//wei
      },
      currentChainInfo: null,
      sendMetadata: null,
      defaultNetWork: '',

      currentClickType: 'setName',//setName createSubmit
      createWalletAddress: '',
      
    
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
    "v-searchSignerModal": searchSignerModal,
    'v-confirmModal': ConfirmModal,
    'v-loadingPopup': LoadingPopup,
    'v-inputPsw': InputPswModal,
    'v-resultModal': resultModal,
  },
  methods: {
    async confirmSearchSigner(value) {
      var searchData = {
        userId: this.userId,
        value: value
      }
      const { hasError, list } = await this.$store.dispatch('searchSigner', searchData);
      this.searchSignerList = list
    },
    async confirmAddSigner(value) {
      if (!value) {
        Toast('Please choose signer')
        return
      }
      const signAddress = value.address
      let currentOwner = getConnectedAddress()

      if (signAddress.toLocaleLowerCase() == currentOwner) {
        Toast('This owner can not to be this signer')
        return
      }
      let isSignerExist = this.createSignerList.findIndex(function(item) {
        return item.address == value
      })
      if (isSignerExist > -1) {
        Toast('This signer already exists')
        return
      }
      // var nowDate = new Date()
      // var nowTime = timeFormat(nowDate, 'yyyy-MM-dd hh:mm:ss')
      // const signAddress = await getEns(value)
      
      console.log(this.createSignerList)
      this.createSignerList.push({
        address: signAddress,
        name: value.name,
        picture: value.picture,
      })
      this.createSignerSubmit.push(signAddress.toLocaleLowerCase())
      // this.signerTotal = this.createSignerList.length
      // this.signerPercent = Math.ceil(this.signerTotal/2)
    },
    stepComponseClick() {
      this.isComponse = !this.isComponse
    },

    // ***************** set wallet name start ***************** //
    setWalletNameClick() {
      this.setNameLoading = true
      this.currentClickType = 'setName'
      this.getIsShowPwd()
    },
    async confirmSetp1Ok() {
      this.showSetp1Waitting() 

      const proxyContract = await getContractAt({ tokenAddress: this.proxyRouter, abi: ProxyJson.abi }, this)
      console.log(proxyContract)
       // const saletnew = ethers.utils.formatBytes32String(randomBytesToString);
      const saletnew = ethers.utils.formatBytes32String(ethers.utils.sha256(ethers.utils.randomBytes(32)).substr(2,31))
      console.log(saletnew)
       
      this.createWalletAddress = await proxyContract.getAddress(saletnew);
      
      proxyContract.create(saletnew,this.overrides).then(async tx=> {
          console.log(tx)
          let currentNetInfo = getConnectedNet()
          let blockExplorerUrls = currentNetInfo.blockExplorerUrls[0]
          this.detailUrl = `${blockExplorerUrls}/tx/${tx.hash}`
          tx.wait().then(async res => {
            console.log(res)
            this.showResultModal = false
            this.createPage1Visible = false
            this.createPage2Visible = true
          })
      }).catch(error => {
        console.log(error)
        this.showResultModal = false
        let errorValue = formatErrorContarct(error)
        this.showSetpFail(errorValue)
        // Toast.fail(errorValue)
        return
      })
    },
    showSetp1Waitting() {
      this.resuletContent = '<span class="blueColor">30s</span> will finish Transaction Waiting for payment confirmation'
      this.showResultModal = true
      this.needBtnConfirm = false
      this.resultStatus = 'waiting'
      this.showCloseIcon = false
    },
    // ***************** set wallet name end ***************** //

    // ***************** confirm result model start ***************** //
    confirmResultModal() {
      if (this.resultStatus == 'success') {
        this.showResultModal = false
        this.$router.push({ name: 'ncWalletList' })
      } else {//retry
        this.showResultModal = false
        this.createSignerSubmit = []
        this.createSignerList = []
        this.createPage1Visible = true
        this.createPage2Visible = false
      }
      
    },
    cancelResultModal() {
      this.showResultModal = false
      this.$router.push({ name: 'ncWalletList' })
    },
    // ***************** confirm result model end ***************** //

    // ***************** create start ***************** //
    showSetp2Waitting() {
      this.detailUrl = ''
      this.showSetp1Waitting()
    },
    createWalletClick() {
      this.createSubmitLoading = true
      this.currentClickType = 'createSubmit'
      this.getIsShowPwd()
    },
    async confirmSetp2Ok() {
      this.showSetp2Waitting()
      const securityModuleContract = await getContractAt({ tokenAddress: this.securityModuleRouter, abi: SecurityModule.abi }, this)
      const walletContract = await getContractAt({ tokenAddress: this.createWalletAddress, abi: WalletJson.abi }, this)
      const transactionContract = await getContractAt({ tokenAddress: this.walletTransactionRouter, abi: WalletTransaction.abi }, this)
    
      let modules = [ transactionContract.address, securityModuleContract.address ]
      let encoder = ethers.utils.defaultAbiCoder
      let du = ethers.utils.parseEther("15")//one day
      let lap = ethers.utils.parseEther("10")//one 
      let data = [encoder.encode(["uint", "uint"], [du, lap]), encoder.encode(["address[]"], [this.createSignerSubmit])]
      
      
      walletContract.initialize(
        modules, 
        data, 
        this.overrides
      ).then(async tx=> {
          console.log(tx)
          this.showResultModal = false
          this.createWallet(this.createWalletAddress, tx.hash)
          addTransHistory(tx, 'Create Wallet', this)
          tx.wait().then(async res => {
            console.log('Create:', res)
          })
      }).catch(error => {
        console.log(error)
        this.showResultModal = false
        let errorValue = formatErrorContarct(error)
        this.showSetp2Fail(errorValue)
      })
    },
    async createWallet(walletAddress, txhash) {
      const selectedConnectAddress = getConnectedAddress()
      console.log(txhash)
      let data = {
        name: this.createWalletName,
        address: selectedConnectAddress,
        wallet_address: walletAddress.toLocaleLowerCase(),
        signers: this.createSignerSubmit,
        txid: txhash,
        network_id: getConnectedNet().id,
      }
      console.log(data)
      const { hasError } = await this.$store.dispatch('addWallet', {...data});
      this.showLoading = false;
      if (hasError) {
        this.showSetpFail('Create Failed')
        // Toast.fail('Create Failed')
      } else {
        this.showSetp2Success()
      }
    },
    showSetp2Success() {
      this.resuletContent = 'Submitted Successfully!'
      this.showResultModal = true
      this.needBtnConfirm = true
      this.confirmText = 'Confirm'
      this.resultStatus = 'success'
      this.showCloseIcon = true
    },
    showSetpFail(reason) {
      this.resuletContent = reason
      this.showResultModal = true
      this.needBtnConfirm = true
      this.confirmText = 'Retry'
      this.resultStatus = 'noresult'
      this.showCloseIcon = false
    },
    // ***************** create end ***************** //
    confirmTradeModal({ overrides }) {
      this.overrides.gasLimit = overrides.gasLimit
      this.overrides.gasPrice = web3.utils.toWei(overrides.gasPrice, 'gwei')
      if (this.currentClickType == 'setName') {
        this.confirmSetp1Ok()
      } else {
        this.confirmSetp2Ok()
      }
    },
    cancelTradeModal() {
      this.showTradeConfirm = false
      Toast('Cancel')
    },
    checkData() {
      if (this.currentClickType == 'setName') {
        if (!this.createWalletName) {
          Toast.fail('Need Input Name')
          return false
        }
      } else {
        if (this.createSignerSubmit.length == 0) {
          Toast.fail('Set Signer')
          return false
        }
        let currentUser = getConnectedAddress()
        if (this.createSignerSubmit.indexOf(currentUser) > -1) {
          Toast.fail('This owner can not to be this signer')
          this.createSignerSubmit = []
          this.createSignerList = []
          return false
        }
      }
      return true
    },
    checkFalse() {
      this.setNameLoading = false
      this.createSubmitLoading = false
      this.showLoading = false
      return false
    },
    async showTradeConfirmModel() {
      this.showLoading = true
      if (!getSupportNet()) {
        this.checkFalse()
        return
      }
      if (!this.checkData()) { 
        this.checkFalse()
        return 
      }
      const selectedConnectAddress = getConnectedAddress()
      const connectBalance = await getBalanceByAddress(selectedConnectAddress)
      if (connectBalance < 0) {
        Toast('Insufficient Funds')
        this.checkFalse()
        return
      }
      let estimatedGasFee = await getEstimateGas('gasUsed', 20000000000) * 10
      console.log(connectBalance)
      if (connectBalance < estimatedGasFee) {
        Toast('Insufficient Funds')
        this.checkFalse()
        return
      }
      let thisGasPrice = this.overrides.gasPrice.toString()
      let gasPrice = web3.utils.fromWei(thisGasPrice, 'gwei')

      // let geeweiTtoal = estimatedGasFee * 1000000000
      // let grNum = geeweiTtoal/gasPrice
      // console.log(grNum)

      this.sendMetadata = {
        from: getConnectedAddress(),
        to: this.securityModuleRouter,
        gas: this.overrides.gasLimit,
        gasPrice: gasPrice,
        value: 0,
        symbolName: 'ETH',
        netInfo: this.currentChainInfo,
        DATA: '0x',
        estimatedGasFee: estimatedGasFee
      }
      this.showLoading = false
      this.showTradeConfirm = true
      this.setNameLoading = false
      this.createSubmitLoading = false
    },
    async getIsShowPwd() {
      // check privateKey whether is existed
      const privateKey = await getDecryptPrivateKeyFromStore(this)
      if (!privateKey) {
        this.showInputPswModal = true;
        return
      }
      this.showTradeConfirmModel()
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
      const address = getConnectedAddress()
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
      this.showTradeConfirmModel()
    },
    getDefaultNetWork() {
      const info = getInfoFromStorageByKey('netInfo')
      return info && info['id'] || 1
    },
    _handleNetworkChange({ chainInfo, from }) {
      if (from === 'sendMenu') { return }
      this.currentChainInfo = CHAINMAP[web3.utils.numberToHex(chainInfo.id)]
    },
    handleAccountChange(addressInfo) {
      this.createSignerSubmit = []
      this.createSignerList = []
    },
  },
  async created() {
    if (!isLogin()) {
      Toast('Need Login')
      return
    }
    this.defaultNetWork = this.getDefaultNetWork()
    const { data: netInfo } = await this.$store.dispatch('GetSelectedNetwork')
    console.log(netInfo)
    if (netInfo) {
      this.currentChainInfo = CHAINMAP[web3.utils.numberToHex(netInfo['id'])]
    } else {
      this.currentChainInfo = CHAINMAP[web3.utils.numberToHex(this.defaultNetWork)]
    }
    this.overrides.gasPrice = await getEstimateGas('gasPrice', 20000000000)
  },
  async mounted() {
    this.$eventBus.$on('networkChange', this._handleNetworkChange)
    this.$eventBus.$on('changeAccout', this.handleAccountChange)
  },
};
</script>
<style lang="scss" scoped>
  @import "index";
</style>