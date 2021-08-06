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
        <span>可用：{{ availableBanlance }} ETH</span>
      </van-col>
      <van-col span="12" style="text-align:right">
        <div class="flex flex-column">
          <van-field
            v-model="number"
            type="number"
            label=""
            placeholder="0.0"
            class="recharge-amount-input"
            :disabled="this.walletIsLock" />
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
    <v-unlockwallet :show="showUnlockWalletButton" :showLockIcon="false" key="unlockWalletButton"  v-show="walletIsLock"/>
    <van-popup v-model="showTokenSelect" round closeable position="bottom" :style="{ minHeight: '30%' }">
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

Vue.use(Button);
Vue.use(Col);
Vue.use(Row);
Vue.use(Field);
Vue.use(Popup);
Vue.use(Search);

export default {
  name: "common-recharge-amount",
  // props: ['type', 'buttonTxt', 'disabled'],  // recharge | transfer | withdraw
  props: {
    'type': String, // recharge | transfer | withdraw
    'buttonCode': Number,
    'buttonTxt': String,
    'disabled': Boolean,
  },
  components: {
    "v-unlockwallet": UnlockWallet,
  },
  data() {
    return {
      number: '0.0001',
      showTokenSelect: false,
      serchTokenValue: '',
      availableBanlance: '0.0',
      buttonColor: '#A4ACDF',
      buttonDisabled: false,
    }
  },
  watch: {
    buttonCode: {
      handler(newV, oldV) {
         /* const config = {
          1: '请输入金额',
          2: '地址无效',
        } */
        switch(newV) {
          case 1:
            this.buttonColor = '#495ABE'
            // this.buttonDisabled = false;
            break;
          case 2:
            this.buttonColor = '#A4ACDF'
            // this.buttonDisabled = true;
            break;
          default:
            this.buttonColor = '#495ABE'
            // this.buttonDisabled = false;
            break;
        }
      },
      deep: true,
    },
    dynamicButtonTxt: {
      // 深度监听，可监听到对象、数组的变化
      handler(newV, oldV) {
        console.log(newV, oldV)
      },
      deep: true,
    },
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
    /* buttonTxt() {
      console.log(1, this.$props.buttonTxt)
      return '请输入金额'
    }, */
  },
  methods: {
    wait(ms) {
      return new Promise(res => setTimeout(res, ms || this.defaultWait))
    },
    prettyLog(text) {
      // console.log(chalk.blue(`    *** ${text}`))
      console.log(`%c------------- ${text} ------------- \n`, 'background: #333; color: #8dc63f');
      console.log()
    },
    choseToken() {
      if (this.walletIsLock) { return }
      this.showTokenSelect = true
    },
    submitTranction() {
      this.$emit('childEvent',{amount: this.number});
    },
    getbuttonTxt() {
      console.log('1', this.$props.buttonTxt)
      return '请输入金额'
    },
    async updateAvailableBanlance (balanceObj) {
      let balance = this.balance;
      if (balanceObj) {
        balance = balanceObj.balance;
      } else {
        const address = this.$store.state.metamask.accountsArr[0]
        if (address) {
          const _balance = await this.web3.eth.getBalance(address);
          if (_balance) {
            balance = utils.formatEther(_balance);
          }
        }
      }
      this.availableBanlance = balance
    },
  },
  async mounted() {
    const balance = await this.updateAvailableBanlance();
    this.$eventBus.$on('updateAvailableBanlance', this.updateAvailableBanlance);
    balance && (this.availableBanlance = utils.formatEther(balance));
  }
}
</script>
<style lang="scss" scoped>
  @import 'index';
</style>
