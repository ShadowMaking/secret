<template>
  <div class="add-proposal-page content-box">
    <v-navTitle title="New proposal" helpUrl="docs/usage/Send"></v-navTitle >
    <div class="add-proposal-content content-page">
      <p class="proposal-des">You need to have a minimum of 1 governance token in order to submit a proposal.</p>
      <div class="proposal-title">Please select the module proposal to be upgraded:</div>
      <div class="module-list">
        <el-select v-model="selectModal" placeholder="Please choose" class="module-select">
          <el-option
            v-for="item in moduleList"
            :key="item.id"
            :label="item.title"
            :value="item.proxyAddress">
          </el-option>
        </el-select>
      </div>
      <div class="proposal-title">Please enter new contract address:</div>
      <el-input v-model="proposalNewContract"></el-input>
      <div class="proposal-title">Proposal Voting Period <span style="font-weight: bold">7</span> days</div>
      <div class="proposal-title">Description:</div>
      <el-input type="textarea" v-model="proposalDes"></el-input>
      <div class="add-proposal-btn">
        <el-button type="primary" class="common-form-btn" :loading="addBtnLoading" @click="addSubmit">Submit</el-button>
      </div>
    </div>
    <v-loadingPopup :show="showLoading" :showSpinner="false" />
    <v-confirmModal
      :show="showTradeConfirm"
      type="New Proposal"
      :metadata="sendMetadata"
      @close="showTradeConfirm=false"
      @reject="cancelCreate"
      @confirm="confirmCreate" />
    <v-inputPsw :show="showInputPswModal" @cancel="showInputPswModal=false" @ok="confirmPswOk" :btnLoading="confirmPswBtnLoading" />
    <v-resultModal :show="showResultModal" :content="resuletContent" :needColse="needResultColse" @confirm="confirmResultModal" @close="cancelResultModal"></v-resultModal>
  </div>
</template>
<script>
import Vue from 'vue';
import _ from 'lodash';
import { ethers } from 'ethers'
import navTitle from '@/components/NavTitle/index'
import { Toast, Dialog} from 'vant'
import { getContractAt, getConnectedAddress, getBalanceByAddress, getDecryptPrivateKeyFromStore, isLogin, getEstimateGas, getConnectedUserAddress, getEncryptKeyByAddressFromStore, getSupportNet, addTransHistory } from '@/utils/dashBoardTools';

import GovernanceToken from "@/assets/contractJSON/GovernanceToken.json";
import GovernorAlpha from "@/assets/contractJSON/GovernorAlpha.json";
import { GovernanceTokenRouter, GovernorAlphaRouter, securityModuleProxyRouter, transactionModuleProxyRouter } from '@/utils/global';

import { getInfoFromStorageByKey } from '@/utils/storage';

import InputPswModal from '@/components/InputPswModal'
import ConfirmModal from '@/components/ConfirmModal';
import LoadingPopup from '@/components/LoadingPopup';
import resultModal from '@/components/ResultModal';
import { generateEncryptPswByPublicKey, generateCR1ByPublicKey, getDecryptPrivateKey } from '@/utils/relayUtils'
import web3 from 'web3'
import { CHAINMAP } from '@/utils/netWorkForToken';

import { formatErrorContarct } from '@/utils/index'

Vue.use(Toast);
Vue.use(Dialog);

