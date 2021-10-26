<template>
  <div class="third-login-page">
    <img :src="DEFAULTIMG.LOGO" class="logo" />
    <p>Please choose login method</p>
    <ul class="third-type-ul">
      <li><a class="button-google" @click="loginForGoogleOAuth"><i></i></a></li>
    </ul>
    <van-popup v-model="showError" class="status-popUp-refresh flex flex-center flex-column">
      <i class="icon icon-failed"></i>
      <span class="main-txt">Failed</span>
      <span class="supplement-txt">Please wait for minutes</span>
      <!-- <van-button block color="#495ABF" class="button" @click="retryAddHistory">{{ refreshing?"Refresh...":"Refresh"}}</van-button> -->
    </van-popup>
  </div>
</template>
<script>
import Vue from 'vue';
import { Toast, Popup } from 'vant';
import { DEFAULTIMG } from '@/utils/global';
import { installWeb3WalletMetamask } from '@/utils/web3'

Vue.use(Toast)
Vue.use(Popup)

export default {
  name: "ThirdLogin",
  components: {
  },
  data() {
    return {
      DEFAULTIMG,
      showError: false
    }
  },
  computed: {
    walletIsLock() {
      return this.$store.state.metamask.walletIsLock;
    },
    metamaskInstall() {
      return this.$store.state.metamask.metamaskInstall || installWeb3WalletMetamask();
    },
  },
  methods: {
    async loginForGoogleOAuth() {
      Toast.loading({
        duration: 0,
        message: 'loading...',
        forbidClick: true,
        loadingType: 'spinner',
      });
      const loginRes = await this.$store.dispatch('GoogleLogin');
      Toast.clear()
      const { hasError, url } = loginRes;
      if (hasError) {
        this.showError = true
        return
      }
      window.location.href = url
    },
  },
  mounted() {
    
  },
}
</script>
<style lang="scss" scoped>
  @import 'index';
</style>