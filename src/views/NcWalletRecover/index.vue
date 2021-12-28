<template>
  <div class="ncWalletRecover-page">
    <v-navTitle title="Recover NC-Wallet"></v-navTitle>
    <div class="recover-wallet-container">
      <p class="recover-des">You can restore the owner private key corresponding to the backed up wallet by signer confirmation</p>
      <div class="recover-wallet-box">
        <div class="recover-steps">
          <van-steps :active="activeStep">
            <van-step>Choose</van-step>
            <van-step>Signer Confirm</van-step>
            <van-step>Complete</van-step>
          </van-steps>
        </div>
        <div class="recover-content-box">
          <v-walletList></v-walletList>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import Vue from 'vue'
import { Toast, Step, Steps } from 'vant'
import navTitle from '@/components/NavTitle/index'
import { isLogin } from '@/utils/dashBoardTools';
import walletList from './walletList/index'

Vue.use(Toast);
Vue.use(Step);
Vue.use(Steps);


export default {
  name: 'NC-Wallet-Recover',
  data() {
    return {
      activeStep: 0,//0-choose 1-signer confirm 2-complete
    }
  },
  components: {
    "v-navTitle": navTitle,
    "v-walletList": walletList,
  },
  methods: {
    
  },
  created() {
    if (!isLogin()) {
      Toast('Need Login')
      return
    }
  },
};
</script>
<style lang="scss" scoped>
  @import "index";
</style>