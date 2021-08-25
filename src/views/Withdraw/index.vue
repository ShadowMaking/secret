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
    <v-exchangeList key="comon-exchangeList" type="L2ToL1" v-show="!walletIsLock"/>
    <!-- 请在链上钱包中查看到账情况 -->
    <v-statusPop
      :status="popStatus"
      :title="statusPopTitle"
      timeTxt="预计等待 20-40 分钟汇出"
      tip="到账慢可在交易详情中进行加速操作"
      :show="showStatusPop"
      @childEvent="changeVisible" />
    <van-popup v-model="show" round :close-on-click-overlay="false" class="waiting-modal flex flex-center flex-column">
      <div>{{ tipTxt }}</div>
    </van-popup>
    <v-netTipPopup :show="showNetTip" key="netTipModal" />
  </div>
</template>
<script>
import Vue from 'vue';
import { Popup, CountDown, Field, Toast } from 'vant';
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
      statusPopTitle: '您的提现已提交',
      show: false,
      tipTxt: '请在钱包上确认',
      tokenAmountButtonTxtCode: 1,
      tokenAmountButtonTxt: '请输入金额',
      withDrawAddress: getDefaultAddress(this.$store),
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
        this.$router.push({ name: 'Home' });
      }
    },
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
      this.tipTxt = '请在钱包上确认';
      this.show = true;

      const connectAddress = window.ethereum.selectedAddress;
      if (!utils.isAddress(connectAddress)) {
        Toast.fail(`账户地址有误，无法进行交易`);
        return;
      }

      // const bridge = initBrideByTransanctionType('l2');
      const bridge = this.bridge || this.initBridge();
      const ethFromL2WithdrawAmount = parseEther(info.amount);
      const destinationAddress = await bridge.l2Signer.getAddress();
      // gasPrice : gwei（1000000000=1gwei）
      bridge.withdrawETH(ethFromL2WithdrawAmount, undefined, {gasLimit: '21000', gasPrice:'100000000000' })
      // bridge.withdrawETH(ethFromL2WithdrawAmount)
      .then(async res=>{
        this.tipTxt = '交易正在进行';
        const txHash = res.hash;
        const transactionWaitRes = await res.wait();
        console.log('transactionWaitRes', transactionWaitRes)
        const { confirmations, from, to, transactionHash, status } = transactionWaitRes

        // if (confirmations == 1) {
          this.$store.dispatch('AddTransactionHistory', {
            txid: transactionHash||txHash,
            from,
            to,
            type: TRANSACTION_TYPE['L2ToL1'],
            status
          })
          .then(async res=>{
            this.show = false;
            console.log('交易成功',res)
            await wait()
            prettyLog('交易正在进行，请耐心等待10s....')
            this.showStatusPop = true;
            this.statusPopTitle = '您的提现已提交'
            this.popStatus = 'success';
            await wait(10000);
            this.showStatusPop = false;
            this.$router.push({ name: 'Home' });
            this.$eventBus.$emit('handleUpdateTransactionHistory', {type: 'L2ToL1'});
          })
          .catch(err=>{
            this.show = false;
            this.showStatusPop = false;
            // this.$router.push({ name: 'Home' });
            Toast.fail(`交易已成功，但提交记录发生未知错误`);
            console.log(`提交记录发生未知错误,${err}`)
          })
        // }
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
        this.statusPopTitle = '提现失败'
        this.popStatus = 'fail';
      })
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
