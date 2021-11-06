<template>
  <van-popup v-model="showPopup" closeable class="install-wallet-modal" @close="closePopup">
    <div>
      <h4>Choose Backup Method</h4>
      <span>You can choose to backup by mnemonic phrase or json key</span>
      <van-button @click="toPageCreate('mnemonic')">Mnemonic Phrase</van-button>
      <van-button @click="toPageCreate('json')">Json Key</van-button>
    </div>
  </van-popup>
</template>

<script>
import Vue from 'vue';
import { Popup, Button } from 'vant';

Vue.use(Popup);
Vue.use(Button);

export default {
  name: 'BackUpMethod',
  props: ['show'],
  data() {
    return {
      showPopup: false,
    }
  },
  watch: {
    show() {
      this.showPopup = this.show
    },
  },
  methods: {
    closePopup() {
      this.showPopup = false;
      this.$emit('childEvent',{show: false});
    },
    toPageCreate(type) {
      let pathName
      type === 'mnemonic' && (pathName = 'phrase')
      type === 'json' && (pathName = 'jType')
      this.$router.push({ name: pathName })
    },
  },
};
</script>
<style lang="scss" scoped>
  @import "index";
</style>
