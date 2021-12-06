<template>
  <div class="main-page home-page">
    <div class="page-wrapper">
      <div class="common-transaction-table">
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
import { Search } from 'vant';
import { generateTransactionList } from '@/utils/index';
import TransactionList from '@/components/TransactionList/TransactionList';

Vue.use(Search);

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
      headerList: ['STATUS','TX HASH','FROM','TO','BLOCK NUMBER','TIMESTAMP','OPERATION'],
      showLoading: false,
      totalPage: 1,
      currentPage: 1,
      pageSize: 10,
      showNoMore: false,
      searchValue: '',
      isSearch: false,
      defaultNetWork: 1,
    }
  },
  methods: {
    searchAllTrasanctionList() {
      if(!this.connectedWallet()) { return }
      this.showLoading = true
      const selectedConnectAddress = window.ethereum.selectedAddress
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
      this.searchAllTrasanctionList()
    },
    connectedWallet() {
      const chainId = window.ethereum && window.ethereum.chainId;
      const userAddress = window.ethereum && window.ethereum.selectedAddress;
      if (!chainId || !userAddress) {
        console.log('Need Connect Wallet')
        return false
      }
      return true
    },
  },
  created (){
    // window.onscroll = _.throttle(this.onScroll)
    window.addEventListener('scroll', this.onScroll, true)
    window.ethereum && (this.defaultNetWork = web3.utils.hexToNumber(window.ethereum.chainId))
    this.searchAllTrasanctionList()
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
