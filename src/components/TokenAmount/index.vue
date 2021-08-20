<template>
  <div class="token-amount-wrap">
    <van-row class="token-amount-wrap-inner">
      <van-col span="12" @click="choseToken">
        <div class="slect-token-wrap">
          <i class="token token-ETH"></i>
          <span class="token-span">ETH</span>
          <i class="icon-selected"></i>
          <van-button color="#E4E6F5" size="mini" >
            <span slots="default" style="color:#495ABE">最大值</span>
          </van-button>
        </div>
        <span>可用：{{ availableBalance }} ETH</span>
      </van-col>
      <van-col span="12" style="text-align:right">
        <div class="flex flex-column">
          <van-field
            v-model="number"
            type="number"
            label=""
            placeholder="0.0"
            class="recharge-amount-input"
            :disabled="this.walletIsLock"
            @input="handleInputTokenAmountChange" />
          <span>{{typeTxt}}金额</span>
        </div>
      </van-col>
    </van-row>
    <div class="amount-fee-tip" v-show="type=='withdraw'">
      <span class="tip"><i class="info_icon"></i>提现手续费：0.000002 ZKS($5.00)</span>
      <span class="tip"><i class="info_icon"></i>到账金额：3.678766 ZKS</span>
    </div>
    <!-- 请输入金额|金额过低|确定（color：#495ABE  #A4ACDF） -->
    <van-button
      type="primary"
      block
      :color="buttonColor"
      class="opt-button"
      @click="submitTranction"
      :disabled="buttonDisabled"
      v-show="!walletIsLock">
      {{ dynamicButtonTxt }}
    </van-button>
    <v-unlockwallet
      key="unlockWalletButton"
      :show="showUnlockWalletButton"
      :showLockIcon="false"
      v-show="walletIsLock" />
    <van-popup round closeable v-model="showTokenSelect" position="bottom" :style="{ minHeight: '30%' }">
      <div class="token-select-wrap">
        <div class="header"><h3>选择通证</h3></div>
        <div class="choose-token-list">
          <van-search v-model="serchTokenValue" placeholder="输入代币名称" class="serach-token-input"/>
          <div class="common-base-token">
            <p>Common bases<i></i></p>
            <div class="common-bases-list">
              <span><i class="token token-ETH"></i><span>ETH</span></span>
              <span><i class="token token-DAI"></i><span>DAI</span></span>
            </div>
          </div>
          <ul class="choose-token-list-ul">
            <li>
              <van-row class="flex" justify="space-between">
                <van-col span="12">
                  <div class="flex">
                    <i class="token token-ETH"></i>
                    <div class="token-name"><span>ETH</span><span>Ether</span></div>
                  </div>
                </van-col>
                <van-col span="12" class="textAlignRight token-balance"><span>0.098766544</span></van-col>
              </van-row>
            </li>
            <li>
              <van-row class="flex" justify="space-between">
                <van-col span="12">
                  <div class="flex">
                    <i class="token token-DAI"></i>
                    <div class="token-name"><span>ETH</span><span>DAI</span></div>
                  </div>
                </van-col>
                <van-col span="12" class="textAlignRight token-balance"><span>0.098</span></van-col>
              </van-row>
            </li>
          </ul>
        </div>
      </div>
    </van-popup>
  </div>
</template>
<script>
import Vue from 'vue';
import { Button, Col, Row, Field, Popup, Search } from 'vant';
import UnlockWallet from '@/components/UnlockWallet';
import { minus, lteZero, isZero } from '@/utils/number'
import { getAvailableBalanceForL1, getAvailableBalanceForL2 } from '@/utils/walletBridge'
import { providers, utils, Wallet, BigNumber, constants } from 'ethers'
import { initBrideByTransanctionType } from '@/utils/web3'
const { parseEther, formatEther } = utils;

Vue.use(Button);
Vue.use(Col);
Vue.use(Row);
Vue.use(Field);
Vue.use(Popup);
Vue.use(Search);

