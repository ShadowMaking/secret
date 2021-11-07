<template>
  <div class="social-recovery-introduction-page">
    <div class="tip-wrapper secret">
      <div class="top">
        <h4>Recover Secret</h4>
        <a><router-link to="/backup?type=create">GO</router-link></a>
      </div>
      <span class="tip">Recover Secret is a secret recovery mechanism,
        in which you can ask your friends to save and recover your secret or private data with the cryptography of Threshold Secret Share.
      </span>
      <span class="tip">You  don’t have a key backup yet. Please implement it now.</span>
    </div>
    <div class="tip-wrapper bridge">
      <div class="top">
        <h4>Bridge</h4>
        <a><router-link to="/introduction">GO</router-link></a>
      </div>
      <span class="tip">Bridge realizes the function of asset transfer between L1 and L2，</span>
      <span class="tip">You can ：</span>
      <ul>
        <li>Deposit to L2：Transfer assets from the Layer1 wallet to the EigenSecret l2 wallet, or directly deposit through the Layer2 wallet.</li>
        <li>Send to L2：Used for asset transfer between EigenSectet Layer2 wallets, you will enjoy gas-free and real-time transfer.</li>
        <li>Withdraw to L1：Transfer assets from the EigenSecret l2 wallet to the Layer1 wallet.</li>
      </ul>
    </div>
  </div>
</template>
<script>
import Vue from 'vue';
import { Button } from 'vant';
import _ from 'lodash';
import { getQueryString, getLocationParam } from '@/utils/index'

Vue.use(Button);

export default {
  name: "Introduction",
  computed: {
  },
  async mounted() {
    const googleUserId = getLocationParam('id')
    const googleAuthToken = getLocationParam('auth_token')
    if (googleUserId) {
      await this.$store.dispatch('StoreGoogleUserId', {userId: googleUserId })
      await this.$store.dispatch('StoreGoogleAuthToken', {authToken: googleAuthToken })
      const { hasError, data: userInfo } = await this.$store.dispatch('GetUserInfoById', { userId: googleUserId })
      this.$eventBus.$emit('thirdLogin', { success: !hasError, userInfo });
    }
  },
  created() {
  },
}
</script>
<style lang="scss" scoped>
  @import 'index';
</style>
