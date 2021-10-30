<template>
  <div class="social-recovery-page">
    <van-steps :active="activeStepForSrecovery">
      <!-- <van-step>Type</van-step> -->
      <van-step>2FA</van-step>
      <van-step>SecretKey</van-step>
      <van-step>Compelte</van-step>
    </van-steps>
    <div>
      <!-- type -->
      <!-- <v-recoverytype
        key="srecovery-type"
        v-show="activeStepForSrecovery===0"
        @childEvent="typefirmCallback" /> -->
      <!-- 2FA -->
      <!-- backup name list -->
      <v-2FA
        key="srecovery-2FAconfirm"
        v-show="activeStepForSrecovery===0"
        :showQRCode="false"
        :showSeetingTip="false"
        @childEvent="menonic2FAConfirmCallback" />
      <!-- enter SecretKey -->
      <v-secretkey
        key="srecovery-secretkey"
        v-show="activeStepForSrecovery===1"
        @childEvent="secretKeyConfirmCallback" />
      <!-- resultview -->
      <v-resultview
        key="srecovery--complete"
        :str="recoveryStr"
        v-show="activeStepForSrecovery===2"
        @childEvent="completeCallback" />
    </div>
  </div>
</template>
<script>
import Vue from 'vue';
import { Step, Steps } from 'vant';
import Menonic2FAConfirm from '@/components/SocialRecovery/Menonic2FAConfirm'
import ResultView from './components/RecoveryView'
import SecretKey from './components/SecretKey'
import RecoveryType from './components/RecoveryType'
import _ from 'lodash'
import { SecLevelEnum, generate_mnemonic, generate_key, split } from '@/utils/secretshare'

Vue.use(Step);
Vue.use(Steps);

export default {
  name: "SocialRecovery",
  components: {
    'v-2FA': Menonic2FAConfirm,
    'v-resultview': ResultView,
    'v-secretkey': SecretKey,
    // 'v-recoverytype': RecoveryType,
  },
  data() {
    return {
      recoveryStr: '',
      activeStepForSrecovery: 0, // 0-Type 1-2FA 2-SecretKey 3-complete
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
    menonic2FAConfirmCallback() {
      this.activeStepForSrecovery = 1
    },
    secretKeyConfirmCallback(recoveryStr) {
      this.recoveryStr = recoveryStr
      this.activeStepForSrecovery = 2
    },
    completeCallback() {
      this.$router.push({name:'home'})
    },
  },
  mounted() {
    
  },
}
</script>
<style lang="scss" scoped>
  @import 'index';
</style>