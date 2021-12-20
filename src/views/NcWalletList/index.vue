<template>
  <div class="ncWalletList-page">
    <v-navTitle title="NC-Wallet"></v-navTitle >
    <div class="nc-wallet-des">Non-custodial Wallet is the most reliable asset management method. It confirms each transaction by setting up one or more signers to make asset transactions more secure.</div>
    <van-tabs color="#4375f1" title-active-color="#4375f1">
      <van-tab title="I am The Owner" title-style="font-weight: bold">
        <div>
          <v-ownWalletList
          :dataList="ownWalletList"
          :showLoading="showLoading"
          :showNoMore="showNoMore" />
          <v-none v-if="!showLoading && ownWalletList.length==0" />
        </div>
      </van-tab>
      <van-tab title="I am The Signer" title-style="font-weight: bold">
        <div>
          <v-signWalletList
          :dataList="signWalletList"
          :showLoading="showLoading"
          :showNoMore="showNoMore" />
          <v-none v-if="!showLoading && signWalletList.length==0" />
        </div>
        <v-none v-if="!showLoading && signWalletList.length==0" />       
      </van-tab>
    </van-tabs>
    <v-loading v-show="showLoading" />
    <div v-show="_showNoMore" class="no-more">no more</div>
  </div>
</template>

<script>
import Vue from 'vue'
import { Tab, Tabs} from 'vant'
import navTitle from '@/components/NavTitle/index'
import ownWalletList from './ownWalletList/index'
import signWalletList from './signWalletList/index'
import None from '@/components/None/index'
import Loading from '@/components/Loading'

Vue.use(Tab);
Vue.use(Tabs);

export default {
  name: 'NC-Wallet',
  data() {
    return {
      tabActive: 0,
      ownWalletList: [{
        CreateTime:1,
        WalletName: 2,
        Balance: 3,
        Address: 4,
        signer: 5
      }],
      signWalletList: [{
        CreateTime:1,
        WalletName: 2,
        Balance: 3,
        Address: 4,
        signer: 5
      }],
      
      showLoading: false,
      showNoMore: false,
    }
  },
  components: {
    "v-navTitle": navTitle,
    "v-ownWalletList": ownWalletList,
    "v-signWalletList": signWalletList,
    'v-none': None,
    'v-loading': Loading,
  },
  computed: {
    _showNoMore() {
      return this.showNoMore && this.ownWalletList.length > 0
    },
  },
  methods: {
    
  },
  created() {
    
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