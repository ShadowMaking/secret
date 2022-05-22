<template>
  <div class="proposal-detail-page">
    <v-navTitle title="Proposal" helpUrl="docs/usage/Send"></v-navTitle >
    <div class="proposal-detail-content">
      <div class="proposal-detail-left">
        <div class="proposal-row">
          <div class="proposal-col-left">Samurai v2 [Implementation]</div>
          <div class="proposal-col-right">
            <el-tag type="warn" v-if="proposalStatus == 0">Pending</el-tag>
            <el-tag type="success" v-else-if="proposalStatus == 1">Active</el-tag>
            <el-tag v-else-if="proposalStatus == 2">Closed</el-tag>
          </div>
        </div>
        <div class="proposal-row proposal-address-box">
          <div class="proposal-col-left">
            <span>By</span>
            <img src="~@/assets/help.png" class="proposal-user-image">
            <span v-if="proposalInfo && proposalInfo.proposer">{{`${proposalInfo.proposer.slice(0,10)}...${proposalInfo.proposer.slice(-4)}`}}</span>
          </div>
          <div class="proposal-col-right">
            <span class="contant-address">new contract address</span>
            <span class="grey-color" v-if="newContractAddress">
            {{`${newContractAddress.slice(0,10)}...${newContractAddress.slice(-4)}`}}
            </span>
            <span class="grey-color" v-else>--</span>
          </div>
        </div>
        <div class="proposal-des-content">
          <!-- <div class="proposal-detail-title">This proposal expectation is to produce an implementation. Full details and discussions thus far can be found at:</div>
          <div class="proposal-detail-url">httos://for/9768</div> -->
          <div class="proposal-detail-sy">Synopsis:</div>
          <div class="proposal-detail-des">{{proposalInfoDes}}</div>
        </div>
        <div class="proposal-vote-list block-container">
          <v-loading v-if="listLoading" />
          <div v-else>
            <div class="proposal-vote-list" v-if="isVote">
              <div class="proposal-vote-title">{{voteList.length}} Votes</div>
              <el-row class="list-header">
                <el-col :span="8" class="list-header-item">Address</el-col>
                <el-col :span="8" class="list-header-item">Opinion</el-col>
                <el-col :span="8" class="list-header-item">Share</el-col>
              </el-row>
              <el-row 
                class="list-content" 
                v-for="(item, index) in voteList"
                :key="index">
                 <el-col :span="8" class="list-item">
                   <img src="~@/assets/help.png" class="proposal-user-image">
                   {{`${item.voter.slice(0,10)}...${item.voter.slice(-4)}`}}
                 </el-col>
                 <el-col :span="8" class="list-item">{{item.support}}</el-col>
                 <el-col :span="8" class="list-item">{{item.value}}</el-col>
              </el-row>
            </div>
            <div class="proposal-vote-btn-container" v-else>
              <div class="proposal-vote-title">Cast your vote</div>
              <div class="proposal-vote-opration">
                <div class="proposal-vote-item">
                  <el-button type="primary" class="common-form-btn" :loading="agreeLoading" @click="agreeSubmit" :disabled="proposalStatus !== 1">Yes</el-button>
                </div>
                <div class="proposal-vote-item">
                  <el-button plain type="info" class="common-reject-btn" :loading="rejectLoading" @click="rejectSubmit" :disabled="proposalStatus !== 1">No</el-button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div class="proposal-detail-right">
        <div class="block-container right-block-1">
          <div class="row-item" v-for="(item, index) in rightBlock1" :key="index">
            <div>{{item.name}}</div>
            <div>{{item.value}}</div>
          </div>
        </div>
        <div class="block-container right-block-2">
          <div class="progress-item-row">
            <div class="progress-txt-row">
              <div>Yes</div>
              <div>5.5M {{yesPercent}}%</div>
            </div>
            <el-progress :percentage="yesPercent" :format="formatProgress"></el-progress>
          </div>
          <div class="progress-item-row">
            <div class="progress-txt-row">
              <div>No</div>
              <div>19k {{noPercent}}%</div>
            </div>
            <el-progress :percentage="noPercent" :format="formatProgress"></el-progress>
          </div>
        </div>
        <div class="block-container right-block-3">
          <div class="block-3-title">Quorum</div>
          <div class="progress-txt-row">
            <div>5.6M / 5M </div>
            <div>111.5% </div>
          </div>
          <el-progress :percentage="50" :format="formatProgress"></el-progress>
        </div>
      </div>
    </div>
    <v-inputPsw :show="showInputPswModal" @cancel="showInputPswModal=false" @ok="confirmPswOk" :btnLoading="confirmPswBtnLoading" />
    <v-loadingPopup :show="showLoading" :showSpinner="false" />
    <v-confirmModal
      :show="showTradeConfirm"
      type="vote"
      :metadata="sendMetadata"
      @close="showTradeConfirm=false"
      @reject="cancelModal"
      @confirm="confirmModal" />
    <v-resultModal :show="showResultModal" :content="resuletContent" :needColse="needResultColse" @confirm="confirmResultModal" @close="cancelResultModal"></v-resultModal>
  </div>
