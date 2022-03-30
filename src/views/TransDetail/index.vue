<template>
  <div class="trans-detail-page">
    <v-navTitle title="Details" :backIcon="true" :backEvent="backHistory"></v-navTitle >
    <div class="trans-detail-box">
      <div class="trans-detail-info">
        <div class="trans-item">
          <span class="trans-item-name">Transaction hash:</span>
          <span class="trans-item-value" @click="copyAddress(txHash)">{{txHash}}</span>
        </div>
        <div class="trans-item">
          <span class="trans-item-name">Operation:</span>
          <span class="trans-item-value">{{operationType}}</span>
        </div>
        <div class="trans-item">
          <span class="trans-item-name">Nonce:</span>
          <span class="trans-item-value">{{txNonce}}</span>
        </div>
        <div class="trans-item">
          <span class="trans-item-name">Created:</span>
          <span class="trans-item-value">{{txCreated}}</span>
        </div>
        <div class="trans-item">
          <span class="trans-item-name">Executed:</span>
          <span class="trans-item-value">{{executedTime}}</span>
        </div>
      </div>
      <div class="trans-path-title">Steps</div>
      <div class="trans-path-list">
        <div class="trans-path-item active">
          <div class="path-item-top">
            <span class="path-item-icon">1</span>
            <span class="path-item-status success">Created</span>
          </div>
          <div class="path-item-bottom"></div>
        </div>
        <div v-for="(item, index) in signerList" :key="index">
          <div class="trans-path-item active" v-if="item.status == (signerStatus.agreeMult || signerStatus.ignoreMult)">
            <div class="path-item-top">
              <span class="path-item-icon active">{{index+2}}</span>
              <span class="path-item-status success" v-if="item.status == signerStatus.agreeMult">Confirmed</span>
              <span class="path-item-status success" v-if="item.status == signerStatus.ignoreMult">Refused by</span>
            </div>
            <div class="path-item-bottom">
              <div class="path-item-bottom-img">
                <img :src="item.picture">
              </div>
              <div class="path-item-bottom-con">
                <p>{{item.name}}</p>
                <p>{{item.signer_address}}</p>
              </div>
            </div>
          </div>
          <div class="trans-path-item" v-else>
            <div class="path-item-top">
              <span class="path-item-icon active">{{index+2}}</span>
              <span class="path-item-status error">To be confirmed by other signers</span>
            </div>
            <div class="path-item-bottom" v-if="item.signer_address == currentUserAddress">
              <div class="path-item-bottom-btn">
                <el-button type="primary" @click="signerConfirmTrans()" :disabled="mtxInfo.operation == multOperation['Recovery']">Confirm</el-button>
                <el-button @click="signerRefuseTrans()" :disabled="mtxInfo.operation == multOperation['Recovery']">Refuse</el-button>
              </div>
            </div>
            <div class="path-item-bottom" v-else>
              <div class="path-item-bottom-img">
                <img :src="item.picture">
              </div>
              <div class="path-item-bottom-con">
                <p>{{item.name}}</p>
                <p>{{item.signer_address}}</p>
              </div>
            </div>
          </div>
        </div>

        <div class="trans-path-item">
          
          <div class="path-item-top" v-if="(currentUserAddress == currenntOwnerAddress) && this.transStatus == 2">
             <span class="path-item-icon active">{{this.signerLength + 2}}</span>
            <el-button type="primary" :disabled="!isCanExcute" @click="ownerExecutedTrans">Execute</el-button>
          </div>
          <div class="path-item-top" v-else>
            <span class="path-item-icon active">{{this.signerLength + 2}}</span>
            <span class="path-item-status error" v-if="this.transStatus == -1">fail</span>
            <span class="path-item-status success" v-else-if="this.transStatus == 1">Success</span>
            <span class="path-item-status info" v-else>Success</span>
          </div>
        </div>
      </div>
    </div>
    <v-inputPsw :show="showInputPswModal" @cancel="showInputPswModal=false" @ok="confirmPswOk" :btnLoading="confirmPswBtnLoading" />
    <v-signMessageModal
      :show="showSignMessageModal"
      :metadata="signMessageMetadata"
      @close="showSignMessageModal=false"
      @reject="cancelSignMessage"
      @confirm="confirmSignMessage" />
    <v-confirmModal
      :show="showTradeConfirm"
      type="Execute"
      :metadata="sendMetadata"
      @close="showTradeConfirm=false"
      @reject="cancelExecuted"
      @confirm="confirmExecuted" />
    <v-loadingPopup :show="showLoading" :showSpinner="false" />
  </div>
