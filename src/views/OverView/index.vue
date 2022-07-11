<template>
  <div class="overview-page">
    <v-navTitle title="Overview" helpUrl="docs/usage/Overview"></v-navTitle >
    <!-- <van-tabs v-model="tabActive" color="#4375f1" title-active-color="#4375f1"> -->
      <!-- <van-tab title="Home" title-style="font-weight: bold"> -->
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
      <!-- </van-tab> -->
      <!-- <van-tab title="History" title-style="font-weight: bold">
        <v-history></v-history>
      </van-tab>
      <van-tab title="Approval" title-style="font-weight: bold">
        <v-approval></v-approval>        
      </van-tab> -->
    <!-- </van-tabs> -->
  </div>
</template>

<script>
import Vue from 'vue'
import { Icon, Popup, Tab, Tabs, Toast } from 'vant'
import navTitle from '@/components/NavTitle/index'
// import history from '../History/index'
import TrendLine from '@/components/TrendLine'
import * as ethers from 'ethers'
import { retainDecimals } from '@/utils/number'
import { ethRPC } from '@/utils/netWork'
import { CHAINMAP } from '@/utils/netWorkForToken'
import { generateTokenList, getDefaultETHAssets, getConnectedNet, getConnectedAddress } from '@/utils/dashBoardTools';
import web3 from 'web3'
import None from '@/components/None/index'
import Loading from '@/components/Loading'
// import Approval from './Approval/index'


Vue.use(Toast)
Vue.use(Icon);
Vue.use(Popup);
Vue.use(Tab);
Vue.use(Tabs);
//0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266
export default {
  name: 'OverView',
  data() {
    return {
      tabActive: this.$route.query.tabActive ? Number(this.$route.query.tabActive) : 0,
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
      fetchTicker: '',
      showLoading: true,
      currentChainInfo: null,
    }
  },
  components: {
    "v-navTitle": navTitle,
    // "v-history": history,
    "v-trendLine": TrendLine,
    'v-none': None,
    'v-loading': Loading,
    // 'v-approval': Approval,
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
    
  },
  methods: {
    // timer() {
    //   return setTimeout(()=>{
    //     this.initGthers()
    //   },5000)
    // },
    
    async initGthers() {
      if(!this.connectedWallet()) { return }
      const selectedConnectAddress = getConnectedAddress()
      if (!selectedConnectAddress) {
        this.assetsData = []
        return
      }
      const connectedNetInfo = getConnectedNet()

      const currentChainId = connectedNetInfo && connectedNetInfo['id']
      const hexChainId = currentChainId && web3.utils.numberToHex(currentChainId)
      const rpcUrl = hexChainId && CHAINMAP[hexChainId]['rpcUrls'][0]
      const ETHAssets = await getDefaultETHAssets(this, rpcUrl);
      const tokenListRes = await this.$store.dispatch('GetAvailableTokenAssets', { selectedConnectAddress, chainInfo: connectedNetInfo });
      const { hasError, list } = tokenListRes
      const tokenList = await generateTokenList(_.cloneDeep(list), this, true)
      // tokenList.filter(item => {
      //    return item.icon = require("@/assets/" + item.icon)
      // })
      const layer2Assets = await this.getLayer2Assets()
      this.assetsData = [].concat(layer2Assets, [ETHAssets], tokenList)
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
    async getLayer2Assets() {
      const userAddress = getConnectedAddress()
      const { hasError, data} = await this.$store.dispatch('getZkzruAccountInfo', userAddress)
      const lay2Item = data && data[0] || {}
      const lay2BalanceEth = await this.getlay2BalanceEth(lay2Item)
      lay2Item.balanceNumberString = lay2BalanceEth
      lay2Item.tokenName = 'layer2'
      lay2Item.icon = 'https://s3.amazonaws.com/token-icons/eth.png'
      console.log(lay2Item)
      return lay2Item
    },
    getlay2BalanceEth(lay2Item) {
      let banlanceEth = 0
      if (lay2Item && lay2Item.balance) {
        const amountWei = web3.utils.toWei(lay2Item.balance, 'gwei')
        banlanceEth = web3.utils.fromWei(amountWei, 'ether')//value: aomuntGwei
      }
      return banlanceEth
    },
    connectedWallet() {
      const userAddress = getConnectedAddress()
      const connectedNetInfo = getConnectedNet()
      const chainId = connectedNetInfo && web3.utils.numberToHex(connectedNetInfo.id)
      if (!chainId || !userAddress) {
        Toast('Please Login')
        return false
      }
      return true
    },
    async handleAccountChange(addressInfo) {
      this.showLoading = true;
      this.assetsData = []
      await this.initGthers()
      this.showLoading = false;
    },
  },
  created() {
    // this.timer();
    this.initGthers()
    this.$eventBus.$on('disconnect', this.handleAccountChange);
    this.$eventBus.$on('changeAccout', this.handleAccountChange)
    this.$eventBus.$on('networkChange', this.handleAccountChange)
  },
  // destroyed() {
  //   clearTimeout(this.timer)
  // },
};
</script>
<style lang="scss" scoped>
  @import "index";
  ::v-deep .van-tabs__nav--line {
    width: 250px;
  }
</style>