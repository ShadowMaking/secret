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
    </div>
    <div class="recover-page-2" v-show="recoverPage2Visible">
      <v-recoverPage2 :currentWalletId="walletSelectId" :currentWalletAddress="walletSelectAddress"></v-recoverPage2>
    </div>
  </div>
</template>

<script>
import Vue from 'vue'
import { ethers } from 'ethers'
import { Toast, Dialog } from 'vant'

import navTitle from '@/components/NavTitle/index'
import recoverPage2 from './recoverPage2/index'

import { isLogin, getContractAt,getConnectedAddress, getDecryptPrivateKeyFromStore, getSupportNet, getConnectedNet} from '@/utils/dashBoardTools';
import { getFromStorage } from '@/utils/storage'
import { walletStatus, securityModuleRouter } from '@/utils/global';

import SecurityModule from "@/assets/contractJSON/SecurityModule.json";
import WalletJson from "@/assets/contractJSON/Wallet.json";

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
    }
  },
  components: {
    "v-navTitle": navTitle,
    "v-recoverPage2": recoverPage2,
  },
  methods: {
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
          Toast('Signer Cannot Recover Wallet')
          return
        }

        const walletContract = await getContractAt({ tokenAddress: currentWallet, abi: WalletJson.abi }, this)
        const ownerAddress = await walletContract.owner()
        if (ownerAddress.toLocaleLowerCase() == currentUserAddress) {
          this.nextLoading = false
          Toast('Owner Cannot Recover Wallet')
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
    recoverConfirm() {
      this.nextLoading = false
      this.showConfirmPopup = false
      this.recoverPage1Visible = false
      this.recoverPage2Visible = true
    },
  },
  created() {
    if (!isLogin()) {
      Toast('Need Login')
      return
    }
    this.currentUserAddress = getConnectedAddress()
    this.getWalletList()
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