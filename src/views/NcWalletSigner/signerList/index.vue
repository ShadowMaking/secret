<template>
  <div class="signer-list-page" >
    <div class="tab-des">
      The owner and signers of wallet  {{currentWalltInfo && currentWalltInfo.name}} ({{currentWalltInfo && currentWalltInfo.wallet_address}})
      <!-- You need {{signerPercent}} signer approval for a vault recovery or to approve an untrusted transaction. -->
    </div>
    <div class="tab-content-list">
      <div class="tab-content-item" v-for="(item, index) in dataList" :key="index">
        <div class="tab-item-left">
          <div class="tab-item-left-top">
            <div class="tab-item-left-img">
              <img :src="item.picture">
            </div>
            <div class="tab-item-left-info">
              <p class="tab-item-left-name"><span>{{item.name}}</span><el-tag size="small">signer</el-tag></p>
              <p class="tab-item-left-address">{{item.address}}</p>
            </div>
          </div>
          <!-- <div class="tab-item-left-bottom blueColor">Invitaion rejected</div> -->
        </div>
        <div class="tab-item-right">
          <!-- <div class="tab-item-tight-top">
            <span class="tab-item-right-detail blueColor" @click="signerDetail(item)">Detail</span>
            <div class="tab-item-right-icon"></div>
          </div> -->
          <div class="tab-item-right-btn">
            <el-button type="primary" @click="signerDetail(item)">Detail</el-button>
          </div>
        </div>
      </div>
    </div>
    <div class="add-signer-box">
      <v-searchSignerModal
        :dataSource="searchSignerList"
        @confirm="confirmSearchSigner"
        @addConfirm="confirmAddSigner" 
        />
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
            <img :src="detailDataSource.picture">
          </div>
          <div class="tab-item-left-info">
            <p class="tab-item-left-name">{{detailDataSource.name}}</p>
            <p class="tab-item-left-address">{{`${detailDataSource.address.slice(0,8)}...${detailDataSource.address.slice(-4)}`}}</p>
          </div>
        </div>
        <div class="detail-top-right">
          <el-button type="primary" @click="DeleteClick">Delete</el-button>
        </div>
      </div>
      <div class="detail-middle">
        <p style="font-weight:bold;">The signers help you to recover your ownership,  fine-grain payment management by multi-signature.</p>
        <p>It works in consensus with your other signers.</p>
        <p>By enabling, you will receive a email to authorize recovery or untrusted transaction.</p>
      </div>
      <div class="detail-bottom">
        <div class="detail-item">
          <label>Email:</label>
          <span>{{detailDataSource.email}}</span>
        </div>
        <div class="detail-item">
          <label>Address:</label>
          <span>{{`${detailDataSource.address.slice(0,16)}...${detailDataSource.address.slice(-4)}`}}</span>
        </div>
      </div>
    </el-dialog>
    <v-loadingPopup :show="showLoading" :showSpinner="false" />
    <v-confirmModal
      :show="showTradeConfirm"
      type="Signer"
      :metadata="sendMetadata"
      @close="showTradeConfirm=false"
      @reject="cancelConfirmModal"
      @confirm="confirmConfirmModal" />
    <v-inputPsw :show="showInputPswModal" @cancel="showInputPswModal=false" @ok="confirmPswOk" :btnLoading="confirmPswBtnLoading" />
    <v-resultModal :show="showResultModal" :content="resuletContent" :needColse="needResultColse" @confirm="confirmResultModal" @close="cancelResultModal"></v-resultModal>
  </div>
</template>
<script>
import Vue from 'vue';
import { Toast, Loading, Dialog } from 'vant'
import searchSignerModal from '@/components/SearchSignerModal/index'
import LoadingPopup from '@/components/LoadingPopup';
import ConfirmModal from '@/components/ConfirmModal';
import InputPswModal from '@/components/InputPswModal'
import resultModal from '@/components/ResultModal'
import {  isLogin, getContractAt, getConnectedAddress, getEncryptKeyByAddressFromStore, addTransHistory, getSupportNet, getBalanceByAddress,getEstimateGas, getConnectedNet, getConnectedUserAddress, getDecryptPrivateKeyFromStore } from '@/utils/dashBoardTools'
import { getFromStorage, removeFromStorage, getInfoFromStorageByKey } from '@/utils/storage'
import SecurityModule from "@/assets/contractJSON/SecurityModule.json";
import { signerStatus, securityModuleRouter, lockType } from '@/utils/global';
import { copyTxt, formatErrorContarct } from '@/utils/index';
import { generateEncryptPswByPublicKey, generateCR1ByPublicKey, getDecryptPrivateKey } from '@/utils/relayUtils'
import _ from 'lodash'
import { timeSericeFormat } from '@/utils/str';
import web3 from 'web3'
import { CHAINMAP } from '@/utils/netWorkForToken';



Vue.use(Toast)
Vue.use(Dialog)

