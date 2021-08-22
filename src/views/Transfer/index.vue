<template>
  <div class="transfer-page">
    <div class="transfer-toL2-tip flex">
      <div><i class="info_icon"></i></div>
      <div class="flex flex-column">
        <p>L2 转账</p>
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
            placeholder="请输入转账地址"
            @input="handleAddressInputChange"
            @focus="handleAddressInputFocus"
          />
        </div>
      </div>
      <span class="tip"><i class="info_icon"></i>请勿输入交易所地址</span>
      <v-tokenAmount key="tokenAmount-transfer" type="transfer" @childEvent="submitTransfer" />
    </div>
    <v-exchangeList key="comon-exchangeList" type="L2ToL2" v-show="!walletIsLock" />
    <van-popup v-model="tipShow" class="safe-tip-toast" overlay-class="noneOverlay">
      <i class=""></i>
      <span>您的交易地址和交易金额已被加密保护</span>
    </van-popup>
    <van-popup v-model="show" round :close-on-click-overlay="false" class="waiting-modal flex flex-center flex-column">
      <div>{{ tipTxt }}</div>
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
      tipTxt: '请在钱包上确认',
      statusPopTitle: '您的转账已提交',
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
        Toast('转账地址输入有误')
        return
      }
      
      if (transferToAddress.toLocaleUpperCase() === selectedAccountAddress.toLocaleUpperCase()) {
        Toast('不允许给自己转账')
        return
      }

      this.tipTxt = '请在钱包上确认';
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
        this.show = false;
        console.log('交易成功',res)
        await wait()
        prettyLog('交易正在进行，请耐心等待10s....')
        this.showStatusPop = true;
        this.statusPopTitle = '您的转账已提交'
        this.popStatus = 'success';
        // {"txid": "1", "from": "0x1", "to": "0x1", "type":0}
        this.$store.dispatch('AddTransactionHistory', {
          txid: res,
          from: transferParams['from'],
          to: transferParams['to'],
          type: TRANSACTION_TYPE['L2ToL2'],
          status: 1,
        })
        .then(async res=>{
          await wait(10000);
          this.showStatusPop = false;
          this.$router.push({ name: 'Home' });
        })
        .catch(err=>{
          this.showStatusPop = false;
          // this.$router.push({ name: 'Home' });
          // Toast.fail(`提交记录发生未知错误`);
          console.log(`提交记录发生未知错误,${err}`)
        })
      })
      .catch(error=>{
        this.show = false;
        if (error.code == '4001') {
          Toast('交易取消')
          return
        }
        console.log(error)
        // Toast.fail(`未知错误`);
        this.showStatusPop = true;
        this.statusPopTitle = '转账失败'
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