<template>
  <van-popup v-model="showPopup" class="speed-modal-popUp flex flex-center flex-column" @close="closeModal" :closeable="true">
    <div class="speed-modal-content">
      <div class="speed-title">Speed up transaction</div>
      <div class="speed-tip">Network is busy, Gas Prices are high and estimates are less accounrate.</div>
      <div class="speed-top-text">
        <div class="speed-name">New gas fee</div>
        <div class="speed-new-fee-value">0.001765</div>
        <div class="speed-new-fee-value">ETH</div>
        <div class="speed-name">Max fee: (0.0023423ETH)</div>
        <div class="speed-time">Very likely in&lt;15 seconds</div>
      </div>
      <div class="speed-fast-box"></div>
        <div class="advanced-options-box">
          <div class="advances-title" @click="showAdvance">
            <span class="advance-text">Advanced Options</span>
            <van-icon name="arrow-down" v-show="advanceVisible"/>
            <van-icon name="arrow-up" v-show="!advanceVisible"/>
          </div>
          <div class="advance-input-box" v-show="advanceVisible">
            <div class="advance-input-item">
              <label>Gas Limit</label>
              <van-field v-model="gasLimit" class="advance-input"/>
            </div>
            <div class="advance-input-item">
              <label>Max priority fee (GWEI)</label>
              <van-field v-model="maxPriorityFee" class="advance-input" />
            </div>
            <div class="advance-input-item">
              <label>Max fee (GWEI)</label>
              <van-field v-model="maxFee" class="advance-input" />
            </div>
          </div>
          <div class="submit-box">
            <el-button type="primary" class="common-form-btn">Save</el-button>
          </div>
        </div>
    </div>
  </van-popup>
</template>
<script>
import Vue from 'vue';
import { Popup, Button, Tab, Tabs, Toast, Field  } from 'vant';
import { saveToStorage, getFromStorage, removeFromStorage, getInfoFromStorageByKey } from '@/utils/storage';
import { getTokenIsValid } from '@/utils/dashBoardTools';

import { LOCATION_HREF } from '../../global'
import { logout } from '@/utils/auth'

Vue.use(Popup);
Vue.use(Button);
Vue.use(Toast);
Vue.use(Field);

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
      tabActive: 'detail',
      gasPriceVal: '',
      gasLimitVal: '',
      showGasPrice: false,
      showGasLimit: false,
      advanceVisible: false,

      gasLimit: '',
      maxPriorityFee: '',
      maxFee: '',
    }
  },
  watch: {
    show() {
      if (this.show) {
        this.getTokenIsValid()
      }
      this.showPopup = this.show
    },
    metadata: {
      handler(newV, oldV) {
        this.setInitData()
      },
      deep: true
    }
  },
  methods: {
    showAdvance() {
      this.advanceVisible = !this.advanceVisible
    },
    cancelModal() {
      this.showPopup = false;
      this.$emit('reject',{show: false, submit: false});
    },
    confirm() {
      this.showPopup = false;
      this.$emit('confirm',{show: false, overrides: { gasPrice: this.gasPriceVal, gasLimit: this.gasLimitVal }});
    },
    closeModal() {
      this.showPopup = false;
      this.$emit('close',{show: false, submit: false});
    },
    setInitData() {
      if (this.metadata) {
        const gasPrice = this.metadata['gasPrice']
        const gasLimit = this.metadata['gas']
        this.gasPriceVal = gasPrice
        this.gasLimitVal = gasLimit
      }
    },
    
    getTokenIsValid() {
      if(!getTokenIsValid(this)){
        Toast('Please Login')
        logout()
        setTimeout(()=>{ window.location.href = LOCATION_HREF }, 2000);
        return false
      }
    },
  },
  created() {
    this.getTokenIsValid()
  },
}
</script>
<style lang="scss" scoped>
  @import './index.scss';
</style>
