<template>
  <div class="common-exchange-list-wrapper">
    <div class="common-exchange-list">
      <h3 class="exchange-list-title">交易记录</h3>
      <div class="exchange-list" v-if="historyList.length>0 && !walletIsLock">
        <div v-for="(item,index) in historyList" :key="`history-${index}`" @click="getExchangeDetail(item)">
          <mt-cell is-link class="exchange-list-item">
            <div slot="title" class="flex flex-column mt10">
              <!-- <span><i :class="['icon', 'exchange-status-icon', 'status-transfer']"></i>{{ item.typeTxt }}ETH</span> -->
              <span><i :class="iconClass(item)"></i>{{ item.typeTxt }}ETH</span>
              <span class="exchange-status" v-if="item.status===1 && type==='L2ToL1'">确认中</span>
            </div>
            <div class="flex flex-column">
              <span class="exchange-amount">{{item.value}} ETH<span>($ {{item.gasPrice}})</span></span>
              <span class="exchange-time">{{item.dateTitme}}</span>
            </div>
          </mt-cell>
        </div>
        <div @click="getExchangeDetail" style="display:none">
          <mt-cell is-link class="exchange-list-item" >
            <div slot="title" class="flex flex-column mt10">
              <span><i class="icon exchange-status-icon status-transfer"></i>转账ZKS</span>
              <span class="exchange-status">确认中</span>
            </div>
            <div class="flex flex-column">
              <span class="exchange-amount">-9.9932 ZKS<span>($ 7.81)</span></span>
              <span class="exchange-time">13/07/2021 12:54:35</span>
            </div>
          </mt-cell>
        </div>
        <mt-cell is-link class="exchange-list-item"  style="display:none">
          <div slot="title" class="flex flex-column mt10">
            <span><i class="icon exchange-status-icon status-withdraw"></i>提现ZKS</span>
            <span class="exchange-status">确认中</span>
          </div>
          <div class="flex flex-column">
            <span class="exchange-amount">-9.9932 ZKS<span>($ 7.81)</span></span>
            <span class="exchange-time">13/07/2021 12:54:35</span>
          </div>
        </mt-cell>
        <mt-cell is-link class="exchange-list-item"  style="display:none">
          <div slot="title" class="flex flex-column mt10">
            <span><i class="icon exchange-status-icon status-wrong"></i>交易失败</span>
            <!-- <span class="exchange-status">确认中</span> -->
          </div>
          <div class="flex flex-column">
            <span class="exchange-amount textTransparent">交易失败</span>
            <span class="exchange-time">13/07/2021 12:54:35</span>
          </div>
        </mt-cell>
        <mt-cell is-link class="exchange-list-item"  style="display:none">
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
import moment from 'moment'
import { utils } from 'ethers';

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
    iconClass(record) {
      let classArr = ['icon', 'exchange-status-icon', 'status-transfer']
      let icoC = '';
      switch(record['type']) {
        case TRANSACTION_TYPE['L1ToL2']:
          icoC = 'status-recharge'
          break;
        case TRANSACTION_TYPE['L2ToL1']:
          icoC = 'status-withdraw'
          break;
        case TRANSACTION_TYPE['L2ToL2']:
          icoC = 'status-transfer'
          break; 
      }
      classArr.push(icoC)
      return classArr
    },
    getExchangeDetail(record) {
      console.log('record', record);
      // this.popupVisible = true;
      if (record.status === '0') {
        console.log('需要重试')
        this.showUpdate = true
        this.needRetryData = record;
      }
    },
    handleSearchTransactionHistoryList() {
      console.log('ready requet history...')
      if (this.walletIsLock) { return }
      console.log('requet history...')
      const tx_type = this.type === 'all' ? '' : TRANSACTION_TYPE[this.type];
      const fromAddress = window.ethereum.selectedAddress;
      this.$store.dispatch('SearchAllTransactionHistory', { from: fromAddress })
      .then(async result => {
        let list = _.cloneDeep(result);
        if (tx_type) {
          list = [].concat(_.filter(result, {type: tx_type}))
        }
        console.log(`response transaction history ...`,result)
        console.log(`response transaction history from ${this.type}...`,list);
        const historyList = []
        list.forEach(async item=>{
          const hash = item.txid
          const info = await this.web3.eth.getTransaction(hash);
          let gas =0;
          let gasPrice = 0;
          let value = 0;
          if (info){
            // gas = info['gas']; // TODO 单位
            // gasPrice = info['gasPrice']; // TODO 单位
            value = utils.formatEther(info.value);
          }
          // const type = '' // 1-充值 2-提现 3-转账
          // status 0-失败 1-成功（ withraw1-确认中 2-成功）
          historyList.push({
            ...item,
            value,
            gas,
            gasPrice,
            typeTxt: ['', '充值','提现','转账'][item.type],
            dateTitme: moment(item.createdAt).format('YYYY-MM-DD HH:MM:SS')
          })
        })
        this.historyList = historyList;
        console.log('historyList',historyList);
      })
    },
  },
  created() {
    if (!this.walletIsLock) {
      this.handleSearchTransactionHistoryList()
    }
  },
  mounted() {
    this.$eventBus.$on('handleUpdateTransactionHistory', this.handleSearchTransactionHistoryList)
  },
  
};
</script>
<style lang="scss" >
  @import 'index';
</style>
