<template>
  <div class="proposal-list-page">
    <v-navTitle title="Proposals" helpUrl="docs/usage/Send"></v-navTitle >
    <div class="proposal-list-content">
      <van-tabs color="#4375f1" title-active-color="#4375f1">
        <van-tab title="All" title-style="font-weight: bold;"></van-tab>
        <van-tab title="Active" title-style="font-weight: bold;"></van-tab>
        <van-tab title="Pending" title-style="font-weight: bold;"></van-tab>
        <van-tab title="Closed" title-style="font-weight: bold;"></van-tab>
      </van-tabs>
      <div class="proposal-list">
        <div class="proposal-item" v-for="(item, index) in dataList" :key="index" @click="goDetail(item.args.id)">
          <div class="proposal-item-top">
            <div class="proposal-item-top-left">
              <span>By</span>
              <img src="~@/assets/help.png" class="proposal-user-image">
              <span v-if="item.args.proposer!==''">{{ `${item.args.proposer.slice(0,10)}...${item.args.proposer.slice(-4)}` }}</span>
            </div>
            <div class="proposal-item-top-right">
              <el-tag type="warn" v-if="item.status == 0">Pending</el-tag>
              <el-tag type="success" v-else-if="item.status == 1">Active</el-tag>
              <el-tag v-else>Closed</el-tag>
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
      </div>
    </div>
  </div>
</template>
<script>
import Vue from 'vue';
import _ from 'lodash';
import { ethers } from 'ethers'
import navTitle from '@/components/NavTitle/index'
import { Toast, Dialog, Tab, Tabs} from 'vant'
import { installWeb3WalletMetamask } from '@/utils/web3'
import { saveToStorage, getFromStorage } from '@/utils/storage';
import { getContractAt,  getDecryptPrivateKeyFromStore, isLogin, getEncryptKeyByAddressFromStore, getConnectedNet, initRPCProvider } from '@/utils/dashBoardTools';

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
      GovernorAlphaRouter,
    }
  },
  components: {
    "v-navTitle": navTitle,
  },
  
  methods: {
    goDetail(id) {
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
      for(let i=0; i<proposalList.length;i+=1) {
        const proposalStatus = await GovernorAlphaContract.state(proposalList[i].args.id)
        this.$set(proposalList[i], 'status', proposalStatus)
      }
      this.dataList = proposalList
      console.log(this.dataList)
    },
  },
  created() {
    if (!isLogin()) {
      Toast('Please Login')
      return
    }
    this.getProposalList()
  },
}
</script>
<style lang="scss" scoped>
  @import 'index.scss';
  ::v-deep .van-tabs__nav--line {
    width: 300px;
  }
</style>
