<template>
  <div class="page-home">
    <div class="page-home-account flex flex-center flex-column">
      <a class="button button-with-radius button-update"><i class="icon ico-ipdate"></i>刷新</a>
      <div class="flex flex-column account-info">
        <span class="balance">4.22</span>
        <span class="tip">L2 资产总额($)</span>
      </div>
      <div class="flex page-home-opt-wrap">
        <mt-button type="default" size="large" class="button button-with-radius" @click="toPage('recharge')">充值到 L2</mt-button>
        <mt-button type="primary" size="large" class="button button-with-radius" @click="toPage('transfer')">L2 转账</mt-button>
        <mt-button type="default" size="large" class="button button-with-radius" @click="toPage('withdraw')">提现到 L1</mt-button>
      </div>
    </div>
    <div class="page-home-no-connect-wallet" v-if="exchangeListData.length===0">
      <div class="flex flex-center"><img :src="DEFAULTIMG.TEST_QR" /></div>
      <mt-button type="primary" size="large" class="button button-large">解锁钱包</mt-button>
    </div>
    <v-exchangeList key="comon-exchangeList" type="all" v-else />
  </div>
</template>

<script>
import Vue from 'vue';
import { Button, Cell, Popup } from 'mint-ui';
import { DEFAULTIMG } from '@/utils/global';
import ExchangeList from '@/components/ExchangeList';

Vue.component(Button.name, Button)
Vue.component(Cell.name, Cell)
Vue.component(Popup.name, Popup)

export default {
  name: 'Home',
  components: {
    'v-exchangeList': ExchangeList,
  },
  data() {
    return {
      DEFAULTIMG,
      popupVisible: false,
      exchangeListData: [1],
      detailList: [
        {
          title: '时间',
          value: '13/07/2021 12:54:35'
        },
        {
          title: '操作',
          value: '充值 54.6958 ZKS'
        },
      ]
    }
  },
  methods: {
    getExchangeDetail() {
      this.popupVisible = true;
    },
    toPage(pageType) {
      switch(pageType) {
        // 充值
        case "recharge":
          this.$router.push({ name: 'recharge' })
          break;
        // 转账
        case "transfer":
          this.$router.push({ name: 'transfer' })
          break;
        // 提现
        case "withdraw":
          this.$router.push({ name: 'withdraw' })
          break;
      }
    }
  },

};
</script>
<style lang="scss" scoped>
  @import 'index';
</style>
