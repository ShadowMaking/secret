<template>
  <van-popup v-model="show" class="status-popUp flex flex-center flex-column">
    <i class="icon icon-success"></i>
    <span class="main-txt">您的转账已提交</span>
    <span class="supplement-txt">预计 1 分钟内完成资金变动</span>
    <span class="supplement-txt">可以到“L2 钱包”对应资产的详情查看明细</span>
    <van-button block color="#495ABF" class="button">确认</van-button>
  </van-popup>
</template>
<script>
import Vue from 'vue';
import { Popup, Button } from 'vant';

Vue.use(Popup);
Vue.use(Button);

export default {
  name: "StatusPop",
  props: ['show'],
  data() {
    return {
      // show: false
    }
  }
}
</script>
<style lang="scss" scoped>
  @import 'index';
</style>