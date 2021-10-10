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
            placeholder="Please enter the address"
            @input="handleAddressInputChange"
          />
        </div>
      </div>
      <v-tokenAmount
        key="tokenAmount-withdraw"
        type="withdraw"
        @childEvent="submitWithdraw"
        :address="withDrawAddress"
        :buttonCode="tokenAmountButtonTxtCode"
        :buttonTxt="tokenAmountButtonTxt" />
    </div>
    <v-exchangeList key="comon-exchangeList" type="L2ToL1" v-show="!walletIsLock"/>
    <v-statusPop
      :status="popStatus"
      :title="statusPopTitle"
      :timeTxt="timeTxt"
      tip=""
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
      <span class="supplement-txt">Refresh to get history</span>
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
import { getNetMode, initBrideByNetType } from '@/utils/web3'
import { getTokenAddress, L2TokenABIJSON } from '@/utils/token';
import { TRANSACTION_TYPE } from '@/api/transaction';
import { utils, ethers } from 'ethers'
import { BigNumber } from "bignumber.js";

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
    changeVisible(eventInfo) {
      if (!eventInfo.submit) { return }
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
    withdrawFailed(error) {
      this.show = false;
      if (error.code == '4001') {
        Toast('Cancel Transaction')
        return
      }
      console.log(error)
      this.showStatusPop = true;
      this.statusPopTitle = 'Withdraw Failed'
      this.popStatus = 'fail';
    },
    async withdrawSuccess(withdrawRes, info) {
      this.tipTxt = 'In progress, waitting';
      const txHash = withdrawRes.hash;
      const transactionWaitRes = await withdrawRes.wait();
      const { confirmations, from, to, transactionHash, status } = transactionWaitRes
      console.log('transaction success! res:',withdrawRes,'waitRes:',transactionWaitRes)

      const submitData = {
        txid: transactionHash||txHash,
        from,
        to,
        type: TRANSACTION_TYPE['L2ToL1'],
        status,
        value: info.amount,
        block_num: transactionWaitRes.blockNumber,
        name: info.tokenInfo.symbol,
      }
      this.addHistoryData = _.cloneDeep(submitData);
      await this.addHistory(submitData);
    },
    async ethWithdraw(info) {
      const bridge = initBrideByNetType('l2')['bridge'];
      const ethFromL2WithdrawAmount = parseEther(info.amount);
      let destinationAddress = await bridge.l2Signer.getAddress();
      console.log(destinationAddress, this.withDrawAddress); // TODO 
      // gasPrice : gwei（1000000000=1gwei）
      bridge.withdrawETH(ethFromL2WithdrawAmount, undefined, {gasLimit: '21000', gasPrice:'100000000000' })
      // bridge.withdrawETH(ethFromL2WithdrawAmount)
      .then(async res=>{
        await this.withdrawSuccess(res, info)
      })
      .catch(error => {
        this.withdrawFailed(error)
      })
    },
    async tokenWithdraw(info) {
      const { symbol } = info.tokenInfo
      const tokenAddress = getTokenAddress(symbol)
      const abi = L2TokenABIJSON.abi;
      const { l2Signer } = initBrideByNetType('l2');
      const myContract = new ethers.Contract(tokenAddress, abi, l2Signer)
      console.log('myContract', myContract)
      const connectAddress = window.ethereum.selectedAddress;
      const tokenWithdrawAmount = this.web3.utils.toHex(BigNumber(Number(info.amount*1000000000000000000)).toFixed())
      console.log('tokenWithdrawAmount', tokenWithdrawAmount)
      myContract.withdraw(
        connectAddress, // l1TestWallet.address,
        tokenWithdrawAmount,
        { gasLimit: 600000, gasPrice: 100 })
      .then(async res=>{
        await this.withdrawSuccess(res, info)
      })
      .catch(error => {
        this.withdrawFailed(error)
      })
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

      const { symbol, isToken } = info.tokenInfo
      switch (symbol) {
        case 'ETH':
          await this.ethWithdraw(info)
          break;
        case 'xEIG':
          await this.tokenWithdraw(info)
          break;
      }
    },
    async addHistory(data) {
      const submitData = data || this.addHistoryData;
      if (!submitData) {
        Toast('Params Error');
        return ;
      }
      const res = await this.$store.dispatch('AddTransactionHistory', {...submitData});
      if (res.hasError) {
        this.showRefresh = true;
        this.showStatusPop = false;
        this.show = false;
        console.log('Transaction success，but error when add history')
      } else  {
        this.show = false;

        // prettyLog('Transaction is in progress，waiting for 10s....')
        this.showStatusPop = true;
        this.statusPopTitle = 'Withdraw Submitted'
        this.popStatus = 'success';
        await wait();
        this.showStatusPop = false;
        this.$router.push({ name: 'home' });
        // this.$eventBus.$emit('handleUpdateTransactionHistory', {type: 'L2ToL1'});

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
