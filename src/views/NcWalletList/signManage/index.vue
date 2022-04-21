<template>
  <div class="signManage-page">
    <v-navTitle title="Signer" :backIcon="true" :backEvent="backEvent"></v-navTitle >
    <div class="sign-manage-des">Non-custodial Wallet is the most reliable asset management method. It confirms each transaction by setting up one or more signers to make asset transactions more secure.</div>
    <div class="wallet-info">
        <div class="wallet-info-item">
          <span class="wallet-info-label">Wallet Name:</span>
          <span class="wallet-info-value">{{signList.length>0 && signList[0].wallet_name || '--'}}</span>
        </div>
        <div class="wallet-info-item">
          <span class="wallet-info-label">Wallet Address:</span>
          <span class="wallet-info-value" @click="copyAddress(signList[0].wallet_address)">{{signList.length>0 && signList[0].wallet_address  || '--'}}</span>
        </div>
        <div class="wallet-info-item">
          <span class="wallet-info-label">Create Time:</span>
          <span class="wallet-info-value">{{walletCreatTime}}</span>
        </div>
        <div class="wallet-info-item">
          <span class="wallet-info-label">Balance:</span>
          <span class="wallet-info-value">{{walletBalance}}</span>
        </div>
    </div>
    <div class="signlist-wrapper" >
      <el-table
        :data="signList"
        style="width: 100%"
        empty-text="no data"
        :header-cell-style="{background:'#eff1f8'}" >
          <el-table-column
            fixed
            prop="createdAt"
            label="Add Time"
            :formatter="formatterTime">
          </el-table-column>
          <el-table-column
            prop="name"
            label="Name">
          </el-table-column>
          <el-table-column
            prop="address"
            label="Signer Address/ENS">
            <template slot-scope="scope">
              <span @click="copyAddress(scope.row.address)">{{scope.row.address}}</span>
            </template>
          </el-table-column>
          <el-table-column
            prop="status"
            label="State"
            v-if="!isRecover">
            <template slot-scope="scope">
              <div v-if="scope.row.status == signerStatus['confirmed']">
                <el-tag>To be confirmed</el-tag>
              </div>
              <div v-else-if="scope.row.status == signerStatus['rejected']">
                <el-tag type="danger">Rejected</el-tag>
              </div>
              <div v-else-if="scope.row.status == signerStatus['freeze']">
                <el-tag type="info">Locked</el-tag>
              </div>
              <div v-else>
                <el-tag type="success">Active</el-tag>
              </div>
            </template>
          </el-table-column>
          <el-table-column
            label="Operation"
            v-if="!isRecover">
              <template slot-scope="scope">
                <el-button @click="deleteSigner(scope.row)" type="text" size="small">Delete</el-button>
              </template>
          </el-table-column>
      </el-table>
      <div class="add-signer-box" v-if="!isRecover">
        <v-searchSignerModal
          :dataSource="searchSignerList"
          @confirm="confirmSearchSigner"
          @addConfirm="confirmAddSigner" 
          v-if="!isHasFreeze"/>
      </div>
      <div class="add-signer-tip">Any transaction requires the confirmation of: {{signerPercent}} out of {{signerTotal}} signer(s)</div>
      <!-- <van-popup v-model="showLoading" round :close-on-click-overlay="false" class="waiting-modal flex flex-center flex-column">
        <div class="inner-wrapper">
          <van-loading type="spinner" />
        </div>
      </van-popup> -->
      <v-loadingPopup :show="showLoading" :showSpinner="false" />
    </div>
    <v-confirmModal
      :show="showTradeConfirm"
      type="Create Wallet"
      :metadata="sendMetadata"
      @close="showTradeConfirm=false"
      @reject="cancelConfirmModal"
      @confirm="confirmConfirmModal" />
    <v-inputPsw :show="showInputPswModal" @cancel="showInputPswModal=false" @ok="confirmPswOk" :btnLoading="confirmPswBtnLoading" />
  </div>
