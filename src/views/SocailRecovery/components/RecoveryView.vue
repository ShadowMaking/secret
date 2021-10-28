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
          placeholder=""
          :readonly="true"
          @click="copyViewTxt" />
      </div>
    </div>
    <div class="opt-wrapper">
      <van-button block color="#495ABE" class="mb10" @click="confirmView" :disabled="!str">Confirm</van-button>
    </div>
  </div>
</template>
<script>
import Vue from 'vue';
import { Field, Toast } from 'vant';
import { copyTxt } from '@/utils/index';
import { saveToStorage, getFromStorage } from '@/utils/storage';
import _ from 'lodash'

Vue.use(Field);
Vue.use(Toast);

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
    copyViewTxt() {
      if (copyTxt(this.str)) {
        Toast.success('Copied');
      }
    },
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