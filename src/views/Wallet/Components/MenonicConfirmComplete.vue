<template>
  <div class="create-wallet-step4">
    <div class="icon-success">
      <van-icon name="success" size="80" color="#07c160"/>
    </div>
    <div class="success-tip">
      <span>恭喜您，验证通过</span>
    </div>
    <div class="opt-wrapper">
      <van-button block color="#495ABE" @click="confirm">确认</van-button>
    </div>
  </div>
</template>
<script>
import Vue from 'vue';
import { Button } from 'vant';

Vue.use(Button);


export default {
  name: 'memonicConfirmComplete',
  data() {
    return{ }
  },
  methods: {
    confirm() {
      this.$router.push({ name: 'Home' });
    },
  },
}
</script>
<style lang="scss" scoped>
  @import 'index';
</style>
