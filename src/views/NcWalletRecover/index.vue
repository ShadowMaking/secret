<template>
  <div class="ncWalletRecover-page">
    <v-navTitle title="Recovery Wallet"></v-navTitle>
    <div class="recover-page-1" v-show="recoverPage1Visible">
      
      <div class="recover-wallet-container">
        <p class="recover-des">We show the Eigen wallet in your current Eigen account, choose the Eigen Wallet you want to recover.</p>
        <div class="recover-content-box">
          <div class="wallet-list">
            <el-select v-model="walletSelectInfo" placeholder="" class="wallet-select" value-key="wallet_id" :loading="selectLoading">
              <el-option
                v-for="item in walletList"
                :key="item.wallet_id"
                :label="item.name + '-' + item.wallet_address"
                :value="item">
              </el-option>
            </el-select>
          </div>
          <div class="recover-next">
            <el-button type="primary" @click="recoverNext" :loading="nextLoading">Next</el-button>
          </div>
        </div>
      </div>
    </div>
    <div class="recover-page-2" v-show="recoverPage2Visible">
      <v-recoverPage2 :currentWalletId="walletSelectId" :currentWalletAddress="walletSelectAddress" :newOwnerAddress="newOwnerAddress" :oldOwnerAddress="oldOwnerAddress" :walletName="walletName"></v-recoverPage2>
    </div>
    <v-inputPsw :show="showInputPswModal" @cancel="showInputPswModal=false" @ok="confirmPswOk" :btnLoading="confirmPswBtnLoading" />
    <v-resultModal :show="showResultModal" :content="resuletContent" :needColse="needResultColse" @confirm="confirmResultModal" @close="cancelResultModal"></v-resultModal>
  </div>
</template>

<script>
import Vue from 'vue'
import { ethers } from 'ethers'
import { Toast, Dialog } from 'vant'

import navTitle from '@/components/NavTitle/index'
import recoverPage2 from './recoverPage2/index'
import InputPswModal from '@/components/InputPswModal'
import resultModal from '@/components/ResultModal'

import { isLogin, getContractAt,getConnectedAddress, getDecryptPrivateKeyFromStore, getSupportNet, getConnectedNet, getEncryptKeyByAddressFromStore} from '@/utils/dashBoardTools';
import { getFromStorage, getInfoFromStorageByKey } from '@/utils/storage'
import { walletStatus, securityModuleRouter } from '@/utils/global';

import SecurityModule from "@/assets/contractJSON/SecurityModule.json";
import WalletJson from "@/assets/contractJSON/Wallet.json";

import { generateEncryptPswByPublicKey, generateCR1ByPublicKey, getDecryptPrivateKey } from '@/utils/relayUtils'
import web3 from 'web3'

Vue.use(Toast);
Vue.use(Dialog);