</template>
<script>
import Vue from 'vue';
import _ from 'lodash';
import { ethers } from 'ethers'

import navTitle from '@/components/NavTitle/index'
import InputPswModal from '@/components/InputPswModal'
import ConfirmModal from '@/components/ConfirmModal';
import LoadingPopup from '@/components/LoadingPopup';
import resultModal from '@/components/ResultModal';
import Loading from '@/components/Loading'

import GovernorAlpha from "@/assets/contractJSON/GovernorAlpha.json";
import { GovernorAlphaRouter } from '@/utils/global';

import { getInfoFromStorageByKey, getFromStorage } from '@/utils/storage';

import { getContractAt, getDecryptPrivateKeyFromStore, isLogin, getEncryptKeyByAddressFromStore, getConnectedUserAddress, getConnectedAddress, getBalanceByAddress, getSupportNet, getEstimateGas, addTransHistory, getConnectedNet, initWeb3Provider } from '@/utils/dashBoardTools';

import { Toast, Dialog} from 'vant'
import { generateEncryptPswByPublicKey, generateCR1ByPublicKey, getDecryptPrivateKey } from '@/utils/relayUtils'

import web3 from 'web3'
import { CHAINMAP } from '@/utils/netWorkForToken';
import { formatErrorContarct } from '@/utils/index'
import { timeFormat } from '@/utils/str'

Vue.use(Toast);
Vue.use(Dialog);

