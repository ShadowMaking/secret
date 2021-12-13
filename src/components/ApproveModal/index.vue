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
            <h4>Give permission to access your {{ showValBySourceData('tokenName') }}</h4>
            <div class="tip"><span>By granting permission, you are allowing the following contract to access your funds</span></div>
            <div class="token-address-wrapper">
              <i class="token"></i>
              <span>{{ showValBySourceData('tokenAddress') }}</span>
            </div>
          </div>
        </div>
        <div class="gas-info-wrapper">
          <div class="gas-info-wrapper-inner">
            <div class="gasFee"><span class="name">Estimated gas fee</span><span class="value">0.012 ETH</span></div>
            <div class="gasPrice"><span class="name">GasPrice</span><span class="value">{{ showValBySourceData('gasPrice') }} Gwei</span></div>
            <div class="gasLimit"><span class="name">GasLimit</span><span class="value">{{ 21000 }}</span></div>
          </div>
          <!-- <div class="detail-wraper-inner">
            <div class="total">
              <span class="name">Total</span>
              <span class="value">Max amount: {{ showValBySourceData('total') }}</span>
            </div>
          </div> -->
        </div>
        <!-- Button -->
        <div class="button-content">
          <van-button class="opt-button" color="#367BCF" plain @click="cancelModal">Cancel</van-button>
          <van-button class="opt-button" color="#367BCF" @click="confirm">Confirm</van-button>
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
  name: 'ApproveModal',
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
          case 'tokenName':
            return metadata.tokenName
          case 'tokenAddress':
            return metadata && `${metadata.tokenAddress.slice(0,6)}...${metadata.tokenAddress.slice(-4)}`
          case 'netInfo':
            return metadata && `${metadata.netInfo.name}`
          case 'gasPrice':
            return metadata.gasPrice
          case 'total':
            return `${metadata.value} ${metadata.symbolName} + 0.012000 ETH` 
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
