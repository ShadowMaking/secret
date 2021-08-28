<template>
  <div class="transfer-page">
    <div class="transfer-toL2-tip flex">
      <div><i class="info_icon"></i></div>
      <div class="flex flex-column">
        <p>L2 Transfer</p>
        <div class="expand">
          <span class="expand-tip">{{ TRANSFER_TIP }}</span>
        </div>
      </div>
    </div>
    <div class="transfer-opt-area">
      <div class="flex flex-center address-wrapper">
        <div class="address-wrapper-inner">
          <van-field
            v-model="transferAddress"
            rows="2"
            autosize
            label=""
            type="textarea"
            :disabled="walletIsLock"
            placeholder="enter the transfer address"
            @input="handleAddressInputChange"
            @focus="handleAddressInputFocus"
          />
        </div>
      </div>
      <span class="tip"><i class="info_icon"></i>Do not enter any exchange address!</span>
      <v-tokenAmount key="tokenAmount-transfer" type="transfer" @childEvent="submitTransfer" />
    </div>
    <v-exchangeList key="comon-exchangeList" type="L2ToL2" v-show="!walletIsLock" />
    <van-popup v-model="tipShow" class="safe-tip-toast" overlay-class="noneOverlay">
      <i class=""></i>
      <span>Aaddress and Amount have been encrypted and protected!</span>
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
      timeTxt="It is expected to take effect within 1 minute"
      tip="You can check the transaction details in the transaction record"
      :show="showStatusPop"
      @childEvent="changeVisible" />
    <v-netTipPopup :show="showNetTip" key="netTipModal" />
  </div>
</template>
<script>
import Vue from 'vue';
import { TRANSFER_TIP } from '@/utils/global';
import ExchangeList from '@/components/ExchangeList';
import TokenAmount from '@/components/TokenAmount';
import StatusPop from '@/components/StatusPop';
import NetTipModal from '@/components/NetTipModal';
import { Popup, Field, Toast } from 'vant';
import { getNetMode } from '@/utils/web3';
import { wait, prettyLog } from '@/utils/index'
import { utils } from 'ethers';
import { utils as web3utils } from 'web3';
import { TRANSACTION_TYPE } from '@/api/transaction';

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
      popStatus: "success",
      transferAddress: '',
      showNetTip: false,
      show: false,
      tipTxt: 'Confirm On The Wallet',
      statusPopTitle: 'Transfer Submitted',
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
      this.showStatusPop = eventInfo.show;
    },
    async submitTransfer(info) {
      this.showStatusPop = false;
      const transferToAddress = this.transferAddress;
      const accounts = await ethereum.request({ method: 'eth_requestAccounts' })
      const selectedAccountAddress = accounts[0];
      if (!utils.isAddress(transferToAddress)) {
        Toast('Wrong Address')
        return
      }
      
      if (transferToAddress.toLocaleUpperCase() === selectedAccountAddress.toLocaleUpperCase()) {
        Toast("Don't enter your own address")
        return
      }

      this.tipTxt = 'Confirm On The Wallet';
      this.show = true;
      const transferAmount = utils.parseEther(info.amount);
      const transferParams = [{
        from: selectedAccountAddress,
        to: transferToAddress,
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
        this.tipTxt = 'In progress,waitting';
        console.log('交易成功',res)
        await wait(10000);
        prettyLog('Transaction is in progress，waiting for 10s....')
        
        this.$store.dispatch('AddTransactionHistory', {
          txid: res,
          from: transferParams['from'] || selectedAccountAddress,
          to: transferParams['to'] || transferToAddress,
          type: TRANSACTION_TYPE['L2ToL2'],
          status: 1,
          value: info.amount
        })
        .then(async res=>{
          this.show = false;
          this.showStatusPop = true;
          this.statusPopTitle = 'Transfer Submitted'
          this.popStatus = 'success';
          this.$eventBus.$emit('handleUpdateTransactionHistory', {type: 'L2ToL2'});
          await wait();
          this.$router.push({ name: 'Home' });
        })
        .catch(err=>{
          this.showStatusPop = false;
          // this.$router.push({ name: 'Home' });
          Toast.fail(`Transaction success，but error when add history`);
          console.log(`There is unknown error when add history,${err}`)
        })
      })
      .catch(error=>{
        this.show = false;
        if (error.code == '4001') {
          Toast('Cancel Transaction')
          return
        }
        console.log(error)
        // Toast.fail(`unknown error`);
        this.showStatusPop = true;
        this.statusPopTitle = 'Transfer Failed'
        this.popStatus = 'fail';
      })
    },
    handleAddressInputChange(value) {

    },
    handleAddressInputFocus() {
      this.tipShow = true;
      setTimeout(()=>{
        this.tipShow = false;
      }, 2000)
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