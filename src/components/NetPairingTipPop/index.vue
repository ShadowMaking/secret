<template>
  <van-popup v-model="show" class="status-popUp flex flex-center flex-column">
    <span class="main-txt">您需要先配置L1和L2网络对</span>
    <van-button block color="#495ABF" class="button" @click="submitOk">确定</van-button>
  </van-popup>
</template>
<script>
import Vue from 'vue';
import { Popup, Button } from 'vant';

Vue.use(Popup);
Vue.use(Button);

export default {
  name: "NetPairingPop",
  props: ['show'],
  methods: {
    submitOk() {
      this.show = false;
      this.$emit('childEvent',{show: false});
    },
  },
}
</script>
<style lang="scss" scoped>
  @import 'index';
</style>