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
        <div class="proposal-vote-list">
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
             <el-col :span="8" class="list-item">{{item.address}}</el-col>
             <el-col :span="8" class="list-item">{{item.status}}</el-col>
             <el-col :span="8" class="list-item">{{item.share}}</el-col>
          </el-row>
        </div>
      </div>
      <div class="proposal-detail-right"></div>
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
        {address: 'sdsd', status: 'Yes', share: '0.2ETH'}
      ]
    }
  },
  components: {
    "v-navTitle": navTitle,
  },
  
  methods: {
    addSubmit() {},
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
