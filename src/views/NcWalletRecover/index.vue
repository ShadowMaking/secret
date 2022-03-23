<template>
  <div class="ncWalletRecover-page">
    <div class="recover-page-1" v-show="recoverPage1Visible">
      <v-navTitle title="Recovery Wallet"></v-navTitle>
      <div class="recover-wallet-container">
        <p class="recover-des">We show the Eigen wallet in your current Eigen account, Choose the Eigen Wallet you want to recover.</p>
        <div class="wallet-list">
          <el-select v-model="walletSelectInfo" placeholder="" class="wallet-select" value-key="wallet_id">
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
      <van-popup v-model="showConfirmPopup" class="confirm-modal-popUp flex flex-center flex-column" @close="closeModal">
        <div class="selcet-confirm-content">
          <p>The Eigen Wallet</p>
          <p><span class="confirm-address">{{walletSelectAddress}}</span></p>
          <p>will recover to</p>
          <p><span class="confirm-address">{{currentUserAddress}}</span></p>
          <p>would you confirm?</p>
        </div>
        <div class="select-confirm-btn">
          <el-button @click="closeModal">Cancel</el-button>
          <el-button type="primary" @click="recoverConfirm">Confirm</el-button>
        </div>
      </van-popup>
      <van-popup v-model="showWarnPopup" class="confirm-modal-popUp flex flex-center flex-column" @close="closeWarnModal">
        <div class="selcet-confirm-content">
          <p>This eigen smart contract wallet cannot be recovered because the wallet itself exists in <span class="confirm-address">{{walletSelectAddress}}</span> Under <span class="confirm-address">{{currentUserAddress}}</span> account, we can only restore the eigen smart contract wallet that does not exist under this account</p>
        </div>
        <div class="select-confirm-btn">
          <el-button type="primary" @click="closeWarnModal">Confirm</el-button>
        </div>
      </van-popup>
    </div>
    <div class="recover-page-2" v-show="recoverPage2Visible">
      <v-recoverPage2 :currentWalletId="walletSelectId" :currentWalletAddress="walletSelectAddress"></v-recoverPage2>
    </div>
    <v-inputPsw :show="showInputPswModal" @cancel="showInputPswModal=false" @ok="confirmPswOk" :btnLoading="confirmPswBtnLoading" />
  </div>
</template>

<script>
import Vue from 'vue'
import { ethers } from 'ethers'
import { Toast, Dialog } from 'vant'

import navTitle from '@/components/NavTitle/index'
import recoverPage2 from './recoverPage2/index'
import InputPswModal from '@/components/InputPswModal'

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

      showConfirmPopup: false,
      currentUserAddress: '',
      nextLoading: false,

      recoverPage1Visible: true,
      recoverPage2Visible: false,

      securityModuleContract: null,
      walletStatus,
      securityModuleRouter,
      showWarnPopup: false,

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
        this.recoverConfirm()//show recover detail
      } else {
        this.getWalletList()
      }
    },
    async getWalletList() {
      let data = {
        network_id: getConnectedNet().id,
        user_id: getFromStorage('gUID'),
      }
      const { hasError, list } = await this.$store.dispatch('getWalletList', data)
      this.walletList = list
      if (hasError) {
        Toast('Get Error')
      }
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
      if (recoverSelect.wallet_status == walletStatus['Active']) {
        
        let currentWallet = recoverSelect.wallet_address
        let currentUserAddress = getConnectedAddress()

        this.securityModuleContract = await getContractAt({ tokenAddress: this.securityModuleRouter, abi: SecurityModule.abi }, this)
        let isSigner = await this.securityModuleContract.isSigner(currentWallet, currentUserAddress)
        if (isSigner) {
          this.nextLoading = false
          this.showWarnPopup = true
          // Toast('Signer Cannot Recover Wallet')
          return
        }

        const walletContract = await getContractAt({ tokenAddress: currentWallet, abi: WalletJson.abi }, this)
        const ownerAddress = await walletContract.owner()
        if (ownerAddress.toLocaleLowerCase() == currentUserAddress) {
          this.nextLoading = false
          this.showWarnPopup = true
          // Toast('Owner Cannot Recover Wallet')
          return
        }
        
        let isInRecovery = await this.securityModuleContract.isInRecovery(currentWallet)
        if (isInRecovery && currentUserAddress !== recoverSelect.address) {
          this.nextLoading = false
          Toast('Wallet is Recovering')
          return
        }
        this.openSelectTipDialog()
      } else {
        Toast('Wallet is Unavailable')
      }
      
    },
    openSelectTipDialog() {
      this.walletSelectId = this.walletSelectInfo && this.walletSelectInfo.wallet_id
      this.walletSelectAddress = this.walletSelectInfo && this.walletSelectInfo.wallet_address
      this.showConfirmPopup = true
    },
    closeModal() {
      this.nextLoading = false
      this.showConfirmPopup = false
    },
    closeWarnModal() {
      this.showWarnPopup = false
    },
    recoverConfirm() {
      this.nextLoading = false
      this.showConfirmPopup = false
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
      this.dealDataBeforeRecoverNext()
    },
  },
  created() {
    if (!isLogin()) {
      Toast('Need Login')
      return
    }
    this.currentUserAddress = getConnectedAddress()
    this.getIsHasRecoverWallet()
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