<template>
  <div class="common-exchange-list-wrapper">
    <div class="common-exchange-list" id="common-exchange-list">
      <h3 class="exchange-list-title">Transactions</h3>
      <div class="exchange-list" v-if="historyList.length>0 && !walletIsLock">
        <mt-cell is-link class="exchange-list-item"  v-for="(item,index) in historyList" :key="`history-${index}`" @click.native="getExchangeDetail(item)">
          <div slot="title" class="flex flex-column transaction-type-info">
            <span class="transaction-title"><i :class="iconClass(item)"></i>{{ item.typeTxt }} {{ item.name }}</span>
            <span class="exchange-status pending" v-show="showStatus(item)">Confirming</span>
            <span class="exchange-status success" v-show="showStatusSuccess(item)">Succeed</span>
            <span class="exchange-status fail" v-show="showStatusFail(item)">Failed</span>
          </div>
          <div class="flex flex-column transaction-amount-info">
            <span class="exchange-amount">
              {{exchangeValue(item)}} {{ item.name }}
              <span style="display:none">($ {{item.gasPrice}})</span>
            </span>
            <span class="exchange-time">{{item.dateTitme}}</span>
          </div>
        </mt-cell>
        <div @click="getExchangeDetail" style="display:none">
          <mt-cell is-link class="exchange-list-item" >
            <div slot="title" class="flex flex-column mt10">
              <span><i class="icon exchange-status-icon status-transfer"></i>Transfer ZKS</span>
              <span class="exchange-status">Confirming</span>
            </div>
            <div class="flex flex-column">
              <span class="exchange-amount">-9.9932 ZKS<span>($ 7.81)</span></span>
              <span class="exchange-time">13/07/2021 12:54:35</span>
            </div>
          </mt-cell>
        </div>
        <mt-cell is-link class="exchange-list-item"  style="display:none">
          <div slot="title" class="flex flex-column mt10">
            <span><i class="icon exchange-status-icon status-withdraw"></i>withdraw ZKS</span>
            <span class="exchange-status">Confirming</span>
          </div>
          <div class="flex flex-column">
            <span class="exchange-amount">-9.9932 ZKS<span>($ 7.81)</span></span>
            <span class="exchange-time">13/07/2021 12:54:35</span>
          </div>
        </mt-cell>
        <mt-cell is-link class="exchange-list-item"  style="display:none">
          <div slot="title" class="flex flex-column mt10">
            <span><i class="icon exchange-status-icon status-wrong"></i>Transaction Failed</span>
            <!-- <span class="exchange-status">Confirming</span> -->
          </div>
          <div class="flex flex-column">
            <span class="exchange-amount textTransparent">Transaction Failed</span>
            <span class="exchange-time">13/07/2021 12:54:35</span>
          </div>
        </mt-cell>
        <mt-cell is-link class="exchange-list-item"  style="display:none">
          <div slot="title" class="flex flex-column mt10">
            <span><i class="icon exchange-status-icon status-recharge"></i>deposit ETH</span>
            <span class="textTransparent">deposit</span>
          </div>
          <div class="flex flex-column">
            <span class="exchange-amount">-9.9932 ZKS<span>($ 7.81)</span></span>
            <span class="exchange-time">13/07/2021 12:54:35</span>
          </div>
        </mt-cell>
      </div>
      <div class="flex flex-center flex-column none-data" v-else>
        <img :src="DEFAULTIMG.NONE_TATA" class="img-QR"/>
        <span>No Transactions</span>
      </div>
    </div>
    <div class="seeMore" v-show="allList.length>20"><a @click='toBroswer()'>see more</a></div>
    <!-- get-container="#app"  -->
    <!-- Transaction Details -->
    <van-popup v-model="transactionDetailVisible" round :position="checkBrower()" get-container="#app"   :style="{ minHeight: '40%' }" class="common-bottom-popup exchange-detail-popup">
      <div class="common-exchange-detail-wrap">
        <div class="header">
          <h3>Transaction Details</h3>
        </div>
        <ul v-for="(item,index) in detaiInfo" :key="`exchange-${index}`">
          <li
            class="flex flex-content-between common-exchange-detail-item"
            v-if="item.key==='from'" v-show="showFromOrToAddress(item)">
            <span class="title">{{ item.title }}</span>
            <span class="flex flex-center" @click="copyAddress(item.value)">{{ `${item.value.substr(0,6)}...${item.value.substr(-4)}` }}</span>
          </li>
          <li
            class="flex flex-content-between common-exchange-detail-item"
            v-else-if="item.key==='to'" v-show="showFromOrToAddress(item)">
            <span class="title">{{ item.title }}</span>
            <span class="flex flex-center" @click="copyAddress(item.value)">{{ `${item.value.substr(0,6)}...${item.value.substr(-4)}` }}</span>
          </li>
          <li class="flex flex-content-between common-exchange-detail-item" v-else>
            <span class="title">{{ item.title }}</span>
            <span class="flex flex-center">
              <span v-if="item.key==='status'">
                <span class="exchange-status pending" v-show="showStatus(item['info'])">Confirming</span>
                <span class="exchange-status success" v-show="showStatusSuccess(item['info'])">Succeed</span>
                <span class="exchange-status fail" v-show="showStatusFail(item['info'])">Failed</span>
              </span>
              <span v-else-if="item.key==='progress'">
                <a class="to-etherscan" @click="toBroswer(item)">{{item.value}}</a>
              </span>
              <span @click="copyHash(item)" v-else>
                {{ item.key==='hash'?`${item.value.substr(0,6)}...${item.value.substr(-4)}`:item.value }}
                <!-- <span v-show="item.key==='hash'" class="copy-tip">（copy）</span> -->
              </span>
              <!-- <a class="refres-button" @click="speed(item)"
                v-show="item.info['type']=='2'&&item.key==='status'&&item.info['status']===1">Refresh</a> -->
              <a class="refres-button" @click="speed(item)"
                v-show="showRefresh(item)">Refresh</a>
            </span>
          </li>
        </ul>
      </div>
    </van-popup>
    <van-popup v-model="showUpdate" round >
      <a>Need Refresh</a>
    </van-popup>
    <van-popup v-model="show" round :close-on-click-overlay="false" class="waiting-modal flex flex-center flex-column">
      <div class="inner-wrapper">
        <i class="waiting_icon spin"></i>
        <span class="tip">Waiting...</span>
      </div>
    </van-popup>
    <v-netTipPopup :show="showNetTip" key="netTipModal-transactionlist" showType="l2" @childEvent="closeNetTip"/>
  </div>
