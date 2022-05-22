<template>
  <div class="proposal-list-page">
    <v-navTitle title="Proposals" helpUrl="docs/usage/Send"></v-navTitle >
    <div class="proposal-list-content">
      <van-tabs color="#4375f1" title-active-color="#4375f1" @click="onTabClick">
        <van-tab title="All" title-style="font-weight: bold;"></van-tab>
        <van-tab title="Active" title-style="font-weight: bold;"></van-tab>
        <van-tab title="Pending" title-style="font-weight: bold;"></van-tab>
        <van-tab title="Closed" title-style="font-weight: bold;"></van-tab>
      </van-tabs>
      <div class="proposal-list">
        <div class="proposal-item" v-for="(item, index) in dataList" :key="index" @click="goDetail(item)">
          <div class="proposal-item-top">
            <div class="proposal-item-top-left">
              <span>By</span>
              <img src="~@/assets/help.png" class="proposal-user-image">
              <span v-if="item.args.proposer!==''">{{ `${item.args.proposer.slice(0,10)}...${item.args.proposer.slice(-4)}` }}</span>
            </div>
            <div class="proposal-item-top-right">
              <el-tag type="warn" v-if="item.status == 0">Pending</el-tag>
              <el-tag type="success" v-else-if="item.status == 1">Active</el-tag>
              <el-tag v-else-if="item.status == 2">Closed</el-tag>
            </div>
          </div>
          <!-- <div class="proposal-item-name">{{item.args.calldatas[0]}}</div> -->
          <div class="proposal-item-des">{{item.args.description}}</div>
        </div>
        <!-- <div class="proposal-pages">
          <el-pagination
            background
            layout="prev, pager, next"
            :total="1000">
          </el-pagination>
        </div> -->
        <div class="no-data-container" v-if="!showLoading && dataList.length==0">
          <v-none />
        </div>
        <v-loading v-show="showLoading" />
      </div>
      <v-inputPsw :show="showInputPswModal" @cancel="showInputPswModal=false" @ok="confirmPswOk" :btnLoading="confirmPswBtnLoading" />
    </div>
  </div>
</template>
<script>
import Vue from 'vue';
import _ from 'lodash';
import { ethers } from 'ethers'
import web3 from 'web3'

import navTitle from '@/components/NavTitle/index'
import Loading from '@/components/Loading'
import None from '@/components/None/index'
import InputPswModal from '@/components/InputPswModal'

import { Toast, Dialog, Tab, Tabs} from 'vant'
import { installWeb3WalletMetamask } from '@/utils/web3'
import { saveToStorage, getFromStorage, getInfoFromStorageByKey } from '@/utils/storage';
import { getContractAt,  getDecryptPrivateKeyFromStore, isLogin, getEncryptKeyByAddressFromStore, getConnectedNet, initRPCProvider, getConnectedUserAddress } from '@/utils/dashBoardTools';
import { generateEncryptPswByPublicKey, generateCR1ByPublicKey, getDecryptPrivateKey } from '@/utils/relayUtils'

import GovernorAlpha from "@/assets/contractJSON/GovernorAlpha.json";
import { GovernorAlphaRouter } from '@/utils/global';

Vue.use(Toast);
Vue.use(Dialog);
Vue.use(Tab);
Vue.use(Tabs);

export default {
  name: 'proposalList',
  data() {
    return {
      dataList: [],
      allDataList: [],
      GovernorAlphaRouter,
      showLoading: true,
      proposalStatus: 0,//0-pengding 1-active 2-closed

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
    'v-loading': Loading,
    'v-none': None,
    'v-inputPsw': InputPswModal,
  },
  
  methods: {
    onTabClick(index) {
      this.showLoading = false
      this.dataList = []
      switch(index) {
        case 0:
          this.dataList = this.allDataList
          break;
        case 1:
          this.fiterProposal(1)
          break;
        case 2:
          this.fiterProposal(0)
          break;
        case 3:
          this.fiterProposal(2)
          break;
        default:
          break;
      }
    },
    fiterProposal(status) {
      let fiterProposal = this.allDataList.filter((item, index)=>{
        return item.status == status
      })
      this.dataList = fiterProposal
    },
    goDetail(param) {
      saveToStorage({'proposalItem': param})
      const id = web3.utils.hexToNumberString(param.args.id)
      this.$router.push({
        path: `/proposalDetail`,
        query: {id: id},
      })
    },
    async getProposalList() {
      const network = getConnectedNet()
      const rpcUrl = network['rpcUrls'][0]
      const currentProvider = initRPCProvider(rpcUrl)
      const latestBlock = await currentProvider.getBlock('latest')
      const blockRange = [0, latestBlock.number]
      console.log(blockRange)
      const GovernorAlphaContract = await getContractAt({ tokenAddress: this.GovernorAlphaRouter, abi: GovernorAlpha.abi }, this)
      const proposalList = await GovernorAlphaContract.queryFilter(
                    GovernorAlphaContract.filters.ProposalCreated(),
                    ...blockRange
                )
      this.dataList = proposalList
      this.showLoading = false
      for(let i=0; i<proposalList.length;i+=1) {
        const proposalStatus = await GovernorAlphaContract.state(proposalList[i].args.id)
        this.$set(proposalList[i], 'status', proposalStatus)
      }
      this.dataList = proposalList
      this.allDataList = proposalList
      console.log(this.dataList)
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
      await this.getProposalList()
    },
    async isShowPwdModal() {
      // check privateKey whether is existed
      const privateKey = await getDecryptPrivateKeyFromStore(this)
      if (!privateKey) {
        this.showInputPswModal = true;
        return
      }
      await this.getProposalList()
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
  ::v-deep .van-tabs__nav--line {
    width: 300px;
  }
</style>