export default {
  name: 'NC-Wallet-Recover',
  data() {
    return {
      walletSelectInfo: null,
      walletSelectId: '',
      walletSelectAddress: '',
      walletList: [],
      allWalletList: [],
      newOwnerAddress: '',
      oldOwnerAddress: '',
      walletName: '',

      currentUserAddress: '',
      nextLoading: false,
      selectLoading: true,
      
      recoverPage1Visible: true,
      recoverPage2Visible: false,

      securityModuleContract: null,
      walletStatus,
      securityModuleRouter,
      
      resuletContent: '',
      needResultColse: true,
      showResultModal: false,
      currentTip: 'warn',//warn next

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
    "v-recoverPage2": recoverPage2,
    'v-inputPsw': InputPswModal,
    'v-resultModal': resultModal,
  },
  methods: {
    async getIsHasRecoverWallet() {
      let data = {
        network_id: getConnectedNet().id,
        user_id: getFromStorage('gUID'),
        wallet_status: walletStatus['Recovering']
      }
      const { hasError, list } = await this.$store.dispatch('getWalletList', data)
      if (hasError) {
        Toast('Get Error')
        return
      }
      if (list.length > 0) {//has a recovering wallet
        this.walletSelectId = list[0].wallet_id
        this.walletSelectAddress = list[0].wallet_address
        this.newOwnerAddress = list[0].new_address
        this.oldOwnerAddress = list[0].address
        this.walletName = list[0].name
        this.recoverConfirm()//show recover detail
      } else {
        this.getWalletList()
      }
    },
    async getWalletList() {
      this.securityModuleContract = await getContractAt({ tokenAddress: this.securityModuleRouter, abi: SecurityModule.abi }, this)
      let data = {
        network_id: getConnectedNet().id,
        user_id: getFromStorage('gUID'),
        recoverable_address: 1,
        address: getConnectedAddress(),
      }
      const { hasError, list } = await this.$store.dispatch('getWalletList', data)
      this.selectLoading = false
      this.walletList = list
      if (hasError) {
        Toast('Get Error')
        return
      }
      // this.dealWalletList()
    },
    async dealWalletList() {
      let allWalletList = this.allWalletList
      let newList = []
      this.walletList = []
      for (var i=0; i<allWalletList.length; i++) {
        let isSigner = await this.getCurrentUserISSigner(allWalletList[i].wallet_address)
        let isOwner = await this.getCurrentUserISOwner(allWalletList[i].wallet_address)
        let WalletIsActive = await this.getWalletStatusIsActive(allWalletList[i].wallet_address, allWalletList[i].wallet_status,allWalletList[i].address)
        !isSigner && !isOwner && WalletIsActive && newList.push(allWalletList[i])
      }
      console.log(newList)
      this.selectLoading = false
      this.walletList = newList
    },
    async getCurrentUserISSigner(walletAddress) {
      let currentUserAddress = getConnectedAddress()
      let isSigner = await this.securityModuleContract.isSigner(walletAddress, currentUserAddress)
      return isSigner
    },
    async getCurrentUserISOwner(walletAddress) {
      let currentUserAddress = getConnectedAddress()
      let walletContract = await getContractAt({ tokenAddress: walletAddress, abi: WalletJson.abi }, this)
      console.log(walletContract)
      let ownerAddress = await walletContract.owner()
      if (ownerAddress.toLocaleLowerCase() == currentUserAddress) {
        return true
      }
      return false
    },
    async getWalletStatusIsActive(walletAddress, status, ownerAddress) {
      let currentUserAddress = getConnectedAddress()
      if (status == walletStatus['Active']) {
        let isInRecovery = await this.securityModuleContract.isInRecovery(walletAddress)
        if (isInRecovery && currentUserAddress !== ownerAddress) {
          return false
        }
        return true
      }
      return false
    },
    async recoverNext() {
      const privateKey = await getDecryptPrivateKeyFromStore(this)
      if (!privateKey) {
        this.showInputPswModal = true;
        return
      }
      await this.dealDataBeforeRecoverNext()
    },
    async dealDataBeforeRecoverNext() {
      let recoverSelect = this.walletSelectInfo
      this.nextLoading = true
      if (!recoverSelect) {
        this.nextLoading = false
        Toast('Select Wallet')
        return
      }
      if (!getSupportNet()) {
        this.nextLoading = false
        return
      }
      this.openSelectTipDialog()
      // if (recoverSelect.wallet_status == walletStatus['Active']) {
        
      //   let currentWallet = recoverSelect.wallet_address
      //   let currentUserAddress = getConnectedAddress()

      //   this.securityModuleContract = await getContractAt({ tokenAddress: this.securityModuleRouter, abi: SecurityModule.abi }, this)
      //   let isSigner = await this.securityModuleContract.isSigner(currentWallet, currentUserAddress)
      //   console.log(isSigner)
      //   if (isSigner) {
      //     this.nextLoading = false
      //     this.showTipModal()
      //     // Toast('Signer Cannot Recover Wallet')
      //     return
      //   }
    
      //   const walletContract = await getContractAt({ tokenAddress: currentWallet, abi: WalletJson.abi }, this)
      //   console.log(walletContract)
      //   const ownerAddress = await walletContract.owner()
      //   if (ownerAddress.toLocaleLowerCase() == currentUserAddress) {
      //     this.nextLoading = false
      //     this.showTipModal()
      //     // Toast('Owner Cannot Recover Wallet')
      //     return
      //   }
        
      //   let isInRecovery = await this.securityModuleContract.isInRecovery(currentWallet)
      //   if (isInRecovery && currentUserAddress !== recoverSelect.address) {
      //     this.nextLoading = false
      //     Toast('Wallet is Recovering')
      //     return
      //   }
      //   this.openSelectTipDialog()
      // } else {
      //   Toast('Wallet is Unavailable')
      // }
      
    },
    showTipModal() {
      this.currentTip = 'warn'
      this.showResultModal = true
      // this.resuletContent = `This eigen smart contract wallet cannot be recovered because the wallet itself exists in ${this.walletSelectAddress} Under ${this.currentUserAddress} account, we can only restore the eigen smart contract wallet that does not exist under this account`
      this.resuletContent = `The owner or signers itself of wallet ${this.walletSelectAddress} can not transfer the ownership`
      this.needResultColse = false
    },
    showConfirmModal() {
      this.currentTip = 'next'
      this.showResultModal = true
      this.needResultColse = true
      this.resuletContent = `The Eigen Wallet ${this.walletSelectAddress} will recover to ${this.newOwnerAddress} would you confirm?`
    },
    openSelectTipDialog() {
      this.walletSelectId = this.walletSelectInfo && this.walletSelectInfo.wallet_id
      this.walletSelectAddress = this.walletSelectInfo && this.walletSelectInfo.wallet_address
      this.newOwnerAddress = getConnectedAddress()
      this.oldOwnerAddress = this.walletSelectInfo && this.walletSelectInfo.address
      this.walletName = this.walletSelectInfo && this.walletSelectInfo.name
      this.showConfirmModal()
    },
    recoverConfirm() {
      this.nextLoading = false
      this.showResultModal = false
      this.recoverPage1Visible = false
      this.recoverPage2Visible = true
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
      this.getIsHasRecoverWallet()
    },
    
    confirmResultModal() {
      if (this.currentTip == 'next') {
        this.recoverConfirm()
      }
      this.showResultModal = false
    },
    cancelResultModal() {
      this.showResultModal = false
    },
    handleAccountChange(addressInfo) {
      this.getIsHasRecoverWallet()
    },
    _handleNetworkChange({ chainInfo, from }) {
      this.getIsHasRecoverWallet()
    },
    async getIsShowPwd() {
      const privateKey = await getDecryptPrivateKeyFromStore(this)
      if (!privateKey) {
        this.showInputPswModal = true;
        return
      }
      await this.getIsHasRecoverWallet()
    }
  },
  created() {
    if (!isLogin()) {
      Toast('Need Login')
      return
    }
    this.getIsShowPwd()
  },
  mounted() {
    this.$eventBus.$on('changeAccout', this.handleAccountChange)
    this.$eventBus.$on('networkChange', this._handleNetworkChange)
  },
};
</script>
<style lang="scss" scoped>
  @import "index";
  ::v-deep .recover-next .el-button {
    padding: 0.6rem 4rem;
  }
  ::v-deep .select-confirm-btn .el-button {
    padding: 0.6rem 1.2rem;
  }
  ::v-deep .el-select-dropdown__list .el-select-dropdown__item{
    padding: 0 10px !important;
    text-align: center;
  }
</style>