<template>
  <div class="send-page content-box">
    <div class="send-toL2-tip flex">
      <div><i class="info_icon"></i></div>
      <div class="flex flex-column">
        <p>Send to L2</p>
        <div class="expand">
          <span class="expand-tip">{{ TRANSFER_TIP }}</span>
        </div>
      </div>
    </div>
    <div class="send-opt-area">
      <div class="flex flex-center address-wrapper">
        <div class="address-wrapper-inner">
          <van-field
            v-model="sendAddress"
            rows="2"
            autosize
            label=""
            type="textarea"
            :disabled="walletIsLock"
            placeholder="Please enter the address"
            @input="handleAddressInputChange"
            @focus="handleAddressInputFocus"
          />
        </div>
      </div>
      <span class="tip"><i class="info_icon"></i>Do not enter any exchange address!</span>
      <v-tokenAmount
        key="tokenAmount-send"
        type="send"
        @childEvent="submitSend"
        :address="sendAddress"
        :buttonCode="tokenAmountButtonTxtCode"
        :buttonTxt="tokenAmountButtonTxt" />
    </div>
    <v-exchangeList key="comon-exchangeList" type="L2ToL2" v-show="!walletIsLock" />
    <van-popup v-model="tipShow" class="safe-tip-toast" overlay-class="noneOverlay">
      <i class=""></i>
      <span>Address and Amount have been encrypted and protected!</span>
    </van-popup>
    <van-popup v-model="show" round :close-on-click-overlay="false" class="waiting-modal flex flex-center flex-column">
      <div class="inner-wrapper">
        <i class="confirm_icon"></i>
        <span class="tip">{{ tipTxt }}</span>
      </div>
    </van-popup>
    <v-statusPop
      :status="popStatus"
      :title="statusPopTitle"
      :timeTxt="timeTxt"
      tip=""
      :show="showStatusPop"
      @childEvent="changeVisible" />
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
import { TRANSFER_TIP } from '@/utils/global';
import ExchangeList from '@/components/ExchangeList';
import TokenAmount from '@/components/TokenAmount';
import StatusPop from '@/components/StatusPop';
import NetTipModal from '@/components/NetTipModal';
import { Popup, Field, Toast } from 'vant';
import { getNetMode, initBrideByNetType } from '@/utils/web3';
import { wait, prettyLog } from '@/utils/index'
import { getTokenAddress, L2TokenABIJSON } from '@/utils/token';
import { utils, ethers } from 'ethers'
import { utils as web3utils } from 'web3';
import { TRANSACTION_TYPE } from '@/api/transaction';
import { BigNumber } from "bignumber.js";

Vue.use(Popup);
Vue.use(Field);

