<template>
  <div class="main-page home-page">
    <div class="page-wrapper">
      <div class="common-transaction-table">
        <van-search 
          v-model="searchValue" 
          placeholder="Filter by Address" 
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
      headerList: ['STATUS','TX HASH','FROM','TO','BLOCK NUMBER','TIMESTAMP'],
      showLoading: false,
      totalPage: 1,
      currentPage: 1,
      pageSize: 10,
      showNoMore: false,
      searchValue: '',
    }
  },
  methods: {
    searchAllTrasanctionList() {
      this.transactionList = []
      this.showLoading = true;
      this.$store.dispatch('SearchAllTransactionHistory_forHistory', {
        action: 'search_l2',
        page: this.currentPage,
        page_size: this.pageSize,
        from: this.searchValue,
      })
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
        console.log('page bottom');
        if (this.currentPage + 1 > this.totalPage) {
          console.log('no more')
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
      this.searchAllTrasanctionList();
    },
  },
  async mounted() {
    await this.searchAllTrasanctionList();
  },
  created (){
    window.onscroll = _.throttle(this.onScroll)
  }
}
</script>
<style lang="scss" scoped>
  @import 'index';
  @import '@/assets/style/media.scss';
</style>
