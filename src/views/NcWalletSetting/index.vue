<template>
  <div class="ncWallet-setting-page">
    <v-navTitle title="Create Eigen Multi-Signature Wallet Setting"></v-navTitle>
    <div class="page-section-border payment-limit-box">
      <p class="setting-title">Payment Limit</p>
      <div class="setting-list">
        <div class="setting-item">
          <label>Max Per Day</label>
          <input type="number" v-model="maxPerDay">
        </div>
        <div class="setting-item">
          <label>Max Per Transaction</label>
          <input type="number" v-model="maxPerTransaction">
        </div>
      </div>
      <div class="setting-set">
        <el-button type="primary" @click="paymentSet" :loading="paymentLoading" :disabled="setDiabled">Set</el-button>
      </div>
    </div>
    <div class="page-section-border security-setting-box">
      <p class="setting-title">Security Setting</p>
      <div class="setting-list">
        <div class="setting-item">
          <label>Lock Expiry</label>
          <input type="number" v-model="lockExpiry">
        </div>
        <div class="setting-item">
          <label>Recovery Expiry</label>
          <input type="number" v-model="recoveryExpiry">
        </div>
      </div>
      <div class="setting-set">
        <el-button type="primary" @click="securitySet" :loading="securityLoading" :disabled="setDiabled">Set</el-button>
      </div>
    </div>
    <v-inputPsw :show="showInputPswModal" @cancel="showInputPswModal=false" @ok="confirmPswOk" :btnLoading="confirmPswBtnLoading" />
    <v-confirmModal
      :show="showTradeConfirm"
      type="Create Wallet"
      :metadata="sendMetadata"
      @close="showTradeConfirm=false"
      @reject="cancelTradeModal"
      @confirm="confirmTradeModal" />
    <v-loadingPopup :show="showLoading" :showSpinner="false" />
    <v-resultModal :show="showResultModal" :content="resuletContent" :needColse="needResultColse" @confirm="confirmResultModal" @close="cancelResultModal"></v-resultModal>
  </div>
</template>

<script>
import Vue from 'vue'
import { Toast, Dialog, Popup, Loading } from 'vant'
import { ethers } from 'ethers'

import navTitle from '@/components/NavTitle/index'
import ConfirmModal from '@/components/ConfirmModal';
import LoadingPopup from '@/components/LoadingPopup';
import InputPswModal from '@/components/InputPswModal'
import resultModal from '@/components/ResultModal'

