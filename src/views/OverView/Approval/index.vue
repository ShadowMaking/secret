<template>
  <div class="approval-box">
    <div class="tag-list">
      <span 
      v-for="(item, index) in netWorkList"
      :key="index"
      :class="['tag-item', defaultNetWork == item.id ? 'active' : '']"
      @click="changetTag(item.id)"
      >{{item.chainName}}</span>
    </div>
    <div class="approval-list">
      <el-row class="list-header">
        <el-col :span="4" class="list-header-item">Approved Time</el-col>
        <el-col :span="4" class="list-header-item">Token</el-col>
        <el-col :span="4" class="list-header-item">Allowance</el-col>
        <el-col :span="12" class="list-header-item">Contract</el-col>
      </el-row>
      <el-row 
        class="list-content" 
        v-for="(item, index) in approvalList"
        :key="index">
        <el-col :span="4" class="list-item">{{item.approvalTime}}</el-col>
        <el-col :span="4" class="list-item">{{item.token}}</el-col>
        <el-col :span="4" class="list-item">{{item.allowance}}</el-col>
        <el-col :span="12" class="list-item item-contract">
          <div class="item-con-left">
            <div class="item-icon"><img src="@/assets/token/tokenImages/defaultToken.png"></div>
            <div class="item-left-con">
              <h3>{{item.tokenName}}</h3>
              <p>{{item.tokenAddress}}</p>
            </div>
          </div>
          <div class="item-con-right"><a @click="declineSubmit">Decline</a></div>
        </el-col>
      </el-row>
      <v-loading v-show="showLoading"/>
      <v-none v-if="!showLoading && approvalList.length==0"/>
    </div>
  </div>
</template>
<script>
import Vue from 'vue'
import web3 from 'web3'
import { getFromStorage } from '@/utils/storage'
import { NETWORKSFORTOKEN } from '@/utils/netWorkForToken'
import None from '@/components/None/index'
import Loading from '@/components/Loading'

export default {
  name: 'Home',
  data() {
    return {
      approvalList: [],
      netWorkList: _.cloneDeep(NETWORKSFORTOKEN),
      defaultNetWork: 1,
      showLoading: true,
    }
  },
  components: {
    'v-none': None,
    'v-loading': Loading,
  },
  methods: {
    changetTag(id) {
      this.defaultNetWork = id
    },
    declineSubmit(item) {
      console.log(item)
    },
    async getApprovalList() {
      const userId = getFromStorage('gUID')
      if (!userId) {
        console.log('can detect userID after third login') 
        return
      }
      const selectedConnectAddress = window.ethereum.selectedAddress;
      if (!selectedConnectAddress) {
        return
      }
      const data = await this.$store.dispatch('QueryApprovalList', {network_id: this.defaultNetWork, user_address: selectedConnectAddress, userId });
      if (data) {
        this.showLoading = false
        this.approvalList = data
      }
    }
  },
  created (){
    this.netWorkList = _.cloneDeep(NETWORKSFORTOKEN)
    window.ethereum && (this.defaultNetWork = web3.utils.hexToNumber(window.ethereum.chainId))
    this.getApprovalList()
  }
}
</script>
<style lang="scss" scoped>
  @import 'index';
  @import '@/assets/style/media.scss';
</style>