export default {
  name: 'addProposal',
  data() {
    return {
      voteList: [],
      rightBlock1: [
        {name: 'Strategie(s)', value: 'ox6e9s...3244'},
        {name: 'IPFS', value: '#qMBz6cY'},
        {name: 'Voting system', value: 'Single choice voting'},
        {name: 'Start date', value: '--'},
        {name: 'End date', value: '--'},
      ],
      GovernorAlphaRouter,
      agreeLoading: false,
      rejectLoading: false,
      GovernorAlphaContract: '',
      proposalId: this.$route.query.id,
      proposalInfo: null,
      showLoading: false,
      newContractAddress: '',
      proposalStatus: '',
      proposalInfoDes: '--',
      isVote: false,
      listLoading: true,

      yesPercent: 0,
      noPercent: 0,

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
      currentOptType: 'agree',//agree reject

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
    async agreeSubmit() {
      this.currentOptType = 'agree'
      this.agreeLoading = true
      this.isHasBalance()
    },
    async rejectSubmit() {
      this.currentOptType = 'reject'
      this.rejectLoading = true
      this.isHasBalance()
    },
    async isHasBalance() {
      const selectedConnectAddress = getConnectedAddress()
      const connectBalance = await getBalanceByAddress(selectedConnectAddress)
      if (connectBalance < 0) {
        Toast('Insufficient Funds')
        this.agreeLoading = false
        this.rejectLoading = false
        return
      }
      this.openDialog()
    },
    openDialog() {
      Dialog.confirm({
        message: 'Are you sure you want to cast this vote? This action cannot be undone',
        confirmButtonText: 'Confirm',
        confirmButtonColor: '#4375f1',
        cancelButtonText: 'Cancel'
      })
      .then(() => {
        this.showConfirmModal()
      })
      .catch((error) => {
        this.rejectLoading = false
        this.agreeLoading = false
        console.log(error)
      });
    },
    async showConfirmModal() {
      if (!getSupportNet()) {
        this.agreeLoading = false
        this.rejectLoading = false
        return
      }
      const selectedConnectAddress = getConnectedAddress()
      const connectBalance = await getBalanceByAddress(selectedConnectAddress)
      let estimatedGasFee = await getEstimateGas('gasUsed')
      console.log(connectBalance)
      if (connectBalance < estimatedGasFee) {
        Toast('Insufficient Funds')
        this.agreeLoading = false
        this.rejectLoading = false
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
      this.agreeLoading = false
      this.rejectLoading = false
    },
    formatProgress(percentage) {
      return '';
    },
    cancelModal() {
      this.showTradeConfirm = false
      Toast('Cancel')
    },
    confirmModal({ overrides }) {
      this.overrides.gasLimit = overrides.gasLimit
      this.overrides.gasPrice = web3.utils.toWei(overrides.gasPrice, 'gwei')
      if (this.currentOptType == 'agree') {
        this.dealDataAgreeContract()
      } else if (this.currentOptType == 'reject') {
        this.dealDataRejectContract()
      }
    },
    dealDataAgreeContract() {
      this.castVoteByContract(true, 'Agree Vote')
    },
    dealDataRejectContract() {
      this.castVoteByContract(false, 'Reject Vote')
    },
    async castVoteByContract(oprType, hisrotyText) {
      this.showLoading = true
      const proposalId = this.$route.query.id
      this.GovernorAlphaContract.castVote(proposalId, oprType, this.overrides).then(async tx=> {
          console.log(tx)
          this.showLoading = false
          this.showResultModal = true
          this.getProposalInfo()
          addTransHistory(tx, hisrotyText, this)
          tx.wait().then(async res => {
            console.log('Agree Vote:', res)
          })
      }).catch(error => {
          console.log(error)
          this.showLoading = false
          let errorValue = formatErrorContarct(error)
          Toast.fail(errorValue)
      })
    },
    cancelResultModal() {
      this.showResultModal = false
    },
    confirmResultModal() {
      this.showResultModal = false
    },
    async getProposalInfo() {
      this.listLoading = true
      this.GovernorAlphaContract = await getContractAt({ tokenAddress: this.GovernorAlphaRouter, abi: GovernorAlpha.abi }, this)
      console.log(this.GovernorAlphaContract)
      const proposalInfo = await this.GovernorAlphaContract.proposals(this.proposalId)
      this.proposalInfo = proposalInfo
      console.log(proposalInfo)
      this.resetDate(proposalInfo.startBlock, 'start')
      this.resetDate(proposalInfo.endBlock, 'end')
      
      const proposalItem = getInfoFromStorageByKey('proposalItem')
      const calldata = (proposalItem.args[5])[0]
      this.newContractAddress = calldata.slice(0,2) + calldata.slice(26)
      this.proposalStatus = proposalItem.status
      this.proposalInfoDes = proposalItem.args[8]
      const voteCastInfo = await this.GovernorAlphaContract.queryFilter(
                    this.GovernorAlphaContract.filters.VoteCast()
                )
      this.dealVoteList(voteCastInfo)
      console.log(voteCastInfo)
    },
    async resetDate(dateBlock, type) {
      const network = getConnectedNet()
      const rpcUrl = network['rpcUrls'][0]
      const currentWeb3Provider = initWeb3Provider(rpcUrl)
      const thisDateBlock = web3.utils.hexToNumberString(dateBlock)
      const blockRes = await currentWeb3Provider.eth.getBlock(thisDateBlock);
      const blockTime = blockRes ? timeFormat(blockRes.timestamp * 1000, 'yyyy-MM-dd hh:mm:ss') : '--'
      if (type == 'start') {
        this.rightBlock1[3].value = blockTime
      } else {
        this.rightBlock1[4].value = blockTime
      }
    },
    dealVoteList(data) {
      let dealData = []
      let proposalTotal = data.length
      let agreeTotal = 0
      let currentUserAddress = getConnectedUserAddress()
      console.log(currentUserAddress)
      for (var i = 0; i < data.length; i++) {
        const voter = data[i].args.voter.toLocaleLowerCase()
        if (data[i].args.proposalId == this.proposalId) {//fiter
            if (voter == currentUserAddress) {
              this.isVote = true
            }
            if (data[i].args.support) {
              agreeTotal = agreeTotal + 1
            }
            dealData.push({
              voter: voter,
              support: data[i].args.support ? 'Yes' : 'No',
              value: web3.utils.hexToNumberString(data[i].args.votes),
            })
        }
      }
      this.yesPercent = (agreeTotal/proposalTotal)*100
      this.noPercent = ((proposalTotal-agreeTotal)/proposalTotal)*100
      this.listLoading = false
      this.voteList = dealData
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
      await this.getProposalInfo()
    },
    async isShowPwdModal() {
      // check privateKey whether is existed
      const privateKey = await getDecryptPrivateKeyFromStore(this)
      if (!privateKey) {
        this.showInputPswModal = true;
        return
      }
      await this.getProposalInfo()
    },
    getDefaultNetWork() {
      const info = getInfoFromStorageByKey('netInfo')
      return info && info['id'] || 1
    },
    _handleNetworkChange({ chainInfo, from }) {
      console.log(chainInfo)
    },
    handleAccountChange(addressInfo) {
      console.log(addressInfo)
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
    this.isShowPwdModal()
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
