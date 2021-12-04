<template>
  <div class="overview-page">
    <v-navTitle title="OverView"></v-navTitle >
    <van-tabs v-model="tabActive" color="#4375f1" title-active-color="#4375f1">
      <van-tab title="Home" title-style="font-weight: bold">
        <div class="home-page">
          <v-trendLine :sourceData="chartSourceData"/>
          <div class="home-assets">
            <h3>All Assets</h3>
            <div class="select-item" v-for="(item, index) in assetsData" :key="index">
              <div class="select-left">
                <div class="select-left-icon">
                  <img :src="item.icon">
                </div>
                <div class="select-left-text">
                  <h3 class="select-left-title">{{item.tokenName}}</h3>
                  <!-- <p class="select-left-value">{{item.balance}}ETH</p> -->
                </div>
              </div>
              <div class="select-price-right">
                <h3>{{ item.balanceNumberString|showAvailableBalance }}</h3>
                <!--<p class="select-right-des" v-if="ethPercentage > 0" style="color: #00965e">+{{ethPercentage|showAvailableBalance}}%(${{item.label|showAvailableBalance}})</p>
                <p class="select-right-des" v-else>{{ethPercentage|showAvailableBalance}}%{{item.label|showAvailableBalance}}</p> -->
              </div>
            </div>
            <v-loading v-show="showLoading"/>
            <v-none v-if="!showLoading && assetsData.length==0"/>
          </div>
        </div>
      </van-tab>
      <van-tab title="History" title-style="font-weight: bold">
        <v-history></v-history>
      </van-tab>
      <van-tab title="Approval" title-style="font-weight: bold">
        <div class="approval-box">
          <div class="tag-list">
            <span 
            v-for="(item, index) in tagList"
            :key="index"
            :class="['tag-item', index == activeTagKey ? 'active' : '']"
            @click="changetTag(index)"
            >{{item}}</span>
          </div>
          <div class="approval-list">
            <el-row class="list-header">
              <el-col :span="4" class="list-header-item">Approved Time</el-col>
              <el-col :span="4" class="list-header-item">Token</el-col>
              <el-col :span="4" class="list-header-item">Allowance</el-col>
              <el-col :span="12" class="list-header-item">Contract</el-col>
            </el-row>
            <el-row class="list-content">
              <el-col :span="4" class="list-item">2017-07-08 11:17</el-col>
              <el-col :span="4" class="list-item">ZKS</el-col>
              <el-col :span="4" class="list-item">671</el-col>
              <el-col :span="12" class="list-item item-contract">
                <div class="item-con-left">
                  <div class="item-icon"><img src="@/assets/token/tokenImages/defaultToken.png"></div>
                  <div class="item-left-con">
                    <h3>ZKSwap</h3>
                    <p>0xjjkdk0xjjkdkf0xj</p>
                  </div>
                </div>
                <div class="item-con-right"><a @click="DeclineSubmit">Decline</a></div>
              </el-col>
            </el-row>
          </div>
        </div>
        
        
      </van-tab>
    </van-tabs>
  </div>
</template>

<script>
import Vue from 'vue'
import { Icon, Popup, Tab, Tabs } from 'vant'
import navTitle from '@/components/NavTitle/index'
import history from '../History/index'
import TrendLine from '@/components/TrendLine'
import * as ethers from 'ethers'
import { retainDecimals } from '@/utils/number'
import { ethRPC } from '@/utils/netWork'
import { getDefaultAddress } from '@/utils/auth'
import { generateTokenList, getDefaultETHAssets } from '@/utils/dashBoardTools'
import web3 from 'web3'
import None from '@/components/None/index'
import Loading from '@/components/Loading'
import { getTokenUs, getTokenAmountByUs } from '@/utils/coinGecko'

Vue.use(Icon);
Vue.use(Popup);
Vue.use(Tab);
Vue.use(Tabs);
//0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266
export default {
  name: 'OverView',
  data() {
    return {
      tabActive: 0,
      chartSourceData: [{
        time: '2021-01-01 00:00:00',
        value: 11
      },{
        time: '2021-01-01 00:01:00',
        value: 110
      }],
      assetsData: [],
      ethUsdt: '',
      ethPercentage: '',
      ethChange: '',
      address: getDefaultAddress(this.$store),
      fetchTicker: '',
      showLoading: true,
      currentChainInfo: null,
      activeTagKey: 0,
      tagList: ['Ethereun', 'BSC']
    }
  },
  components: {
    "v-navTitle": navTitle,
    "v-history": history,
    "v-trendLine": TrendLine,
    'v-none': None,
    'v-loading': Loading,
  },
  filters: {
    showAvailableBalance(amount) {
      if (!isNaN(amount)) {
        return retainDecimals(amount, 6)
      }
      return amount
    }
  },
  watch: {
    '$store.state.metamask.accountsArr': function (res) {
      this.address = res.length&&res[0] || ''
      this.initGthers()
    },
    'fetchTicker': function(res) {
      // this.timer()
    },
  },
  methods: {
    changetTag(index) {
      this.activeTagKey = index
    },
    DeclineSubmit() {
      console.log('de')
    },
    timer() {
      return setTimeout(()=>{
        this.getExchange()
      },5000)
    },
    //0x32E6C34Cd57087aBBD59B5A4AECC4cB495924356 BTBS
    //0x3fa400483487A489EC9b1dB29C4129063EEC4654 KEK
    async getExchange() {
      let fromTokenUs = await getTokenUs('0x32E6C34Cd57087aBBD59B5A4AECC4cB495924356', 2)
      console.log(fromTokenUs)
      let toTokenAmount = await getTokenAmountByUs('0x32E6C34Cd57087aBBD59B5A4AECC4cB495924356', 1.2427)
      console.log(toTokenAmount)
      // let to = await this.initGthers();
    },
    
    async initGthers() {
      const selectedConnectAddress = window.ethereum.selectedAddress;
      if (!selectedConnectAddress) {
        this.assetsData = []
        return
      }
      const ETHAssets = await getDefaultETHAssets(this);
      const tokenListRes = await this.$store.dispatch('GetAvailableTokenAssets', { selectedConnectAddress, chainInfo: this.currentChainInfo });
      const { hasError, list } = tokenListRes
      const tokenList = await generateTokenList(_.cloneDeep(list), this, true)
      tokenList.filter(item => {
         return item.icon = require("@/assets/token/tokenImages/defaultToken.png")
      })
      this.assetsData = [].concat([ETHAssets], tokenList)
      console.log(this.assetsData)
      this.showLoading = false


      // let ethData = {
      //   name: ETHAssets.tokenName,
      //   icon: ETHAssets.icon,
      //   balance: balanceString,
      //   amount: (this.ethUsdt * balanceString),
      //   label: (this.ethChange * balanceString),
      // }
      // this.assetsData = []
      // this.assetsData.push(ethData)
      
    },
  },
  created() {
    // this.timer();
    this.getExchange()
  },
  destroyed() {
    clearTimeout(this.timer)
  },
};
</script>
<style lang="scss" scoped>
  @import "index";
  ::v-deep .van-tabs__nav--line {
    width: 200px;
  }
</style>