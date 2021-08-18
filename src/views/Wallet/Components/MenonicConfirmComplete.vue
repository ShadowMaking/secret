<!--
 * @Author       : skyeGao
 * @Email        : yingyinggao@sohu-inc.com
 * @DateTime     : 2021-08-12 14:44:02
 * @Description  : Description
-->
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
import { saveToStorage, getFromStorage, removeFromStorage } from '@/utils/storage';

Vue.use(Button);


export default {
  name: 'memonicConfirmComplete',
  data() {
    return{ }
  },
  methods: {
    async confirm() {
      const accountInfo = window.JSON.parse(getFromStorage('walletAccounts'))[0];
      await this.$store.dispatch('login', { ...accountInfo });
      // 登录成功后，检测上次链接网络，如果有则直接连接，否则默认连接以太坊主网。
      await this.$store.dispatch('getConnectNet');
      this.$eventBus.$emit('updateLoginStatus', {...accountInfo});
      this.$router.push({ name: 'Home' });
    },
  },
}
</script>
<style lang="scss" scoped>
  @import 'index';
</style>
