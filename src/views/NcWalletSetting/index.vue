<template>
  <div class="ncWalletSetting-page">
    <v-navTitle title="Setting"></v-navTitle>
    <div class="ncWalletSetting-form">
      <div class="wallet-setting-item">
        <div class="setting-item-left">Multisig Wallet Daily Limit</div>
        <div class="setting-item-right">
          <el-input v-model="dailyLimit" class="item-input"></el-input>
        </div>
      </div>
    </div>
  </div>
</template>
<script>
import Vue from 'vue';
import { Toast } from 'vant';
import navTitle from '@/components/NavTitle/index'


Vue.use(Toast);

export default {
  name: 'Setting',
  components: {
    "v-navTitle": navTitle,
  },
  data() {
    return {
      dailyLimit: 10,
    }
  },
  methods: {
    
  },
  async created (){
    
  },
}
</script>
<style lang="scss" scoped>
  @import 'index';
  @import '@/assets/style/media.scss';
</style>
