<template>
  <div class="token-amount-wrap">
    <van-row class="token-amount-wrap-inner">
      <van-row class="top">
        <van-col span="12" @click="choseToken">
          <div class="slect-token-wrap flex">
            <i class="token token-ETH"></i>
            <span class="token-span">ETH</span>
            <!-- TODO hide -->
            <i class="icon-selected" style="display:none;"></i>
            <!-- <van-button color="#E4E6F5" size="mini" style="" class="max-button">
              <span slots="default" class="max-button-inner">Max</span>
            </van-button> -->
            <a class="max-button">Max</a>
          </div>
          <!-- <span>Balance：{{ availableBalance }} ETH</span> -->
        </van-col>
        <van-col span="12" style="text-align:right">
          <div class="flex flex-column">
            <van-field
              v-model="number"
              type="number"
              label=""
              placeholder="0.0"
              :formatter="formatter"
              class="recharge-amount-input"
              :disabled="this.walletIsLock"
              @input="handleInputTokenAmountChange" />
            <!-- <span>Amount</span> -->
          </div>
        </van-col>
      </van-row>
      <div class="bottom">
        <div>
          <span>Balance：{{ availableBalance|showAvailableBalance }} ETH</span>
        </div>
        <div style="text-align:right">
          <span>Amount</span>
        </div>
      </div>
    </van-row>
    <!-- TODO -->
    <!-- <div class="amount-fee-tip" v-show="type=='withdraw'" style="display:none!important"> -->
    <div class="amount-fee-tip" style="display:none!important">
      <span class="tip"><i class="info_icon"></i>Withdrawal Transaction Fee：0.000002 ETH($5.00)</span>
      <span class="tip"><i class="info_icon"></i>Withdrawal Amount：3.678766 ETH</span>
    </div>
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
      :expectNetType="expectNetType"
      v-show="walletIsLock" />
    <van-popup round closeable v-model="showTokenSelect" position="bottom" :style="{ minHeight: '30%' }">
      <div class="token-select-wrap">
        <div class="header"><h3>Choose Token</h3></div>
        <div class="choose-token-list">
          <van-search v-model="serchTokenValue" placeholder="token name" class="serach-token-input"/>
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
    <v-statusPop
      status="warning"
      title="Sign Lose Efficacy"
      timeTxt=""
      tip="Sign Again"
      :show="showStatusPop"
      @childEvent="changeVisible" />
  </div>
