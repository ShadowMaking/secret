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
        <span>可用：0.005965 ETH</span>
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
    <van-button type="primary" block color="#495ABE" class="opt-button" @click="submitTranction" v-show="!walletIsLock">请输入金额</van-button>
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

Vue.use(Button);
Vue.use(Col);
Vue.use(Row);
Vue.use(Field);
Vue.use(Popup);
Vue.use(Search);

export default {
  name: "common-recharge-amount",
  props: ['type'],  // recharge | transfer | withdraw
  components: {
    "v-unlockwallet": UnlockWallet,
  },
  data() {
    return {
      number: '0.0001',
      showTokenSelect: false,
      serchTokenValue: '',
    }
  },
  computed: {
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
  },
}
</script>
<style lang="scss" scoped>
  @import 'index';
</style>
