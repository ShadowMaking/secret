<template>
  <div class="recover-confirm-page">
    <div class="recover-confirm-title">
      <p>You are trying to recover Wallet <span @click="copyAddress(currentWalletAddress)">({{walletName}} {{currentWalletAddress}}),</span>The owner will change from <span @click="copyAddress(newOwnerAddress)">{{oldOwnerAddress}}</span> to <span @click="copyAddress(newOwnerAddress)">{{newOwnerAddress}}</span></p>
    </div>
    <div class="recover-content-box">
      <!-- <div class="recover-step-show address-blue">
        <span class="step-show-title">How to do?</span>
        <i :class="isComponse ? 'el-icon-arrow-up' : 'el-icon-arrow-down'" @click="stepComponseClick"></i>
      </div> -->
      <div class="confirm-step-list">
        <div class="confrim-step-item">
          <div class="confirm-step-left">
            <div class="step-left-title">Step 1: <i :class="this.signerAgreeNum >= this.signerNeedTotal ? 'el-icon-circle-check' : 'el-icon-remove-outline'"></i></div>
            <div class="step-left-content">
              Please ask at least <span class="address-blue">{{signerNeedTotal}}</span> guardians below to help you recover wallet and ask them to login Eigen to confirm your request
            </div>
          </div>
        </div>
        <div class="confirm-signer-list">
          <div class="confrim-signer-item" v-for="(item,index) in signerList" :key="index">
            <div class="confirm-signer-item-left">
              <img :src="item.picture">
            </div>
            <div class="confirm-signer-item-middle">
              <p style="font-weight: bold">{{item.name}}</p>
              <p>{{item.address}}</p>
            </div>
            <div class="confirm-signer-item-right">
              <el-tag type="success" effect="dark" v-if="item.status == signerStatus['agreeRecover']">confirmed</el-tag>
              <el-tag type="danger" effect="dark" v-if="item.status == signerStatus['ignoreRecover']">rejected</el-tag>
              <el-tag type="info" effect="dark" v-if="item.status == signerStatus['startRecover']">confirming</el-tag>
            </div>
          </div>
        </div>
        <div class="confirm-btn-box">
          <div class="confirm-btn-item" v-show="confirmBtn1Disabled && userIsNewOwner">
            <span class="confirm-btn-label">Please start the recovery</span>
            <el-button type="primary" @click="ownerStartRecover">Start</el-button>
          </div>
          <div class="confirm-btn-item" v-show="!confirmBtn1Disabled">Expired in {{lasetTimes}}</div>
        </div>
      </div>
      
      
      <div class="confirm-step-list">
        <div class="confrim-step-item">
          <div class="confirm-step-left">
            <div class="step-left-title">Step 2: <i :class="isTriggerRecover ? 'el-icon-circle-check' : 'el-icon-remove-outline'"></i></div>
            <div class="step-left-content">
              Ask any of the signers above to trigger recovery
            </div>
          </div>
        </div>
      </div>
      <div class="confirm-step-list">
        <div class="confrim-step-item">
          <div class="confirm-step-left">
            <div class="step-left-title">Step 3: <i class="el-icon-remove-outline"></i></div>
          </div>
        </div>
        <div class="confirm-btn-box" style="margin-top: 20px">
          <div class="confirm-btn-item">
            <span class="confirm-btn-label">Set my account as the new owner</span>
            <el-button :type="confirmBtn2Disabled ? 'primary' : 'info'" :disabled="!confirmBtn2Disabled" @click="ownerExcuteRecover" :loading="isHasExcuteClick">Confirm</el-button>
          </div>
        </div>
      </div>
      <div class="confirm-btn-box" style="margin-top: 20px">
          <div class="confirm-btn-item" v-show="confirmBtn3Visible && userIsNewOwner">
            <span class="confirm-btn-label">Cancel the recovery</span>
            <el-button type="danger" plain @click="cancelExcuteRecover" :loading="isHasCancelClick">Cancel</el-button>
          </div>
        </div>
    </div>
    <v-confirmModal
      :show="showTradeConfirm"
      :type="tradeConfrimType"
      :metadata="sendMetadata"
      @close="showTradeConfirm=false"
      @reject="cancelTrade"
      @confirm="confirmTrade" />
    <v-loadingPopup :show="showLoading" :showSpinner="false" />
    <v-inputPsw :show="showInputPswModal" @cancel="showInputPswModal=false" @ok="confirmPswOk" :btnLoading="confirmPswBtnLoading" />
    <v-resultModal :show="showResultModal" :content="resuletContent" :needColse="needResultColse" @confirm="confirmResultModal" @close="cancelResultModal"></v-resultModal>
  </div>
