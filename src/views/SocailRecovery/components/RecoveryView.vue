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
      <van-button block color="#495ABE" class="mb10" @click="confirmView" :disabled="!str">{{ buttonTxt }}</van-button>
    </div>
    <div class="support-wallet-tip">
      <span>Your recovered data can be used in the following wallets</span>
      <ul class="list">
        <li><a href="https://metamask.io/" target="_blank" ><i class="icon icon-metamask"></i></a></li>
      </ul>
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
      resultStr: '',
      buttonTxt: 'Copy'
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
      if (this.str && copyTxt(this.str)) {
        // Toast.success('Copied');
        this.buttonTxt = 'Copied'
        setTimeout(()=>{
          this.buttonTxt = 'Copy'
        }, 800)
      }
    },
    confirmView() {
      // this.$emit('childEvent', {});
      this.copyViewTxt()
    },
  },
  mounted() {
    
  },
}
</script>
<style lang="scss" scoped>
  @import 'index';
</style>