export default {
  name: "common-recharge-amount",
  props: {
    'type': String, // recharge | transfer | withdraw
    'buttonCode': Number,
    'buttonTxt': {
      type: String,
      default: '请输入金额'
    },
    'disabled': Boolean,
  },
  components: {
    "v-unlockwallet": UnlockWallet,
  },
  data() {
    return {
      number: '',
      showTokenSelect: false,
      serchTokenValue: '',
      availableBalance: '0.0',
      buttonColor: '#A4ACDF',
      buttonDisabled: true,
    }
  },
  watch: {
    buttonCode: {
      handler(newV, oldV) {
        let buttonColor = this.buttonColor;
        let buttonDisabled = this.buttonDisabled;
        switch(newV) {
          case 1: // 1: '请输入金额'
          case 2: // 2: '地址无效'
          default:
            buttonColor = 'A4ACDF'
            buttonDisabled = true;
            break;
        }
        this.buttonColor = buttonColor;
        this.buttonDisabled = buttonDisabled;
      },
      deep: true,
    },
    dynamicButtonTxt: {
      // 深度监听，可监听到对象、数组的变化
      handler(newV, oldV) {
        // console.log(newV, oldV)
      },
      deep: true,
    },
    '$store.state.metamask.walletIsLock': async function (res) {
      if (!this.walletIsLock) {
        const balance = await this.getAvailableBalance()
        this.availableBalance = balance && (formatEther(balance)) || 0;
      }
    }
  },
  computed: {
    dynamicButtonTxt() {
      return this.buttonTxt;
    },
    metamaskInstall() {
      return this.$store.state.metamask.metamaskInstall;
    },
    walletIsLock() {
      return this.$store.state.metamask.walletIsLock;
    },
    showUnlockWalletButton() {
      return !this.metamaskInstall || this.walletIsLock;
    },
    typeTxt() {
      const erum = { recharge: '充值', transfer: '转账', withdraw: '提现' };
      return erum[this.type];
    },
  },
  methods: {
    choseToken() {
      if (this.walletIsLock) { return }
      this.showTokenSelect = true
    },
    submitTranction() {
      this.$emit('childEvent',{amount: this.number});
    },
    handleWatchResetStatus() {
      this.number = '';
      this.availableBalance = '0.0';
      this.buttonColor = '#A4ACDF';
      this.buttonDisabled = true;
    },
    initBridge() {
      
    },
    async getAvailableBalance() {
      const type = this.type
      const bridgeType = type === 'recharge'? 'l1':'l2';
      const bridge = initBrideByTransanctionType(bridgeType);
      let balance;
      switch(type) {
        case 'recharge':
          // balance = await getAvailableBalanceForL1();
          balance = await bridge.getAndUpdateL1EthBalance();
          break;
        case 'withdraw':
          // balance = await getAvailableBalanceForL2();
          balance = await bridge.getAndUpdateL2EthBalance();
          break;
        case 'transfer':
          break;
      }
      return balance;
    },
    async handleInputTokenAmountChange(tokenAmount) {
      if (!tokenAmount || isZero(tokenAmount)) {
        this.buttonTxt = '请输入金额';
        this.buttonColor = '#A4ACDF';
        this.buttonDisabled = true;
        return;
      }
      let availableBalance = this.availableBalance;
      if (!availableBalance) {
        let _availableBalance = await this.getAvailableBalance();
        availableBalance = formatEther(_availableBalance);
      }
      const formatAmount = parseEther(tokenAmount);
      const _minus  = minus(parseEther(availableBalance).toString(), formatAmount.toString())
      if (lteZero(_minus, false)) {
        this.buttonTxt = '余额不足';
        this.buttonColor = '#A4ACDF';
        this.buttonDisabled = true;
      } else {
        this.buttonTxt = '确定';
        this.buttonColor = '#495ABE';
        this.buttonDisabled = false;
      }
      console.log(`ETH余额-${availableBalance}；输入余额换成ETH为-${formatEther(formatAmount)}`)
    },
  },
  async mounted() {
    if (!this.walletIsLock) {
      const balance = await this.getAvailableBalance();
      if (BigNumber.isBigNumber(balance)) {
        this.availableBalance = formatEther(balance);
      }
    }
    this.$eventBus.$on('resetStatus', this.handleWatchResetStatus);
  }
}
</script>
<style lang="scss" scoped>
  @import 'index';
</style>
