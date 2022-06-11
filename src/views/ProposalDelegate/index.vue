<template>
  <div class="delegate-proposal-page content-box">
    <v-navTitle title="Delegate" helpUrl="docs/usage/Send"></v-navTitle >
    <div class="delegate-proposal-content content-page">
      <div class="proposal-title">Governance token</div>
      <p class="proposal-des">Governance tokens represent voting shares in Eigen governance. You can vote on each proposal yourself or delegate your votes to other address or cancel delegation.</p>
      <div class="proposal-vote-info" v-if="!initPageLoading && currentDelegateType !== 'add'">
        <div class="proposal-title">You have {{currentVotes}} votes, delegated to 
          <span v-if="delegateIsSelf">self</span>
          <span style="color: #495ABE" v-else>{{`${currentDelegateAddress.slice(0,6)}...${currentDelegateAddress.slice(-4)}`}}</span>
        </div>
        <el-button class="common-form-btn edit-btn" @click="editSubmit">Edit</el-button>
      </div>
      <div class="delegate-opr-content" v-if="!initPageLoading && currentDelegateType !== 'view'">
        <div class="proposal-title">{{delegateTitle}}</div>
        <div class="delegate-type-content" v-if ="currentDelegateType == 'add'">
          <div class="delegate-type-select">
            <a  
              v-for="(item, index) in delegateTypeList"
              :key="index"
              :class="['delegate-item', delegateTypeAcite == index ? 'active' : '']"
              @click="changeDelegateType(index)"
              >{{item}}</a>
          </div>
          <div class="delete-address-box" v-show="delegateTypeAcite == 1">
            <label class="address-label">Recipient Address</label>
            <el-input v-model="delegateOther" placeholder="Please enter" :disabled="addressDiabled"></el-input>
          </div>
        </div>
        <div class="delegate-update-content" v-else>
          <label class="address-label">Recipient Address</label>
          <el-input v-model="updateNewAddress" placeholder="Please enter" :disabled="addressDiabled" class="update-input"></el-input>
          <a class="update-fast-btn" @click="updateSelf">Self</a>
          <a class="update-fast-btn" @click="updateCancelDele">Cancel</a>
        </div>
        <div class="add-proposal-btn">
          <el-button type="primary" class="common-form-btn" :loading="delegateBtnLoading" @click="delegateSubmit">Submit</el-button>
        </div>
      </div>
      <v-loading v-if="initPageLoading" />
    </div>
    <v-loadingPopup :show="showLoading" :showSpinner="false" />
    <v-confirmModal
      :show="showTradeConfirm"
      type="New Proposal"
      :metadata="sendMetadata"
      @close="showTradeConfirm=false"
      @reject="cancelDelegate"
      @confirm="confirmDelegate" />
    <v-inputPsw :show="showInputPswModal" @cancel="showInputPswModal=false" @ok="confirmPswOk" :btnLoading="confirmPswBtnLoading" />
    <v-resultModal :show="showResultModal" :content="resuletContent" :needColse="needResultColse" @confirm="confirmResultModal" @close="cancelResultModal"></v-resultModal>
  </div>
</template>
<script>
import Vue from 'vue';
import _ from 'lodash';
import { ethers, utils } from 'ethers'
import navTitle from '@/components/NavTitle/index'
import { Toast, Dialog} from 'vant'
import { getContractAt, getConnectedAddress, getBalanceByAddress, getDecryptPrivateKeyFromStore, isLogin, getEstimateGas, getConnectedUserAddress, getEncryptKeyByAddressFromStore, getSupportNet, addTransHistory } from '@/utils/dashBoardTools';

import GovernanceToken from "@/assets/contractJSON/GovernanceToken.json";
import GovernorAlpha from "@/assets/contractJSON/GovernorAlpha.json";
import { GovernanceTokenRouter, GovernorAlphaRouter } from '@/utils/global';

import { getInfoFromStorageByKey } from '@/utils/storage';

import InputPswModal from '@/components/InputPswModal'
import ConfirmModal from '@/components/ConfirmModal';
import LoadingPopup from '@/components/LoadingPopup';
import resultModal from '@/components/ResultModal';
import Loading from '@/components/Loading'
import { generateEncryptPswByPublicKey, generateCR1ByPublicKey, getDecryptPrivateKey } from '@/utils/relayUtils'
import web3 from 'web3'
import { CHAINMAP } from '@/utils/netWorkForToken';

import { formatErrorContarct } from '@/utils/index'
import { BigNumber } from "bignumber.js";

Vue.use(Toast);
Vue.use(Dialog);

