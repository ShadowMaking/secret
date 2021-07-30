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
          <v-tokenAmount key="tokenAmount-recharge" type="recharge" @childEvent="submitRecharge"/>
        </van-tab>
        <van-tab title="从L2 账户充值" name="fromeL2">
          <div class="recharge-amount-wrap">
            <div class="flex flex-center">
              <img :src="DEFAULTIMG.TEST_QR" class="img-QR"/>
            </div>
            <div class="recharge-address-wrapper">
              <h3>充币地址</h3>
              <div class="address">
                lkkdkjkdfjkdfjkdjfiejijriejckdcdncjdn
              </div>
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
  </div>
</template>
<script>
import Vue from 'vue';
import { RECHAERGE_TIP } from '@/utils/global';
import ExchangeList from '@/components/ExchangeList';
import TokenAmount from '@/components/TokenAmount';
import { DEFAULTIMG } from '@/utils/global';
import { Tab, Tabs, Button, Col, Row } from 'vant';

Vue.use(Tab);
Vue.use(Tabs);
Vue.use(Button);
Vue.use(Col);
Vue.use(Row);

export default {
  name: "Recharge",
  components: {
    'v-exchangeList': ExchangeList,
    'v-tokenAmount': TokenAmount,
  },
  data() {
    return {
      DEFAULTIMG,
      RECHAERGE_TIP,
      activeName: 'fromL1', // fromL1 | fromeL2
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
    submitRecharge(info) {
      console.log('金额', info.amount)
    },
  },
  mounted() {
    console.log("metamask是否安装", this.$store.state.metamask.metamaskInstall)
    console.log('钱包账户是否锁定', this.$store.state.metamask.walletIsLock);
  },
  
}
</script>
<style lang="scss" scoped>
  @import 'index';
</style>