</template>
<script>
import Vue from 'vue';
import { Toast, Loading, Dialog } from 'vant'
import navTitle from '@/components/NavTitle/index'
import searchSignerModal from '@/components/SearchSignerModal/index'
import LoadingPopup from '@/components/LoadingPopup';
import ConfirmModal from '@/components/ConfirmModal';
import {  isLogin, getContractAt, getConnectedAddress, getEncryptKeyByAddressFromStore, addTransHistory, getSupportNet, getBalanceByAddress,getEstimateGas, getConnectedNet, getConnectedUserAddress } from '@/utils/dashBoardTools'
import { getFromStorage, removeFromStorage, getInfoFromStorageByKey } from '@/utils/storage'
import SecurityModule from "@/assets/contractJSON/SecurityModule.json";
import { signerStatus, securityModuleRouter, lockType } from '@/utils/global';
import { copyTxt, formatErrorContarct } from '@/utils/index';
import InputPswModal from '@/components/InputPswModal'
import { generateEncryptPswByPublicKey, generateCR1ByPublicKey, getDecryptPrivateKey } from '@/utils/relayUtils'
import _ from 'lodash'
import { timeSericeFormat } from '@/utils/str';
import web3 from 'web3'
import { CHAINMAP } from '@/utils/netWorkForToken';

Vue.use(Toast);
Vue.use(Loading);
Vue.use(Dialog);

