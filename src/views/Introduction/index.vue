<template>
  <div class="social-recovery-introduction-page">
    <div class="tip-wrapper secret">
      <div class="top">
        <h4>Social Recovery</h4>
        <a><router-link to="/backup?type=create">GO</router-link></a>
      </div>
      <span class="tip">Social Recovery is a secret recovery mechanism, allowing you to place your secret or private data in the custody of your friends by Cryptography Threshold Secret Share and multi-sig contract wallet on Layer 2. And the multi-sig wallet will be available in early December.
      </span>
      <span class="tip">Important: all your keys and shares are processed at your computer or device, Eigrn team can't access them. </span>
      <span class="tip">Now you can:</span>
      <span class="tip">Create Secret:</span>
      <span class="tip">Generate your private key or key recovery phrases randomly, split and send the shares to your friends' email;</span>
      <span class="tip">Recover Secret：</span>
      <span class="tip">Collect the shares from your friends, and recover your original secret.</span>
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
