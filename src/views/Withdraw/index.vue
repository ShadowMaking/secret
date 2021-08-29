<template>
  <div class="withdraw-page">
    <van-row type="flex" justify="space-between" align="center" class="top-address">
      <van-col span="12" class="textAlignLeft">Withdrawal Address</van-col>
      <van-col span="12" class="textAlignRight">
        <van-button color="#E4E6F5" size="mini" @click="setMyAddress" class="myAddress">
          <span slots="default" style="color:#495ABE">My Address</span>
        </van-button>
      </van-col>
    </van-row>
    <div class="withdraw-opt-area">
      <div class="flex flex-center address-wrapper">
        <div class="address-wrapper-inner">
          <van-field
            v-model="withDrawAddress"
            rows="2"
            autosize
            label=""
            type="textarea"
            :disabled="walletIsLock"
            placeholder="enter withdrawal address"
            @input="handleAddressInputChange"
          />
        </div>
      </div>
      <v-tokenAmount
        key="tokenAmount-withdraw"
        type="withdraw"
        @childEvent="submitWithdraw"
        :buttonCode="tokenAmountButtonTxtCode"
        :buttonTxt="tokenAmountButtonTxt" />
    </div>
    <v-exchangeList key="comon-exchangeList" type="L2ToL1" v-show="!walletIsLock"/>
    <v-statusPop
      :status="popStatus"
      :title="statusPopTitle"
      :timeTxt="timeTxt"
      :tip="tip"
      :show="showStatusPop"
      @childEvent="changeVisible" />
    <van-popup v-model="show" round :close-on-click-overlay="false" class="waiting-modal flex flex-center flex-column">
      <div class="inner-wrapper">
        <i class="confirm_icon"></i>
        <span class="tip">{{ tipTxt }}</span>
      </div>
    </van-popup>
    <van-popup v-model="showRefresh" class="status-popUp-refresh flex flex-center flex-column">
      <i class="icon icon-failed"></i>
      <span class="main-txt">No Transactions</span>
      <span class="supplement-txt">Refresh to get histoty</span>
      <van-button block color="#495ABF" class="button" @click="retryAddHistory">{{ refreshing?"Refresh...":"Refresh"}}</van-button>
    </van-popup>
    <v-netTipPopup :show="showNetTip" key="netTipModal" showType="l2"/>
  </div>
</template>
<script>
import Vue from 'vue';
import _ from 'lodash';
import { Popup, CountDown, Field, Toast, Icon } from 'vant';
import TokenAmount from '@/components/TokenAmount';
import ExchangeList from '@/components/ExchangeList';
import StatusPop from '@/components/StatusPop';
import NetTipModal from '@/components/NetTipModal';
import { wait, prettyLog } from '@/utils/index'
import { getDefaultAddress } from '@/utils/auth'
import { getNetMode, getSelectedChainID, initBrideByTransanctionType } from '@/utils/web3'
import { Bridge, OutgoingMessageState } from 'arb-ts';
import { NETWORKS } from '@/utils/netWork'
import { TRANSACTION_TYPE } from '@/api/transaction';
import { utils, ethers } from 'ethers'


Vue.use(Popup);
Vue.use(CountDown);
Vue.use(Field);
Vue.use(Toast);
Vue.use(Icon);

const { parseEther } = utils;

