<template>
  <div class="ncWalletSetting-page">
    <v-navTitle title="Setting"></v-navTitle>
    <div class="ncWalletSetting-form">
      <div class="wallet-setting-item">
        <div class="setting-item-left">Multisig Wallet Daily Limit</div>
        <div class="setting-item-right">
          <el-input v-model="dailyLimit" class="item-input" @blur="dailyLimitSetting"></el-input>
          <label class="right-label">ETH</label>
        </div>
      </div>
      <div class="wallet-setting-item">
        <div class="setting-item-left">
         <p>Multisig Wallet Per Transaction Limit</p>
        </div>
        <div class="setting-item-right">
          <el-input v-model="oneTransLimit" class="item-input" @blur="oneTransLimitSetting"></el-input>
          <label class="right-label">ETH</label>
        </div>
      </div>
      <p class="item-left-des">*Enable multi-signature transactions beyond this limit</p>
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
      oneTransLimit: 5,
    }
  },
  methods: {
    oneTransLimitSetting() {
      console.log(this.oneTransLimit)
    },
    dailyLimitSetting() {
      console.log(this.dailyLimit)
    },
  },
  created (){

  },
}
</script>
<style lang="scss" scoped>
  @import 'index';
  @import '@/assets/style/media.scss';
</style>