export default {
  name: 'signManage',
  props: ['id'],
  data() {
    return {
      signList: [],
      searchSignerList: [],
      signerStatus,

      signerPercent: 0,
      signerTotal: 0,
      
      userId: getFromStorage('gUID'),
      walletAddress: getFromStorage('currentWallet'),
      isHasFreeze: false,
      showLoading: false,
      isRecover: false,

      securityModuleRouter,
      securityModuleContract: null,

      currentOptType:'', // deleteSigner||addSigner
      currentRecord: null,

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
      overrides: {
        gasLimit: 8000000,
        gasPrice: 20000000000,//wei
      },
      currentChainInfo: null,
      defaultNetWork: '',

      walletBalance: 0,
      walletCreatTime: '--',
    }
  },
  components: {
    "v-navTitle": navTitle,
    "v-searchSignerModal": searchSignerModal,
    'v-loadingPopup': LoadingPopup,
    'v-inputPsw': InputPswModal,
    'v-confirmModal': ConfirmModal,
  },
  
  methods: {
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
    async getConfirmModalData() {
      this.showLoading = true
      if (!getSupportNet()) {
        return
      }
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
      this.showLoading = false
      this.showTradeConfirm = true
    },
    formatterTime(row) {
      return timeSericeFormat(row.createdAt, 'yyyy-MM-dd hh:mm:ss')
    },
    copyAddress(str) {
      if (copyTxt(str)) {
        Toast.success('Copied');
      }
    },
    backEvent() {
      removeFromStorage(['currentWallet'])
      this.$router.go(-1)
    },
    deleteSigner(row) {
      let totalSigner = this.signList.length
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
        this.confirmDeleteSigner(row)
      })
      .catch(() => {
        console.log('cancel')
      });
    },
    async dealDataDeleteSigner() {
      const row = this.currentRecord
      console.log(row)
      if (!this.securityModuleContract) {
        this.securityModuleContract = await getContractAt({ tokenAddress: this.securityModuleRouter, abi: SecurityModule.abi }, this)
      }
      
      var walletTime = new Date(this.walletCreatTime).getTime()
      var canTime = new Date('2022-03-12 07:50:40').getTime()
      if (walletTime < canTime) {
        this.showLoading = false
        Toast('Invalid wallet')
        return
      }

      let lockStatus = await this.securityModuleContract.isLocked(this.walletAddress)
      if (lockStatus == lockType['GlobalLock'] || lockStatus == lockType['GlobalAndSigner']) {
        Toast('Wallet is locked')
        return
      } else if (lockStatus == lockType['signerChangeLock']) {
        Toast('The signer cannot be changed frequently')
        return
      }
      this.showLoading = true
      this.securityModuleContract.removeSigner(
        this.walletAddress, row.address, this.overrides).then(async tx=> {
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
    async confirmDeleteSigner(row) {
      this.currentOptType = 'deleteSigner'
      this.currentRecord = _.cloneDeep(row)

      // check privateKey whether is existed
      if (!this.securityModuleContract) {
        this.showInputPswModal = true;
        return
      }
      await this.getConfirmModalData()
    },
    async deleteSignerSubmit(row, txHash) {
      let deleteData = {
        walletId: this.$route.params.id,
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

    async confirmSearchSigner(value) {
      var searchData = {
        userId: this.userId,
        value: value
      }
      const { hasError, list } = await this.$store.dispatch('searchSigner', searchData);
      this.searchSignerList = list
    },
    async dealDataAddSigner() {
      const address = this.currentRecord
      
      if (!this.securityModuleContract) {
        this.securityModuleContract = await getContractAt({ tokenAddress: this.securityModuleRouter, abi: SecurityModule.abi }, this)
      }

      var walletTime = new Date(this.walletCreatTime).getTime()
      var canTime = new Date('2022-03-12 07:50:40').getTime()
      if (walletTime < canTime) {
        this.showLoading = false
        Toast('Invalid wallet')
        return
      }
      if (address.toLocaleLowerCase() == getConnectedAddress()) {
        Toast('This owner can not to be this signer')
        return
      }
      
      let lockStatus = await this.securityModuleContract.isLocked(this.walletAddress)
      if (lockStatus == lockType['GlobalLock'] || lockStatus == lockType['GlobalAndSigner'] ) {
        Toast('Wallet is locked')
        return
      } else if (lockStatus == lockType['signerChangeLock']) {
        Toast('The signer cannot be changed frequently')
        return
      }
      this.showLoading = true
      this.securityModuleContract.addSigner(
        this.walletAddress, address, this.overrides).then(async tx=> {
          console.log(tx)
         this.addSignerSubmit(address, tx.hash);
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
    async confirmAddSigner(signerInfo) {
      let address = signerInfo.address
      this.currentOptType = 'addSigner'
      this.currentRecord = _.cloneDeep(address)
      if (!address) {
        Toast('Need Choose Signer')
        return
      }

      // check privateKey whether is existed
      if (!this.securityModuleContract) {
        this.showInputPswModal = true;
        return
      }
      await this.getConfirmModalData()
    }, 
    async addSignerSubmit(address, txHash) {
      let addData = {
        walletId: this.$route.params.id,
        address: address.toLocaleLowerCase(),
        name: this.signList[0].wallet_name,
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
    submitFailed(type) {
      Toast.fail(`${type} Failed`)
      this.showLoading = false
    },
    submitSuccess(type) {
      this.showLoading = false
      Toast(`${type} success`)
      this.getSignerListByid()
    },
    async getSignerListByid() {
      let data = {
        network_id: getConnectedNet().id,
        walletId: this.$route.params.id
      }
      const { hasError, list } = await this.$store.dispatch('getSignerList', {...data})
      this.signList = list
      this.signerTotal = list.length
      this.signerPercent = Math.ceil(this.signerTotal/2)
      this.getWalletBalance()
      // this.getIsFreeze(list)
    },
    async getWalletBalance() {
      this.walletBalance = await getBalanceByAddress(this.signList[0].wallet_address)
      this.walletCreatTime = timeSericeFormat(this.signList[0].createdAt, 'yyyy-MM-dd hh:mm:ss')
    },
    async getIsFreeze(list) {//todo判断是否isHasFreeze
      
      for(let i=0; i<list.length;i+=1) {
        if (list[i].status == 1) {
          // let walletAddress = await this.securityModuleContract.isSigner('0x5EDF4660113d32bbB94D8ac1a5B815f4BfeB2863',list[i].address)
          // console.log(walletAddress)
        }
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

      this.securityModuleContract = await getContractAt({ tokenAddress: this.securityModuleRouter, abi: SecurityModule.abi }, this)
      if (!this.securityModuleContract) {
        Toast('Failed! Retry!')
        this.confirmPswBtnLoading = false
        return
      }

      this.confirmPswBtnLoading = false
      this.showInputPswModal = false

      await this.getConfirmModalData()
      
    },
    getDefaultNetWork() {
      const info = getInfoFromStorageByKey('netInfo')
      return info && info['id'] || 1
    },
  },
  async created() {
    if (!isLogin()) {
      Toast('Please Login')
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
    this.overrides.gasPrice = await getEstimateGas('gasPrice')
    this.isRecover = this.$route.query.isRecover
    this.getSignerListByid()

    this.securityModuleContract = await getContractAt({ tokenAddress: this.securityModuleRouter, abi: SecurityModule.abi }, this)
  },
}
</script>
<style lang="scss" scoped>
  @import 'index.scss';
</style>
