<template>
  <div class="proposal-list-page">
    <v-navTitle title="Proposals" helpUrl="docs/usage/Send"></v-navTitle >
    <div class="proposal-list-content">
      <van-tabs color="#4375f1" title-active-color="#4375f1">
        <van-tab title="All" title-style="font-weight: bold;"></van-tab>
        <van-tab title="Active" title-style="font-weight: bold;"></van-tab>
        <van-tab title="Pending" title-style="font-weight: bold;"></van-tab>
        <van-tab title="Closed" title-style="font-weight: bold;"></van-tab>
      </van-tabs>
      <div class="proposal-list">
        <div class="proposal-item" v-for="(item, index) in dataList" :key="index" @click="goDetail(item.id)">
          <div class="proposal-item-top">
            <div class="proposal-item-top-left">
              <span>By</span>
              <img src="~@/assets/help.png" class="proposal-user-image">
              <span>ox6e8d---33</span>
            </div>
            <div class="proposal-item-top-right">
              <el-tag type="success" v-if="item.status == 0">标签二</el-tag>
              <el-tag type="warning" v-else-if="item.status == 1">标签二</el-tag>
              <el-tag v-else>标签二</el-tag>
            </div>
          </div>
          <div class="proposal-item-name">{{item.title}}</div>
          <div class="proposal-item-des">this id the datasets contains this id the datasets containsthis id the datasets containsthis id the datasets contains</div>
        </div>
        <div class="proposal-pages">
          <el-pagination
            background
            layout="prev, pager, next"
            :total="1000">
          </el-pagination>
        </div>
      </div>
    </div>
  </div>
</template>
<script>
import Vue from 'vue';
import _ from 'lodash';
import { ethers } from 'ethers'
import navTitle from '@/components/NavTitle/index'
import { Toast, Dialog, Tab, Tabs} from 'vant'
import { installWeb3WalletMetamask } from '@/utils/web3'
import { saveToStorage, getFromStorage } from '@/utils/storage';

Vue.use(Toast);
Vue.use(Dialog);
Vue.use(Tab);
Vue.use(Tabs);

export default {
  name: 'proposalList',
  data() {
    return {
      dataList: [
       {title: 'testname1', address: 'oxskdjjskfsjdkfoio', status: 0, id: 1},
       {title: 'testname2', address: 'oxskdjjskfsjdkfoio', status: 1, id: 2},
       {title: 'testname3', address: 'oxskdjjskfsjdkfoio', status: 2, id: 3},
       {title: 'testname4', address: 'oxskdjjskfsjdkfoio', status: 2, id: 4},
      ]
    }
  },
  components: {
    "v-navTitle": navTitle,
  },
  
  methods: {
    goDetail(id) {
      this.$router.push({
        path: `/proposalDetail`,
        query: {id: id},
      })
    },
  },
  created() {
    
  },
}
</script>
<style lang="scss" scoped>
  @import 'index.scss';
  ::v-deep .van-tabs__nav--line {
    width: 300px;
  }
</style>
