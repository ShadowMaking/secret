<template>
  <div class="wallet-list-page" >
    <div class="tab-des">
      The multisig wallets you own or protect, click detail for specific actions you can do.
    </div>
    <div class="tab-content-list">
      <div class="tab-content-item" v-for="(item, index) in dataList" :key="index">
        <div class="tab-item-left">
          <div class="tab-item-left-top">
            <div class="tab-item-left-img">
              <img :src="item.owner_picture">
            </div>
            <div class="tab-item-left-info">
              <p class="tab-item-left-name">
                <span class="tab-item-left-text">{{item.name}}</span>
                
                <img src="~@/assets/walletStatus/creating.png" class="status-icon" v-if="item.wallet_status == walletStatus['Creating']">
                <img src="~@/assets/walletStatus/failed.png" class="status-icon" v-else-if="item.wallet_status == walletStatus['Fail']">
                <img src="~@/assets/walletStatus/active.png" class="status-icon" v-else-if="item.wallet_status == walletStatus['Active']">
                <img src="~@/assets/walletStatus/Lock.png" class="status-icon" v-else-if="item.wallet_status == 6">
                
                <el-tag size="small" type="warning" class="item-tag" v-if="item.owner_address == item.address">owner</el-tag>
                <el-tag size="small" class="item-tag" v-else @click="copyAddress(item.owner_address)">signer</el-tag>
              </p>
              <p class="tab-item-left-address" @click="copyAddress(item.wallet_address)">{{item.wallet_address}}</p>
            </div>
          </div>
          <!-- <div class="tab-item-left-bottom blueColor" v-if="item.status > 4">Recover invitation</div> -->
        </div>
        <div class="tab-item-right">
          <div class="tab-item-tight-top">
            <span class="tab-item-right-detail blueColor" @click="walletDetail(item)">Detail</span>
            <!-- <div class="tab-item-right-icon"></div> -->
          </div>
          <div class="tab-item-right-btn" v-if="item.status > 4 && item['wallet_status'] !== walletStatus['Fail']">
            <div class="tab-item-right-btn-list" v-if="item.status == signerStatus['startRecover']">
              <el-button type="primary" @click="checkDialogClick(item, 'singerSignMessage')">Confirm</el-button>
              <el-button type="danger" plain @click="checkDialogClick(item, 'rejectSign')">Reject</el-button>
            </div>
            <div class="tab-item-right-btn-list" v-if="item.status == signerStatus['agreeRecover']">
              <el-button type="primary" @click="checkDialogClick(item, 'triggerRecover')" v-if="!item.isInRecovery">Trigger</el-button>
              <span v-else>This wallet is recovering</span>
            </div>
          </div>
        </div>
      </div>
    </div>
    <el-dialog
      title=""
      :visible.sync="showDetailDialog"
      custom-class="detail-modal-wraper"
      center
      v-if="detailDataSource">
      <div class="detail-top">
        <div class="detail-top-left" >
          <div class="tab-item-left-img">
            <img :src="detailDataSource.owner_picture">
          </div>
          <div class="tab-item-left-info">
            <p class="tab-item-left-name">{{detailDataSource.name}}</p>
            <p class="tab-item-left-address" v-if="detailDataSource.wallet_address">{{`${detailDataSource.wallet_address.slice(0,8)}...${detailDataSource.wallet_address.slice(-4)}`}}</p>
          </div>
        </div>
        <div class="detail-top-right">
          <el-button type="primary" @click="LockClick" v-if="lockVisible">{{isLocked ? 'Unlock' : 'Lock'}}</el-button>
        </div>
      </div>
      <div class="detail-middle">
       <p style="font-weight:bold;">The signers help you to recover your ownership,  fine-grain payment management by multi-signature.</p>
      </div>
      <div class="detail-bottom">
        <div class="detail-item">
          <label>Email:</label>
          <span>{{detailDataSource.owner_email}}</span>
        </div>
        <div class="detail-item">
          <label>Owner Address:</label>
          <span>
          {{detailDataSource.owner_address ? `${detailDataSource.owner_address.slice(0,16)}...${detailDataSource.owner_address.slice(-4)}` : `${detailDataSource.new_owner_address.slice(0,16)}...${detailDataSource.new_owner_address.slice(-4)}`}}
          </span>
        </div>
      </div>
    </el-dialog>

    <v-loadingPopup :show="showLoading" :showSpinner="false" />
    <v-confirmModal
      :show="showTradeConfirm"
      type="Recover Wallet"
      :metadata="sendMetadata"
      @close="showTradeConfirm=false"
      @reject="cancelConfirmModal"
      @confirm="okConfirmModal" />
    <v-signMessageModal
      :show="showSignMessageModal"
      :metadata="signMessageMetadata"
      @close="showSignMessageModal=false"
      @reject="cancelSignMessage"
      @confirm="confirmSignMessage" />
    <v-inputPsw :show="showInputPswModal" @cancel="showInputPswModal=false" @ok="confirmPswOk" :btnLoading="confirmPswBtnLoading" />
    <v-resultModal :show="showResultModal" :content="resuletContent" :needColse="needResultColse" @confirm="confirmResultModal" @close="cancelResultModal"></v-resultModal>
  </div>
