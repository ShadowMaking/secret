<template>
  <div class="withdraw-page">
    <van-row type="flex" justify="space-between" align="center" class="top-address">
      <van-col span="12" class="textAlignLeft">提现地址</van-col>
      <van-col span="12" class="textAlignRight">
        <van-button color="#E4E6F5" size="mini" @click="setMyAddress">
          <span slots="default" style="coloe:#495ABE">我的地址</span>
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
            placeholder="请输入提现地址"
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
    <v-exchangeList key="comon-exchangeList" type="withdraw" v-show="!walletIsLock"/>
    <v-statusPop
      :status="popStatus"
      title="您的提现已提交"
      timeTxt="预计等待 20-40 分钟汇出"
      tip="请在链上钱包中查看到账情况"
      :show="showStatusPop"
      @childEvent="changeVisible" />
    <van-popup v-model="show" round :close-on-click-overlay="false" class="waiting-modal flex flex-center flex-column">
      <div>交易正在进行</div>
      <div>请耐心等待<van-count-down :time="time" /></div>
    </van-popup>
  </div>
</template>
<script>
import Vue from 'vue';
import { Popup, CountDown, Field, Toast } from 'vant';
import TokenAmount from '@/components/TokenAmount';
import ExchangeList from '@/components/ExchangeList';
import StatusPop from '@/components/StatusPop';
import { wait, prettyLog } from '@/utils/index'
import { getDefaultAddress } from '@/utils/auth'

import { providers, utils, Wallet, BigNumber, constants } from 'ethers'
import { Bridge } from 'arb-ts';
import {
  address,
  DEVNET_PRIVKEY,
  ethRPC,
  arbRPC
} from '@/utils/global';

Vue.use(Popup);
Vue.use(CountDown);
Vue.use(Field);
Vue.use(Toast);

const { parseEther } = utils;

export default {
  name: "withdraw",
  components: {
    'v-exchangeList': ExchangeList,
    'v-tokenAmount': TokenAmount,
    'v-statusPop': StatusPop,
  },
  data() {
    return {
      popStatus: 'sucess',
      showStatusPop: false,
      show: false,
      time: 10 * 1000,
      tokenAmountButtonTxtCode: 1,
      tokenAmountButtonTxt: '请输入金额',
      withDrawAddress: getDefaultAddress(this.$store),
    }
  },
  
  computed: {
    walletIsLock() {
      return this.$store.state.metamask.walletIsLock;
    },
    metamaskInstall() {
      return this.$store.state.metamask.metamaskInstall;
    },
    defaultAddress() {
      return this.$store.state.metamask.accountsArr[0] || ''
    },
  },
  watch: {
    walletIsLock(newValue, oldValue) {
      !newValue && (this.withDrawAddress = getDefaultAddress(this.$store));
    },
  },
  methods: {
    setMyAddress() { },
    changeVisible() {},
    handleAddressInputChange(value) {
      this.withDrawAddress = value;
      if (!utils.isAddress(value)) {
        this.tokenAmountButtonTxt = '地址无效'
        this.tokenAmountButtonTxtCode = 2
        return;
      }
      this.tokenAmountButtonTxt = '请输入金额'
      this.tokenAmountButtonTxtCode = 1
    },
    async submitWithdraw(info) {
      this.showStatusPop = false;
      const accountAddress = this.defaultAddress;           // 0x81183C9C61bdf79DB7330BBcda47Be30c0a85064
      const arbTokenBridgeAddress = address.arbTokenBridge; // 0x2EEBB8EE9c377caBC476654ca4aba016ECA1B9fc
      // 转换充值金额
      const ethFromL2WithdrawAmount = parseEther(info.amount);
      if (!utils.isAddress(accountAddress)) {
        Toast.fail(`账户地址有误,无法进行交易`);
        return;
      }
      // 交易对象
      const params= [{
        from: accountAddress,
        to: arbTokenBridgeAddress,
        // gas: '0x76c0',              // 30400
        // gasPrice: '0x9184e72a000',  // 10000000000000
        // value: '0x9184e72a',     // 2441406250
        gas: '0',
        gasPrice: '1',
        value: ethFromL2WithdrawAmount.toHexString(),
        // data:'0xd46e8dd67c5d32be8d46e8dd67c5d32be8058bb8eb970870f072445675058bb8eb970870f072445675',
      }];
      let transactionStatus = false;
      let errorTxt = '未知错误';
      await ethereum.request({
        method: 'eth_sendTransaction',
        params,
      })
      .then((result) => {
        transactionStatus = true;
      })
      .catch((error) => {
        switch(error.code) {
          case 4001:
            errorTxt = '交易已取消'
            break;
          default:
            errorTxt = '未知错误'
            break;
        }
        console.log('transaction-error', error)
      });
      if (!transactionStatus) {
        Toast.fail(`${errorTxt}`);
        return
      }
      await wait();
      this.show = true;
      prettyLog('交易正在进行，请耐心等待10s....')
      await wait(10000);
      this.show = false;
      this.$router.push({ name: 'Home' });
    }
  },
  mounted() {
    console.log("metamask是否安装", this.$store.state.metamask.metamaskInstall)
    console.log('钱包账户是否锁定', this.$store.state.metamask.walletIsLock);
  },
}
</script>

<style lang="scss" scoped>
  @import 'index';
</style>