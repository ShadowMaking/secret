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
  </div>
</template>
<script>
import Vue from 'vue';
import _ from 'lodash';
import { ethers } from 'ethers'
import navTitle from '@/components/NavTitle/index'
import { Toast, Dialog} from 'vant'

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
    }
  },
  components: {
    "v-navTitle": navTitle,
  },
  
  methods: {
    addSubmit() {},
    formatProgress(percentage) {
      return '';
    },
  },
  created() {
    
  },
}
</script>
<style lang="scss" scoped>
  @import 'index.scss';
  .el-select-dropdown__item {
    padding: 0 20px !important;
  }
</style>