</template>
<script>
import Vue from 'vue';
import { ethers } from 'ethers'
import { Toast, Loading, Popup, Dialog } from 'vant'
import { getFromStorage, getInfoFromStorageByKey } from '@/utils/storage';
import SecurityModule from "@/assets/contractJSON/SecurityModule.json";
import { getContractAt, getConnectedAddress, getContractWallet, getDecryptPrivateKeyFromStore, getEncryptKeyByAddressFromStore, addTransHistory, getEstimateGas, getBalanceByAddress, getConnectedNet, getConnectedUserAddress, getSupportNet  } from '@/utils/dashBoardTools'
import WalletJson from "@/assets/contractJSON/Wallet.json";
import { signerStatus, securityModuleRouter, walletStatus, multOperation, lockType } from '@/utils/global';

import ConfirmModal from '@/components/ConfirmModal';
import SignMessageModal from '@/components/SignMessageModal';
import LoadingPopup from '@/components/LoadingPopup';
import InputPswModal from '@/components/InputPswModal'
import resultModal from '@/components/ResultModal'

import { CHAINMAP } from '@/utils/netWorkForToken';
import web3 from 'web3'
import { copyTxt, formatErrorContarct } from '@/utils/index';
import { generateEncryptPswByPublicKey, generateCR1ByPublicKey, getDecryptPrivateKey } from '@/utils/relayUtils'
import { timeSericeFormat } from '@/utils/str';



Vue.use(Toast)

