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
    <v-statusPop
      :status="popStatus"
      :title="statusPopTitle"
      timeTxt="预计等待 20-40 分钟汇出"
      tip="请在链上钱包中查看到账情况"
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
import {
  rpcProvider, walletForRPC, bridgeAboutWalletForRPC,
  getAvailableBalanceForL1,getAvailableBalanceForL2, } from '@/utils/walletBridge'

import { providers, utils, Wallet, BigNumber, constants } from 'ethers'


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
      const metamaskProvider = new this.ethers.providers.Web3Provider(window.ethereum);
      const netId = getSelectedChainID();
      const currentNet = NETWORKS[netId];
      const partnerNet = NETWORKS[currentNet['partnerChainID']];
      const tokenBridge = currentNet['tokenBridge'];

      const ethProvider = new this.ethers.providers.JsonRpcProvider(
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
        await wait(1000 * 60)
        /* const outgoingMessageState = await bridge.getOutGoingMessageState(
          batchNumber,
          indexInBatch
        ) */
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
      debugger
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
      // bridge.withdrawETH(ethFromL2WithdrawAmount, undefined, {gas: '0x933212' })
      bridge.withdrawETH(ethFromL2WithdrawAmount)
      .then(async res=>{
        const txHash = res.hash;
        const transactionWaitRes = await res.wait();
        console.log('transactionWaitRes', transactionWaitRes)
        const { confirmations } = transactionWaitRes
        const { from, to, transactionHash } = confirmations;

        // {"txid": "1", "from": "0x1", "to": "0x1", "type":0}
        this.$store.dispatch('AddTransactionHistory', {
          txid: transactionHash,
          from,
          to,
          type: TRANSACTION_TYPE['L2ToL1'],
          status: confirmations // 1-成功(交易已被确认)，0-失败
        })
        .then(res=>{
          this.$eventBus.$emit('handleUpdateTransactionHistory', {type: 'L2ToL1'});
        })
        .catch(err=>{})

        this.tipTxt = '交易正在进行';

        // 执行下面代码
        if (confirmations == 1) {
          const conformStatus = await this.executeConfirmTransaction(txHash);
          if (conformStatus.success) {
            // 如果是withdraw，并且confirmation是1，然后继续调用我那段代码，如果成功将后端status改成2.
            // {"status": 1, "sub_txid": "2121"}  withdraw类型的交易，status是2，才认为成功
            this.$store.dispatch('UpdateTransactionHistory', {
              txid: txHash,
              status: 2,
            })
            .then(res=>{
              this.$eventBus.$emit('handleUpdateTransactionHistory', {type: 'L2ToL1'});
            })
            .catch(err=>{})
          }
        }

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
        
        //执行交易
        /* const txnHash = res.hash;
        const initiatingTxnReceipt = await bridge.l2Provider.getTransactionReceipt(
          res.hash
        )
        if (!initiatingTxnReceipt){
          throw new Error(`No Arbitrum transaction found with provided txn hash: ${txnHash}`)
        }
        const outGoingMessagesFromTxn = await bridge.getWithdrawalsInL2Transaction(initiatingTxnReceipt)
        if (outGoingMessagesFromTxn.length === 0){
          throw new Error(`Txn ${txnHash} did not initiate an outgoing messages`)
        }
        const { batchNumber, indexInBatch } = outGoingMessagesFromTxn[0]
        const outgoingMessageState = await bridge.getOutGoingMessageState(
          batchNumber,
          indexInBatch
        )
        console.log(`Waiting for message to be confirmed: Batchnumber: ${batchNumber}, IndexInBatch ${indexInBatch}`)
        
        while (!outgoingMessageState === OutgoingMessageState.CONFIRMED) {
          await wait(1000 * 60)
          const outgoingMessageState = await bridge.getOutGoingMessageState(
            batchNumber,
            indexInBatch
          )
          switch (outgoingMessageState) {
            case OutgoingMessageState.NOT_FOUND: {
              console.log('Message not found; something strange and bad happened')
              process.exit(1)
              break
            }
            case OutgoingMessageState.EXECUTED: {
              console.log(`Message already executed! Nothing else to do here`)
              process.exit(1)
              break
            }
            case OutgoingMessageState.UNCONFIRMED: {
              console.log(`Message not yet confirmed; we'll wait a bit and try again`)
              break
            }
            default:
              break
          }
        }
        const _res = await bridge.triggerL2ToL1Transaction(batchNumber, indexInBatch)
        const rec = await _res.wait()
        console.log(_res, rec)
        console.log('Done! Your transaction is executed') */
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
