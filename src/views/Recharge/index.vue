<template>
  <div class="recharge-page">
    <div class="recharge-toL2-tip flex">
      <div><i></i></div>
      <div class="flex flex-column">
        <p>Deposit to L2</p>
        <div class="expand">
          <span class="expand-tip">{{ RECHAERGE_TIP }}</span>
        </div>
      </div>
    </div>
    <div class="recharge-opt-area">
      <van-tabs v-model="activeName">
        <van-tab title="Deposit from L1 account" name="fromL1">
          <v-tokenAmount
          key="tokenAmount-recharge"
          type="recharge"
          @childEvent="submitRecharge" />
        </van-tab>
        <van-tab title="Deposit from L2 account" name="fromeL2">
          <div class="recharge-amount-wrap">
            <div class="flex flex-center">
              <img :src="DEFAULTIMG.TEST_QR" class="img-QR"/>
            </div>
            <div class="recharge-address-wrapper">
              <h3>Deposit address</h3>
              <div class="address">{{ defaultAddress }}</div>
              <van-button color="#ECEEF8" class="copy-address" @click="copyAddress">
                <span slots="default" style="color:#495ABE">Copy Address</span>
              </van-button>
              <span>
                <span>EigenSecret supported assets only.</span>
                <span>Do not send other assets to this address.</span>
              </span>
            </div>
          </div>
        </van-tab>
      </van-tabs>
    </div>
    <v-exchangeList key="comon-exchangeList" type="L1ToL2" v-show="activeName=='fromL1'&&!walletIsLock" />
    <van-popup v-model="show" round :close-on-click-overlay="false" class="waiting-modal flex flex-center flex-column">
      <div>{{ tipTxt }}</div>
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
import { RECHAERGE_TIP } from '@/utils/global';
import ExchangeList from '@/components/ExchangeList';
import TokenAmount from '@/components/TokenAmount';
import StatusPop from '@/components/StatusPop';
import NetTipModal from '@/components/NetTipModal';
import { wait, prettyLog } from '@/utils/index'
import { Tab, Tabs, Button, Col, Row, Toast, Popup, CountDown } from 'vant';
import { getNetMode, getSelectedChainID, initBrideByTransanctionType } from '@/utils/web3'
import { utils, ethers } from 'ethers'
import { DEFAULTIMG } from '@/utils/global';
import { NETWORKS } from '@/utils/netWork'
import { Bridge } from 'arb-ts';
import { TRANSACTION_TYPE } from '@/api/transaction';
import { copyTxt } from '@/utils/index';
import { utils as web3utils } from 'web3';

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
      tipTxt: 'Please confirm on the wallet',
      showStatusPop: false,
      popStatus: "success",
      statusPopTitle: 'Your transfer has been submitted',
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
    copyAddress() {
      if (this.walletIsLock) {
        return;
      }
      copyTxt(this.defaultAddress)
      Toast.success('Success')
    },
    async getWalletBalance() {
      const testWalletL1EthBalance = await testBridge.getAndUpdateL1EthBalance()
      const testWalletL2EthBalance = await testBridge.getAndUpdateL2EthBalance()
      console.log(testWalletL1EthBalance.toString(), testWalletL2EthBalance.toString())
    },
    initBridge() {
      const connectAddress = window.ethereum.selectedAddress;
      const metamaskProvider = new ethers.providers.Web3Provider(window.ethereum);
      const netId = getSelectedChainID();
      const currentNet = NETWORKS[netId];
      const partnerNet = NETWORKS[currentNet['partnerChainID']];
      const tokenBridge = currentNet['tokenBridge'];

      const ethProvider = metamaskProvider
      const arbProvider = new ethers.providers.JsonRpcProvider(
        partnerNet['url']
      )
      const l1Signer = ethProvider.getSigner(0);
      const l2Signer = arbProvider.getSigner(connectAddress);
      const bridge = new Bridge(
        tokenBridge['l1Address'],
        tokenBridge['l2Address'],
        l1Signer,
        l2Signer,
      )
      this.bridge = bridge;
      return bridge
    },
    async submitRecharge(info) {
      this.showStatusPop = false;
      this.tipTxt = 'Please confirm on the wallet';
      this.show = true;

      const connectAddress = window.ethereum.selectedAddress;
      if (!utils.isAddress(connectAddress)) {
        Toast.fail(`Wrong Address`);
        return;
      }

      const bridge = this.bridge || this.initBridge();
      // const bridge = initBrideByTransanctionType('l1');
      const ethToL2DepositAmount = parseEther(info.amount);
      // bridge.depositETH(ethToL2DepositAmount, {gas: web3utils.toHex('21000')})
      bridge.depositETH(ethToL2DepositAmount)
      .then(async res=>{
        this.tipTxt = 'The transaction is in progress, please wait';
        const txHash = res.hash;
        const transactionWaitRes = await res.wait();
        console.log('transactionWaitRes', transactionWaitRes)
        const { confirmations, from, to, transactionHash, status } = transactionWaitRes

        // if (confirmations == 1) { // TODO deposit confirmations===1 is success，but appear 2
          console.log('transaction success',res)
          this.$store.dispatch('AddTransactionHistory', {
            txid: txHash,
            from: res.from || connectAddress,
            to: res.to,
            type: TRANSACTION_TYPE['L1ToL2'],
            status: status,
          })
          .then(async res=>{
            this.show = false;
            this.showStatusPop = true;
            this.statusPopTitle = 'Your transfer has been submitted'
            this.popStatus = 'success';
            prettyLog('transaction is in progress，waiting fro 10s....')
            await wait(10000);
            this.showStatusPop = false;
            this.$eventBus.$emit('handleUpdateTransactionHistory', {type: 'L1ToL2'});
            this.$router.push({ name: 'Home' });
          })
          .catch(err=>{
            this.show = false;
            this.showStatusPop = false;
            // this.$router.push({ name: 'Home' });
            Toast.fail(`Transaction success，but error when add history`);
            console.log(`There is unknown error when add history,${err}`)
          })
        // } else {
        //   this.show = false;
        //   Toast('unknown error')
        // }
      })
      .catch(error => {
        this.show = false;
        if (error.code == '4001') {
          Toast('Cancel Transaction')
          return
        }
        console.log(error)
        this.showStatusPop = true;
        this.statusPopTitle = 'Deposit Failed'
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
