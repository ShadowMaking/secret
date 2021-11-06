<template>
  <div class="recovery-setting-tip">
    <h4>Social Recovery Settings</h4>
    <span class="tip">Social recovery refers to a method to ensure the security of your account through the key stored in the social relationship of your friends</span>
    <span class="tip">Through the friends you added, send your key fragments to your friend's mailbox for backup, so as to restore the key of your personal account</span>
    <van-field name="recoveryType" label="recoveryType" class="recovery-type">
      <template #input>
        <van-radio-group v-model="recoveryType" direction="horizontal">
          <van-radio name="mnemonic">Mnemonic</van-radio>
          <van-radio name="privateKey">privateKey</van-radio>
        </van-radio-group>
      </template>
    </van-field>
    <div class="opt-wrapper">
      <van-button block color="#495ABE" @click="confirmRecoveryType">Confirm</van-button>
    </div>
  </div>
</template>
<script>
import Vue from 'vue';
import { Icon, Tab, Tabs, Step, Steps, Field, Form, Popup, Picker, Radio, RadioGroup } from 'vant';
import { saveToStorage, getFromStorage } from '@/utils/storage';
import Menonic2FAConfirm from '@/components/SocialRecovery/Menonic2FAConfirm'
import _ from 'lodash'
import { SecLevelEnum, generate_mnemonic, generate_key, split } from '@/utils/secretshare'

Vue.use(Icon);
Vue.use(Tab);
Vue.use(Tabs);
Vue.use(Step);
Vue.use(Steps);
Vue.use(Field);
Vue.use(Form);
Vue.use(Popup);
Vue.use(Picker);
Vue.use(Radio)
Vue.use(RadioGroup)

export default {
  name: "RecoveryType",
  components: {
  },
  data() {
    return {
      recoveryType: 'mnemonic', // mnemonic || privateKey
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
    confirmRecoveryType() {
      this.$emit('childEvent', {type: this.recoveryType});
    },
  },
  mounted() {
    
  },
}
</script>
<style lang="scss" scoped>
  @import 'index';
</style>