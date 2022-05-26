<template>
  <div class="proposal-detail-page">
    <v-navTitle title="Proposal" helpUrl="docs/usage/Send"></v-navTitle >
    <div class="proposal-detail-content">
      <div class="proposal-detail-left">
        <div class="proposal-row">
          <div class="proposal-col-left">Samurai v2 [Implementation]</div>
          <div class="proposal-col-right">
            <el-tag type="warn" v-if="proposalStatus == 0">Pending</el-tag>
            <el-tag v-else-if="proposalStatus == 2">Closed</el-tag>
            <el-tag type="success" v-else>Active</el-tag>
          </div>
        </div>
        <div class="proposal-row proposal-address-box">
          <div class="proposal-col-left">
            <span>By</span>
            <img src="~@/assets/help.png" class="proposal-user-image">
            <span v-if="proposalInfo && proposalInfo.proposer" class="cursor-box" @click="toPageDetail(proposalInfo.proposer)">{{`${proposalInfo.proposer.slice(0,10)}...${proposalInfo.proposer.slice(-4)}`}}</span>
          </div>
          <div class="proposal-col-right">
            <span class="contant-address">new contract address</span>
            <span class="grey-color cursor-box" v-if="newContractAddress" @click="toPageDetail(newContractAddress)">
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
            <div class="proposal-vote-title" style="text-align: right;">your banlance: {{yourSelfBalance}}</div>
            <div class="proposal-vote-btn-container" v-if="!isVote && proposalStatus == 1">
              <div class="proposal-vote-title">Cast your vote</div>
              <div class="proposal-vote-opration">
                <div class="proposal-vote-item">
                  <el-button type="primary" class="common-form-btn" :loading="agreeLoading" @click="allBtnSubmit('agree', 'agreeLoading')">Yes</el-button>
                </div>
                <div class="proposal-vote-item">
                  <el-button plain type="info" class="common-reject-btn" :loading="rejectLoading" @click="allBtnSubmit('reject', 'rejectLoading')">No</el-button>
                </div>
              </div>
            </div>
            <div class="proposal-vote-list" v-else>
              <div class="proposal-result" v-if="resultTxtVisible">
                <i :class="[resultIconStatus, 'el-icon']"></i>
                <span>{{proposalResultTxt}}</span>
              </div>
              <div class="proposal-vote-title">{{voteList.length}} Votes</div>
              <el-row class="list-header">
                <el-col :span="8" class="list-header-item">Address</el-col>
                <el-col :span="8" class="list-header-item">Opinion</el-col>
                <el-col :span="8" class="list-header-item">Share</el-col>
              </el-row>
              <div v-if="voteList.length > 0">
              <el-row 
                class="list-content" 
                v-for="(item, index) in voteList"
                :key="index"
                >
                 <el-col :span="8" class="list-item">
                   <img src="~@/assets/help.png" class="proposal-user-image">
                   {{`${item.voter.slice(0,10)}...${item.voter.slice(-4)}`}}
                 </el-col>
                 <el-col :span="8" class="list-item">{{item.support}}</el-col>
                 <el-col :span="8" class="list-item">{{item.value}}</el-col>
              </el-row>
              </div>
              <el-row v-else><el-col :span="24" class="list-item">no data</el-col></el-row>
            </div>
            <el-button type="primary" class="common-form-btn" :loading="formBtnLoading" @click="formBtnSubmit" v-if="fotmBtnVisible" :disabled="formBtnDisabled">{{formBtnTxt}}</el-button>
          </div>
        </div>
      </div>
      <div class="proposal-detail-right">
        <div class="block-container right-block-1">
          <div class="row-item" v-for="(item, index) in rightBlock1" :key="index">
            <div>{{item.name}}</div>
            <div v-if="index == 0" class="cursor-box" @click="toPageDetail(item.value)">
              {{`${item.value.slice(0,10)}...${item.value.slice(-4)}`}}
            </div>
            <div v-else>{{item.value}}</div>
          </div>
        </div>
        <div class="block-container right-block-2">
          <div class="progress-item-row">
            <div class="progress-txt-row">
              <div>Yes</div>
              <div>{{yesShowBalance}} {{yesPercent}}%</div>
            </div>
            <el-progress :percentage="yesPercent" :format="formatProgress"></el-progress>
          </div>
          <div class="progress-item-row">
            <div class="progress-txt-row">
              <div>No</div>
              <div>{{noShowBalance}} {{noPercent}}%</div>
            </div>
            <el-progress :percentage="noPercent" :format="formatProgress"></el-progress>
          </div>
        </div>
        <div class="block-container right-block-3">
          <div class="block-3-title">Quorum</div>
          <div class="progress-txt-row">
            <div>{{yesShowBalance}} / {{quorumVotes}} </div>
            <div>{{quorumPercent}}% </div>
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
import GovernanceToken from "@/assets/contractJSON/GovernanceToken.json";
import { GovernorAlphaRouter, GovernanceTokenRouter } from '@/utils/global';