import { getContractAt, getConnectedAddress, getEns, isLogin, getEncryptKeyByAddressFromStore, getDecryptPrivateKeyFromStore,addTransHistory, getBalanceByAddress, getSupportNet, getConnectedNet, initRPCProvider, getEstimateGas, getConnectedUserAddress, getConnectedAccountType, getDATACode} from '@/utils/dashBoardTools';
import SecurityModule from "@/assets/contractJSON/SecurityModule.json";
import WalletJson from "@/assets/contractJSON/Wallet.json";
import TransactionModule from "@/assets/contractJSON/TransactionModule.json";
import { BigNumber } from "bignumber.js";
import { getFromStorage, getInfoFromStorageByKey } from '@/utils/storage';
import { securityModuleRouter, walletTransactionRouter, lockType, multOperation } from '@/utils/global';
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
      userId: getFromStorage('gUID'),

      showLoading: false,
      showTradeConfirm: false,

      securityModuleRouter,
      walletTransactionRouter,

      overrides: {
        gasLimit: 8000000,
        gasPrice: 20000000000,//wei
      },
      currentChainInfo: null,
      sendMetadata: null,
      defaultNetWork: '',
      paymentLoading: false,
      securityLoading: false,
      setDiabled: true,

      resuletContent: '',
      needResultColse: false,
      showResultModal: false,
      currentTip: '',//warn next

      maxPerDay: '',
      maxPerTransaction: '',

      lockExpiry: '',
      recoveryExpiry: '',

      oldmaxPerDay: '',
      oldmaxPerTransaction:'',
      oldlockExpiry: '',
      oldrecoveryExpiry: '',

      
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
    'v-confirmModal': ConfirmModal,
    'v-loadingPopup': LoadingPopup,
    'v-inputPsw': InputPswModal,
    'v-resultModal': resultModal,
  },
  methods: {
    confirmTradeModal({ overrides }) {
      this.overrides.gasLimit = overrides.gasLimit
      this.overrides.gasPrice = web3.utils.toWei(overrides.gasPrice, 'gwei')
    },
    cancelTradeModal() {
      this.showTradeConfirm = false
      Toast('Cancel')
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
      this.getWalletSetting()
    },
    getDefaultNetWork() {
      const info = getInfoFromStorageByKey('netInfo')
      return info && info['id'] || 1
    },
    _handleNetworkChange({ chainInfo, from }) {
      this.currentChainInfo = CHAINMAP[web3.utils.numberToHex(chainInfo.id)]
      console.log('Please switch back to the network')
    },
    handleAccountChange(addressInfo) {
      this.getIsCanSet()
    },
    paymentSet() {
      if (!this.maxPerDay || !this.maxPerTransaction) {
        Toast('Invalid Value')
        return
      }
      if (this.maxPerDay == this.oldmaxPerDay && this.maxPerTransaction == this.oldmaxPerTransaction) {
        Toast('must change at least one parametar')
        return
      }
      this.paymentLoading = true
      this.showLoading = true
      
      let dailyWei = web3.utils.toWei(this.maxPerDay, 'ether')
      let perTransWei = web3.utils.toWei(this.maxPerTransaction, 'ether')
      let datacode = getDATACode(TransactionModule.abi, 'setTMParameter', [this.settingWallet, web3.utils.toHex(dailyWei), web3.utils.toHex(perTransWei)])
      const submitData = {
        user_id: getFromStorage('gUID'),
        wallet_address: this.settingWallet,
        to: this.walletTransactionRouter,
        value: 0,
        network_id: getConnectedNet().id,
        data: datacode,
        operation: multOperation['setMaxPerParametar']
      }
      this.addMultOperation(submitData)
    },
    securitySet() {
      if (!this.lockExpiry || !this.recoveryExpiry) {
        Toast('Invalid Value')
        return
      }
      if (this.lockExpiry == this.oldlockExpiry && this.recoveryExpiry == this.oldrecoveryExpiry) {
        Toast('must change at least one parametar')
        return
      }
      this.securityLoading = true
      this.showLoading = true

      let lockExpiryHex = web3.utils.toHex(this.lockExpiry * 3600)
      let recoveryExpiryHex = web3.utils.toHex(this.recoveryExpiry * 3600)
      let datacode = getDATACode(SecurityModule.abi, 'setSecurityPeriod', [this.settingWallet, lockExpiryHex, recoveryExpiryHex])

      const submitData = {
        user_id: getFromStorage('gUID'),
        wallet_address: this.settingWallet,
        to: this.securityModuleRouter,
        value: 0,
        network_id: getConnectedNet().id,
        data: datacode,
        operation: multOperation['setSecurityPeriod']
      }
      this.addMultOperation(submitData)
    },
    async addMultOperation(data) {
      const res = await this.$store.dispatch('addMultTx', data);
      this.showLoading = false
      this.securityLoading = false
      this.paymentLoading = false
      if (res.hasError) {
        this.showSettingFail()
        console.log('Transaction success，but error when add history')
      } else  {
        this.showSettingSuccess()
      }
    },
    showAccountChangeModal() {
      this.currentTip = 'accountChangeWarn'
      this.showResultModal = true
      this.resuletContent = `Please switch back to the multisig wallet`
    },
    showSettingSuccess() {
      this.currentTip = 'settingSuccessWarn'
      this.showResultModal = true
      this.resuletContent = `Please waiting for another signer to confirm the transaction in "Activity-History-Multisig Wallt`
      this.$eventBus.$emit('addTransactionHistory')
    },
    showSettingFail() {
      this.currentTip = 'settingFailWarn'
      this.showResultModal = true
      this.resuletContent = `Submitted Failed`
    },
    confirmResultModal() {
      if (this.currentTip == 'accountChangeWarn') {
        this.$router.push({
          path: `/overview`,
          query: {tabActive: 1},
        })
      } else {
        this.$router.push({
          path: `/history`,
        })
      }
      this.showResultModal = false
    },
    cancelResultModal() {
      this.showResultModal = false
    },
    async getWalletSetting() {
      const currentAccountType = getConnectedAccountType()
      if (currentAccountType !== 'wallet') {
        this.showAccountChangeModal()
        return
      }
      this.settingWallet = getConnectedAddress()
      let securityModuleContract = await getContractAt({ tokenAddress: this.securityModuleRouter, abi: SecurityModule.abi }, this)

      // var walletTime = new Date(row.createdAt).getTime()
      // var canTime = new Date('2022-03-12 07:50:40.092 +00:00').getTime()
      // if (walletTime < canTime) {
      //   this.showLoading = false
      //   Toast('Invalid wallet')
      //   return
      // }

      let lockStatusHex = await securityModuleContract.isLocked(this.settingWallet)
      let lockStatus = web3.utils.hexToNumber(lockStatusHex)
      console.log(lockStatus)
      if (lockStatus == lockType['GlobalLock'] || lockStatus == lockType['GlobalAndSigner']) {
        Toast('Wallet is locked')
        return
      }


      let transactionModuleContract = await getContractAt({ tokenAddress: this.walletTransactionRouter, abi: TransactionModule.abi }, this)
      transactionModuleContract.getDailyUpbound(this.settingWallet).then(res => {
        let dailyWei = web3.utils.toBN(res).toString()
        this.maxPerDay = web3.utils.fromWei(dailyWei, 'ether')
        this.oldmaxPerDay = this.maxPerDay
        this.setDiabled = false
      }).catch(error => {
        console.log(error)
        this.setDiabled = true
        Toast('Invalid wallet')
      })
      
      transactionModuleContract.getLargeAmountPayment(this.settingWallet).then(res => {
        let perTransWei =  web3.utils.toBN(res).toString()
        this.maxPerTransaction = web3.utils.fromWei(perTransWei, 'ether')
        this.oldmaxPerTransaction = this.maxPerTransaction
      }).catch(error => {
        console.log(error)
      })


      securityModuleContract.getLockedSecurityPeriod(this.settingWallet).then(res => {
        console.log(res)
        this.lockExpiry = web3.utils.hexToNumber(res)/3600
        this.oldlockExpiry = this.lockExpiry
      }).catch(error => {
        console.log(error)
        this.setDiabled = true
        Toast('Invalid wallet')
        return
      })
      
      securityModuleContract.getRecoverySecurityPeriod(this.settingWallet).then(res => {
        console.log(res)
        this.recoveryExpiry = web3.utils.hexToNumber(res)/3600
        this.oldrecoveryExpiry = this.recoveryExpiry
      }).catch(error => {
        console.log(error)
      })

    },
    async getIsCanSet() {
      if (!getSupportNet()) {
        return
      }
      const privateKey = await getDecryptPrivateKeyFromStore(this)
      if (!privateKey) {
        this.showInputPswModal = true;
        return
      }
      this.getWalletSetting()
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
    this.getIsCanSet()
  },
  async mounted() {
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