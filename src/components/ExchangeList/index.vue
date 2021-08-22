<template>
  <div class="common-exchange-list-wrapper">
    <div class="common-exchange-list">
      <h3 class="exchange-list-title">交易记录</h3>
      <!-- TODO 需要分页 -->
      <div class="exchange-list" v-if="historyList.length>0 && !walletIsLock">
        <div v-for="(item,index) in historyList" :key="`history-${index}`" @click="getExchangeDetail(item)">
          <mt-cell is-link class="exchange-list-item">
            <div slot="title" class="flex flex-column mt10">
              <span><i :class="iconClass(item)"></i>{{ item.typeTxt }}ETH</span>
              <span class="exchange-status" v-if="showStatus(item)">确认中</span>
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
        <ul v-for="(item,index) in detaiInfo" :key="`exchange-${index}`">
          <li class="flex flex-content-between common-exchange-detail-item">
            <span>{{ item.title }}</span>
            <span class="flex flex-center">
              {{ item.value }}
              <van-button
                size='small'
                style="margin-left:10px;"
                plain
                type="info"
                @click="speed(item)"
                v-show="item.info['type']=='2'&&item.key==='status'&&item.info['status']===1">加速</van-button>
            </span>
          </li>
        </ul>
      </div>
    </van-popup>
    <van-popup v-model="showUpdate" round >
      <a>需要刷新</a>
    </van-popup>
    <van-popup v-model="show" round :close-on-click-overlay="false" class="waiting-modal flex flex-center flex-column">
      <div>加速进行中</div>
    </van-popup>
  </div>
</template>
<script>
import Vue from 'vue';
import { DEFAULTIMG } from '@/utils/global';
import { TRANSACTION_TYPE } from '@/api/transaction';
import { Popup, Toast } from 'vant';
import moment from 'moment'
import { utils } from 'ethers';
import { Bridge, OutgoingMessageState } from 'arb-ts';
import { initBrideByTransanctionType, getNetMode } from '@/utils/web3';

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
      detaiInfo: [],
      infoRecord: null,
      show: false,
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
    showStatus(record) {
      return record.status===1 && record.type === TRANSACTION_TYPE['L2ToL1'];
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
    getExchangeDetail(record) {
      const { typeTxt, createdAt, value, type, status } = record;
      const date = moment(createdAt).format('YY:MM:DD HH:MM:SS')
      const opt = `${typeTxt} ${value} ETH`;
      let statusTxt = '';
      if (status===0) {
        statusTxt = '失败'
      }
      switch(status) {
        case 0:
          statusTxt = '失败'
          break;
        case 1:
          if (type === TRANSACTION_TYPE['L2ToL1']) {
            statusTxt = '确认中'
          } else {
            statusTxt = '成功'
          }
          break;
        case 2:
          statusTxt = '成功'
          break;
      }
      const browser = ''; // TODO
      const info = [
        {title: '时间', value: date, key:'data', info: record},
        {title: '操作', value: opt, key:'opt', info: record},
        {title: '状态', value: statusTxt, key:'status', info: record},
      ];
      console.log('record', record);
      this.infoRecord = record;
      this.detaiInfo = info;
      this.popupVisible = true;
      if (record.status === '0') {
        console.log('需要重试')
        this.showUpdate = true
        this.needRetryData = record;
      }
    },
    // withdraw 确认中需要加速（重试）
    async executeConfirmTransaction(withrawTxHash) {
      this.show = true;
      const bridge = initBrideByTransanctionType('l2');
      const txnHash = withrawTxHash;
      const initiatingTxnReceipt = await bridge.l2Provider.getTransactionReceipt(txnHash);
      if (!initiatingTxnReceipt){
        this.show = false;
        return {
          success: false,
          msg: `No Arbitrum transaction found with provided txn hash: ${txnHash}`
        };
      }
      const outGoingMessagesFromTxn = await bridge.getWithdrawalsInL2Transaction(initiatingTxnReceipt)
      if (outGoingMessagesFromTxn.length === 0){
        this.show = false;
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
        return { success: false, msg };
      }
      // const res = await bridge.triggerL2ToL1Transaction(batchNumber, indexInBatch)
      bridge.triggerL2ToL1Transaction(batchNumber, indexInBatch)
      .then(async res=>{
        const rec = await res.wait()
        if (rec.confirmations === 1) {
          console.log('Done! Your transaction is executed')
          this.show = false;
          return { success: true }
        }
      })
      .catch(err=>{
        this.show = false;
        Toast('加速失败，等待几分钟后在重试');
        return { success: false };
      })
      return { success: false };
    },
    async speed(item) {
      // 判断网络类型，非L2网络不可进行该操作
      const netType = getNetMode();
      if (netType !== 'l2') {
        Toast('需切换到L2网络进行该操作')
        return;
      }
      const info = this.infoRecord;
      console.log('info', info)
      const txHash = info.txid
      const conformStatus = await this.executeConfirmTransaction(txHash);
      if (conformStatus.success) {
        // 如果是withdraw，并且confirmation是1，然后继续调用我那段代码，如果成功将后端status改成2.
        // {"status": 1, "sub_txid": "2121"}  withdraw类型的交易，status是2，才认为成功
        this.$store.dispatch('UpdateTransactionHistory', {
          txid: txHash,
          status: 2,
        })
        .then(res=>{
          this.popupVisible = false;
          this.$eventBus.$emit('handleUpdateTransactionHistory', {type: 'L2ToL1'});
        })
        .catch(err=>{
          this.popupVisible = false;
          Toast('未知错误')
        })
      }
    },
    handleSearchTransactionHistoryList() {
      // console.log('ready requet history...')
      if (this.walletIsLock) { return }
      // console.log('requet history...')
      const tx_type = this.type === 'all' ? '' : TRANSACTION_TYPE[this.type];
      const fromAddress = window.ethereum.selectedAddress;
      this.$store.dispatch('SearchAllTransactionHistory', { from: fromAddress })
      .then(async result => {
        let list = _.cloneDeep(result);
        if (tx_type) {
          list = [].concat(_.filter(result, {type: tx_type}))
        }
        // console.log(`response transaction history ...`,result)
        // console.log(`response transaction history from ${this.type}...`,list);
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
