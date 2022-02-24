<template>
  <div class="recovery-result-status">
    <h4>Social Recovery</h4>
    <div class="icon-success">
      <van-icon name="success" size="80" color="#07c160"/>
    </div>
    <div class="success-tip">
      <span>Congratulations! Social Recovery Completed!</span>
    </div>
    <div class="success-tip">
      <span>The account share has been sent to the friend's email!</span>
    </div>
    <div class="opt-wrapper">
      <van-button block color="#495ABE" @click="confirm">Confirm</van-button>
    </div>
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
  name: "RecoveryStatus",
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
    confirm() {
      this.$router.push({ name: 'overview' })
    },
  },
  mounted() {
    
  },
}
</script>
<style lang="scss" scoped>
  @import 'index';
</style>