</template>
<script>
import Vue from 'vue';
import _ from 'lodash';
import navTitle from '@/components/NavTitle/index'
import { Toast, Dialog } from 'vant'
import { ethers } from 'ethers'
import {  isLogin, getConnectedAddress, getEncryptKeyByAddressFromStore, getDecryptPrivateKeyFromStore, getContractWallet, getContractAt, addTransHistory, initRPCProvider, getConnectedNet, getDATACode, getMultSignMessage, getEstimateGas,getBalanceByAddress} from '@/utils/dashBoardTools'
import { timeFormat, timeSericeFormat } from '@/utils/str'
import { getFromStorage, getInfoFromStorageByKey } from '@/utils/storage'
import { signerStatus, walletTransactionRouter, securityModuleRouter, multOperation } from '@/utils/global'
import WalletJson from "@/assets/contractJSON/Wallet.json";
import SecurityModule from "@/assets/contractJSON/SecurityModule.json";
import TransactionModule from "@/assets/contractJSON/TransactionModule.json";

import InputPswModal from '@/components/InputPswModal'
import { generateEncryptPswByPublicKey, generateCR1ByPublicKey, getDecryptPrivateKey } from '@/utils/relayUtils'

import SignMessageModal from '@/components/SignMessageModal';
import LoadingPopup from '@/components/LoadingPopup';
import ConfirmModal from '@/components/ConfirmModal';
import { CHAINMAP } from '@/utils/netWorkForToken';
import web3 from 'web3'

import { copyTxt, formatErrorContarct } from '@/utils/index';

Vue.use(Toast);
Vue.use(Dialog);