export default {
  name: 'delegateProposal',
  data() {
    return {
      GovernanceTokenRouter,
      GovernorAlphaRouter,
      delegateBtnLoading: false,
      showLoading: false,
      initPageLoading: true,

      overrides: {
        gasLimit: 8000000,
        gasPrice: 20000000000,//wei
      },

      currentChainInfo: null,
      sendMetadata: null,
      defaultNetWork: '',
      showTradeConfirm: false,

      showResultModal: false,
      resuletContent: 'Submitted Success',
      needResultColse: false,

      delegateTypeAcite: 0,
      delegateTypeList: ['Self Delegate', 'Add Delegate'],
      delegateOther: '',
      delegateAddress: '',
      delegateTitle: 'Unlock Votes',
      currentDelegateType: 'add',//add, view, edit
      currentDelegateAddress: '',
      delegateIsSelf: false,
      addressDiabled: false,
      updateNewAddress: '',
      currentVotes: '',
      
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
    'v-confirmModal': ConfirmModal,
    'v-loadingPopup': LoadingPopup,
    'v-resultModal': resultModal,
    'v-loading': Loading,
  },
  
  methods: {
    changeDelegateType(index) {
      this.delegateTypeAcite = index
    },
    async delegateSubmit() {
      this.delegateBtnLoading = true
      const selectedConnectAddress = getConnectedAddress()
      const connectBalance = await getBalanceByAddress(selectedConnectAddress)
      if (connectBalance < 0) {
        Toast('Insufficient Funds')
        this.delegateBtnLoading = false
        return
      }
      this.delegateAddress = (this.delegateTypeAcite == 0 ? selectedConnectAddress : this.delegateOther)
      if (!this.checkData()) { 
        this.delegateBtnLoading = false
        return 
      }
      
      this.showConfirmModal()

    },
    editSubmit() {
      if (this.currentDelegateType == 'edit') {
        this.currentDelegateType = 'view'
      } else {
        this.currentDelegateType = 'edit'
        this.delegateTitle = 'Update Delegation'
      }
    },
    updateSelf() {
      this.updateNewAddress = getConnectedAddress()
    },
    updateCancelDele() {
      this.updateNewAddress = '0x0000000000000000000000000000000000000000'
    },
    checkData() {
      const userId = getInfoFromStorageByKey('gUID')
      if (!userId) {
        Toast('Please Login')
        return false
      }
      if (!(utils.isAddress(this.delegateAddress) || this.delegateAddress == 0) ) {
        Toast(`Recipient address is wrong`);
        return false;
      }
      return true
    },
    cancelResultModal() {
      this.showResultModal = false
    },
    confirmResultModal() {
      this.showResultModal = false
      this.$router.push({ path: '/overview' })
    },
    async showConfirmModal() {
      const isCanSubmit = await this.isCaSubmit()
      if (!isCanSubmit) {
        return
      }
      let thisGasPrice = this.overrides.gasPrice.toString()
      let gasPrice = web3.utils.fromWei(thisGasPrice, 'gwei')
      let estimatedGasFee = await getEstimateGas('gasUsed')
      this.sendMetadata = {
        from: getConnectedAddress(),
        to: this.GovernanceTokenRouter,
        gas: this.overrides.gasLimit,
        gasPrice: gasPrice,
        value: 0,
        symbolName: 'ETH',
        netInfo: this.currentChainInfo,
        DATA: '0x',
        estimatedGasFee: estimatedGasFee
      }
      this.showTradeConfirm = true
      this.delegateBtnLoading = false
    },
    async isCaSubmit() {
      if (!getSupportNet()) {
        this.delegateBtnLoading = false
        return false
      }
      const GovernanceTokenContract = await getContractAt({ tokenAddress: this.GovernanceTokenRouter, abi: GovernanceToken.abi }, this)
      const selectedConnectAddress = getConnectedAddress()

      const connectBalance = await getBalanceByAddress(selectedConnectAddress)
      let estimatedGasFee = await getEstimateGas('gasUsed')
      console.log(connectBalance)
      if (connectBalance < estimatedGasFee) {
        Toast('Insufficient Funds')
        this.delegateBtnLoading = false
        return false
      }

      if (this.currentDelegateType !== 'edit' && this.updateNewAddress !== '0x0000000000000000000000000000000000000000') {//not cancel
        const balance = await GovernanceTokenContract.balanceOf(selectedConnectAddress)
        if (balance <= 0) {
          this.delegateBtnLoading = false
          Toast('You need no GovernanceToken to delegate')
          return false
        }
      }

      return true
    },
    cancelDelegate() {
      this.showTradeConfirm = false
      Toast('Cancel')
    },
    confirmDelegate({ overrides }) {
      this.overrides.gasLimit = overrides.gasLimit
      this.overrides.gasPrice = web3.utils.toWei(overrides.gasPrice, 'gwei')
      console.log(this.overrides)
      if (this.currentDelegateType == 'add') {
        this.dealDataDelegatedContract(this.delegateAddress)
      } else {
        this.dealDataDelegatedContract(this.updateNewAddress)
      }
      
    },
    async dealDataDelegatedContract(address) {
      this.showLoading = true;
      const GovernanceTokenContract = await getContractAt({ tokenAddress: this.GovernanceTokenRouter, abi: GovernanceToken.abi }, this)
      GovernanceTokenContract.delegate(address, this.overrides).then(async tx=> {
          console.log(tx)
          this.showLoading = false
          this.showResultModal = true
          addTransHistory(tx, 'Delegate', this)
          tx.wait().then(async res => {
            console.log('Delegate:', res)
          })
      }).catch(error => {
          console.log(error)
          this.showLoading = false
          let errorValue = formatErrorContarct(error)
          Toast(errorValue)
      })
    },
    async getIsCanDelegate() {
      this.initPageLoading = true
      const GovernanceTokenContract = await getContractAt({ tokenAddress: this.GovernanceTokenRouter, abi: GovernanceToken.abi }, this)
      const selectedConnectAddress = getConnectedAddress()
      const isDelegates = await GovernanceTokenContract.delegates(selectedConnectAddress)
      if (isDelegates == '0x0000000000000000000000000000000000000000') {
        this.currentDelegateType = 'add'
      } else {
        this.currentDelegateType = 'view'
        this.currentDelegateAddress = isDelegates.toLocaleLowerCase()
        this.delegateIsSelf = (this.currentDelegateAddress == selectedConnectAddress ? true : false)
        const yourselfBig = await GovernanceTokenContract.getCurrentVotes(selectedConnectAddress)
        this.currentVotes = await this.dealBigNumber(yourselfBig)
      }
      this.initPageLoading = false
    },
    async dealBigNumber(bigValue) {
      const GovernanceTokenContract = await getContractAt({ tokenAddress: this.GovernanceTokenRouter, abi: GovernanceToken.abi }, this)
      const decimals = await GovernanceTokenContract.decimals() 
      const decimalsIsBigNumber = web3.utils.isBigNumber(decimals)||web3.utils.isHexStrict(decimals)||!_.isFinite(decimals)
      const decimalsNumber = BigNumber(10).pow((decimalsIsBigNumber?decimals.toNumber():decimals)) // .toNumber() 1000000000000000000
      const balanceNumber = BigNumber(Number(web3.utils.hexToNumberString(bigValue)))
      const balanceFormatString = balanceNumber.div(decimalsNumber).toFixed(0,1) || 0.00
      return balanceFormatString
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
      await this.getIsCanDelegate()
    },
    async getIsHasPwd() {
      // check privateKey whether is existed
      const privateKey = await getDecryptPrivateKeyFromStore(this)
      if (!privateKey) {
        this.showInputPswModal = true;
        return
      }
      this.getIsCanDelegate()
    },
    _handleNetworkChange({ chainInfo, from }) {
      this.currentChainInfo = chainInfo
      this.getIsHasPwd()
    },
    handleAccountChange(addressInfo) {
      this.getIsHasPwd()
    },
    getDefaultNetWork() {
      const info = getInfoFromStorageByKey('netInfo')
      return info && info['id'] || 1
    },
  },
  async created() {
    this.defaultNetWork = this.getDefaultNetWork()
    if (!isLogin()) {
      Toast('Please Login')
      return
    }
    const { data: netInfo } = await this.$store.dispatch('GetSelectedNetwork')
    console.log(netInfo)
    if (netInfo) {
      this.currentChainInfo = CHAINMAP[web3.utils.numberToHex(netInfo['id'])]
    } else {
      this.currentChainInfo = CHAINMAP[web3.utils.numberToHex(this.defaultNetWork)]
    }
    // this.overrides.gasPrice = await getEstimateGas('gasPrice')
    this.overrides.gasPrice = 1
    
    this.getIsHasPwd()
  },
  async mounted() {
    this.$eventBus.$on('networkChange', this._handleNetworkChange)
    this.$eventBus.$on('changeAccout', this.handleAccountChange)
  },
}
</script>
<style lang="scss" scoped>
  @import 'index.scss';
  .el-select-dropdown__item {
    padding: 0 20px !important;
  }
</style>