export default {
  name: 'ownWalletList',
  props: ['dataList', 'signerPercent'],
  data() {
    return {
      securityModuleRouter,
      signerStatus,
      showDetailDialog: false,
      detailDataSource: null,

      showLoading: false,

      showTradeConfirm: false,
      sendMetadata: null,
      overrides: {
        gasLimit: 8000000,
        gasPrice: 20000000000,//wei
      },
      currentChainInfo: null,
      defaultNetWork: '',

      searchSignerList: [],

      currentOptType:'',
      currentRecord: '',
      currentWalltInfo: null,
      
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
    "v-searchSignerModal": searchSignerModal,
    'v-loadingPopup': LoadingPopup,
    'v-inputPsw': InputPswModal,
    'v-confirmModal': ConfirmModal,
    'v-resultModal': resultModal,
  },
  methods: {
    signerDetail(item) {
      this.showDetailDialog = true
      this.detailDataSource = item
    },
    DeleteClick() {
      let totalSigner = this.dataList.length
      if (totalSigner < 2) {
        Toast('Please keep at least one signer')
        return
      }
      Dialog.confirm({
        message: 'Are you sure to delete this signer?',
        confirmButtonText: 'Confirm',
        confirmButtonColor: '#4375f1',
        cancelButtonText: 'Cancel'
      })
      .then(() => {
        this.confirmDeleteSigner()
      })
      .catch(() => {
        console.log('cancel')
      });
    },
    async confirmDeleteSigner() {
      this.currentOptType = 'deleteSigner'
      this.showDetailDialog = false
      this.getIsSupport()
    },
    async confirmSearchSigner(value) {
      var searchData = {
        userId: getFromStorage('gUID'),
        value: value
      }
      const { hasError, list } = await this.$store.dispatch('searchSigner', searchData);
      this.searchSignerList = list
    },
    async confirmAddSigner(signerInfo) {
      if (!signerInfo.address) {
        Toast('Need Choose Signer')
        return
      }
      this.currentRecord = signerInfo
      this.currentOptType = 'addSigner'
      this.getIsSupport()
    }, 
    async getConfirmModalData() {
      this.showLoading = true
      const selectedConnectAddress = getConnectedAddress()
      const connectBalance = await getBalanceByAddress(selectedConnectAddress)
      let estimatedGasFee = await getEstimateGas('gasUsed')
      console.log(connectBalance)
      if (connectBalance < estimatedGasFee) {
        Toast('Not Enough ETH')
        return
      }
      let thisGasPrice = this.overrides.gasPrice.toString()
      let gasPrice = web3.utils.fromWei(thisGasPrice, 'gwei')
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
      console.log(this.sendMetadata)
      this.showLoading = false
      this.showTradeConfirm = true
    },

    cancelConfirmModal() {
      this.showTradeConfirm = false
      Toast('Cancel')
    },
    confirmConfirmModal({ overrides }) {
      this.overrides.gasLimit = overrides.gasLimit
      this.overrides.gasPrice = web3.utils.toWei(overrides.gasPrice, 'gwei')
      if (this.currentOptType === 'addSigner') {
        this.dealDataAddSigner()
      } else if (this.currentOptType === 'deleteSigner') {
        this.dealDataDeleteSigner()
      }
    },
    async dealDataAddSigner() {
      const addSigneraddress = this.currentRecord && this.currentRecord.address
      
      const securityModuleContract = await getContractAt({ tokenAddress: this.securityModuleRouter, abi: SecurityModule.abi }, this)
      if (!this.currentWalltInfo) {
        this.showAccountChangeModal()
        return
      }
      const thisWalletTime = this.currentWalltInfo['createdAt']
      const thisWalletAddress = this.currentWalltInfo['wallet_address']
      var walletTime = new Date(thisWalletTime).getTime()
      var canTime = new Date('2022-03-12 07:50:40').getTime()//todo
      if (walletTime < canTime) {
        Toast('Invalid wallet')
        return
      }

      if (addSigneraddress.toLocaleLowerCase() == getConnectedUserAddress()) {
        Toast('This owner can not to be this signer')
        return
      }
      
      let lockStatus = await securityModuleContract.isLocked(thisWalletAddress)
      if (lockStatus == lockType['GlobalLock'] || lockStatus == lockType['GlobalAndSigner'] ) {
        Toast('Wallet is locked')
        return
      } else if (lockStatus == lockType['signerChangeLock']) {
        Toast('The signer cannot be changed frequently')
        return
      }
      this.showLoading = true
      securityModuleContract.addSigner(
        thisWalletAddress, addSigneraddress, this.overrides).then(async tx=> {
          console.log(tx)
         this.addSignerSubmit(addSigneraddress, tx.hash);
         addTransHistory(tx, 'Add Signer', this)
         
         tx.wait().then(async res => {
          console.log('Add Signer:', res)
          this.showLoading = false
        })
      }).catch(async error => {
        this.showLoading = false
        let errorValue = formatErrorContarct(error)
        Toast.fail(errorValue)
        console.log(error)
      })
    },
    async addSignerSubmit(address, txHash) {
      const currentWalletId = this.currentWalltInfo && this.currentWalltInfo['wallet_id']
      const currentWalletName = this.currentWalltInfo && this.currentWalltInfo['name']
      let addData = {
        walletId: currentWalletId,
        address: address.toLocaleLowerCase(),
        name: currentWalletName,
        txid: txHash,
        network_id: getConnectedNet().id,
      }
      console.log(addData)
      const { hasError, list } = await this.$store.dispatch('addSigner', {...addData});
      if (hasError) {
        this.submitFailed('Submit')
      } else {
        this.submitSuccess('Submit')
      }
    },
    async dealDataDeleteSigner() {
      const row = this.detailDataSource
      console.log(row)
      const securityModuleContract = await getContractAt({ tokenAddress: this.securityModuleRouter, abi: SecurityModule.abi }, this)
      
      if (!this.currentWalltInfo) {
        this.showAccountChangeModal()
        return
      }

      const thisWalletTime = this.currentWalltInfo['createdAt']
      const thisWalletAddress = this.currentWalltInfo['wallet_address']
      
      var walletTime = new Date(thisWalletTime).getTime()
      var canTime = new Date('2022-03-12 07:50:40').getTime()//todo
      if (walletTime < canTime) {
        Toast('Invalid wallet')
        return
      }

      let lockStatus = await securityModuleContract.isLocked(thisWalletAddress)
      if (lockStatus == lockType['GlobalLock'] || lockStatus == lockType['GlobalAndSigner']) {
        Toast('Wallet is locked')
        return
      } else if (lockStatus == lockType['signerChangeLock']) {
        Toast('The signer cannot be changed frequently')
        return
      }
      this.showLoading = true
      securityModuleContract.removeSigner(
        thisWalletAddress, row.address, this.overrides).then(async tx=> {
         this.deleteSignerSubmit(row, tx.hash);
         addTransHistory(tx, 'Delete Signer', this)
         
         tx.wait().then(async res => {
          console.log('Delete Signer:', res)
          this.showLoading = false
        })
      }).catch(error => {
        console.log(error)
        this.showLoading = false
        let errorValue = formatErrorContarct(error)
        Toast.fail(errorValue)
      })
      
    },
    async deleteSignerSubmit(row, txHash) {
      const currentWalletId = this.currentWalltInfo && this.currentWalltInfo['wallet_id']
      let deleteData = {
        walletId: currentWalletId,
        signerAddress: row.address,
        txid: txHash,
        network_id: getConnectedNet().id,
      }
      const { hasError, list } = await this.$store.dispatch('deleteSigner', {...deleteData});
      if (hasError) {
        this.submitFailed('Submit')
      } else {
        this.submitSuccess('Submit')
      }
    },
    submitFailed(type) {
      Toast.fail(`${type} Failed`)
      this.showLoading = false
    },
    submitSuccess(type) {
      this.showLoading = false
      Toast(`${type} success`)
      this.$emit('signerChange');
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
      this.getConfirmModalData()
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

      const securityModuleContract = await getContractAt({ tokenAddress: this.securityModuleRouter, abi: SecurityModule.abi }, this)
      if (!securityModuleContract) {
        Toast('Failed! Retry!')
        this.confirmPswBtnLoading = false
        return
      }

      this.confirmPswBtnLoading = false
      this.showInputPswModal = false

      await this.getConfirmModalData()
      
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
    showAccountChangeModal() {
      this.currentTip = 'accountChangeWarn'
      this.showResultModal = true
      this.resuletContent = `Please switch back to the multisig wallet`
    },
    getCurrentWalletInfo() {
      this.currentWalltInfo = getInfoFromStorageByKey('currentWalletInfo')
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
      this.getCurrentWalletInfo()
    },
  },
  async created() {
    if (!isLogin()) {
      Toast('Please Login')
      return
    }
    this.defaultNetWork = this.getDefaultNetWork()
    this.getCurrentWalletInfo()
    const { data: netInfo } = await this.$store.dispatch('GetSelectedNetwork')
    console.log(netInfo)
    if (netInfo) {
      this.currentChainInfo = CHAINMAP[web3.utils.numberToHex(netInfo['id'])]
    } else {
      this.currentChainInfo = CHAINMAP[web3.utils.numberToHex(this.defaultNetWork)]
    }
    this.overrides.gasPrice = await getEstimateGas('gasPrice')
  },
  mounted() {
    this.$eventBus.$on('networkChange', this._handleNetworkChange)
    this.$eventBus.$on('changeAccout', this.handleAccountChange)
  },
}
</script>
<style lang="scss" scoped>
  @import 'index.scss';
</style>
