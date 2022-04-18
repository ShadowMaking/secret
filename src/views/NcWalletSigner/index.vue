<template>
  <div class="ncWallet-setting-page">
    <v-navTitle title="Signers"></v-navTitle>
    <div class="page-section-border payment-limit-box">
      
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
import { Toast, Popup, Loading } from 'vant'
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
      

      resuletContent: '',
      needResultColse: false,
      showResultModal: false,
      currentTip: '',//warn next

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
      // this.getIsCanSet()
    },
    
    confirmResultModal() {
      
      this.showResultModal = false
    },
    cancelResultModal() {
      this.showResultModal = false
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
      // this.getWalletSetting()
    },
  },
  async created() {
    if (!isLogin()) {
      Toast('Please Login')
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