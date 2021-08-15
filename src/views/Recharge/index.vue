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
              <div class="address">{{ defaultAddress }}</div>
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
      <div>请耐心等待</div>
    </van-popup>
    <v-statusPop
      :status="popStatus"
      :title="statusPopTitle"
      timeTxt="预计 1 分钟内完成资金变动"
      tip="可以到“L2 钱包”对应资产的详情查看明细"
      :show="showStatusPop"
      @childEvent="changeVisible" />
  </div>
</template>
<script>
import Vue from 'vue';
import { RECHAERGE_TIP } from '@/utils/global';
import ExchangeList from '@/components/ExchangeList';
import TokenAmount from '@/components/TokenAmount';
import StatusPop from '@/components/StatusPop';
import { wait, prettyLog } from '@/utils/index'
import { Tab, Tabs, Button, Col, Row, Toast, Popup, CountDown } from 'vant';

import { providers, utils, Wallet, BigNumber, constants } from 'ethers'
import { DEFAULTIMG } from '@/utils/global';
import { getInfoFromStorageByKey } from '@/utils/storage';

import {
  rpcProvider, walletForRPC, bridgeAboutWalletForRPC,
  getAvailableBalanceForL1,getAvailableBalanceForL2, } from '@/utils/walletBridge'

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
    'v-statusPop': StatusPop,
  },
  data() {
    return {
      DEFAULTIMG,
      RECHAERGE_TIP,
      activeName: 'fromL1', // fromL1 | fromeL2
      show: false,
      time: 10 * 1000,
      showStatusPop: false,
      popStatus: "success",
      statusPopTitle: '您的转账已提交',
    }
  },
  computed: {
    /* walletIsLock() {
      return this.$store.state.metamask.walletIsLock;
    }, */
    walletIsLock() {
      const walletInfo = getInfoFromStorageByKey('walletInfo')
      if (walletInfo) {
        return walletInfo.isLock
      }
      return true;
    },
    metamaskInstall() {
      return this.$store.state.metamask.metamaskInstall;
    },
    defaultAddress() {
      return this.$store.state.metamask.accountsArr[0] || ''
    },
    provider() {
      return rpcProvider()
    },
    wallet() {
      return walletForRPC()
    },
    bridge() {
      return bridgeAboutWalletForRPC()
    },
  },
  methods: {
    async getWalletBalance() {
      const testWalletL1EthBalance = await testBridge.getAndUpdateL1EthBalance()
      const testWalletL2EthBalance = await testBridge.getAndUpdateL2EthBalance()
      console.log(testWalletL1EthBalance.toString(), testWalletL2EthBalance.toString())
    },
    async submitRecharge(info) {
      this.show = true;
      const { ethProvider } = this.provider;
      const bridge = this.bridge;
      const inbox = await bridge.l1Bridge.getInbox();  // 这个inbox (address)的作用？
      const inboxAddress = inbox.address;
      if (!utils.isAddress(inboxAddress)) {
        Toast.fail(`账户地址有误，无法进行交易`);
        return;
      }
      
      /* 
      const initialInboxBalance = await ethProvider.getBalance(inboxAddress)
      console.log('initialInboxBalance', initialInboxBalance.toNumber()) */
      
      // const testWalletL1EthBalance = await bridge.getAndUpdateL1EthBalance()
      // const testWalletL2EthBalance = await bridge.getAndUpdateL2EthBalance()
      // console.log(testWalletL1EthBalance.toString(), testWalletL2EthBalance.toString())

      // 转换充值金额
      const ethToL2DepositAmount = parseEther(info.amount);

      // let res = await bridge.depositETH(ethToL2DepositAmount)
      // let rec = await res.wait()

      bridge.depositETH(ethToL2DepositAmount)
      .then(async res=>{ // TODO 
        // Toast.fail(`交易已取消`);
        const walletL1EthBalance = await getAvailableBalanceForL1()
        const walletL2EthBalance = await getAvailableBalanceForL2()
        console.log('交易进行完成后获取L1和L2余额', walletL1EthBalance.toString(), walletL2EthBalance.toString())
        await wait()
        // this.showStatusPop = true;
        this.popStatus = 'success';
        prettyLog('交易正在进行，请耐心等待10s....')
        await wait(10000);
        // this.showStatusPop = false;
        this.show = false;
        this.$router.push({ name: 'Home' });
      })
      .catch(error => {
        // Toast.fail(`未知错误`);
        this.showStatusPop = true;
        this.statusPopTitle = '提现失败'
        this.popStatus = 'fail';
        console.log(error)
      })
      // const finalInboxBalance = await ethProvider.getBalance(inbox.address)
      // expect(initialInboxBalance.add(ethToL2DepositAmount).eq(finalInboxBalance))
    },
    handleUpdateWalletLockStatus(data) {
      this.walletIsLock = data.walletIsLock
    }
  },
  mounted() {
    this.$eventBus.$on('updateWalletLockStatus', this.handleUpdateWalletLockStatus);
    // console.log("metamask是否安装-recharge", this.$store.state.metamask.metamaskInstall)
    // console.log('钱包账户是否锁定-recharge', this.$store.state.metamask.walletIsLock);
  },
}
</script>
<style lang="scss" scoped>
  @import 'index';
</style>