</template>

<script>
import Vue from 'vue'
import { Toast } from 'vant'

import { isLogin, getConnectedNet, getConnectedAddress, getContractAt, addTransHistory, getDecryptPrivateKeyFromStore, getEncryptKeyByAddressFromStore, getEstimateGas, getBalanceByAddress } from '@/utils/dashBoardTools'
import { signerStatus, securityModuleRouter, multOperation, walletStatus } from '@/utils/global'
import { getFromStorage, getInfoFromStorageByKey } from '@/utils/storage'
import { copyTxt, formatErrorContarct } from '@/utils/index'
import { CHAINMAP } from '@/utils/netWorkForToken'
import web3 from 'web3'
import { generateEncryptPswByPublicKey, generateCR1ByPublicKey, getDecryptPrivateKey } from '@/utils/relayUtils'

import SecurityModule from "@/assets/contractJSON/SecurityModule.json"
import WalletJson from "@/assets/contractJSON/Wallet.json";

import ConfirmModal from '@/components/ConfirmModal'
import LoadingPopup from '@/components/LoadingPopup'
import InputPswModal from '@/components/InputPswModal'
import resultModal from '@/components/ResultModal'

Vue.use(Toast);

export default {
  name: 'recover-confirm',
  props: ['currentWalletId', 'currentWalletAddress', 'newOwnerAddress', 'oldOwnerAddress', 'walletName', 'recoverWalletTxid'],
  data() {
    return {
      // currentWalletId: 195,
      // currentWalletAddress: '0x6d4143f1404bd78c15a22c7e02ad00317fd2d2bc',
      confirmBtn1Disabled: true,
      confirmBtn2Disabled: false,
      confirmBtn3Visible: false,
      userIsNewOwner: false,
      isTriggerRecover: false,
      isComponse: true,

      showResultModal: false,
      resuletContent: '',
      needResultColse: false,

      signerList: [],
      signerNeedTotal: 0,
      signerAgreeNum: 0,
      signerStatus,
      multOperation,
      securityModuleRouter,
      walletStatus,

      overrides: {
        gasLimit: 8000000,
        gasPrice: 20000000000,
      },
      currentChainInfo: null,
      
      showLoading: false,
      isHasExcuteClick:false,
      lasetTimes: '48h',
      currentTip: 'cancel',//cancel excuteConfirm cancelResult

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

      showTradeConfirm: false,
      sendMetadata: null,
      defaultNetWork: '',
      thisTimer: null,
      tradeConfrimType: 'Recover Wallet',
      isHasCancelClick: false,
    }
  },
  components: {
    'v-confirmModal': ConfirmModal,
    'v-loadingPopup': LoadingPopup,
    'v-inputPsw': InputPswModal,
    'v-resultModal': resultModal,
  },
  watch: {
    currentWalletId: {
      handler(newValue, oldValue) {
        if (newValue) {
          this.getSignerListByid()
        }
      }
    },
    currentWalletAddress: {
      handler(newValue, oldValue) {
        if (newValue) {
          this.getIsShowInputPsw()
        }
      }
    },
    newOwnerAddress: {
      handler(newValue, oldValue) {
        console.log('newValue:' + newValue)
        this.getIsNewOwner()
      }
    },
  },
  methods: {
    copyAddress(str) {
      if (copyTxt(str)) {
        Toast.success('Copied');
      }
    },
    getIsNewOwner() {
      if (this.newOwnerAddress == getConnectedAddress()) {
        this.userIsNewOwner = true
        if (!this.confirmBtn1Disabled) {
          this.confirmBtn3Visible = true
        }
      }
    },
    ownerStartRecover() {
      this.updateOwner(null)
      this.addMultTx()
    },
    async updateOwner(txid) {
      let data = {
        walletId: this.currentWalletId,
        txid: txid,
        status: walletStatus['Active'],
        ownerAddress: this.newOwnerAddress,
        network_id: getConnectedNet().id,
      }
      const { hasError } = await this.$store.dispatch('updateOwnerAddress', {...data});
      if (hasError) {
        Toast('Update Owner Failed')
      } else {
        console.log('Update Owner success')
      }
    },
    async addMultTx() {
      const submitData = {
        user_id: getFromStorage('gUID'),
        wallet_address: this.currentWalletAddress,
        to: this.securityModuleRouter,
        value: 0,
        network_id: getConnectedNet().id,
        data: '',
        operation: multOperation['Recovery']
      }
      const res = await this.$store.dispatch('addMultTx', submitData);
      if (res.hasError) {
        console.log('addMultTx Failed')
      } else {
        console.log('addMultTx success')
        for (var i=0; i<this.signerList.length; i++) {//waiting for signer agree
          await this.updateSigner(this.signerList[i].address, signerStatus['startRecover'])
        }
        this.updateWalletStatusSubmit(walletStatus['Recovering'])
        this.getSignerListByid()
      }
    },
    async updateWalletStatusSubmit(status) {
      let data = {
        walletId: this.currentWalletId,
        status: status,
        network_id: getConnectedNet().id,
      }
      const { hasError } = await this.$store.dispatch('updateWalletStatus', {...data});
      if (hasError) {
        Toast('failed')
      } else {
        if (status == walletStatus['Recovering']) {
          Toast('Send success')
        } else {
          this.showCacelResultModal()
        }
        
      }
      console.log(hasError)
    },
    async updateSigner(signerAddress, status) {
      let data = {
        walletId: this.currentWalletId,
        signerAddress: signerAddress,
        status: status,
        network_id: getConnectedNet().id,
      }
      const { hasError } = await this.$store.dispatch('updateSigner', {...data});
      if (hasError) {
        console.log('Update Signer Failed')
      } else {
        console.log('Update Signer success')
      }
    },
    ownerExcuteRecover() {
      this.isHasExcuteClick = true
      this.tradeConfrimType = 'Recover Wallet'
      this.showTradeModalData()
    },
    async showTradeModalData() {

      let thisGasPrice = this.overrides.gasPrice.toString()
      let gasPrice = web3.utils.fromWei(thisGasPrice, 'gwei')
      let estimatedGasFee = await getEstimateGas('gasUsed', 5000000000)
      const selectedConnectAddress = getConnectedAddress()
      const connectBalance = await getBalanceByAddress(selectedConnectAddress)
      if (connectBalance < estimatedGasFee) {
        Toast('Insufficient Funds')
        this.isHasExcuteClick = false
        this.isHasCancelClick = false
        this.showLoading = false
        return
      }
      this.sendMetadata = {
        from: getConnectedAddress(),
        to: this.securityModuleRouter,
        gas: this.overrides.gasLimit,
        gasPrice: gasPrice,
        value: 0,
        symbolName: 'ETH',
        netInfo: this.currentChainInfo,
        DATA: '',
        estimatedGasFee: estimatedGasFee
      }
      this.showLoading = false
      this.showTradeConfirm = true
    },
    async dealDataBeforeOwnerExcuteRecover() {
      console.log('start excute')
      const securityModuleContract = await getContractAt({ tokenAddress: this.securityModuleRouter, abi: SecurityModule.abi }, this)

      let amount = 0
      const SMABI = [
          "function executeRecovery(address)",
          "function cancelRecovery(address)",
          "function triggerRecovery(address, address)"
      ]
      // let newOwnAddress = getConnectedAddress()
      // let newOwnAddress = '0x4F5FD0eA6724DfBf825714c2742A37E0c0d6D7d9'
      // let iface = new ethers.utils.Interface(SMABI)
      // let replaceOwnerData = iface.encodeFunctionData("triggerRecovery", [this.currentWalletAddress, newOwnAddress])

      // console.log(replaceOwnerData)
      console.log(securityModuleContract)
      securityModuleContract.executeRecovery(this.currentWalletAddress, this.overrides).then(async tx=> {
          addTransHistory(tx, 'Execute Recover', this)
          this.showLoading = false
          this.showSuccessModal()
          // this.resetSignStatus()
          this.updateOwner(tx.hash)
          tx.wait().then(async res => {
           console.log('Execute Recover:', res)
           this.showLoading = false
          })
      }).catch(error => {
        console.log(error)
        this.showLoading = false
        let errorValue = formatErrorContarct(error)
        Toast.fail(errorValue)
      })
    },
    resetSignStatus() {
      this.signerList.map(async item => {
        this.updateSigner(item.address, signerStatus['active'])
      })
    },
    cancelExcuteRecover() {

      this.showCancelModal()
    },
    showSuccessModal() {
      this.currentTip = 'excuteConfirm'
      this.showResultModal = true
      this.resuletContent = 'The wallet’s owner will be changed to current account soon!'
      // this.resuletContent = `This eigen smart contract wallet has been retrieved successfully! Eigen smart contract wallet ${this.currentWalletAddress}  has been automatically synced to you ${this.newOwnerAddress} account`
      this.needResultColse = false
    },
    showCancelModal() {
      this.currentTip = 'cancel'
      this.showResultModal = true
      this.resuletContent = `Cancel this recover?`
      this.needResultColse = true
    },
    showCacelResultModal() {
      this.currentTip = 'cancelResult'
      this.showResultModal = true
      this.resuletContent = `Submitted Success`
      this.needResultColse = false
    },
    async getSignerListByid() {
      let data = {
        network_id: getConnectedNet().id,
        walletId: this.currentWalletId
      }
      const { hasError, list } = await this.$store.dispatch('getSignerList', {...data})
      for (var i=0; i<list.length; i++) {
        if (list[i].status >= 5) {
          this.confirmBtn1Disabled = false
          this.confirmBtn3Visible = true
        }
        if (list[i].status == this.signerStatus['agreeRecover']) {
          this.signerAgreeNum = this.signerAgreeNum + 1
        }
      }
      this.signerList = list
      this.signerNeedTotal = Math.ceil(this.signerList.length/2)
    },
    async dealDataBeforeGetRecoverInfo() {
      const SecurityContract = await getContractAt({ tokenAddress: this.securityModuleRouter, abi: SecurityModule.abi }, this)
      console.log(SecurityContract)
      this.isTriggerRecover = await SecurityContract.isInRecovery(this.currentWalletAddress);
      let RecoveryExpiryHash = await SecurityContract.getRecoveryExpiryTime(this.currentWalletAddress);
      let recoveryExpiryNumber = web3.utils.hexToNumberString(RecoveryExpiryHash)
      console.log(this.userIsNewOwner)
      console.log(this.isTriggerRecover)
      this.confirmBtn2Disabled = (this.isTriggerRecover && this.userIsNewOwner)
      if (this.isTriggerRecover && !this.thisTimer) {
        this.timer(recoveryExpiryNumber)
      }
    },
    timer(seconds) {
      this.thisTimer = window.setInterval(() => {
        if (seconds > 0) {
          seconds -= 1
          this.countDown(seconds)
        } else {
          this.confirmBtn2Disabled = false
        }
        
      }, 1000)
    },
    countDown(seconds) {
      let d = parseInt(seconds / (24 * 60 * 60))
      d = d <= 0 ? "": d + 'd'
      let h = parseInt(seconds / (60 * 60));
      h = h <= 0 ? "": h + 'h'
      let m = parseInt(seconds / 60 % 60);
      m = m <= 0 ? "": m + 'm'
      let s = parseInt(seconds % 60);
      s = s <= 0 ? "0s": s + 's'
      this.lasetTimes = h + m + s
    },
    _handleNetworkChange({ chainInfo, from }) {
      if (from === 'sendMenu') { return }
      this.currentChainInfo = CHAINMAP[web3.utils.numberToHex(chainInfo.id)]
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
    },
    async getIsShowInputPsw() {
      const privateKey = await getDecryptPrivateKeyFromStore(this)
      console.log(privateKey)
      if (!privateKey) {
        this.showInputPswModal = true;
      }
      this.dealDataBeforeGetRecoverInfo()
    },
    cancelTrade() {
      this.showTradeConfirm = false
      this.isHasExcuteClick = false
      this.isHasCancelClick = false
      Toast('Cancel')
    },
    confirmTrade({ overrides }) {
      this.overrides.gasLimit = overrides.gasLimit
      this.overrides.gasPrice = web3.utils.toWei(overrides.gasPrice, 'gwei')
      this.isHasExcuteClick = false
      this.isHasCancelClick = false
      this.showLoading = true;
      if (this.tradeConfrimType == 'Recover Wallet') {
        this.dealDataBeforeOwnerExcuteRecover()
      } else {
        this.dealDataBeforeCancleRecover()
      }
      
    },
    getDefaultNetWork() {
      const info = getInfoFromStorageByKey('netInfo')
      console.log(info)
      return info && info['id'] || 1
    },
    handleAccountChange(addressInfo) {
      this.getIsNewOwner()
      this.getIsShowInputPsw()
    },
    // stepComponseClick() {
    //   this.isComponse = !this.isComponse
    // },
    confirmResultModal() {
      console.log(this.currentTip)
      if (this.currentTip == 'cancel') {
        this.cancelRecoveryByStatus()
        this.showResultModal = false
      } else if (this.currentTip == 'excuteConfirm'){
        this.showResultModal = false
        this.confirmBtn2Disabled = false
        this.confirmBtn3Visible = false
      } else {//excute confirm result and cancelResult
        this.$router.push({ path: '/overview' })
        this.showResultModal = false
      }
    },
    async dealDataBeforeCancleRecover() {
      const securityModuleContract = await getContractAt({ tokenAddress: this.securityModuleRouter, abi: SecurityModule.abi }, this)

      securityModuleContract.cancelRecovery(this.currentWalletAddress, this.overrides).then(async tx=> {
          addTransHistory(tx, 'Cancel Recover', this)
          this.cancelRecoverySubmit(tx.hash)
          tx.wait().then(async res => {
           console.log('Cancel Recover:', res)
          })
      }).catch(error => {
        console.log(error)
        this.showLoading = false
        let errorValue = formatErrorContarct(error)
        Toast.fail(errorValue)
      })
    },
    async cancelRecoverySubmit(txid) {
      let data = {
        walletId: this.currentWalletId,
        txid: txid,
        status: walletStatus['Active'],
        ownerAddress: this.oldOwnerAddress,
      }
      const { hasError } = await this.$store.dispatch('cancelRecoverWallet', {...data});
      if (hasError) {
        Toast('Cancel Failed')
      } else {
        this.showLoading = false
        this.showCacelResultModal()
      }
    },
    async cancelRecoveryByStatus() {
      if (this.isTriggerRecover) {
        this.isHasCancelClick = true
        this.showLoading = true
        this.tradeConfrimType = 'Cancel Recover'
        this.showTradeModalData()
      } else {
        this.updateWalletStatusSubmit(walletStatus['Active'])
        this.resetSignStatus()
      }
    },
    cancelResultModal() {
      this.showResultModal = false
    },
    getIsHasConfirming() {
      // this.
    },
  },
  async created() {
    if (!isLogin()) {
      Toast('Need Login')
      return
    }
    this.defaultNetWork = this.getDefaultNetWork()
    const { data: netInfo } = await this.$store.dispatch('GetSelectedNetwork')
    if (netInfo) {
      this.currentChainInfo = CHAINMAP[web3.utils.numberToHex(netInfo['id'])]
    } else {
      this.currentChainInfo = CHAINMAP[web3.utils.numberToHex(this.defaultNetWork)]
    }
    this.overrides.gasPrice = await getEstimateGas('gasPrice', 5000000000)
    this.currentWalletId && this.getSignerListByid()
    this.currentWalletAddress && this.getIsShowInputPsw()
    // this.recoverWalletTxid && this.getIsHasConfirming()
    this.getIsNewOwner()
  },
  async mounted() {
    this.$eventBus.$on('networkChange', this._handleNetworkChange)
    this.$eventBus.$on('changeAccout', this.handleAccountChange)
    this.$once('hook:beforeDestroy', function () {
      window.clearInterval(this.thisTimer)
      this.thisTimer = null;
    })
  },
  beforeDestroy() {
    window.clearInterval(this.thisTimer)
    this.thisTimer = null;
  },
};
</script>
<style lang="scss" scoped>
  @import "index";
  ::v-deep .confirm-btn-box .el-button {
    width: 100px;
    height: 40px;
    border-radius: 40px;
  }
</style>