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
      <div>请在钱包上确认</div>
    </van-popup>
    <v-statusPop
      :status="popStatus"
      :title="statusPopTitle"
      timeTxt="预计 1 分钟内完成资金变动"
      tip="可以到“L2 钱包”对应资产的详情查看明细"
      :show="showStatusPop"
      @childEvent="changeVisible" />
    <v-netTipPopup :show="showNetTip" key="netTipModal" />
  </div>
</template>
<script>
import Vue from 'vue';
import { RECHAERGE_TIP } from '@/utils/global';
import ExchangeList from '@/components/ExchangeList';
import TokenAmount from '@/components/TokenAmount';
import StatusPop from '@/components/StatusPop';
import NetTipModal from '@/components/NetTipModal';
import { wait, prettyLog } from '@/utils/index'
import { Tab, Tabs, Button, Col, Row, Toast, Popup, CountDown } from 'vant';
import { getNetMode, getSelectedChainID, initBrideByTransanctionType } from '@/utils/web3'
import { providers, utils, Wallet, BigNumber, constants } from 'ethers'
import { DEFAULTIMG } from '@/utils/global';
import { NETWORKS } from '@/utils/netWork'
import { Bridge } from 'arb-ts';

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
    "v-netTipPopup": NetTipModal,
  },
  data() {
    return {
      DEFAULTIMG,
      RECHAERGE_TIP,
      activeName: 'fromL1', // fromL1 | fromeL2
      show: false,
      showStatusPop: false,
      popStatus: "success",
      statusPopTitle: '您的转账已提交',
      showNetTip: false,
      bridge: null,
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
    async getWalletBalance() {
      const testWalletL1EthBalance = await testBridge.getAndUpdateL1EthBalance()
      const testWalletL2EthBalance = await testBridge.getAndUpdateL2EthBalance()
      console.log(testWalletL1EthBalance.toString(), testWalletL2EthBalance.toString())
    },
    initBridge() {
      const connectAddress = window.ethereum.selectedAddress;
      const metamaskProvider = new this.ethers.providers.Web3Provider(window.ethereum);
      const netId = getSelectedChainID();
      const currentNet = NETWORKS[netId];
      const partnerNet = NETWORKS[currentNet['partnerChainID']];
      const tokenBridge = currentNet['tokenBridge'];

      const ethProvider = metamaskProvider
      const arbProvider = new this.ethers.providers.JsonRpcProvider(
        partnerNet['url']
        // 'http://43.128.80.242:8547' // TODO
      )
      const l1Signer = ethProvider.getSigner(0);
      const l2Signer = arbProvider.getSigner(connectAddress);
      const bridge = new Bridge(
        tokenBridge['l1Address'], // "0x7feAe6550487B59Cb903d977c18Ea16c4CC8D89e",
        tokenBridge['l2Address'], // "0x5fe46790aE8c6Af364C2f715AB6594A370089B35",
        l1Signer,
        l2Signer,
      )
      this.bridge = bridge;
      return bridge
    },
    async submitRecharge(info) {
      this.show = true;

      const connectAddress = window.ethereum.selectedAddress;
      if (!utils.isAddress(connectAddress)) {
        Toast.fail(`账户地址有误，无法进行交易`);
        return;
      }

      const bridge = this.bridge || this.initBridge();
      // const bridge = initBrideByTransanctionType('l1');
      const ethToL2DepositAmount = parseEther(info.amount);
      bridge.depositETH(ethToL2DepositAmount)
      .then(async res=>{
        this.show = false;
        console.log('交易成功',res)
        await wait()
        prettyLog('交易正在进行，请耐心等待10s....')
        this.showStatusPop = true;
        this.statusPopTitle = '您的转账已提交'
        this.popStatus = 'success';
        await wait(10000);
        this.showStatusPop = false;
        this.$router.push({ name: 'Home' });
      })
      .catch(error => {
        this.show = false;
        if (error.code == '4001') {
          Toast('交易取消')
          return
        }
        console.log(error)
        // Toast.fail(`未知错误`);
        this.showStatusPop = true;
        this.statusPopTitle = '充值失败'
        this.popStatus = 'fail';
      })
    },
    async handleChainChanged({netId, showTip}) {
      if (showTip) {
        this.showNetTip = false;
        return
      }
      const mode = getNetMode(netId)
      if (mode !== 'l1') {
        this.showNetTip = true;
        await this.$store.dispatch('WalletLockStatus', {isLock: true});
      } else {
        this.showNetTip = false;
      }
    },
    changeVisible() {
      if (this.popStatus === 'success') {
        this.$router.push({ name: 'Home' });
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
