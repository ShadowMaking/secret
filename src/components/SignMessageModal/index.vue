<template>
  <van-popup v-model="showPopup" class="confirm-modal-popUp flex flex-center flex-column" @close="closeModal">
    <div class="confirm-modal">
      <div class="confirm-modal-wraper">
        <div class="top-header">
          <div class="user-address"><i class="user"></i>{{ showValBySourceData('userAddress') }}</div>
          <div class="net"><i class="cicrl"></i>{{ showValBySourceData('netInfo') }}</div>
        </div>
        <div class="approve-info">
          <div class="host"><i></i><span>{{ host }}</span></div>
          <div class="info">
            <div class="token-address-wrapper">
              <span>Signing:</span>
            </div>
          </div>
        </div>
        <div class="gas-info-wrapper">
          <div class="gas-info-wrapper-inner">
            <div class="sign-title">Message:</div>
            <div class="sign-msg">{{ showValBySourceData('signMessage') }}</div>
          </div>
        </div>
        <!-- Button -->
        <div class="button-content">
          <van-button class="opt-button" color="#367BCF" plain @click="cancelModal">Cancel</van-button>
          <van-button class="opt-button" color="#367BCF" @click="confirm">Sign</van-button>
        </div>
      </div>
    </div>
  </van-popup>
</template>
<script>
import Vue from 'vue';
import { Popup, Button, Tab, Tabs } from 'vant';
import { saveToStorage, getFromStorage, removeFromStorage, getInfoFromStorageByKey } from '@/utils/storage';

Vue.use(Popup);
Vue.use(Button);
Vue.use(Tab);
Vue.use(Tabs);

export default {
  name: 'SignMessageModal',
  props: {
    'show': { type: Boolean, },
    'type': { type: String, },
    'metadata': { type: Object, default: null },
  },
  data() {
    return {
      showPopup: false,
      tabActive: 'detail'
    }
  },
  computed: {
    host() {
      return window.location.origin
    },
  },
  watch: {
    show() {
      this.showPopup = this.show
    },
  },
  methods: {
    showValBySourceData(type){
      const metadata = this.metadata
      if (metadata) {
        switch (type) {
          case 'userAddress':
            return metadata && `${metadata.userAddress.slice(0,6)}...${metadata.userAddress.slice(-4)}`
          case 'signMessage':
            return metadata.signMessage
          case 'netInfo':
            return metadata && `${metadata.netInfo.name}`
        }
      }
      return ''
    },
    cancelModal() {
      this.showPopup = false;
      this.$emit('reject',{show: false, submit: false});
    },
    confirm() {
      this.showPopup = false;
      this.$emit('confirm',{show: false});
    },
    closeModal() {
      this.showPopup = false;
      this.$emit('close',{show: false, submit: false});
    },
  },
}
</script>
<style lang="scss" scoped>
  @import './index.scss';
</style>