export default {
  name: 'addProposal',
  data() {
    return {
      moduleList: [
       {title: 'TransactionModule', id: 1, proxyAddress: transactionModuleProxyRouter},
       {title: 'SecurityModule', id: 2, proxyAddress: securityModuleProxyRouter}
      ],
      selectModal: '',
      proposalNewContract: '',
      proposalDes: '',
      addBtnLoading: false,
      showLoading: false,

      GovernanceTokenRouter,
      GovernorAlphaRouter,

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
  },
  
  methods: {
    async addSubmit() {
      console.log(this.selectModal)
      this.addBtnLoading = true
      const selectedConnectAddress = getConnectedAddress()
      const connectBalance = await getBalanceByAddress(selectedConnectAddress)
      if (connectBalance < 0) {
        Toast('Insufficient Funds')
        this.addBtnLoading = false
        return
      }
      if (!this.checkData()) { 
        this.addBtnLoading = false
        return 
      }
      // check privateKey whether is existed
      const privateKey = await getDecryptPrivateKeyFromStore(this)
      if (!privateKey) {
        this.showInputPswModal = true;
        return
      }
      await this.showConfirmModal()

    },
    checkData() {
      const userId = getInfoFromStorageByKey('gUID')
      if (!userId) {
        Toast.fail('Please Login')
        return false
      }
      if (!this.selectModal) {
        Toast.fail('Please select the module')
        return false
      }
      if (!this.proposalNewContract) {
        Toast.fail('Please enter new contract address')
        return false
      }
      return true
    },
    cancelResultModal() {
      this.showResultModal = false
    },
    confirmResultModal() {
      this.showResultModal = false
      this.$router.push({ path: '/proposalList' })
    },
    async showConfirmModal() {
      if (!getSupportNet()) {
        this.addBtnLoading = false
        return
      }
      const selectedConnectAddress = getConnectedAddress()
      const connectBalance = await getBalanceByAddress(selectedConnectAddress)
      let estimatedGasFee = await getEstimateGas('gasUsed', 5000000000)
      console.log(connectBalance)
      if (connectBalance < estimatedGasFee) {
        Toast('Insufficient Funds')
        this.addBtnLoading = false
        return
      }
      let thisGasPrice = this.overrides.gasPrice.toString()
      let gasPrice = web3.utils.fromWei(thisGasPrice, 'gwei')

      this.sendMetadata = {
        from: getConnectedAddress(),
        to: this.GovernorAlphaRouter,
        gas: this.overrides.gasLimit,
        gasPrice: gasPrice,
        value: 0,
        symbolName: 'ETH',
        netInfo: this.currentChainInfo,
        DATA: '0x',
        estimatedGasFee: estimatedGasFee
      }
      this.showTradeConfirm = true
      this.addBtnLoading = false
    },
    cancelCreate() {
      this.showTradeConfirm = false
      Toast('Cancel')
    },
    confirmCreate({ overrides }) {
      this.overrides.gasLimit = overrides.gasLimit
      this.overrides.gasPrice = web3.utils.toWei(overrides.gasPrice, 'gwei')
      this.dealDataAddContract()
    },
    async dealDataAddContract() {
      this.showLoading = true;
      const target = this.selectModal
      const value = 0
      const signature = 'setImplementation(address)'
      const description = this.proposalDes
      const calldata = ethers.utils.defaultAbiCoder.encode( 
       ['address'],
       [this.proposalNewContract]
      )
      const GovernanceTokenContract = await getContractAt({ tokenAddress: this.GovernanceTokenRouter, abi: GovernanceToken.abi }, this)
      // console.log(GovernanceTokenContract)
      const currentAddress = getConnectedAddress()
      await GovernanceTokenContract.delegate(currentAddress)
      const balance = await GovernanceTokenContract.balanceOf(currentAddress)
      console.log(balance)
      
      const GovernorAlphaContract = await getContractAt({ tokenAddress: this.GovernorAlphaRouter, abi: GovernorAlpha.abi }, this)
      console.log(GovernorAlphaContract)
      const proposalThreshold = await GovernorAlphaContract.proposalThreshold()
      console.log(proposalThreshold)
      if (balance < proposalThreshold) {
        this.showLoading = false
        Toast('You need at least 100000000 GovernanceToken to initiate')
        return
      }
      
      GovernorAlphaContract.propose(
            [target],
            [value],
            [signature],
            [calldata],
            description,
            this.overrides
      ).then(async tx=> {
          console.log(tx)
          this.showLoading = false
          this.showResultModal = true
          addTransHistory(tx, 'New Propose', this)
          tx.wait().then(async res => {
            console.log('New Propose:', res)
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
      await this.showConfirmModal()
    },
    _handleNetworkChange({ chainInfo, from }) {
      console.log(chainInfo)
    },
    handleAccountChange(addressInfo) {
      console.log(addressInfo)
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
    this.overrides.gasPrice = await getEstimateGas('gasPrice', 5000000000)
    // console.log(web3.utils.hexToNumberString('0x0422ca8b0a00a425000000'))
    // const GovernorAlphaContract = await getContractAt({ tokenAddress: this.GovernorAlphaRouter, abi: GovernorAlpha.abi }, this)
    // console.log(GovernorAlphaContract)
    // const tx = await GovernorAlphaContract.cancel(1, this.overrides)
    // console.log(tx)
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