</template>
<script>
import Vue from 'vue';
import { Button, Col, Row, Field, Popup, Search } from 'vant';
import UnlockWallet from '@/components/UnlockWallet';
import StatusPop from '@/components/StatusPop';
import { minus, lteZero, isZero } from '@/utils/number'
import { utils, BigNumber } from 'ethers'
import { initBrideByTransanctionType } from '@/utils/web3'
import { initTokenTime, updateLoginTime, tokenIsExpires } from '@/utils/auth'
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
    'type': String, // deposit | send | withdraw
    'buttonCode': Number,
    'buttonTxt': {
      type: String,
      default: 'Enter The Amount'
    },
    'disabled': Boolean,
    'address': String,
  },
  components: {
    "v-unlockwallet": UnlockWallet,
    'v-statusPop': StatusPop,
  },
  filters: {
    showAvailableBalance(amount) {
      if (parseFloat(amount)) {
        return parseFloat(amount).toFixed(6)
      }
      return amount
    }
  },
  data() {
    return {
      number: '',
      showTokenSelect: false,
      serchTokenValue: '',
      availableBalance: '0.0',
      buttonColor: '#A4ACDF',
      buttonDisabled: true,
      buttonText: this.buttonTxt,
      showStatusPop: false,
    }
  },
  watch: {
    buttonTxt() {
      this.buttonText = this.buttonTxt;
    },
    buttonCode: {
      async handler(newV, oldV) {
        let buttonColor = this.buttonColor;
        let buttonDisabled = this.buttonDisabled;
        switch(newV) {
          case 1: // 1: 'Enter The Amount'
            if (isZero(this.number)) {
              buttonColor = 'A4ACDF'
              buttonDisabled = true;
            } else {
              await this.setButtonStatusByBalance();
              // buttonColor = '#495ABE';
              // buttonDisabled = false;
              // this.buttonText = 'Confirm';
            }
            break;
          case 2: // 2: 'invalid address'
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
      // deep watch， watch object and array change
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
    expectNetType() {
      return this.type === 'deposit' ? 'l1' : 'l2';
    },
    dynamicButtonTxt() {
      return this.buttonText;
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
      const erum = { deposit: 'Deposit', send: 'Send', withdraw: 'Withdraw' };
      return erum[this.type];
    },
  },
  methods: {
    formatter(value) {
      const vls = value.split('.');
      if (vls.length > 1) {
        return `${parseInt(vls[0])}.${vls[1]}`;
      }
      return value;
    },
    choseToken() {
      // TODO  only ETH
      return
      if (this.walletIsLock) { return }
      this.showTokenSelect = true
    },
    submitTranction() {
      // check sign wether lose effect
      /* if (tokenIsExpires()) {
        this.showStatusPop = true
      } else {
        this.$emit('childEvent',{amount: this.number});
      } */
      this.$emit('childEvent',{amount: this.number});
    },
    changeVisible(eventInfo) {
      this.showStatusPop = false
      eventInfo.submit && (this.signToMetamask())
    },
    async signToMetamask() {
      const selectedAccountAddress = window.ethereum.selectedAddress;
      const message = `
        Access Eigen account.
        Only sign this message for a trusted client!
      `;
      // when signRes has value declare sign sucess
      const signRes = await this.web3.eth.personal.sign(this.web3.utils.fromUtf8(message), selectedAccountAddress);
      if (signRes!==undefined) {
        initTokenTime()
        this.$emit('childEvent',{amount: this.number});
      }
    },
    handleWatchResetStatus() {
      this.number = '';
      this.availableBalance = '0.0';
      this.buttonColor = '#A4ACDF';
      this.buttonDisabled = true;
    },
    async getAvailableBalance() {
      const type = this.type
      const bridgeType = type === 'deposit'? 'l1':'l2';
      const bridge = initBrideByTransanctionType(bridgeType);
      let balance;
      switch(type) {
        case 'deposit':
          balance = await bridge.getAndUpdateL1EthBalance();
          break;
        case 'withdraw':
          balance = await bridge.getAndUpdateL2EthBalance();
          break;
        case 'send':
          balance = await bridge.getAndUpdateL2EthBalance();
          break;
      }
      return balance;
    },
    async handleInputTokenAmountChange(tokenAmount) {
      this.number = tokenAmount
      if (!tokenAmount || isZero(tokenAmount)) {
        this.buttonText = 'Enter The Amount';
        this.buttonColor = '#A4ACDF';
        this.buttonDisabled = true;
        return;
      }
      if (this.address && !utils.isAddress(this.address) && this.type !== 'deposit') {
        this.buttonText = 'Invalid Address'
        this.buttonColor = '#A4ACDF';
        this.buttonDisabled = true;
        return;
      }
      await this.setButtonStatusByBalance(tokenAmount);
    },
    async setButtonStatusByBalance(tokenAmount) {
      const _minus = await this.getMinus(tokenAmount||this.number);
      if (lteZero(_minus, false)) {
        this.buttonText = 'Insufficient Balance';
        this.buttonColor = '#A4ACDF';
        this.buttonDisabled = true;
      } else {
        this.buttonText = 'Confirm';
        this.buttonColor = '#495ABE';
        this.buttonDisabled = false;
      }
    },
    async getMinus(tokenAmount) {
      let availableBalance = this.availableBalance;
      if (!availableBalance) {
        let _availableBalance = await this.getAvailableBalance();
        availableBalance = formatEther(_availableBalance);
      }
      const formatAmount = parseEther(tokenAmount);
      const _minus  = minus(parseEther(availableBalance).toString(), formatAmount.toString())
      console.log(`ETH Balance-${availableBalance}；input ETH为-${formatEther(formatAmount)}`)
      return _minus
    },
  },
  async mounted() {
    if (!this.walletIsLock) {
      const balance = await this.getAvailableBalance();
      if (BigNumber.isBigNumber(balance)) {
        this.availableBalance = formatEther(balance);
      }
    }
    this.$eventBus.$on('chainChanged', this.handleWatchResetStatus);
    this.$eventBus.$on('accountsChanged', this.handleWatchResetStatus);
    this.$eventBus.$on('disconnect', this.handleWatchResetStatus);
  }
}
</script>
<style lang="scss" scoped>
  @import 'index';
</style>
