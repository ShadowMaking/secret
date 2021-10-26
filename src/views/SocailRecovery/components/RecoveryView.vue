<template>
  <div class="social-recovery-reult-view-page">
    <div class="flex flex-center result-view-wrapper">
      <div class="result-view-wrapper-inner">
        <van-field
          v-model="str"
          rows="2"
          autosize
          label=""
          type="textarea"
          :disabled="false"
          placeholder=""
          :readonly="true" />
      </div>
    </div>
    <div class="opt-wrapper">
      <van-button block color="#495ABE" class="mb10" @click="confirmView">Confirm</van-button>
    </div>
  </div>
</template>
<script>
import Vue from 'vue';
import { Icon, Tab, Tabs, Step, Steps, Field, Form, Popup, Picker } from 'vant';
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

export default {
  name: "RecoveryResultView",
  props: ['str'],
  components: {
  },
  data() {
    return {
      resultStr: ''
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
    confirmView() {
      this.$emit('childEvent', {});
    },
  },
  mounted() {
    
  },
}
</script>
<style lang="scss" scoped>
  @import 'index';
</style>