<template>
  <van-popup v-model="showPopup" class="confirm-modal-popUp flex flex-center flex-column" @close="closeModal">
    <div class="confirm-modal">
      <div class="confirm-modal-wraper">
        <div class="top-header">
          <div class="eidt">Edit</div>
          <div class="net"><i></i>{{ networkName }}</div>
        </div>
        <div class="account-address">
          <div class="address address-from"><i></i>{{ showValBySourceData('from') }}</div>
          <div class="divid"><i></i></div>
          <div class="address address-to"><i></i>{{ showValBySourceData('to') }}</div>
        </div>
        <div class="account-num">
          <div class="host">{{ host }}</div>
          <div class="type"><a>{{ type }}</a></div>
          <div class="trade-token">
            <i></i>
            <span>{{ showValBySourceData('token') }}</span>
          </div>
        </div>
        <div class="data-tab">
          <van-tabs v-model="tabActive" class="confirm-modal-tabs">
            <van-tab title="Detail" name="detail">
              <!-- Detail -->
              <div class="tabs-content detail-wraper">
                <div class="detail-wraper-inner">
                  <div class="gasFee"><span class="name">Estimated gas fee</span><span class="value">0.012 ETH</span></div>
                  <div class="gasPrice"><span class="name">GasPrice</span><span class="value">{{ showValBySourceData('gasPrice') }} Gwei</span></div>
                  <div class="gasLimit"><span class="name">GasLimit</span><span class="value">{{ 21000 }}</span></div>
                </div>
                <div class="detail-wraper-inner">
                  <div class="total">
                    <!-- <span class="name">Amount + gas fee</span> -->
                    <span class="name">Total</span>
                    <span class="value">Max amount: {{ showValBySourceData('total') }}</span>
                  </div>
                </div>
              </div>
            </van-tab>
            <!-- DATA -->
            <van-tab title="DATA" name="data">
              <div class="tabs-content data-wraper"></div>
            </van-tab>
          </van-tabs>
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
  name: 'ConfirmModal',
  props: {
    'show': { type: Boolean, },
    'type': { type: String, },
    'metadata': { type: Object, default: null },
    'needColse': {
      type: Boolean,
      default: true
    },
    'buttonTxt': {
      type: String,
      default: 'OK'
    },
  },
  data() {
    return {
      showPopup: false,
      tabActive: 'detail'
    }
  },
  computed: {
    networkName() {
      const netInfo = getInfoFromStorageByKey('netInfo')
      if (netInfo) {
        return netInfo.name
      }
      return ''
    },
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
          case 'from':
            return metadata && `${metadata.from.slice(0,6)}...${metadata.from.slice(-4)}`
          case 'to':
            return `${metadata.to.slice(0,6)}...${metadata.to.slice(-4)}`
          case 'token':
            return `${metadata.value} ${metadata.symbolName}`
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