export default {
  name: 'ownWalletList',
  props: ['dataList'],
  data() {
    return {
      showDetailDialog: false,
      detailDataSource: null,

      showCheckDialog: false,

      isLocked: false,//lock unlock
      lockVisible: false,

      showLoading: false,

      showTradeConfirm: false,
      currentChainInfo: null,
      sendMetadata: null,
      defaultNetWork: '',
      overrides: {
        gasLimit: 8000000,
        gasPrice: 20000000000,
      },

      showSignMessageModal: false,
      signMessageMetadata: null,
      signMsgHash: '',
      signAmount: 0,

      securityModuleRouter,
      securityModuleContract: null,
      
      signerStatus,
      walletStatus,
      multOperation,
      currentOptType: '',

      resuletContent: '',
      needResultColse: false,
      showResultModal: false,
      currentTip: '',

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
    'v-confirmModal': ConfirmModal,
    'v-signMessageModal': SignMessageModal,
    'v-loadingPopup': LoadingPopup,
    'v-inputPsw': InputPswModal,
    'v-resultModal': resultModal,
  },
  methods: {
    copyAddress(str) {
      if (copyTxt(str)) {
        Toast.success('Copied');
      }
    },
    walletDetail(item) {
      this.currentOptType = 'detail'
      this.detailDataSource = item
      this.getIsSupport()
    },
    LockClick() {
      const lockName = this.isLocked ? 'Unlock' : 'Lock'
      Dialog.confirm({
        message: `Are you confirm to ${lockName} ${this.detailDataSource.owner_name}'s wallet?`,
        confirmButtonText: 'Confirm',
        confirmButtonColor: '#4375f1',
        cancelButtonText: 'Cancel'
      })
      .then(() => {
        this.LockClickConfirm()
      })
      .catch(() => {
        console.log('cancel')
      });
      
    },
    LockClickConfirm() {
      if (this.isLocked) {
        this.currentOptType = 'unlockWalletSubmit'
      } else {
        this.currentOptType = 'freezeWalletSubmit'
      }
      this.showDetailDialog = false
      this.getIsSupport()
    },
    checkDialogClick(item, type) {
      this.detailDataSource = item
      this.currentOptType = type
      this.showCheckDialog = false
      this.getIsSupport()
    },
    async showDetail() {
      console.log(this.detailDataSource)
      this.showLoading = true

      var walletTime = new Date(this.detailDataSource['createdAt']).getTime()
      var canTime = new Date('2022-03-12 07:50:40').getTime()//todo
      if (walletTime < canTime) {
        this.showLoading = false
        Toast('Invalid wallet')
        return
      }

      if (this.detailDataSource['wallet_status'] == walletStatus['Active'] || this.detailDataSource['wallet_status'] == walletStatus['Recovering'] || this.detailDataSource['wallet_status'] == 6) {
        this.lockVisible = true
      }
      const securityModuleContract = await getContractAt({ tokenAddress: this.securityModuleRouter, abi: SecurityModule.abi }, this)
      const lockStatus = await securityModuleContract.isLocked(this.detailDataSource['wallet_address'])
      this.isLocked = (lockStatus == lockType['GlobalLock'] || lockStatus == lockType['GlobalAndSigner']) ? true : false
      console.log(lockStatus)
      this.showLoading = false
      this.showDetailDialog = true
    },
    async getCheckDialog() {
      this.showLoading = true

      var walletTime = new Date(this.detailDataSource['createdAt']).getTime()
      var canTime = new Date('2022-03-12 07:50:40').getTime()//todo
      if (walletTime < canTime) {
        this.showLoading = false
        Toast('Invalid wallet')
        return
      }

      if (this.detailDataSource['wallet_status'] == walletStatus['Fail']) {
        this.showLoading = false
        Toast('Invalid wallet')
        return
      }
      
      const securityModuleContract = await getContractAt({ tokenAddress: this.securityModuleRouter, abi: SecurityModule.abi }, this)
      this.detailDataSource.isInRecovery = await securityModuleContract.isInRecovery(this.detailDataSource['wallet_address'])
      console.log(this.detailDataSource)
      this.showLoading = false
      this.showCheckDialog = true
    },
    
    cancelConfirmModal() {
      this.showTradeConfirm = false
      Toast('Cancel')
    },
    okConfirmModal({ overrides }) {
      this.overrides.gasLimit = overrides.gasLimit
      this.overrides.gasPrice = web3.utils.toWei(overrides.gasPrice, 'gwei')
      this.showLoading = true
      console.log(this.currentOptType)
      if (this.currentOptType === 'triggerRecover') {
        this.dealDataBeforeTriggerRecover()
      }
      if (this.currentOptType === 'freezeWalletSubmit') {
        this.dealDataBeforeFreezeWalletSubmit()
      }
      if (this.currentOptType === 'unlockWalletSubmit') {
        this.dealDataBeforeUnlockWalletSubmit()
      }
    },
    async dealDataBeforeTriggerRecover() {
      let currentWalletAddress = this.detailDataSource.wallet_address
      const walletContract = await getContractAt({ tokenAddress: currentWalletAddress, abi: WalletJson.abi }, this)
      console.log(walletContract)
      let sequenceId = await walletContract.getNextSequenceId()
      console.log(sequenceId)
      let replaceOwnerData = this.getNewOwnerInfo()
      console.log(replaceOwnerData)

      let expireTime = Math.floor((new Date().getTime()) / 1000) + 1800;
      let signatures = this.signMsg;
      
      const securityModuleContract = await getContractAt({ tokenAddress: this.securityModuleRouter, abi: SecurityModule.abi }, this)
      
      var walletTime = new Date(this.detailDataSource.createdAt).getTime()
      var canTime = new Date('2022-03-12 07:50:40.092 +00:00').getTime()
      if (walletTime < canTime) {
        this.showLoading = false
        Toast('Invalid wallet')
        return
      }

      let lockStatus = await securityModuleContract.isLocked(this.detailDataSource.wallet_address)
      console.log(lockStatus)
      if (lockStatus == lockType['GlobalLock'] || lockStatus == lockType['GlobalAndSigner']) {
        this.showLoading = false
        Toast('Wallet is already locked')
        return
      }
      
      securityModuleContract.multicall(
          this.detailDataSource.wallet_address,
          [this.securityModuleRouter, this.signAmount, replaceOwnerData, sequenceId, expireTime],
          signatures,
          this.overrides
        ).then(async tx=> {
          console.log(tx)
          this.triggerRecoverResult()
          this.changeWalletSuccess(tx, 'Recovering', 'Trigger Recover', true)
        
          tx.wait().then(async res => {
            console.log('Trigger Recover:', res)
          }).catch(error => {
            console.log(error)
          })
      }).catch(error => {
        this.showLoading = false
        console.log(error)
        let errorValue = formatErrorContarct(error)
        Toast(errorValue)
      })
    },
    async dealDataBeforeFreezeWalletSubmit() {
      var walletTime = new Date(this.detailDataSource['createdAt']).getTime()
      var canTime = new Date('2022-03-12 07:50:40.092 +00:00').getTime()
      if (walletTime < canTime) {
        this.showLoading = false
        Toast('Invalid wallet')
        return
      }

      const securityModuleContract = await getContractAt({ tokenAddress: this.securityModuleRouter, abi: SecurityModule.abi }, this)

      let lockStatus = await securityModuleContract.isLocked(this.detailDataSource.wallet_address)
      console.log(lockStatus)
      if (lockStatus == lockType['GlobalLock'] || lockStatus == lockType['GlobalAndSigner']) {
        this.showLoading = false
        Toast('Wallet is already locked')
        return
      }
      securityModuleContract.lock(
          this.detailDataSource.wallet_address,
          this.overrides
        ).then(async tx=> {
          this.changeWalletSuccess(tx, 'Freezing', 'Lock')
          tx.wait().then(async res => {
            console.log('Lock:', res)
          })
      }).catch(error => {
        console.log(error)
        this.showLoading = false
        let errorValue = formatErrorContarct(error)
        Toast(errorValue)
      })
    },
    async dealDataBeforeUnlockWalletSubmit() {
      var walletTime = new Date(this.detailDataSource['createdAt']).getTime()
      var canTime = new Date('2022-03-12 07:50:40.092 +00:00').getTime()
      if (walletTime < canTime) {
        this.showLoading = false
        Toast('Invalid wallet')
        return
      }

      const securityModuleContract = await getContractAt({ tokenAddress: this.securityModuleRouter, abi: SecurityModule.abi }, this)

      securityModuleContract.unlock(
          this.detailDataSource.wallet_address,
          this.overrides
        ).then(async tx=> {
          this.changeWalletSuccess(tx, 'Unlocking', 'Unlock')
          tx.wait().then(async res => {
            console.log('Unlock:', res)
          })
      }).catch(error => {
        console.log(error)
        this.showLoading = false
        let errorValue = formatErrorContarct(error)
        Toast(errorValue)
      })
    },
    changeWalletSuccess(res, status, operateType, isToast) {
      this.showLoading = false
      !isToast && Toast(`${operateType} Submitted Success`)
      addTransHistory(res, operateType, this)
    },


    async dealDataBeforeSingerSignMessage() {
      this.showCheckDialog = false
      this.showLoading = true
      let currentWalletAddress = this.detailDataSource.wallet_address
      const walletContract = await getContractAt({ tokenAddress: currentWalletAddress, abi: WalletJson.abi }, this)
      let sequenceId = await walletContract.getNextSequenceId()
      let replaceOwnerData = this.getNewOwnerInfo()
      const input = `0x${[
        "0x19",
        "0x00",
        this.securityModuleRouter,
        ethers.utils.hexZeroPad(ethers.utils.hexlify(this.signAmount), 32),
        replaceOwnerData,
        ethers.utils.hexZeroPad(ethers.utils.hexlify(sequenceId), 32),
      ].map((hex) => hex.slice(2)).join("")}`;
      let hash = ethers.utils.keccak256(input)
      this.signMsgHash = hash
      this.signMessageMetadata = {
        userAddress: getConnectedAddress(),
        signMessage: hash,
        netInfo: this.currentChainInfo,
      }
      this.showLoading = false
      this.showSignMessageModal = true
    },
    getNewOwnerInfo() {
      let currentWalletAddress = this.detailDataSource.wallet_address
      let newOwnAddress = this.detailDataSource.new_owner_address
      const SMABI = [
          "function executeRecovery(address)",
          "function cancelRecovery(address)",
          "function triggerRecovery(address, address)"
      ]
      let iface = new ethers.utils.Interface(SMABI)
      let replaceOwnerData = iface.encodeFunctionData("triggerRecovery", [currentWalletAddress, newOwnAddress])
      return replaceOwnerData
    },
    cancelSignMessage() {
      this.showSignMessageModal = false
      Toast('Cancel Sign Message')
    },
    async confirmSignMessage() {
      this.showLoading = true
      const currentSignerWallet = await getContractWallet(this)
      let sig = await currentSignerWallet.signMessage(ethers.utils.arrayify(this.signMsgHash));
      this.signMessageSubmit(sig)
      console.log(sig)
    },
    async signMessageSubmit(msg) {
      let data = {
        mtxid: this.detailDataSource.mtxid,
        signer_address: this.detailDataSource.address,
        signer_message: msg,
        status: this.signerStatus['agreeRecover'],
        operation: multOperation['Recovery']
      }
      const { hasError, totalSignMessage } = await this.$store.dispatch('addSignerMultMessages', {...data});
      this.showLoading = false;
      if (hasError) {
        Toast('Confirm Recover Failed')
      } else {
        this.updateSignerStatus(this.signerStatus['agreeRecover'], false)
        this.getIsCanRecovery()
      }
    },

    signerRejectSignMessage() {
      this.showCheckDialog = false
      this.updateSignerStatus(this.signerStatus['ignoreRecover'], true)
    },

    async updateSignerStatus(status, isToast) {
      let data = {
        walletId: this.detailDataSource.wallet_id,
        signerAddress: this.detailDataSource.address,
        status: status,
        network_id: getConnectedNet().id,
      }
      const { hasError } = await this.$store.dispatch('updateSigner', {...data});
      this.showLoading = false;
      if (hasError) {
        isToast && Toast('Update Failed')
      } else {
        if (isToast) {
          this.$emit('signChild');
          Toast('Update success')
        }
      }
    },

    isCanTriggerRecover() {
      this.showCheckDialog = false
      let totalSignMessage = this.getSignMessage()
      if (totalSignMessage) {
        this.signMsg = totalSignMessage
        this.currentOptType === 'triggerRecover'
        this.showConfirmModal()
      } else {
        this.showLoading = false
        Toast(`Any transaction requires the confirmation of half signers`)
      }
    },
    async getIsCanRecovery() {
      let totalSignMessage = this.getSignMessage()
      if (totalSignMessage) {
          let currentWalletAdress = this.detailDataSource.wallet_address
          const securityModuleContract = await getContractAt({ tokenAddress: this.securityModuleRouter, abi: SecurityModule.abi }, this)
          let res = await securityModuleContract.isInRecovery(currentWalletAdress)
          console.log("isInRecovery" + res)
          if (res) {
            Toast('Confirm Recover success')
            return
          }
          Dialog.confirm({
            message: 'Half of the signers have signed,Trigger recovery now?',
            confirmButtonText: 'Confirm',
            confirmButtonColor: '#4375f1',
            cancelButtonText: 'Cancel'
          })
          .then(() => {
            this.signMsg = totalSignMessage
            this.currentOptType = 'triggerRecover'
            this.showLoading = true
            this.showConfirmModal()
          })
          .catch((error) => {
            this.showLoading = false
            console.log(error)
          });
      } else {
        this.showLoading = false
        Toast('Confirm Recover success')
      }
    },

    async getSignMessage() {
      let dataParams = {
        walletId: this.detailDataSource.wallet_id,
        signerAddress: this.detailDataSource.address,
        mtxid: this.detailDataSource.mtxid,
        network_id: getConnectedNet().id,
      }
      const { hasError, data } = await this.$store.dispatch('getSignMessage', {...dataParams});
      return data
    },

    async showConfirmModal() {
      this.showLoading = true
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
      this.showLoading = false
      this.showTradeConfirm = true
    },
    triggerRecoverResult() {
      this.currentTip = 'triggerSuccess'
      this.showResultModal = true
      this.resuletContent = `Submitted Successfully!`
    },
    confirmResultModal() {
      this.showResultModal = false
    },
    cancelResultModal() {
      this.showResultModal = false
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

      this.dealOptType()
    },
    dealOptType() {
      if (this.currentOptType == 'detail') {
        this.showDetail()
      } else if (this.currentOptType == 'singerSignMessage') {
        this.dealDataBeforeSingerSignMessage()
      } else if (this.currentOptType == 'rejectSign') {
        this.signerRejectSignMessage()
      } else if (this.currentOptType == 'triggerRecover') {
        this.isCanTriggerRecover()
      } else {
        this.showConfirmModal()
      }
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
      this.dealOptType()
    },
    _handleNetworkChange({ chainInfo, from }) {
      if (from === 'sendMenu') { return }
      this.currentChainInfo = CHAINMAP[web3.utils.numberToHex(chainInfo.id)]
    },
    getDefaultNetWork() {
      const info = getInfoFromStorageByKey('netInfo')
      console.log(info)
      return info && info['id'] || 1
    },
  },
  async created() {
    this.defaultNetWork = this.getDefaultNetWork()
    
    const { data: netInfo } = await this.$store.dispatch('GetSelectedNetwork')
    if (netInfo) {
      this.currentChainInfo = CHAINMAP[web3.utils.numberToHex(netInfo['id'])]
    } else {
      this.currentChainInfo = CHAINMAP[web3.utils.numberToHex(this.defaultNetWork)]
    }
    this.overrides.gasPrice = await getEstimateGas('gasPrice', 5000000000)
  },
  async mounted() {
    this.$eventBus.$on('networkChange', this._handleNetworkChange)
  },
}
</script>
<style lang="scss" scoped>
  @import 'index.scss';
</style>