</template>
<script>
import Vue from 'vue';
import { DEFAULTIMG } from '@/utils/global';
import { TRANSACTION_TYPE } from '@/api/transaction';
import { Popup, Toast, Popover, List } from 'vant';
import moment from 'moment'
import { utils, ethers } from 'ethers';
import { OutgoingMessageState } from 'arb-ts';
import { initBrideByNetType, getNetMode } from '@/utils/web3';
import { copyTxt, isPc } from '@/utils/index';
import { compareDate } from '@/utils/number';
import NetTipModal from '@/components/NetTipModal';
import { getConnectedAddress } from '@/utils/dashBoardTools';

Vue.use(Popup);
Vue.use(Popover);
Vue.use(List);

export default {
  name: 'ExchangeList',
  props: {
    'type': { // all | L1ToL2(deposit) | L2ToL2(transfer) | L2ToL1(withdraw)
      type: String,
      default: 'all'
    },
  },
  components: {
    "v-netTipPopup": NetTipModal,
  },
  data() {
    return {
      TRANSACTION_TYPE,
      showPopover: false,
      DEFAULTIMG,
      transactionDetailVisible: false,
      allList: [],
      historyList: [],
      showUpdate: false,
      detaiInfo: [],
      infoRecord: null,
      show: false,
      loadingHistoryList: false,
      showNetTip: false,
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
    showFromOrToAddress(record) {
      return record['info']['type']==TRANSACTION_TYPE['L2ToL1'] || record['info']['type']==TRANSACTION_TYPE['L2ToL2']
    },
    isTokenTransaction(name="ETH") {
      return name!=='ETH'
    },
    showRefresh(record) {
      const { info, key } = record
      const { type, status, name='ETH' } = info
      // return type == '2'&& key === 'status' && status === 1 && !this.isTokenTransaction(name)
      return type == '2'&& key === 'status' && status === 1
    },
    closeNetTip() {
      this.showNetTip = false;
      this.transactionDetailVisible = false;
    },
    checkBrower() {
      if (isPc()) { return 'center' };
      return 'bottom';
    },
    toBroswer(record) {
      let openUrl = '//explorer.ieigen.com';
      if (record) {
        const { type, txid } = record.info
        openUrl = `//explorer.ieigen.com/#/tx?tstr=${txid}`
        if (type === TRANSACTION_TYPE['L1ToL2'] || type === TRANSACTION_TYPE['L1ToL1']) {
          Toast('Coming Soon')
          return;
        }
      }
      window.open(openUrl)
    },
    copyAddress(txt) {
      copyTxt(txt)
      Toast.success('copy success')
    },
    copyHash(item) {
      if (item.key === 'hash' && copyTxt(item.value)) {
        Toast.success('copy success')
      }
    },
    showStatus(record) {
      // return record.status===1 && record.type === TRANSACTION_TYPE['L2ToL1'] && !this.isTokenTransaction(record.name);
      return record.status===1 && record.type === TRANSACTION_TYPE['L2ToL1'];
    },
    showStatusSuccess(record) {
      /* if (!this.isTokenTransaction(record.name)) {
        return record.type === TRANSACTION_TYPE['L2ToL1']?record.status===2:record.status === 1
      }
      return record.status === 1 */
      return record.type === TRANSACTION_TYPE['L2ToL1']?record.status===2:record.status === 1
    },
    showStatusFail(record) {
      return record.status === 0
    },
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
    exchangeValue(item) {
      if (item.type === TRANSACTION_TYPE['L2ToL2'] || item.type === TRANSACTION_TYPE['L2ToL1']) {
        return -item.value
      }
      return item.value
    },
    getExchangeDetail(record) {
      const { typeTxt, createdAt, value, type, status, name } = record;
      const date = moment(createdAt).format('DD/MM/YYYY HH:mm:ss')
      const opt = `${typeTxt} ${value} ${name}`;
      let statusTxt = '';
      if (status===0) {
        // statusTxt = 'Transaction Failed'
        statusTxt = 'Failed'
      }
      switch(status) {
        case 0:
          // statusTxt = 'Transaction Failed'
          statusTxt = 'Failed'
          break;
        case 1:
          if (type === TRANSACTION_TYPE['L2ToL1'] && !this.isTokenTransaction(name)) {
            statusTxt = 'Confirming'
          } else {
            statusTxt = 'Succeed'
          }
          break;
        case 2:
          statusTxt = 'Succeed'
          break;
      }
      const info = [
        {title: 'Hash', value: record.txid, key:'hash', info: record},
        {title: 'Time', value: date, key:'data', info: record},
        {title: 'Operation', value: opt, key:'opt', info: record},
        {title: 'From', value: record.from, key:'from', info: record},
        {title: 'To', value: record.to, key:'to', info: record},
        {title: 'Status', value: statusTxt, key:'status', info: record},
        {title: 'Progress', value: 'To Etherscan', key:'progress', info: record},
      ];
      console.log('record', record);
      this.infoRecord = record;
      this.detaiInfo = info;
      this.transactionDetailVisible = true;
      if (record.status === '0') {
        console.log('need refresh')
        this.showUpdate = true
        this.needRetryData = record;
      }
    },
    async speed(item) {
      // judge the networkType
      const netType = getNetMode();
      if (netType !== 'l2') {
        console.log('Need change network to L2');
        this.showNetTip = true;
        return;
      }
      const info = this.infoRecord;
      console.log('info', info)

      this.show = true;
      const bridge = initBrideByNetType('l2')['bridge'];
      const txnHash = info.txid;
      const initiatingTxnReceipt = await bridge.l2Provider.getTransactionReceipt(txnHash);
      if (!initiatingTxnReceipt){
        this.show = false;
        Toast('Failed，wait for minutes');
        console.log(`No Arbitrum transaction found with provided txn hash: ${txnHash}`)
        return
      }
      const outGoingMessagesFromTxn = await bridge.getWithdrawalsInL2Transaction(initiatingTxnReceipt)
      if (outGoingMessagesFromTxn.length === 0){
        this.show = false;
        Toast('Failed，wait for minutes');
        console.log(`Txn ${txnHash} did not initiate an outgoing messages`)
        return {
          success: false,
          msg: `Txn ${txnHash} did not initiate an outgoing messages`
        };
      }
      const { batchNumber, indexInBatch } = outGoingMessagesFromTxn[0]
      const outgoingMessageState = await bridge.getOutGoingMessageState(
        batchNumber,
        indexInBatch
      )
      console.log(`Waiting for message to be confirmed: Batchnumber: ${batchNumber}, IndexInBatch ${indexInBatch}`)

      if (!outgoingMessageState === OutgoingMessageState.CONFIRMED) {
        let msg = '';
        switch (outgoingMessageState) {
          case OutgoingMessageState.NOT_FOUND: {
            msg = 'Message not found; something strange and bad happened'
            break
          }
          case OutgoingMessageState.EXECUTED: {
            msg = `Message already executed! Nothing else to do here`
            break
          }
          case OutgoingMessageState.UNCONFIRMED: {
            msg = `Message not yet confirmed; we'll wait a bit and try again`
            break
          }
          default:
            break
        }
        this.show = false;
        Toast('Failed，wait for minutes');
        console.log(`${msg}`)
        return
      }

      // const res = await bridge.triggerL2ToL1Transaction(batchNumber, indexInBatch)
      // const rec = await res.wait()

      bridge.triggerL2ToL1Transaction(batchNumber, indexInBatch)
      .then(async res=>{
        console.log('res', res)
        // const rec = await res.wait()
        // console.log('rec', rec)
        // if (rec.confirmations === 1) {
        if (res.status === 1) {
          console.log('Done! Your transaction is executed')
          this.show = false;
          this.$store.dispatch('UpdateTransactionHistory', {
            txid: txnHash,
            status: 2,
          })
          .then(res=>{
            this.transactionDetailVisible = false;
            this.$eventBus.$emit('handleUpdateTransactionHistory', {type: 'L2ToL1'});
          })
          .catch(err=>{
            this.transactionDetailVisible = false;
            Toast.fail(`Refresh success，but error whenupdate history`);
          })
        }
      })
      .catch(err=>{
        this.show = false;
        Toast('Failed，wait for minutes');
      })
    },
    // TODO forEach and async await will lead to the incorrect order for array
    async generateHistoryList_e(sourceArr) {
      const historyList = [];
      sourceArr.forEach(async item=>{
        const hash = item.txid
        const info = await this.web3.eth.getTransaction(hash);
        let gas =0;
        let gasPrice = 0;
        let value = 0;
        if (info){
          // gas = info['gas'];
          // gasPrice = info['gasPrice'];
          value = utils.formatEther(info.value);
        }
        // const type = '' // 1-deposit 2-withdraw 3-transfer
        // status 0-fail 1-success（ withraw1-pending 2-success）
        historyList.push({
          ...item,
          value,
          gas,
          gasPrice,
          typeTxt: ['', 'Deposit','Withdraw','Send'][item.type],
          dateTitme: moment(sourceArr[i].createdAt).format('DD/MM/YYYY HH:mm:ss')
        })
      })
      return historyList;
    },
    async generateHistoryList(sourceArr) {
      const historyList = [];
      for( let i = 0; i < sourceArr.length; i += 1) {
        const item = sourceArr[i]
        const hash = item.txid;
        // const info = await this.web3.eth.getTransaction(hash);
        let gas =0;
        let gasPrice = 0;
        let value = item.value || 0;
        /* if (info){
          gas = info['gas'];
          gasPrice = info['gasPrice'];
          value = utils.formatEther(info.value);
        } */
        // const type = '' // 1-deposit 2-withdraw 3-transfer
        // status 0-fail 1-success（ withraw1-pending 2-success）
        historyList.push({
          ...item,
          value,
          gas,
          gasPrice,
          typeTxt: ['', 'Deposit','Withdraw','Send'][item.type],
          dateTitme: moment(item.createdAt).format('DD/MM/YYYY HH:mm:ss')
        })
      }
      return historyList;
    },
    async handleSearchTransactionHistoryList() {
      if (this.walletIsLock) { return }
      const tx_type = this.type === 'all' ? '' : TRANSACTION_TYPE[this.type];
      const fromAddress = getConnectedAddress();
      Toast.loading({
        duration: 0,
        message: 'loading...',
        forbidClick: true,
        loadingType: 'spinner',
      });
      this.$store.dispatch('SearchAllTransactionHistory', { from: fromAddress })
      .then(async result => {
        let list =[];
        if (tx_type) {
          list = [].concat(_.filter(result, {type: tx_type}))
        } else {
          list = [].concat(_.cloneDeep(result));
        }
        const sortList = list.sort(compareDate('createdAt', 'reverse'));
        const historyList = await this.generateHistoryList(sortList.slice(0,20));
        this.allList = _.cloneDeep(sortList);
        this.historyList = historyList;
        Toast.clear();
        // console.log('historyList',historyList);
      })
      .catch(err=>{
        Toast.clear();
      })
    },
  },
  created() {
    if (!this.walletIsLock) {
      this.handleSearchTransactionHistoryList()
    }
  },
  async mounted() {
    this.$eventBus.$on('handleUpdateTransactionHistory', this.handleSearchTransactionHistoryList)
    /* const etherscanProvider = new ethers.providers.EtherscanProvider();
    const address = window.ethereum.selectedAddress
    etherscanProvider.getHistory(address).then((history) => {
      history.forEach((tx) => {
        console.log('tx',tx);
      })
    }); */
  },
  
};
</script>
<style lang="scss" >
  @import 'index';
</style>
