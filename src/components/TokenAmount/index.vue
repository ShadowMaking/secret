<template>
  <div class="token-amount-wrap">
    <van-row class="token-amount-wrap-inner">
      <van-col span="12">
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
          <span class="recharge-amount">0.0</span>
          <span>充值金额</span>
        </div>
      </van-col>
    </van-row>
    <!-- 请输入金额|金额过低|确定（color：#495ABE） -->
    <van-button type="primary" block color="#A4ACDF">请输入金额</van-button>
  </div>
</template>
<script>
import Vue from 'vue';
import { Button, Col, Row } from 'vant';

Vue.use(Button);
Vue.use(Col);
Vue.use(Row);

export default {
  name: "common-recharge-amount",
  components: {
    
  },
  data() {
    return {
    }
  }
}
</script>
<style lang="scss" scoped>
  @import 'index';
</style>
