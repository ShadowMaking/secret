<template>
  <div class="main-page home-page">
    <div class="page-wrapper">
      <div class="common-transaction-table">
        <div class="nc-tag">
          <span :class="[isNc && 'active']" @click="selectNC">NC-Wallet</span>
        </div>
        <van-search 
          v-model="searchValue" 
          placeholder="Filter by TX HASH" 
          @input="searchChange"
          style="width: 50%;margin-left: -12px;background-color: #e6e7e9"/>
        <v-list
          key="home-list"
          :headerList="headerList"
          :transactionList="transactionList"
          :showLoading="showLoading"
          :showNoMore="showNoMore" />
      </div>
    </div>
  </div>
</template>
<script>
import Vue from 'vue';
import web3 from 'web3';
import _ from 'lodash';
import { Search, Toast } from 'vant';
import { generateTransactionList } from '@/utils/index';
import TransactionList from '@/components/TransactionList/TransactionList';
import { getConnectedAddress, isLogin } from '@/utils/dashBoardTools';
import { getInfoFromStorageByKey } from '@/utils/storage';
import { CHAINMAP } from '@/utils/netWorkForToken';

Vue.use(Search);
Vue.use(Toast);

export default {
  name: 'Home',
  components: {
    'v-list': TransactionList,
  },
  data() {
    return {
      loadingL2Info: true,
      transactionList: [],
      chainInfoData: [],
      headerList: ['STATUS','OPERATION','TX HASH','FROM','TO','BLOCK NUMBER','TIMESTAMP'],
      showLoading: false,
      totalPage: 1,
      currentPage: 1,
      pageSize: 10,
      showNoMore: false,
      searchValue: '',
      isSearch: false,
      currentChainInfo: null,

      isNc: false,
    }
  },
  computed: {
    defaultNetWork() {
      const info = getInfoFromStorageByKey('netInfo')
      return info && info['id'] || 1
    },
  },
  methods: {
    selectNC() {
      this.isNc = !(this.isNc)
    },
    searchAllTrasanctionList() {
      if(!this.connectedWallet()) { return }
      this.showLoading = true

      const selectedConnectAddress = getConnectedAddress()

      let searchParam = {
        action: 'search_both_sides',//search_l2
        page: this.currentPage,
        page_size: this.pageSize,
        address: selectedConnectAddress,
        txid: this.searchValue,
        network_id: this.defaultNetWork,
      }
      this.getTrasanctionList(searchParam)
    },
    getTrasanctionList (searchParam) {
      this.$store.dispatch('SearchAllTransactionHistory_forHistory', searchParam)
      .then(async result => {
        const { hasError, list=[], totalPage=1 } = result;
        this.showLoading = false;
        this.totalPage = totalPage;
        this.transactionList = [].concat(this.transactionList, generateTransactionList(_.cloneDeep(list)));
      })
    },
    onScroll() {
      let scrollTop = document.documentElement.scrollTop||document.body.scrollTop;
      let windowHeight = document.documentElement.clientHeight || document.body.clientHeight;
      let scrollHeight = document.documentElement.scrollHeight || document.body.scrollHeight;
      if( scrollTop + windowHeight == scrollHeight ){
        if (this.currentPage + 1 > this.totalPage) {
          this.showNoMore = true;
          return
        }
        this.currentPage += 1;
        window.setTimeout(()=>{
          this.searchAllTrasanctionList();
        },800)
      }
    },
    searchChange() {
      this.isSearch = true
      this.transactionList = []
      this.currentPage = 1
      this.searchAllTrasanctionList()
    },
    connectedWallet() {
      const chainId = this.currentChainInfo && this.currentChainInfo['id']
      const selectedConnectAddress = getConnectedAddress()
      console.log(chainId)
      console.log(selectedConnectAddress)
      if (!chainId || !selectedConnectAddress) {
        Toast('Need Connect Wallet')
        return false
      }
      return true
    },
  },
  async created (){
    // window.onscroll = _.throttle(this.onScroll)
    window.addEventListener('scroll', this.onScroll, true)
    const { data: netInfo } = await this.$store.dispatch('GetSelectedNetwork')
    if (netInfo) {
      this.currentChainInfo = CHAINMAP[web3.utils.numberToHex(netInfo['id'])]
    } else {
      this.currentChainInfo = CHAINMAP[web3.utils.numberToHex(this.defaultNetWork)]
    }
    this.searchAllTrasanctionList()
  },
  mounted() {
    if (!isLogin()) {
      Toast('Need Login')
      return
    }
  },
  beforeDestroy() {
    window.removeEventListener("scroll", this.onScroll, true);
  },
}
</script>
<style lang="scss" scoped>
  @import 'index';
  @import '@/assets/style/media.scss';
</style>
