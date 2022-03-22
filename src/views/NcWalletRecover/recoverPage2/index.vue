<template>
  <div class="recover-confirm-page">
    <div class="recover-confirm-title">
      <p>You are trying to recover Eigen Wallet <span @click="copyAddress(currentWalletAddress)">{{currentWalletAddress}}</span> to Account <span @click="copyAddress(currentUserAddress)">{{currentUserAddress}}</span></p>
      <p>Please ask at least <span>{{signerNeedTotal}}</span> guardians below to help you recover wallet and ask them to login Eigen to confirm your request</p>
    </div>
    <div class="confirm-signer-list">
      <div class="confrim-signer-item" v-for="(item,index) in signerList" :key="index">
        <div class="confirm-signer-item-left">
          <img src="~@/assets/icon_logo.png">
        </div>
        <div class="confirm-signer-item-middle">
          <p>signer{{index}}</p>
          <p>{{item.address}}</p>
        </div>
        <div class="confirm-signer-item-right">
          <el-tag type="success" effect="dark" v-if="item.status == signerStatus['agreeRecover']">Guardian已确认您的找回需求，24h36min36s将会过期</el-tag>
          <el-tag type="info" effect="dark" v-if="item.status == signerStatus['ignoreRecover']">Guardian拒绝了您的找回需求，24h36min36s可重新申请</el-tag>
          <el-tag type="info" effect="dark" v-if="item.status == signerStatus['startRecover']">等待Guardian确认，6小时候申请将自动过期</el-tag>
        </div>
      </div>
    </div>
    <div class="confirm-btn-box">
      <div>
        <el-button type="primary" v-show="confirmBtn1Disabled" @click="ownerStartRecover">向所有Guardians发送找回申请</el-button>
      </div>
      <div>
        <el-button :type="confirmBtn2Disabled ? 'primary' : 'info'" :disabled="!confirmBtn2Disabled" @click="ownerExcuteRecover" :loading="isHasExcuteClick">将此智能钱包导入到此账号下</el-button>
      </div>
      <div>
        <el-button type="danger" plain @click="cancelExcuteRecover" v-show="confirmBtn3Visible">取消此智能合约钱包的找回</el-button>
      </div>
    </div>
    <v-confirmModal
      :show="showTradeConfirm"
      type="Recover Wallet"
      :metadata="sendMetadata"
      @close="showTradeConfirm=false"
      @reject="cancelRecover"
      @confirm="confirmRecover" />
    <v-loadingPopup :show="showLoading" :showSpinner="false" />
    <v-inputPsw :show="showInputPswModal" @cancel="showInputPswModal=false" @ok="confirmPswOk" :btnLoading="confirmPswBtnLoading" />
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

import ConfirmModal from '@/components/ConfirmModal'
import LoadingPopup from '@/components/LoadingPopup'
import InputPswModal from '@/components/InputPswModal'

Vue.use(Toast);

