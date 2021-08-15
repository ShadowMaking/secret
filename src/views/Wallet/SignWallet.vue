<template>
  <div class="sign-wallet-page">
    <div class="title">请求签名</div>
    <div class="sign-account-info van-hairline--top-bottom">
      <van-row type="flex" justify="space-between" align="center" class="sign-account-info-item">
        <van-col span="8" class="letf-content">
          <div>账户:</div>
          <div class="subtitle">{{ accountName }}</div>
        </van-col>
        <van-col span="8" class="center-content">
          <div class="connet-circle"></div>
        </van-col>
        <van-col span="8" class="right-content">
          <div>余额:</div>
          <div  class="subtitle">{{ balance}} ETH</div>
        </van-col>
      </van-row>
      <van-row type="flex" justify="space-between" align="center" class="sign-account-info-item">
        <van-col span="8">
          <div class="color000">来源：</div>
        </van-col>
        <van-col span="8" class="right-content">
          <div class="color000">http://eigen.net</div>
        </van-col>
      </van-row>
      <div class="alignCenter">正在签名</div>
    </div>
    <div class="sign-info-txt van-hairline--bottom">
      <p>Access EigenSecret ImportAccount.</p>
      <p>Only sign this message for a trusted client!</p>
    </div>
    <div class="opt-wrapper">
      <van-button plain type="info" @click="toPageHome">取消</van-button>
      <van-button type="info" color="#495ABE" @click="sign">签名</van-button>
    </div>
  </div>
</template>
<script>
import Vue from 'vue';
import { Col, Row, Button } from 'vant';
import { saveToStorage } from '@/utils/storage';

Vue.use(Col)
Vue.use(Row)
Vue.use(Button)

export default {
  name: 'SignWallet',
  data() {
    return {
      accountName: 'Accout1',
      balance: '0.01232434'
    }
  },
  methods: {
    toPageHome() {
      this.$router.go(-1);
    },
    async sign() {
      await this.$store.dispatch('updateWalletLockStatus', {walletIsLock: false});
      this.$eventBus.$emit('updateWalletLockStatus', {walletIsLock: false});
      this.$router.go(-1);
    },
  },
}
</script>
<style lang="scss" scoped>
  @import 'index';
</style>