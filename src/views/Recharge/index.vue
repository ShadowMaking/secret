<template>
  <div class="recharge-page">
    <div class="recharge-toL2-tip flex">
      <div><i></i></div>
      <div class="flex flex-column">
        <p>充值到L2</p>
        <div class="expand">
          <span class="expand-tip">{{ RECHAERGE_TIP }}</span>
        </div>
      </div>
    </div>
    <div class="recharge-opt-area">
      <van-tabs v-model="activeName">
        <van-tab title="从L1 账户充值" name="fromL1">
          <v-tokenAmount
          key="tokenAmount-recharge"
          type="recharge"
          @childEvent="submitRecharge" />
        </van-tab>
        <van-tab title="从L2 账户充值" name="fromeL2">
          <div class="recharge-amount-wrap">
            <div class="flex flex-center">
              <img :src="DEFAULTIMG.TEST_QR" class="img-QR"/>
            </div>
            <div class="recharge-address-wrapper">
              <h3>充币地址</h3>
              <div class="address">
                lkkdkjkdfjkdfjkdjfiejijriejckdcdncjdn
              </div>
              <van-button color="#ECEEF8" class="copy-address">
                <span slots="default" style="color:#495ABE">复制地址</span>
              </van-button>
              <span>
                <span>仅支持 ZKSwap 上 L2 资产转账</span>
                <span>请勿向上送地址发送其他资产</span>
              </span>
            </div>
          </div>
        </van-tab>
      </van-tabs>
    </div>
    <v-exchangeList key="comon-exchangeList" type="recharge" v-show="activeName=='fromL1'&&!walletIsLock" />
    <van-popup v-model="show" round :close-on-click-overlay="false" class="waiting-modal flex flex-center flex-column">
      <div>交易正在进行</div>
      <div>请耐心等待<van-count-down :time="time" /></div>
    </van-popup>
  </div>
</template>
<script>
import Vue from 'vue';
import { RECHAERGE_TIP } from '@/utils/global';
import ExchangeList from '@/components/ExchangeList';
import TokenAmount from '@/components/TokenAmount';
import { wait, prettyLog } from '@/utils/index'
import { Tab, Tabs, Button, Col, Row, Toast, Popup, CountDown } from 'vant';

import { providers, utils, Wallet, BigNumber, constants } from 'ethers'
import { Bridge } from 'arb-ts';
import {
  DEFAULTIMG,
  address,
  DEVNET_PRIVKEY,
  ethRPC,
  arbRPC
} from '@/utils/global';

const { parseEther } = utils;


Vue.use(Tab);
Vue.use(Tabs);
Vue.use(Button);
Vue.use(Col);
Vue.use(Row);
Vue.use(Toast);
Vue.use(Popup);
Vue.use(CountDown);

export default {
  name: "Recharge",
  components: {
    'v-exchangeList': ExchangeList,
    'v-tokenAmount': TokenAmount,
  },
  data() {
    return {
      DEFAULTIMG,
      RECHAERGE_TIP,
      activeName: 'fromL1', // fromL1 | fromeL2
      show: false,
      time: 10 * 1000,
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
  methods: {
    async submitRecharge(info) {
      const accountAddress = this.defaultAddress; // 0x81183C9C61bdf79DB7330BBcda47Be30c0a85064
      const ethERC20BridgeAddress = address.ethERC20Bridge; // 0x9B0bbB332c01F3c81C1Bdd6AbB17649528f198D2
      // 转换充值金额
      const ethToL2DepositAmount = parseEther(info.amount);
      if (!utils.isAddress(accountAddress)) {
        Toast.fail(`账户地址有误，无法进行交易`);
        return;
      }
      // 交易对象
      const params= [{
        from: accountAddress,
        to: ethERC20BridgeAddress,
        // to: '0xDCc1614667ECF280cb2938405f339bFbC3Ab833D',
        // gas: '0x76c0',              // 30400
        // gasPrice: '0x9184e72a000',  // 10000000000000
        gas: '0',       // 30400
        gasPrice: '1',  // 10000000000000
        value: ethToL2DepositAmount.toHexString(),  // 注意单位 此处ethToL2DepositAmount.toString()就不对！！！
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
    },
  },
  mounted() {
    console.log("metamask是否安装-recharge", this.$store.state.metamask.metamaskInstall)
    console.log('钱包账户是否锁定-recharge', this.$store.state.metamask.walletIsLock);
  },
  
}
</script>
<style lang="scss" scoped>
  @import 'index';
</style>