export default {
  name: 'recover-confirm',
  props: ['currentWalletId', 'currentWalletAddress'],
  data() {
    return {
      // currentWalletId: 195,
      // currentWalletAddress: '0x6d4143f1404bd78c15a22c7e02ad00317fd2d2bc',
      confirmBtn1Disabled: true,
      confirmBtn2Disabled: false,
      confirmBtn3Visible: true,

      signerList: [],
      currentUserAddress: '',
      signerNeedTotal: 0,
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
    }
  },
  components: {
    'v-confirmModal': ConfirmModal,
    'v-loadingPopup': LoadingPopup,
    'v-inputPsw': InputPswModal,
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
          this.getRecoverInfo()
        }
      }
    },
  },
  methods: {
    copyAddress(str) {
      if (copyTxt(str)) {
        Toast.success('Copied');
      }
    },
    ownerStartRecover() {
      this.updateOwner()
    },
    async updateOwner() {
      let data = {
        walletId: this.currentWalletId,
        ownerAddress: this.currentUserAddress,
        network_id: getConnectedNet().id,
      }
      const { hasError } = await this.$store.dispatch('updateOwnerAddress', {...data});
      if (hasError) {
        Toast('Update Owner Failed')
      } else {
        console.log('Update Owner success')
        this.addMultTx()
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
        Toast('Send success')
        for (var i=0; i<this.signerList.length; i++) {//waiting for signer agree
          await this.updateSigner(this.signerList[i].address, signerStatus['startRecover'])
        }
        this.updateWalletStatusSubmit(walletStatus['Recovering'])
        this.getSignerListByid()
      }
    },
    async updateWalletStatusSubmit(status) {
      console.log(status)
      let data = {
        walletId: this.currentWalletId,
        status: status,
        txid: null,
        network_id: getConnectedNet().id,
      }
      const { hasError } = await this.$store.dispatch('updateWalletStatus', {...data});
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
    async ownerExcuteRecover() {
      this.isHasExcuteClick = true
      let thisGasPrice = this.overrides.gasPrice.toString()
      let gasPrice = web3.utils.fromWei(thisGasPrice, 'gwei')
      let estimatedGasFee = await getEstimateGas('gasUsed', 5000000000)
      const selectedConnectAddress = getConnectedAddress()
      const connectBalance = await getBalanceByAddress(selectedConnectAddress)
      if (connectBalance < estimatedGasFee) {
        Toast('Insufficient Funds')
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
          this.showLoading = false;
          Toast('success')
          this.resetSignStatus()
          this.updateWalletStatusSubmit(walletStatus['Active'])
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
      this.updateWalletStatusSubmit(walletStatus['Active'])
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
        }
      }
      this.signerList = list
      this.signerNeedTotal = Math.ceil(this.signerList.length/2)
    },
    async getRecoverInfo() {
      const SecurityContract = await getContractAt({ tokenAddress: this.securityModuleRouter, abi: SecurityModule.abi }, this)
      console.log(this.currentWalletAddress)
      let res = await SecurityContract.isInRecovery(this.currentWalletAddress);
      // let RecoveryExpiry = await SecurityContract.getRecoveryExpiryTime(this.currentWalletAddress);
      console.log(res)
      this.confirmBtn2Disabled = res
      // console.log(RecoveryExpiry)
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
      console.log(`GetPublicKey result is: ${publicKey}`)
      
      // const password = ecies.crypto.randomBytes(16).toString("base64");
      const encryptPsw = generateEncryptPswByPublicKey(publicKey, psw); // generate cc1
      const { cr1: encryptCr1, aesKey } = generateCR1ByPublicKey(this.publicKey); // generate cr1
      console.log('aesKey:', aesKey)
      this.aesKey = aesKey
      this.encryptPsw = encryptPsw
      this.encryptCr1 = encryptCr1
      console.log(`encryptPsw: ${encryptPsw}, \n encryptCr1: ${encryptCr1}`)

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
    },
    cancelRecover() {
      this.showTradeConfirm = false
      this.isHasExcuteClick = false
      Toast('Cancel Recover')
    },
    confirmRecover({ overrides }) {
      this.overrides.gasLimit = overrides.gasLimit
      this.overrides.gasPrice = web3.utils.toWei(overrides.gasPrice, 'gwei')
      this.isHasExcuteClick = false
      this.showLoading = true;
      this.dealDataBeforeOwnerExcuteRecover()
    },
    getDefaultNetWork() {
      const info = getInfoFromStorageByKey('netInfo')
      console.log(info)
      return info && info['id'] || 1
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
    this.currentUserAddress = getConnectedAddress()
    this.getIsShowInputPsw()
    this.currentWalletId && this.getSignerListByid()
    this.currentWalletAddress && this.getRecoverInfo()
  },
  async mounted() {
    this.$eventBus.$on('networkChange', this._handleNetworkChange)
  },
};
</script>
<style lang="scss" scoped>
  @import "index";
  ::v-deep .confirm-btn-box .el-button {
    width: 320px;
    height: 40px;
    margin-bottom:20px;
  }
</style>