import { getInfoFromStorageByKey, getFromStorage } from '@/utils/storage';

import { getContractAt, getDecryptPrivateKeyFromStore, isLogin, getEncryptKeyByAddressFromStore, getConnectedUserAddress, getConnectedAddress, getBalanceByAddress, getSupportNet, getEstimateGas, addTransHistory, getConnectedNet, initWeb3Provider, initRPCProvider } from '@/utils/dashBoardTools';

import { Toast, Dialog} from 'vant'
import { generateEncryptPswByPublicKey, generateCR1ByPublicKey, getDecryptPrivateKey } from '@/utils/relayUtils'

import web3 from 'web3'
import { CHAINMAP } from '@/utils/netWorkForToken';
import { formatErrorContarct, copyTxt } from '@/utils/index'
import { timeFormat } from '@/utils/str'
import { BigNumber } from "bignumber.js";

Vue.use(Toast);
Vue.use(Dialog);

export default {
  name: 'addProposal',
  data() {
    return {
      voteList: [],
      rightBlock1: [
        {name: 'Strategie(s)', value: GovernorAlphaRouter},
        {name: 'IPFS', value: '--'},
        {name: 'Voting system', value: 'Single choice voting'},
        {name: 'Start date', value: '--'},
        {name: 'End date', value: '--'},
      ],
      GovernorAlphaRouter,
      GovernanceTokenRouter,
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
      yesBalance: 0,
      noBalance: 0,
      yesShowBalance: 0,
      noShowBalance: 0,

      quorumVotes: 0,
      quorumPercent: 0,
      yourSelfBalance: '--',

      formBtnLoading: false,
      formBtnTxt: 'Queue',
      fotmBtnVisible: false,
      formBtnDisabled: false,

      resultIconStatus: 'el-icon-success',
      proposalResultTxt: '--',
      resultTxtVisible: false,


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
      currentOptType: 'agree',//agree reject queue

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
    copyAddress(str) {
      if (copyTxt(str)) {
        Toast.success('Copied');
      }
    },
    toPageDetail(address) {
      let currentNetInfo = getConnectedNet()
      let blockExplorerUrls = currentNetInfo.blockExplorerUrls[0]
      const url = `${blockExplorerUrls}/address/${address}`
      window.open(url, '_blank')
    },
    allBtnSubmit(optType, loading) {
      this.currentOptType = optType
      this[loading]= true
      this.isHasBalance()
    },
    formBtnSubmit() {
      if (this.proposalStatus == 4) {//queue
        this.allBtnSubmit('queue', 'formBtnLoading')
      } else if (this.proposalStatus == 5){//execute
        this.allBtnSubmit('execute', 'formBtnLoading')
      }
    },
    async isHasBalance() {
      const selectedConnectAddress = getConnectedAddress()
      const connectBalance = await getBalanceByAddress(selectedConnectAddress)
      if (connectBalance < 0) {
        Toast('Insufficient Funds')
        this.agreeLoading = false
        this.rejectLoading = false
        this.formBtnLoading = false
        return
      }
      this.openDialog()
    },
    openDialog() {
      let messageTxt = ''
      switch(this.currentOptType) {
        case 'agree':
        case 'reject':
          messageTxt = 'Are you sure you want to cast this vote? This action cannot be undo'
          break;
        case 'queue':
          messageTxt = 'Are you sure you want to queue? This action cannot be undo'
          break;
        case 'execute':
          messageTxt = 'Are you sure you want to execute? This action cannot be undo'
          break;
        default:
          break;
      }
      Dialog.confirm({
        message: messageTxt,
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
        this.formBtnLoading = false
        console.log(error)
      });
    },
    async showConfirmModal() {
      if (!getSupportNet()) {
        this.agreeLoading = false
        this.rejectLoading = false
        this.formBtnLoading = false
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
        this.formBtnLoading = false
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
      this.formBtnLoading = false
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
      } else if (this.currentOptType == 'queue') {
        this.dealDataQueueContract()
      } else if (this.currentOptType == 'execute') {
        this.dealDataExcuteContract()
      }
    },
    dealDataAgreeContract() {
      this.castVoteByContract(true, 'Cast Vote')
    },
    dealDataRejectContract() {
      this.castVoteByContract(false, 'Cast Vote')
    },
    dealDataQueueContract() {
      this.showLoading = true
      this.GovernorAlphaContract.queue(this.proposalId, this.overrides).then(async tx=> {
          this.successResultByContract(tx, 'Proposal Queue')
          tx.wait().then(async res => {
            console.log('Queue:', res)
          })
      }).catch(error => {
          this.errorResultByContract(error)
      })
    },
    dealDataExcuteContract() {
      this.showLoading = true
      this.GovernorAlphaContract.execute(this.proposalId, this.overrides).then(async tx=> {
          this.successResultByContract(tx, 'Proposal Execute')
          tx.wait().then(async res => {
            console.log('Queue:', res)
          })
      }).catch(error => {
          this.errorResultByContract(error)
      })
    },
    async castVoteByContract(oprType, hisrotyText) {
      this.showLoading = true
      const GovernanceTokenContract = await getContractAt({ tokenAddress: this.GovernanceTokenRouter, abi: GovernanceToken.abi }, this)
      const currentAddress = getConnectedAddress()

      const isDelegates = await GovernanceTokenContract.delegates(currentAddress)
      console.log(isDelegates)
      if (isDelegates == '0x0000000000000000000000000000000000000000') {
        this.showLoading = false
        Toast('You need to delegate first')
        setTimeout(() =>{
          this.$router.push({ path: '/proposalDelegate' })
        }, 2000)
        return false
      }

      if (this.yourSelfBalance == 0) {
        this.showLoading = false
        Toast('You have no GovernanceToken')
        return
      }
      
      const proposalId = this.$route.query.id
      this.GovernorAlphaContract.castVote(proposalId, oprType, this.overrides).then(async tx=> {
          this.successResultByContract(tx, hisrotyText)
          tx.wait().then(async res => {
            console.log('Vote:', res)
          })
      }).catch(error => {
          this.errorResultByContract(error)
      })
    },
    successResultByContract(tx, hisrotyText) {
      console.log(tx)
      this.showLoading = false
      this.showResultModal = true
      this.getProposalInfo()
      addTransHistory(tx, hisrotyText, this)
    },
    errorResultByContract(error) {
      console.log(error)
      this.showLoading = false
      let errorValue = formatErrorContarct(error)
      Toast.fail(errorValue)
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
      this.rightBlock1[3].value = await this.resetDate(proposalInfo.startBlock, 'start')
      this.rightBlock1[4].value = await this.getEndDate(proposalInfo.endBlock, 'end', proposalInfo.startBlock)
      
      const proposalItem = getInfoFromStorageByKey('proposalItem')
      const calldata = (proposalItem.args[5])[0]
      this.newContractAddress = calldata.slice(0,2) + calldata.slice(26)
      this.proposalStatus = await this.GovernorAlphaContract.state(this.proposalId)
      this.proposalInfoDes = proposalItem.args[8]
      this.dealProposalStatus()
      
      const voteCastInfo = await this.GovernorAlphaContract.queryFilter(
                    this.GovernorAlphaContract.filters.VoteCast()
                )
      await this.dealVoteList(voteCastInfo)
      
      const quorumVotesBig = await this.GovernorAlphaContract.quorumVotes()
      const quorumVotesBalance = await this.dealBigNumber(quorumVotesBig)
      this.quorumVotes = this.dealShowVoteNum(quorumVotesBalance)
      if (quorumVotesBalance>0) {
        this.quorumPercent = (this.yesBalance/quorumVotesBalance)*100
      }

      const GovernanceTokenContract = await getContractAt({ tokenAddress: this.GovernanceTokenRouter, abi: GovernanceToken.abi }, this)
      const currentAddress = getConnectedAddress()
      const yourselfBig = await GovernanceTokenContract.getCurrentVotes(currentAddress)
      this.yourSelfBalance = await this.dealBigNumber(yourselfBig)
      // const sdd = await this.GovernorAlphaContract.getReceipt(this.proposalId, '0x4f5fd0ea6724dfbf825714c2742a37e0c0d6d7d9')
      // console.log(sdd)
    },
    dealProposalStatus() {
      console.log(this.proposalStatus)
      switch(this.proposalStatus) {
        case 2:
        case 3:
          this.fotmBtnVisible = false
          this.resultTxtVisible = true
          this.resultIconStatus = 'el-icon-error'
          this.proposalResultTxt = 'This proposal is Failed'
          break;
        case 4:
          this.formBtnTxt = 'Queue'
          this.fotmBtnVisible = true
          this.formBtnDisabled = false
          this.resultTxtVisible = false
          break;
        case 5:
          this.formBtnTxt = 'Queued'
          this.fotmBtnVisible = true
          this.formBtnDisabled = true
          this.resultTxtVisible = false
          this.isCanExecute()
          break;
        case 6:
          this.fotmBtnVisible = false
          this.resultTxtVisible = true
          this.resultIconStatus = 'el-icon-error'
          this.proposalResultTxt = 'This proposal is Expired'
          break;
        case 7:
          this.fotmBtnVisible = false
          this.resultTxtVisible = true
          this.resultIconStatus = 'el-icon-success'
          this.proposalResultTxt = 'This proposal is Executed'
          break;
        default:
          this.fotmBtnVisible = false
          this.resultTxtVisible = false
          break;
      }
      console.log(this.resultTxtVisible)
    },
    async isCanExecute() {
      const network = getConnectedNet()
      const rpcUrl = network['rpcUrls'][0]
      const currentProvider = initRPCProvider(rpcUrl)
      const { number: mostNewBlockNumber } = await currentProvider.getBlock()
      console.log(mostNewBlockNumber)
      const etaInfo = await this.GovernorAlphaContract.queryFilter(
                    this.GovernorAlphaContract.filters.ProposalQueued()
                )
      console.log('etaInfo:', etaInfo)
      for (var i = 0; i < etaInfo.length; i++) {
        const etaItem = etaInfo[i].args
        const etaBLockNumber = web3.utils.hexToNumberString(etaItem.eta)
        if (etaItem.id == this.proposalId && etaBLockNumber > mostNewBlockNumber) {
           this.formBtnDisabled = false
           this.formBtnTxt = 'Execute'
        }
      }

    },
    async resetDate(dateBlock, type) {
      const network = getConnectedNet()
      const rpcUrl = network['rpcUrls'][0]
      const currentWeb3Provider = initWeb3Provider(rpcUrl)
      const thisDateBlock = web3.utils.hexToNumberString(dateBlock)
      const blockRes = await currentWeb3Provider.eth.getBlock(thisDateBlock);
      const blockTime = blockRes ? timeFormat(blockRes.timestamp * 1000, 'yyyy-MM-dd hh:mm:ss') : null
      return blockTime
    },
    async getEndDate(endBlock, type, startBlock) {
      let endTime = await this.resetDate(endBlock, type)
      console.log(endTime)
      if (!endTime) {
        let blockNum = (endBlock - startBlock)*15*1000
        let endTimeDate = new Date(this.rightBlock1[3].value)
        console.log(endTimeDate.getTime())
        endTime = timeFormat(blockNum + endTimeDate.getTime(), 'yyyy-MM-dd hh:mm:ss')
      }
      return endTime
    },
    async dealBigNumber(bigValue) {
      const GovernanceTokenContract = await getContractAt({ tokenAddress: this.GovernanceTokenRouter, abi: GovernanceToken.abi }, this)
      const decimals = await GovernanceTokenContract.decimals() 
      const decimalsIsBigNumber = web3.utils.isBigNumber(decimals)||web3.utils.isHexStrict(decimals)||!_.isFinite(decimals)
      const decimalsNumber = BigNumber(10).pow((decimalsIsBigNumber?decimals.toNumber():decimals)) // .toNumber() 1000000000000000000
      const balanceNumber = BigNumber(Number(web3.utils.hexToNumberString(bigValue)))
      const balanceFormatString = balanceNumber.div(decimalsNumber).toFixed(2,1) || 0.00
      return balanceFormatString
    },
    async dealVoteList(data) {
      console.log(data)
      let dealData = []
      let currentUserAddress = getConnectedUserAddress()
      
      this.yesBalance = 0
      this.noBalance = 0
      for (var i = 0; i < data.length; i++) {
        const voter = data[i].args.voter.toLocaleLowerCase()
        let itemProposalId = web3.utils.hexToNumberString(data[i].args.proposalId)
        if (itemProposalId == this.proposalId) {//fiter
            if (voter == currentUserAddress) {
              this.isVote = true
            }
            const voteBalance = data[i].args.votes
            const balanceFormatString = await this.dealBigNumber(voteBalance)
            if (data[i].args.support) {
              this.resetVoteBalance(balanceFormatString, 'add')
            } else {
              this.resetVoteBalance(balanceFormatString, 'reduce')
            }
            
            dealData.push({
              voter: voter,
              support: data[i].args.support ? 'Yes' : 'No',
              value: balanceFormatString,
            })
        }
      }
      let voteTotal = this.yesBalance + this.noBalance
      if (voteTotal > 0) {
        this.yesPercent = (this.yesBalance/voteTotal)*100
        this.noPercent = (this.noBalance/voteTotal)*100
        this.yesShowBalance = this.dealShowVoteNum(this.yesBalance)
        this.noShowBalance = this.dealShowVoteNum(this.noBalance)
      }
      this.listLoading = false
      this.voteList = dealData
    },
    resetVoteBalance(value, type) {
      if (type == 'add') {
        this.yesBalance = this.yesBalance + Number(value)
      } else {
        this.noBalance = this.noBalance + Number(value)
      }
    },
    dealShowVoteNum(value) {
      if (value >= 1000 && value < 1000000) {
        return (value/1000).toFixed(0) + 'k'
      } else if (value >= 1000000) {
        return (value/1000000).toFixed(0) + 'M'
      } else {
        return value
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
    // console.log(web3.utils.hexToNumberString('0x0de0b6b3a7640000'))
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