export default {
  name: 'signManage',
  data() {
    return {
      mtxid: this.$route.params.id,
      mtxInfo: null,
      txHash: '',
      txCreated: '',
      txNonce: '--',
      executedTime: '--',
      walletTransactionRouter,
      showLoading: false,
      securityModuleRouter,
      transStatus: 2, //0-pending 1-success 2-creating -1-fail
      
      signerList: [],
      signerStatus,
      signerLength: 0,
      isCanExcute: false,//more than 1/2 signer sign is true
      currentUserAddress: getConnectedAddress(),
      currenntOwnerAddress: '',
      amountMulti: 0,
      allSignMessageHash: '',
      multOperation,
      operationType: '',

      currentOptType: 'singerSignMessage',
      overrides: {
        gasLimit: 8000000,
        gasPrice: 20000000000,
      },

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

      // ***************** signmessage start ***************** //
      signMsgHash: '',
      showSignMessageModal: false,
      signMessageMetadata: null,
      currentChainInfo: null,
      // ***************** signmessage end ***************** //

      // ***************** excute confirm model start ***************** //
      showTradeConfirm: false,
      sendMetadata: null,
      // ***************** excute confirm model end ***************** //
    }
  },
  components: {
    "v-navTitle": navTitle,
    'v-inputPsw': InputPswModal,
    'v-signMessageModal': SignMessageModal,
    'v-loadingPopup': LoadingPopup,
    'v-confirmModal': ConfirmModal,
  },
  
  methods: {
    copyAddress(str) {
      if (copyTxt(str)) {
        Toast.success('Copied');
      }
    },
    backHistory() {
      this.$router.push({
        path: `/overview`,
        query: {tabActive: 1},
      })
    },
    async getMultTxInfo() {
      const { hasError, list } = await this.$store.dispatch('getMultTxInfo', this.mtxid)
      if (hasError) {return}
      this.mtxInfo = _.cloneDeep(list)
      
      this.txHash = list.txid
      this.txCreated = timeSericeFormat(list.createdAt)
      this.currenntOwnerAddress = list.owner_address
      this.transStatus = list.status
      this.operationType = this.getOperationType()
      if (this.txHash.indexOf('-') == -1) {//hash is real
        const network = getConnectedNet()
        const rpcUrl = network['rpcUrls'][0]
        const provider = initRPCProvider(rpcUrl)
        const txReceipt = await provider.getTransaction(this.txHash);
        console.log(txReceipt)
        this.txNonce = txReceipt.nonce
        if (txReceipt.blockNumber) {
          const txBlock = await provider.getBlock(txReceipt.blockNumber);
          console.log(txBlock)
          this.executedTime = timeFormat(txBlock.timestamp * 1000, 'yyyy-MM-dd hh:mm:ss')
        }
      }
    },
    async getSigerMessages() {
      const { hasError, list } = await this.$store.dispatch('getSigerMessages', this.mtxid)
      let hasSignLength = 0
      this.allSignMessageHash = "0x";
      list.sort(function(a, b){ 
        return a.signer_address.toLocaleLowerCase() - b.signer_address.toLocaleLowerCase() 
      })
      let thisSignerList = list
      for (var i = 0; i<thisSignerList.length; i++) {
        if (thisSignerList[i].signer_address == this.currenntOwnerAddress) {
          thisSignerList.splice(i, 1)
        }
      }
      for (var i = 0; i<thisSignerList.length; i++) {
        if (thisSignerList[i].sign_message) {
          hasSignLength = hasSignLength + 1
          this.allSignMessageHash = this.allSignMessageHash + thisSignerList[i].sign_message.slice(2)
        }
      }
      this.signerList = list
      this.signerLength = this.signerList.length
      console.log(this.operationType)
      if (hasSignLength/this.signerLength >= 1/2 && this.mtxInfo.operation !== multOperation['Recovery']) {
        this.isCanExcute = true
      }
    },
    async signerConfirmTrans() {
      this.currentOptType = 'singerSignMessage'
      // check privateKey whether is existed
      const privateKey = await getDecryptPrivateKeyFromStore(this)
      if (!privateKey) {
        this.showInputPswModal = true;
        return
      }
      await this.signerConfirmSubmit()
    },
    signerRefuseTrans() {
      Dialog.confirm({
        message: 'Are you sure to Refuse',
        confirmButtonText: 'Confirm',
        confirmButtonColor: '#4375f1',
        cancelButtonText: 'Cancel'
      })
      .then(() => {
        this.showLoading = true;
        this.signMessageSubmit(null, this.signerStatus['ignoreMult'], 'Refuse')
      })
      .catch((error) => {
        this.showLoading = false;
        console.log(error)
      });
    },
    async ownerExecutedTrans() {
      this.currentOptType = 'ownerExecutedTrans'
      // check privateKey whether is existed
      const privateKey = await getDecryptPrivateKeyFromStore(this)
      if (!privateKey) {
        this.showInputPswModal = true;
        return
      }
      this.ownerExecutedSubmit()
    },
    signerConfirmSubmit() {
      switch(this.mtxInfo.operation) {
          case multOperation['LargeTransaction']:
              this.largeTransactionSign()
              break;
          case multOperation['setMaxPerParametar']:
              this.setMaxPerParametarSign()
              break;
          case multOperation['setSecurityPeriod']:
              this.setSecurityPeriodSign()
              break;
           default:
             console.log(this.operationType)
             break;
      } 
    },
    largeTransactionSign() {
      const TMABI = [
        "function executeTransaction(address)",
        "function executeLargeTransaction(address, address, uint, bytes)"
      ]
      let iface = new ethers.utils.Interface(TMABI)
      let largeTxData = iface.encodeFunctionData("executeLargeTransaction", [this.mtxInfo.wallet_address, this.mtxInfo.to, ethers.utils.parseEther(this.mtxInfo.value), "0x"])
      this.getMultModalData(this.walletTransactionRouter, largeTxData)
    },
    setMaxPerParametarSign() {
      this.getMultModalData(this.walletTransactionRouter, this.mtxInfo.data)
    },
    setSecurityPeriodSign() {
      this.getMultModalData(this.securityModuleRouter, this.mtxInfo.data)
    },
    async getMultModalData(moduleRounter, data) {
      const walletContract = await getContractAt({ tokenAddress: this.mtxInfo.wallet_address, abi: WalletJson.abi }, this)
      let sequenceId = await walletContract.getNextSequenceId()
      this.signMsgHash = await getMultSignMessage(moduleRounter, this.amountMulti, data, sequenceId)
      this.signMessageMetadata = {
        userAddress: getConnectedAddress(),
        signMessage: this.signMsgHash,
        netInfo: this.currentChainInfo,
      }
      this.showSignMessageModal = true
    },
    async ownerExecutedSubmit() {
      let estimatedGasFee = await getEstimateGas('gasUsed', 5000000000)
      const selectedConnectAddress = getConnectedAddress()
      const connectBalance = await getBalanceByAddress(selectedConnectAddress)
      if (connectBalance < estimatedGasFee) {
        Toast('Insufficient Funds')
        return
      }
      let thisGasPrice = this.overrides.gasPrice.toString()
      let gasPrice = web3.utils.fromWei(thisGasPrice, 'gwei')
      this.sendMetadata = {
        from: this.mtxInfo.wallet_address,
        to: this.mtxInfo.to,
        gas: this.overrides.gasLimit,
        gasPrice: gasPrice,
        value: this.mtxInfo.value,
        symbolName: 'ETH',
        netInfo: this.currentChainInfo,
        DATA: this.mtxInfo.data,
        estimatedGasFee: estimatedGasFee
      }
      this.showTradeConfirm = true
    },
    async updateTransTx(tx) {
      tx.from = this.mtxInfo.wallet_address
      tx.to = this.mtxInfo.to
      let updateData = {
        id: this.mtxid,
        txid: tx.hash,
      }
      const { hasError, list } = await this.$store.dispatch('updateTransTx', {...updateData});
      this.showLoading = false
      if (hasError) {
        Toast.fail('fail')
      } else {
        this.addMultTransHistory(tx)
        Toast('Execute success')
        this.getMultTxInfo()
      }
    },
    addMultTransHistory(tx) {
      let historyName = this.getOperationType()
      addTransHistory(tx, historyName, this, this.mtxInfo.value, 'ETH', true)
    },
    getOperationType() {
      let operationType = 'Large Transaction'
      if (this.mtxInfo.operation == multOperation['setMaxPerParametar']) {
        operationType = 'Payment Limit'
      } else if (this.mtxInfo.operation == multOperation['setSecurityPeriod']) {
        operationType = 'Security Setting'
      } else if (this.mtxInfo.operation == multOperation['Recovery']) {
        operationType = 'Recovery'
      }
      return operationType
    },
    cancelExecuted() {
      this.showTradeConfirm = false
      Toast('Cancel Execute')
    },
    confirmExecuted({ overrides }) {
      this.showLoading = true
      this.overrides.gasLimit = overrides.gasLimit
      this.overrides.gasPrice = web3.utils.toWei(overrides.gasPrice, 'gwei')
      this.ownerExecutedOk()
    },
    ownerExecutedOk() {
      switch(this.mtxInfo.operation) {
          case multOperation['LargeTransaction']:
              this.largeTransactionExecute()
              break;
          case multOperation['setMaxPerParametar']:
              this.setMaxPerParametarExecute()
              break;
          case multOperation['setSecurityPeriod']:
              this.setSecurityPeriodExecute()
              break;
           default:
             console.log(this.operationType)
             break;
      } 
    },
    async largeTransactionExecute() {
      const TMABI = [
        "function executeTransaction(address)",
        "function executeLargeTransaction(address, address, uint, bytes)"
      ]
      let iface = new ethers.utils.Interface(TMABI)
      let largeTxData = iface.encodeFunctionData("executeLargeTransaction", [this.mtxInfo.wallet_address, this.mtxInfo.to, ethers.utils.parseEther(this.mtxInfo.value), "0x"])

      this.multicallExcute(largeTxData, this.walletTransactionRouter)
      // let expireTime = Math.floor((new Date().getTime()) / 1000) + 1800; // 60 seconds

      // const securityModuleContract = await getContractAt({ tokenAddress: this.securityModuleRouter, abi: SecurityModule.abi }, this)
      // const walletContract = await getContractAt({ tokenAddress: this.mtxInfo.wallet_address, abi: WalletJson.abi }, this)
      // let sequenceId = await walletContract.getNextSequenceId()
      // console.log(this.allSignMessageHash)
      // securityModuleContract.multicall(
      //     this.mtxInfo.wallet_address,
      //     [this.walletTransactionRouter, this.amountMulti, largeTxData, sequenceId, expireTime],
      //     this.allSignMessageHash,
      //     this.overrides
      // ).then(tx => {
      //   console.log(tx)
      //   this.updateTransTx(tx);
      //   tx.wait().then(async res => {
      //     console.log('multicall:', res)
      //   })
      // }).catch(error => {
      //   console.log(error)
      //   this.showLoading = false
      //   let errorValue = formatErrorContarct(error)
      //   Toast.fail(errorValue)
      // })
    },
    async setMaxPerParametarExecute() {
      this.multicallExcute(this.mtxInfo.data, this.walletTransactionRouter)
    },
    async setSecurityPeriodExecute() {
      this.multicallExcute(this.mtxInfo.data, this.securityModuleRouter)
    },
    async multicallExcute(data, moduleRouter) {
      let largeTxData = data

      let expireTime = Math.floor((new Date().getTime()) / 1000) + 1800; // 60 seconds
      
      const walletContract = await getContractAt({ tokenAddress: this.mtxInfo.wallet_address, abi: WalletJson.abi }, this)
      let sequenceId = await walletContract.getNextSequenceId()

      const securityModuleContract = await getContractAt({ tokenAddress: this.securityModuleRouter, abi: SecurityModule.abi }, this)
      
      console.log(this.allSignMessageHash)
      securityModuleContract.multicall(
          this.mtxInfo.wallet_address,
          [moduleRouter, this.amountMulti, largeTxData, sequenceId, expireTime],
          this.allSignMessageHash,
          this.overrides
      ).then(tx => {
        console.log(tx)
        this.updateTransTx(tx);
        tx.wait().then(async res => {
          console.log('multicall:', res)
        })
      }).catch(error => {
        console.log(error)
        this.showLoading = false
        let errorValue = formatErrorContarct(error)
        Toast.fail(errorValue)
      })
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

      if (this.currentOptType === 'singerSignMessage') {
        await this.signerConfirmSubmit()
      }
      if (this.currentOptType === 'ownerExecutedTrans') {
        await this.ownerExecutedSubmit()
      }
      
    },
    cancelSignMessage() {
      this.showSignMessageModal = false
      Toast('Cancel Sign Message')
    },
    async confirmSignMessage() {
      this.showLoading = true
      const currentSignerWallet = await getContractWallet(this)
      let sig = await currentSignerWallet.signMessage(ethers.utils.arrayify(this.signMsgHash));
      this.signMessageSubmit(sig, this.signerStatus['agreeMult'], 'Confirm')
      console.log(sig)
    },
    async signMessageSubmit(sig, status, optreateType) {
      let data = {
        mtxid: this.mtxid,
        signer_address: this.currentUserAddress,
        signer_message: sig,
        status: status,
        operation: this.mtxInfo.operation
      }
      const { hasError, totalSignMessage } = await this.$store.dispatch('addSignerMultMessages', {...data});
      this.showLoading = false;
      if (hasError) {
        Toast.fail(`${optreateType} Failed`)
      } else {
        Toast(`${optreateType} success`)
        this.getSigerMessages()
      }
    },
    getDefaultNetWork() {
      const info = getInfoFromStorageByKey('netInfo')
      return info && info['id'] || 1
    },
  },
  async created() {
    this.defaultNetWork = this.getDefaultNetWork()
    if (!isLogin()) {
      Toast('Need Login')
      return
    }
    const { data: netInfo } = await this.$store.dispatch('GetSelectedNetwork')
    if (netInfo) {
      this.currentChainInfo = CHAINMAP[web3.utils.numberToHex(netInfo['id'])]
    } else {
      this.currentChainInfo = CHAINMAP[web3.utils.numberToHex(this.defaultNetWork)]
    }
    this.getMultTxInfo()
    this.getSigerMessages()
    this.overrides.gasPrice = await getEstimateGas('gasPrice', 5000000000)
   },
}
</script>
<style lang="scss" scoped>
  @import 'index.scss';
  ::v-deep .el-button {
    padding: 5px 10px;
  }
</style>
