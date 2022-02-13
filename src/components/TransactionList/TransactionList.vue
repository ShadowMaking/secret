<template>
  <div class="transactions-container-outer">
    <div class="transactions-container">
      <el-row class="list-header">
        <el-col
          class="list-header-item"
          v-for="(item,index) in headerList" :key="index"
          :span="(index==1 || index==3|| index==4) ? 4 : 3">
          {{ item }}
        </el-col>
      </el-row>
      <div class="transaction-list-wrapper" v-if="newtransactionList.length">
        <el-row class="transaction-list" v-for="(item,index) in newtransactionList" :key="index">
          <el-col :span="3" :class="['transaction-list-item', `status-${item.status}`]">
            <span class="mult-span" v-if="item.from_type == 1">Multisig Wallet</span>
            <i></i>{{ item.status }}
          </el-col>
          <el-col :span="4" class="transaction-list-item">
            <div>
              <a>{{ item.operation }}</a>
              <p><a class="trans-detail-btn" v-if="item.mtxid" @click="goTransDetail(item)">View transaction details</a></p>
            </div>
          </el-col>
          <el-col :span="3" :class="['transaction-list-item', `address`]">
            <el-tooltip  effect="dark" placement="top-start">
              <div slot="content" class="table-item-tip-tooltip" @click="copyAddress(item.hash)">{{ item.hash }}</div>
              <a @click="toPageDetail(item, 'hash')">{{ showAddress(item.hash) }}</a>
            </el-tooltip>
          </el-col>
          <el-col :span="4" :class="['transaction-list-item', `address`]" v-if="!hideFrom">
            <el-tooltip effect="dark" placement="top-start">
              <div slot="content" class="table-item-tip-tooltip" @click="copyAddress(item.from)">{{ item.from }}</div>
              <a @click="toPageDetail(item, 'from')">
                <span class="from"></span>{{ showAddress(item.from) }}
              </a>
            </el-tooltip>
          </el-col>
          <el-col :span="4" :class="['transaction-list-item', `address`]" v-if="!hideTo">
            <el-tooltip effect="dark" placement="top-start">
              <div slot="content" class="table-item-tip-tooltip" @click="copyAddress(item.to)">{{ item.to }}</div>
              <a @click="toPageDetail(item, 'to')">
                <span class="to"></span>{{ showAddress(item.to) }}
              </a>
            </el-tooltip>
          </el-col>
          <el-col :span="3" class="transaction-list-item">
            <a @click="toPageDetail(item, 'block')">{{ item.blockNumber }}</a>
          </el-col>
          <el-col :span="3" class="transaction-list-item">
            {{ item.time }}
          </el-col>
        </el-row>
      </div>
      <v-none v-if="!showLoading && newtransactionList.length==0" />
    </div>
    <div class="transactions-container-mobile">
      <div class="transaction-list-item" v-for="(item,index) in newtransactionList" :key="index">
        <div class="grid grid-1">
          <div class="header">TX HASH</div>
          <div class="value"><a @click="toPageDetail(item, 'hash')">{{ item.hash }}</a></div>
        </div>
        <div class="grid grid-1">
          <div class="header"><span class="address from"></span>FROM</div>
          <div class="value">
            <a @click="toPageDetail(item, 'from')">
              <span>{{ item.from }}</span>
            </a>
          </div>
        </div>
        <div class="grid grid-1">
          <div class="header"><span class="address to"></span>TO</div>
          <div class="value">
            <a @click="toPageDetail(item, 'to')">
              <span>{{ item.to }}</span>
            </a>
          </div>
        </div>
        <div class="grid grid-2">
          <div class="header">
            <span>STATUS</span>
            <span>BLOCK NUMBER</span>
          </div>
          <div class="value">
            <div :class="[`status status-${item.status}`]"><i></i>{{ item.status }}</div>
            <div><a @click="toPageDetail(item, 'block')">{{ item.blockNumber }}</a></div>
          </div>
        </div>
        <div class="grid grid-1">
          <div class="header">TIMESTAMP</div>
          <div class="value">{{ item.time }}</div>
        </div>
      </div>
      <v-empty v-if="!showLoading && newtransactionList.length==0" />
    </div>
    <v-loading v-show="showLoading" />
    <div v-show="_showNoMore" class="no-more">no more</div>
  </div>
</template>
<script>
import Vue from 'vue';
import { Toast } from 'vant';
import { subStrAddress, getRouteNameAndQuery  } from '@/utils/index';
import None from '@/components/None/index';
import Loading from '@/components/Loading';
import Empty from '@/components/Empty/index';
import { getCurrentProvider } from '@/utils/web3';
import { copyTxt } from '@/utils/index';

Vue.use(Toast)

export default {
  name: 'TransactionList',
  props: {
    headerList: {
      type: Array,
      default: () => []
    },
    transactionList: {
      type: Array,
      default: () => []
    },
    showLoading: {
      type: Boolean,
      default: true,
    },
    hideFrom: {
      type: Boolean,
      default: false,
    },
    hideTo: {
      type: Boolean,
      default: false,
    },
    showNoMore: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    return {
      newtransactionList: this.transactionList
    }
  },
  watch: {
    transactionList(newval, oldval) {
      this.newtransactionList = newval
      this.dealTransactionList()
    },
  },
  components: {
    'v-none': None,
    'v-loading': Loading,
    'v-empty': Empty
  },
  computed: {
    _showNoMore() {
      return this.showNoMore && this.newtransactionList.length > 0
    },
  },
  methods: {
    copyAddress(str) {
      if (copyTxt(str)) {
        Toast.success('Copied');
      }
    },
    showAddress(txt) { return subStrAddress(txt)},
    toPageDetail(record, type) {
      const { routeName, query } = getRouteNameAndQuery(record, type);
      let routerInfo = { name: routeName };
      query && (routerInfo['query'] = query);
      console.log(routerInfo)
      let paramsStr = ''
      for(let k in routerInfo.query) {
        paramsStr += `&${k}=${routerInfo.query[k]}`
      }
      const url = `https://explorer.ieigen.com/#/${routerInfo.name}?${paramsStr}`
      window.open(url, '_blank')
    },
    async dealTransactionList() {
      const currentProvider = getCurrentProvider()
      this.newtransactionList.map(async (item ,index)=> {
        let fromens = await currentProvider.lookupAddress(item.from)
        let toens = await currentProvider.lookupAddress(item.to)
        this.newtransactionList[index].from = (fromens ? fromens : item.from)
        this.newtransactionList[index].to = (toens ? toens : item.to)
      })
    },
    goTransDetail(row) {
      console.log(row)
      this.$router.push({
        path: `/transDetail/${row.mtxid}`
      })
    },
  },
  // created(){
  //   this.dealTransactionList()
  // },
}
</script>
<style lang="scss" scoped>
  .no-more {
    color: #ccc;
    font-size: 1rem;
    text-align: center;
    margin: 10px 0 0;
  }
  @import 'index.scss';
  @import '@/assets/style/media.scss';
</style>