export default {
  name: "Transfer",
  components: {
    'v-exchangeList': ExchangeList,
    'v-tokenAmount': TokenAmount,
    'v-statusPop': StatusPop,
    "v-netTipPopup": NetTipModal,
  },
  data() {
    return {
      TRANSFER_TIP,
      tipShow: false,
      showStatusPop: false,
      // timeTxt: 'It is expected to take effect within 1 minute',
      // tip: 'You can check the transaction details in the transaction record',
      timeTxt: 'Will take effect in one minute',
      popStatus: "success",
      sendAddress: '',
      showNetTip: false,
      show: false,
      tipTxt: 'Confirm On The Wallet',
      statusPopTitle: 'Transfer Submitted',
      addHistoryData: null,
      showRefresh: false,
      refreshing: false,
      tokenAmountButtonTxtCode: 1,
      tokenAmountButtonTxt: 'Enter The Amount',
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
  methods: {
    changeVisible(eventInfo) {
      // if (!eventInfo.submit) { return }
      this.showStatusPop = eventInfo.show;
    },
    async submitSend(info) {
      this.tipShow = true;
      setTimeout(()=>{ this.tipShow = false }, 2000);
      await wait(1500)

      this.showStatusPop = false;
      const toAddress = this.sendAddress;
      // const accounts = await ethereum.request({ method: 'eth_requestAccounts' })
      // const selectedAccountAddress = accounts[0];
      const selectedConnectAddress = window.ethereum.selectedAddress;
      if (!utils.isAddress(toAddress)) {
        Toast('Wrong Address')
        return
      }
      
      if (toAddress.toLocaleUpperCase() === selectedConnectAddress.toLocaleUpperCase()) {
        Toast("Don't enter your own address")
        return
      }

      const { symbol, isToken } = info.tokenInfo
      switch (symbol) {
        case 'ETH':
          await this.ethSend(info, { selectedConnectAddress, toAddress })
          break;
        case 'xEIG':
          await this.tokenSend(info, { selectedConnectAddress, toAddress })
          break;
      }
    },
    async sendSuccess(res, info, address) {
      const { selectedConnectAddress, toAddress } = address;
      const symbolName = info.tokenInfo.symbol || 'ETH'
      this.tipTxt = 'In progress,waitting';
      // prettyLog('Transaction is in progress，waiting for 10s....')
      const submitData = {
        txid: symbolName === 'ETH' ? res : res.hash,
        from: selectedConnectAddress,
        to: toAddress,
        type: TRANSACTION_TYPE['L2ToL2'],
        status: 1,
        value: info.amount,
        name: symbolName,
        operation: 'Send',
        network_id: window.ethereum.chainId
      }
      this.addHistoryData = _.cloneDeep(submitData);
      await this.addHistory(submitData);
    },
    sendFailed(error) {
      this.show = false;
      if (error.code == '4001') {
        Toast('Cancel Transaction')
        return
      }
      console.log(error)
      this.showStatusPop = true;
      this.statusPopTitle = 'Transfer Failed'
      this.popStatus = 'fail';
    },
    async ethSend(info, address) {
      this.tipTxt = 'Confirm On The Wallet';
      this.show = true;
      const transferAmount = utils.parseEther(info.amount);
      const { selectedConnectAddress, toAddress } = address;
      const transferParams = [{
        from: selectedConnectAddress,
        to: toAddress,
        gas: web3utils.toHex('21000'), // 21000的16进制 '0x5208
        gasPrice: '0',
        value: transferAmount.toHexString()
      }];
      console.log('submitData', transferParams)
      ethereum.request({
        jsonrpc: "2.0",
        method: "eth_sendTransaction",
        params: transferParams,
        id: 0
      })
      .then(async res=>{
        await this.sendSuccess(res, info, address)
      })
      .catch(error=>{
        this.sendFailed(error)
      })
    },
    async tokenSend(info, address) {
      const { toAddress } = address;
      const { symbol } = info.tokenInfo
      const tokenAddress = getTokenAddress(symbol)
      const abi = L2TokenABIJSON.abi;
      const { l2Signer } = initBrideByNetType('l2');
      const myContract = new ethers.Contract(tokenAddress, abi, l2Signer)
      const tokenWithdrawAmount = this.web3.utils.toHex(BigNumber(Number(info.amount*1000000000000000000)).toFixed())
      const cipher_tokenWithdrawAmount = await myContract.encrypt(info.amount, { gasLimit: 594949, gasPrice: 1 })
      console.log('tokenWithdrawAmount', info.amount, tokenWithdrawAmount)
      // address, uint256
      myContract.transfer(toAddress, tokenWithdrawAmount)
      .then(async res=>{
        console.log(res)
        await this.sendSuccess(res, info, address)
      })
      .catch(error => {
        this.sendFailed(error)
      })
      
      // address, bytes(cipher_amount)
      /* myContract.cipherTransfer(toAddress, cipher_tokenWithdrawAmount)
      .then(async res=>{
        console.log(res)
        await this.sendSuccess(res, info, address)
      })
      .catch(error => {
        this.sendFailed(error)
      }) */
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
        // this.$router.push({ name: 'home' });
        console.log('Transaction success，but error when add history')
      } else  {
        this.show = false;
        this.showStatusPop = true;
        this.statusPopTitle = 'Transfer Submitted'
        this.popStatus = 'success';
        // this.$eventBus.$emit('handleUpdateTransactionHistory', {type: 'L2ToL2'});
        await wait();
        this.$router.push({ name: 'home' });
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
    handleAddressInputChange(value) {
      this.sendAddress = value;
      if (!utils.isAddress(value)) {
        this.tokenAmountButtonTxt = 'Invalid Address'
        this.tokenAmountButtonTxtCode = 2
        return;
      }
      this.tokenAmountButtonTxt = 'Enter The Amount'
      this.tokenAmountButtonTxtCode = 1
    },
    handleAddressInputFocus() {
      return
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
    handleDisconnect() {
      this.sendAddress = ''
    },
  },
  mounted() {
    this.$eventBus.$on('chainChanged', this.handleChainChanged);
    this.$eventBus.$on('disconnect', this.handleDisconnect);
  },
}
</script>
<style lang="scss" scoped>
  @import 'index';
</style>