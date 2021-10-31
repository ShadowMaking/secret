<template>
  <div class="create-wallet-step4">
    <div class="icon-success">
      <van-icon name="success" size="80" color="#07c160"/>
    </div>
    <div class="success-tip">
      <span>Congratulations！Verification Success!</span>
      <span>Click Confirm Button for Social Backup!</span>
    </div>
    <div class="opt-wrapper">
      <van-button block color="#495ABE" @click="confirm">Send Email</van-button>
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
    async confirm() {
      this.$emit('childEvent');
    },
  },
}
</script>
<style lang="scss" scoped>
  @import 'index';
</style>
