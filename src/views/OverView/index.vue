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
                  <h3 class="select-left-title">{{item.name}}</h3>
                  <p class="select-left-value">{{item.balance}}ETH</p>
                </div>
              </div>
              <div class="select-price-right">
                <h3>${{ item.amount|showAvailableBalance }}</h3>
                <p class="select-right-des" v-if="ethPercentage > 0" style="color: #00965e">+{{ethPercentage|showAvailableBalance}}%(${{item.label|showAvailableBalance}})</p>
                <p class="select-right-des" v-else>{{ethPercentage|showAvailableBalance}}%{{item.label|showAvailableBalance}}</p>
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
    </van-tabs>
  </div>
</template>

<script>
import Vue from 'vue';
import { Icon, Popup, Tab, Tabs } from 'vant';
import navTitle from '@/components/NavTitle/index';
import history from '../History/index';
import TrendLine from '@/components/TrendLine';
import { transTickerObject } from '@/utils/ccxt';
import * as ethers from 'ethers'
import { retainDecimals } from '@/utils/number'
import { ethRPC } from '@/utils/netWork'
import { getDefaultAddress } from '@/utils/auth'
import { generateTokenList, getDefaultETHAssets } from '@/utils/dashBoardTools';
import web3 from 'web3'
import None from '@/components/None/index';
import Loading from '@/components/Loading';

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
    timer() {
      return setTimeout(()=>{
        this.getExchange()
      },5000)
    },
    async getExchange() {
      this.fetchTicker = await transTickerObject()
      this.ethUsdt = this.fetchTicker.close;
      this.ethPercentage = this.fetchTicker.percentage;
      this.ethChange = this.fetchTicker.change;
      this.initGthers();
    },
    
    async initGthers() {
      const ETHAssets = await getDefaultETHAssets(this);
      let balanceString = ethers.utils.formatEther(ETHAssets.balance);
      let ethData = {
        name: ETHAssets.tokenName,
        icon: ETHAssets.icon,
        balance: balanceString,
        amount: (this.ethUsdt * balanceString),
        label: (this.ethChange * balanceString),
      }
      this.assetsData = []
      this.assetsData.push(ethData)
      this.showLoading = false
    },
  },
  created() {
    this.timer();
    this.getExchange();
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