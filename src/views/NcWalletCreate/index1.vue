<template>
  <div class="ncWalletCreate-page">
    <v-navTitle title="Create Eigen Multi-Signature Wallet"></v-navTitle>
    <div class="page-content-box">
      <div class="create-top-des">
        <div class="create-top-des-show blueColor">
          <span class="create-top-des-title">About Eigen Multi-Signature Wallet?</span>
          <i :class="isComponse ? 'el-icon-arrow-up' : 'el-icon-arrow-down'" @click="stepComponseClick"></i>
        </div>
        <div class="page-section-border create-des-text">You need to add at least one Guardian to create a multi-signature wallet,which can be recovered and locked to keep you assets safe. Any transaction requires 50%+ Guardian signatures</div>
      </div>
    </div>
    <div class="create-page-1" v-show="createPage1Visible">
      
      <div class="create-1-container">
        <p class="create-1-title">Set Wallet Name</p>
        <div class="create-1-box">
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
          <div class="create-1-next">
            <el-button type="primary" @click="recoverNext" :loading="nextLoading">Next</el-button>
          </div>
        </div>
      </div>
    </div>
    <div class="create-page-2" v-show="createPage2Visible">
      <div class="create-2-container">
        <p class="create-2-title">Add your Guardian</p>
        <div class="create-2-signer-list">
          <div class="create-2-signer-item">
            <div class="create-signer-left"><img src="http://ccw.xinshenxuetang.com:9000/xinshen-public/defaultImage/headimage.png?v=1"></div>
            <div class="create-signer-right">
              <div class="create-sigern-name">Mike</div>
              <div class="create-signer-address">0x241579898323</div>
            </div>
          </div>
        </div>
        <div class="create-2-add-signer">
          <v-searchSignerModal
          :dataSource="searchSignerList"
          @confirm="confirmSearchSigner"
          @addConfirm="confirmAddSigner" />
        </div>
      </div>
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
import InputPswModal from '@/components/InputPswModal'
import resultModal from '@/components/ResultModal'
import searchSignerModal from '@/components/SearchSignerModal/index'

import { isLogin, getContractAt,getConnectedAddress, getDecryptPrivateKeyFromStore, getSupportNet, getConnectedNet, getEncryptKeyByAddressFromStore} from '@/utils/dashBoardTools';
import { getFromStorage, getInfoFromStorageByKey } from '@/utils/storage'
import { securityModuleRouter } from '@/utils/global';

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
      createPage1Visible: false,
      createPage2Visible: true,

      searchSignerList: [],

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
    'v-inputPsw': InputPswModal,
    'v-resultModal': resultModal,
    "v-searchSignerModal": searchSignerModal,
  },
  methods: {
    async confirmSearchSigner(value) {
      var searchData = {
        userId: this.userId,
        value: value
      }
      const { hasError, list } = await this.$store.dispatch('searchSigner', searchData);
      this.searchSignerList = list
    },
    async confirmAddSigner(value) {
      if (!value) {
        Toast('Please Choose Signer')
        return
      }
      let currentOwner = getConnectedAddress()
      if (value.toLocaleLowerCase() == currentOwner) {
        Toast('This Owner Can Not To Be This Signer')
        return
      }
      let isSignerExist = this.createSignerList.findIndex(function(item) {
        return item.signAddress == value
      })
      if (isSignerExist > -1) {
        Toast('This Signer Already Exists')
        return
      }
      var nowDate = new Date()
      var nowTime = timeFormat(nowDate, 'yyyy-MM-dd hh:mm:ss')
      // const signAddress = await getEns(value)
      const signAddress = value
      console.log(this.createSignerList)
      this.createSignerList.push({
        signAddress: signAddress,
        addTime: nowTime,
      })
      this.createSignerSubmit.push(signAddress.toLocaleLowerCase())
      this.signerTotal = this.createSignerList.length
      this.signerPercent = Math.ceil(this.signerTotal/2)
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
      this.dealDataBeforeRecoverNext()
    },
  },
  created() {
    if (!isLogin()) {
      Toast('Need Login')
      return
    }
  },
  async mounted() {
    this.$eventBus.$on('changeAccout', this.handleAccountChange)
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