export default {
  name: "withdraw",
  components: {
    'v-exchangeList': ExchangeList,
    'v-tokenAmount': TokenAmount,
    'v-statusPop': StatusPop,
    "v-netTipPopup": NetTipModal,
  },
  data() {
    return {
      popStatus: 'sucess',
      showStatusPop: false,
      // timeTxt: 'It is expected to take effect within 20~40 minutes',
      // tip: 'You can refrsh transaction in Transaction Details',
      timeTxt: 'Will take effect in 20~40 minutes',
      statusPopTitle: 'Withdraw Submitted',
      show: false,
      tipTxt: 'Confirm On The Wallet',
      tokenAmountButtonTxtCode: 1,
      tokenAmountButtonTxt: 'Enter The Amount',
      withDrawAddress: getDefaultAddress(this.$store),
      showNetTip: false,
      bridge: null,
      addHistoryData: null,
      showRefresh: false,
      refreshing: false,
    }
  },
  
  computed: {
    walletIsLock() {
      return this.$store.state.metamask.walletIsLock;
    },
    metamaskInstall() {
      return this.$store.state.metamask.metamaskInstall;
    },
  },
  watch: {
    walletIsLock(newValue, oldValue) {
      !newValue && (this.withDrawAddress = getDefaultAddress(this.$store));
    },
  },
  methods: {
    setMyAddress() { },
    changeVisible() {
      if (this.popStatus === 'success') {
        this.$router.push({ name: 'home' });
      }
    },
    handleAddressInputChange(value) {
      this.withDrawAddress = value;
      if (!utils.isAddress(value)) {
        this.tokenAmountButtonTxt = 'Invalid Address'
        this.tokenAmountButtonTxtCode = 2
        return;
      }
      this.tokenAmountButtonTxt = 'Enter The Amount'
      this.tokenAmountButtonTxtCode = 1
    },
    initBridge() {
      const connectAddress = window.ethereum.selectedAddress;
      const metamaskProvider = new ethers.providers.Web3Provider(window.ethereum);
      const netId = getSelectedChainID();
      const currentNet = NETWORKS[netId];
      const partnerNet = NETWORKS[currentNet['partnerChainID']];
      const tokenBridge = currentNet['tokenBridge'];

      const ethProvider = new ethers.providers.JsonRpcProvider(
        partnerNet['url']
      )
      const arbProvider = metamaskProvider
      const l1Signer = ethProvider.getSigner(connectAddress)
      const l2Signer = arbProvider.getSigner(0)
      
      const bridge = new Bridge(
        tokenBridge['l1Address'],
        tokenBridge['l2Address'],
        l1Signer,
        l2Signer,
      )
      this.bridge = bridge;
      return bridge
    },
    async executeConfirmTransaction(withrawTxHash) {
      const bridge = this.bridge || this.initBridge();
      const txnHash = withrawTxHash;
      const initiatingTxnReceipt = await bridge.l2Provider.getTransactionReceipt(txnHash);
      if (!initiatingTxnReceipt){
        return {
          success: false,
          msg: `No Arbitrum transaction found with provided txn hash: ${txnHash}`
        };
      }
      const outGoingMessagesFromTxn = await bridge.getWithdrawalsInL2Transaction(initiatingTxnReceipt)
      if (outGoingMessagesFromTxn.length === 0){
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
        return { success: false, msg };
      }
      const res = await bridge.triggerL2ToL1Transaction(batchNumber, indexInBatch)
      
      const rec = await res.wait()
      if (rec.confirmations === 1) {
        console.log('Done! Your transaction is executed')
        return { success: true }
      }
      return { success: false };
    },
    async submitWithdraw(info) {
      this.showStatusPop = false;
      this.tipTxt = 'Confirm On The Wallet';
      this.show = true;

      const connectAddress = window.ethereum.selectedAddress;
      if (!utils.isAddress(connectAddress)) {
        Toast.fail(`Wrong Address`);
        return;
      }

      const bridge = initBrideByTransanctionType('l2');
      // const bridge = this.bridge || this.initBridge();
      const ethFromL2WithdrawAmount = parseEther(info.amount);
      let destinationAddress = await bridge.l2Signer.getAddress();
      console.log(destinationAddress, this.withDrawAddress); // TODO 
      // gasPrice : gwei（1000000000=1gwei）
      bridge.withdrawETH(ethFromL2WithdrawAmount, undefined, {gasLimit: '21000', gasPrice:'100000000000' })
      // bridge.withdrawETH(ethFromL2WithdrawAmount)
      .then(async res=>{
        this.tipTxt = 'In progress, waitting';
        const txHash = res.hash;
        const transactionWaitRes = await res.wait();
        const { confirmations, from, to, transactionHash, status } = transactionWaitRes
        console.log(`transaction success! res:${res},waitRes:${transactionWaitRes}`)

        const submitData = {
          txid: transactionHash||txHash,
          from,
          to,
          type: TRANSACTION_TYPE['L2ToL1'],
          status,
          value: info.amount
        }
        this.addHistoryData = _.cloneDeep(submitData);
        await this.addHistory(submitData);
      })
      .catch(error => {
        this.show = false;
        if (error.code == '4001') {
          Toast('Cancel Transaction')
          return
        }
        console.log(error)
        // Toast.fail(`未知错误`);
        this.showStatusPop = true;
        this.statusPopTitle = 'Withdraw Failed'
        this.popStatus = 'fail';
      })
    },
    async addHistory(data) {
      const submitData = data || this.addHistoryData;
      const res = await this.$store.dispatch('AddTransactionHistory', {...submitData});
      if (res.hasError) {
        this.showRefresh = true;
        this.showStatusPop = false;
        this.show = false;
        console.log('Transaction success，but error when add history')
      } else  {
        this.show = false;
        await wait()
        prettyLog('Transaction is in progress，waiting for 10s....')
        this.showStatusPop = true;
        this.statusPopTitle = 'Withdraw Submitted'
        this.popStatus = 'success';
        await wait(10000);
        this.showStatusPop = false;
        this.$router.push({ name: 'home' });
        this.$eventBus.$emit('handleUpdateTransactionHistory', {type: 'L2ToL1'});
      }
      return { hasError: res.hasError };
    },
    async retryAddHistory() {
      this.refreshing = true;
      const res = await this.addHistory();
      if (!res.hasError) {
        this.showRefresh = false;
      } else {
        this.refreshing = false;
        Toast('Faild, can retry')
      }
    },
    async handleChainChanged({netId, showTip}) {
      if (showTip) {
        this.showNetTip = false;
        return
      }
      const mode = getNetMode(netId)
      if (mode !== 'l2') {
        this.showNetTip = true;
        await this.$store.dispatch('WalletLockStatus', {isLock: true});
      } else {
        this.showNetTip = false;
      }
    },
  },
  mounted() {
    this.$eventBus.$on('chainChanged', this.handleChainChanged);
  },
}
</script>

<style lang="scss" scoped>
  @import 'index';
</style>
