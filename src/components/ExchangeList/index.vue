<template>
  <div class="common-exchange-list-wrapper">
    <div class="common-exchange-list">
      <h3 class="exchange-list-title">交易记录</h3>
      <div class="exchange-list" v-if="historyList.length>0 && !walletIsLock">
        <div v-for="(item,index) in historyList" :key="`history-${index}`" @click="testgetExchangeDetail(item)">
          <mt-cell is-link class="exchange-list-item">
            <div slot="title" class="flex flex-column mt10">
              <span><i class="icon exchange-status-icon status-transfer"></i>测试---withdrawETH</span>
              <!-- <span class="exchange-status">确认中</span> -->
            </div>
            <div class="flex flex-column">
              <span class="exchange-amount">-9.9932 ZKS<span>($ 7.81)</span></span>
              <span class="exchange-time">13/07/2021 12:54:35</span>
            </div>
          </mt-cell>
        </div>
        <div @click="getExchangeDetail">
          <mt-cell is-link class="exchange-list-item" >
            <div slot="title" class="flex flex-column mt10">
              <span><i class="icon exchange-status-icon status-transfer"></i>转账ZKS</span>
              <!-- <span class="exchange-status">确认中</span> -->
            </div>
            <div class="flex flex-column">
              <span class="exchange-amount">-9.9932 ZKS<span>($ 7.81)</span></span>
              <span class="exchange-time">13/07/2021 12:54:35</span>
            </div>
          </mt-cell>
        </div>
        <mt-cell is-link class="exchange-list-item">
          <div slot="title" class="flex flex-column mt10">
            <span><i class="icon exchange-status-icon status-withdraw"></i>提现ZKS</span>
            <span class="exchange-status">确认中</span>
          </div>
          <div class="flex flex-column">
            <span class="exchange-amount">-9.9932 ZKS<span>($ 7.81)</span></span>
            <span class="exchange-time">13/07/2021 12:54:35</span>
          </div>
        </mt-cell>
        <mt-cell is-link class="exchange-list-item">
          <div slot="title" class="flex flex-column mt10">
            <span><i class="icon exchange-status-icon status-wrong"></i>交易失败</span>
            <!-- <span class="exchange-status">确认中</span> -->
          </div>
          <div class="flex flex-column">
            <span class="exchange-amount textTransparent">交易失败</span>
            <span class="exchange-time">13/07/2021 12:54:35</span>
          </div>
        </mt-cell>
        <mt-cell is-link class="exchange-list-item">
          <div slot="title" class="flex flex-column mt10">
            <span><i class="icon exchange-status-icon status-recharge"></i>充值 ETH</span>
            <span class="textTransparent">充值</span>
          </div>
          <div class="flex flex-column">
            <span class="exchange-amount">-9.9932 ZKS<span>($ 7.81)</span></span>
            <span class="exchange-time">13/07/2021 12:54:35</span>
          </div>
        </mt-cell>
      </div>
      <div class="flex flex-center flex-column none-data" v-else>
        <img :src="DEFAULTIMG.NONE_TATA" class="img-QR"/>
        <span>暂无交易记录</span>
      </div>
    </div>
    <van-popup v-model="popupVisible" round position="bottom" :style="{ minHeight: '30%' }" class="common-bottom-popup exchange-detail-popup">
      <div class="common-exchange-detail-wrap">
        <div class="header">
          <h3>交易详情</h3>
        </div>
        <ul v-for="(item,index) in dataList" :key="`exchange-${index}`">
          <li class="flex flex-content-between common-exchange-detail-item">
            <span>{{ item.title }}</span>
            <span>{{ item.value }}</span>
          </li>
        </ul>
      </div>
    </van-popup>
    <van-popup v-model="showUpdate" round >
      <a>需要刷新</a>
    </van-popup>
  </div>
</template>
<script>
import Vue from 'vue';
import { DEFAULTIMG } from '@/utils/global';
import { TRANSACTION_TYPE } from '@/api/transaction';
import { Popup } from 'vant';
// import moment from 'moment'

Vue.use(Popup);

export default {
  name: 'Home',
  props: {
    'type': { // all | L1ToL2(deposit) | L2ToL2(transfer) | L2ToL1(withdraw)
      type: String,
      default: 'all'
    },
  },
  data() {
    return {
      DEFAULTIMG,
      popupVisible: false,
      historyList: [],
      showUpdate: false,
      // dataList: [],
      dataList: [
        {
          title: '时间',
          value: '13/07/2021 12:54:35'
        },
        {
          title: '操作',
          value: '充值 54.6958 ZKS'
        },
      ]
    }
  },
  computed: {
    walletIsLock() {
      return this.$store.state.metamask.walletIsLock;
    },
  },
  watch: {
    '$store.state.metamask.walletIsLock': function (res) {
      if (!this.walletIsLock) {
        this.handleSearchTransactionHistoryList()
      }
    }
  },
  methods: {
    testgetExchangeDetail(record) {
      console.log('record', record);
      if (record.status === '0') {
        console.log('需要重试')
        this.showUpdate = true
        this.needRetryData = record;
      }
    },
    getExchangeDetail(record) {
      this.popupVisible = true;
    },
    handleSearchTransactionHistoryList() {
      const tx_type = this.type === 'all' ? '' : TRANSACTION_TYPE[this.type];
      const fromAddress = window.ethereum.selectedAddress;
      if (tx_type) {
        this.$store.dispatch('SearchAllTransactionHistory', { from: fromAddress })
        .then(result => {
          console.log(`response transaction history from ${this.type}...`,result)
          // 只测试提现
          const withdrawList = _.filter(result, {type: 2})
          const historyList = []
          withdrawList.forEach(i=>{
            historyList.push({
              ...i
            })
          })
          this.historyList = historyList;
        })
      }
    },
  },
  created() {
    if (!this.walletIsLock) {
      this.handleSearchTransactionHistoryList()
    }
  }
};
</script>
<style lang="scss" >
  @import 'index';
</style>
