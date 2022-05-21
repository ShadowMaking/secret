<template>
  <div class="proposal-detail-page">
    <v-navTitle title="Proposal" helpUrl="docs/usage/Send"></v-navTitle >
    <div class="proposal-detail-content">
      <div class="proposal-detail-left">
        <div class="proposal-row">
          <div class="proposal-col-left">Samurai v2 [Implementation]</div>
          <div class="proposal-col-right"><el-tag>closed</el-tag></div>
        </div>
        <div class="proposal-row proposal-address-box">
          <div class="proposal-col-left">
            <span>By</span>
            <img src="~@/assets/help.png" class="proposal-user-image">
            <span>0x6e81...9782</span>
          </div>
          <div class="proposal-col-right">
            <span class="contant-address">new contract address</span>
            <span class="grey-color">0x6e81...9782</span>
          </div>
        </div>
        <div class="proposal-des-content">
          <div class="proposal-detail-title">This proposal expectation is to produce an implementation. Full details and discussions thus far can be found at:</div>
          <div class="proposal-detail-url">httos://for/9768</div>
          <div class="proposal-detail-sy">Synopsis:</div>
          <div class="proposal-detail-des">sam are the community engeagement team for sushi and serve to build trust between users,community menmbers, and sushi</div>
        </div>
        <div class="proposal-vote-list block-container">
          <!-- <div class="proposal-vote-list">
            <div class="proposal-vote-title">343 Votes</div>
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
                 {{item.address}}
               </el-col>
               <el-col :span="8" class="list-item">{{item.status}}</el-col>
               <el-col :span="8" class="list-item">{{item.share}}</el-col>
            </el-row>
          </div> -->
          <div class="proposal-vote-btn-container">
            <div class="proposal-vote-title">Cast your vote</div>
            <div class="proposal-vote-opration">
              <div class="proposal-vote-item">
                <el-button type="primary" class="common-form-btn" :loading="agreeLoading" @click="agreeSubmit">Yes</el-button>
              </div>
              <div class="proposal-vote-item">
                <el-button plain type="info" class="common-reject-btn" :loading="rejectLoading" @click="rejectSubmit">No</el-button>
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
              <div>5.5M 99.54%</div>
            </div>
            <el-progress :percentage="50" :format="formatProgress"></el-progress>
          </div>
          <div class="progress-item-row">
            <div class="progress-txt-row">
              <div>No</div>
              <div>19k 0.54%</div>
            </div>
            <el-progress :percentage="50" :format="formatProgress"></el-progress>
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

import GovernorAlpha from "@/assets/contractJSON/GovernorAlpha.json";
import { GovernorAlphaRouter } from '@/utils/global';

import { getInfoFromStorageByKey } from '@/utils/storage';

import { getContractAt, getDecryptPrivateKeyFromStore, isLogin, getEncryptKeyByAddressFromStore, getConnectedUserAddress } from '@/utils/dashBoardTools';

import { Toast, Dialog} from 'vant'
import { generateEncryptPswByPublicKey, generateCR1ByPublicKey, getDecryptPrivateKey } from '@/utils/relayUtils'

Vue.use(Toast);
Vue.use(Dialog);

export default {
  name: 'addProposal',
  data() {
    return {
      voteList: [
        {address: 'sdsd', status: 'Yes', share: '0.2ETH'},
        {address: 'sdsd', status: 'No', share: '0.2ETH'},
        {address: 'sdsd', status: 'Yes', share: '0.2ETH'}
      ],
      rightBlock1: [
        {name: 'Strategie(s)', value: 'ox6e9s...3244'},
        {name: 'IPFS', value: '#qMBz6cY'},
        {name: 'Voting system', value: 'Single choice voting'},
        {name: 'Start date', value: 'Mar 5,2022,12:00 AM'},
        {name: 'End date', value: 'Mar 5,2022,12:00 AM'},
      ],
      GovernorAlphaRouter,
      agreeLoading: false,
      rejectLoading: false,
      GovernorAlphaContract: '',
      proposalId: this.$route.query.id,
      showLoading: false,

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
    async agreeSubmit() {
      const proposalId = this.$route.query.id
      this.GovernorAlphaContract.castVote(proposalId, true).then(async tx=> {
          console.log(tx)
      }).catch(error => {
          console.log(error)
      })
    },
    rejectSubmit() {},
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
    },
    cancelResultModal() {
      this.showResultModal = false
    },
    confirmResultModal() {
      this.showResultModal = false
    },
    async getProposalInfo() {
      this.GovernorAlphaContract = await getContractAt({ tokenAddress: this.GovernorAlphaRouter, abi: GovernorAlpha.abi }, this)
      console.log(this.GovernorAlphaContract)
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
  },
  created() {
    if (!isLogin()) {
      Toast('Please Login')
      return
    }
    this.isShowPwdModal()
  },
}
</script>
<style lang="scss" scoped>
  @import 'index.scss';
  .el-select-dropdown__item {
    padding: 0 20px !important;
  }
</style>
