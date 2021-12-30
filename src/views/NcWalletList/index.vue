<template>
  <div class="ncWalletList-page">
    <v-navTitle title="NC-Wallet"></v-navTitle >
    <div class="nc-wallet-des">Non-custodial Wallet is the most reliable asset management method. It confirms each transaction by setting up one or more signers to make asset transactions more secure.</div>
    <van-tabs color="#4375f1" title-active-color="#4375f1">
      <van-tab title="I am The Owner" title-style="font-weight: bold">
        <div>
          <v-ownWalletList
          :dataList="ownWalletList"
           />
        </div>
        <v-none v-if="!ownShowLoading && ownWalletList.length==0" />
        <v-loading v-show="ownShowLoading" />
      </van-tab>
      <van-tab title="I am The Signer" title-style="font-weight: bold">
        <div>
          <v-signWalletList
          :dataList="signWalletList"
          @signChild="getWalletAsSigner"
           />
        </div>
        <v-none v-if="!signShowLoading && signWalletList.length==0" />
        <v-loading v-show="signShowLoading" />
      </van-tab>
    </van-tabs>
  </div>
</template>

<script>
import Vue from 'vue'
import { Tab, Tabs, Toast} from 'vant'
import { ethers } from 'ethers'
import navTitle from '@/components/NavTitle/index'
import ownWalletList from './ownWalletList/index'
import signWalletList from './signWalletList/index'
import None from '@/components/None/index'
import Loading from '@/components/Loading'
import { getFromStorage } from '@/utils/storage'
import {  isLogin, getBalanceByAddress, getConnectedAddress } from '@/utils/dashBoardTools';
import { signerStatus } from '@/utils/global';

Vue.use(Tab);
Vue.use(Tabs);
Vue.use(Toast);

export default {
  name: 'NC-Wallet',
  data() {
    return {
      signerStatus,
      tabActive: 0,
      ownWalletList: [],
      signWalletList: [],
      
      ownShowLoading: true,
      signShowLoading: true,
      
      userId: getFromStorage('gUID'),
    }
  },
  components: {
    "v-navTitle": navTitle,
    "v-ownWalletList": ownWalletList,
    "v-signWalletList": signWalletList,
    'v-none': None,
    'v-loading': Loading,
  },
  
  methods: {
    async getWalletAsOwner() {
      let data = {
        userId: this.userId
      }
      const { hasError, list } = await this.$store.dispatch('getWalletList', data)
      
      for(let i=0; i<list.length;i+=1) {
        let itemBalance = await this.getBalance(list[i].wallet_address)
        list[i]['balance'] = itemBalance
      }
      this.ownWalletList = list
      if (hasError) {
        this.ownShowLoading = true
      } else {
        this.ownShowLoading = false
      }
    },
    async getWalletAsSigner() {
      let data = {
        userId: this.userId,
        address: getConnectedAddress()
      }
      const { hasError, list } = await this.$store.dispatch('getWalletListAsSign', data)
      let newList = list.filter((item, index)=>{
          return item.status !== this.signerStatus['rejected']
      });
      this.signWalletList = newList
      if (hasError) {
        this.signShowLoading = true
      } else {
        this.signShowLoading = false
      }
    },
    async getBalance(address) {
      const balanceString = await getBalanceByAddress(address)
      return balanceString
    },
  },
  created() {
    if (!isLogin()) {
      Toast('Need Login')
      return
    }
    this.getWalletAsOwner()
    this.getWalletAsSigner()

  },
};
</script>
<style lang="scss" scoped>
  @import "index";
  ::v-deep .van-tabs__nav--line {
    width: 250px;
  }
  ::v-deep .van-tabs__line {
    width: 100px;
  }
</style>