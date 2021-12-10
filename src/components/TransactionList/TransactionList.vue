<template>
  <div class="transactions-container-outer">
    <div class="transactions-container">
      <el-row class="list-header">
        <el-col
          class="list-header-item"
          v-for="(item,index) in headerList" :key="index"
          :span="(index==2 || index==3|| index==4) ? 4 : 3">
          {{ item }}
        </el-col>
      </el-row>
      <div class="transaction-list-wrapper" v-if="transactionList.length">
        <el-row class="transaction-list" v-for="(item,index) in transactionList" :key="index">
          <el-col :span="3" :class="['transaction-list-item', `status-${item.status}`]">
            <i></i>{{ item.status }}
          </el-col>
          <el-col :span="3" class="transaction-list-item">
            <a>{{ item.operation }}</a>
          </el-col>
          <el-col :span="4" :class="['transaction-list-item', `address`]">
            <el-tooltip  effect="dark" placement="top-start">
              <div slot="content" class="table-item-tip-tooltip">{{ item.hash }}</div>
              <a @click="toPageDetail(item, 'hash')">{{ showAddress(item.hash) }}</a>
            </el-tooltip>
          </el-col>
          <el-col :span="4" :class="['transaction-list-item', `address`]" v-if="!hideFrom">
            <el-tooltip effect="dark" placement="top-start">
              <div slot="content" class="table-item-tip-tooltip">{{ item.from }}</div>
              <a @click="toPageDetail(item, 'from')">
                <span class="from"></span>{{ getEns(item.from) }}
              </a>
            </el-tooltip>
          </el-col>
          <el-col :span="4" :class="['transaction-list-item', `address`]" v-if="!hideTo">
            <el-tooltip effect="dark" placement="top-start">
              <div slot="content" class="table-item-tip-tooltip">{{ item.to }}</div>
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
      <v-none v-if="!showLoading && transactionList.length==0" />
    </div>
    <div class="transactions-container-mobile">
      <div class="transaction-list-item" v-for="(item,index) in transactionList" :key="index">
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
      <v-empty v-if="!showLoading && transactionList.length==0" />
    </div>
    <v-loading v-show="showLoading" />
    <div v-show="_showNoMore" class="no-more">no more</div>
  </div>
</template>
<script>
import Vue from 'vue';
import { subStrAddress, getRouteNameAndQuery  } from '@/utils/index';
import None from '@/components/None/index';
import Loading from '@/components/Loading';
import Empty from '@/components/Empty/index';
import { getCurrentProvider } from '@/utils/web3';
import AsyncComputed from 'vue-async-computed';

Vue.use(AsyncComputed);

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
  components: {
    'v-none': None,
    'v-loading': Loading,
    'v-empty': Empty
  },
  computed: {
    _showNoMore() {
      return this.showNoMore && this.transactionList.length > 0
    },
  },
  asyncComputed:{
    getEns() {
      // return new Promise((resolve, reject) => {
      //   const currentProvider = getCurrentProvider()
      //   currentProvider.lookupAddress('0x6fC21092DA55B392b045eD78F4732bff3C580e2c').then(res => {
      //     console.log(res)
      //       let showEns = res ? res : 'address'
      //       resolve(showEns)

      //   }).catch(error => {
      //       resolve('address')
      //   })
      // })
    }
  },
  methods: {
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
  },
  created (){
    // this.getENS()
  }
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
