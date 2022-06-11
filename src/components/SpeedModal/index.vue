<template>
  <van-popup v-model="showPopup" class="speed-modal-popUp flex flex-center flex-column" @close="closeModal" :closeable="true">
    <div class="speed-modal-content">
      <div class="speed-title">Speed up transaction</div>
      <div class="speed-tip">Network is busy, Gas Prices are high and estimates are less accounrate.</div>
      <div class="speed-top-text">
        <div class="speed-name">New gas fee</div>
        <div class="speed-new-fee-value">{{estimatedGasFee}}</div>
        <div class="speed-new-fee-value">ETH</div>
        <div class="speed-name">Max fee: {{estimatedGasFee}}</div>
        <div class="speed-time red-color" v-if="fastValue == 'Low'">likely in&lt;30 seconds</div>
        <div class="speed-time" v-else-if="fastValue == 'Average'">Very likely in&lt;30 seconds</div>
        <div class="speed-time" v-else>Very likely in&lt;15 seconds</div>
      </div>
      <div class="speed-fast-box">
        <div class="radio-group">
          <div class="radio-group_column">
            <label class="radio-group_column-inner">
              <div class="radio-group__column-radio">
                <input type="radio" name="gas-recommendation" value="Low" v-model='fastValue' @change="changeFast">
              </div>
              <div class="radio-group__column-start-connector"></div>
              <h6 class="fast-h6">低</h6>
            </label>
          </div>
          <div class="radio-group_column">
            <label class="radio-group_column-inner">
              <div class="radio-group__column-radio">
                <input type="radio" name="gas-recommendation" value="Average" v-model='fastValue' @change="changeFast">
              </div>
              <div class="radio-group__column-vertical-line"></div>
              <div class="radio-group__column-horizontal-line"></div>
              <h6 class="fast-h6">中</h6>
            </label>
          </div>
          <div class="radio-group_column">
            <label class="radio-group_column-inner">
              <div class="radio-group__column-radio">
                <input type="radio" name="gas-recommendation" value="Fast" v-model='fastValue' @change="changeFast">
              </div>
              <div class="radio-group__column-end-connector"></div>
              <h6 class="fast-h6">高</h6>
            </label>
          </div>
        </div>
      </div>
      <div class="advanced-options-box">
          <div class="advances-title" @click="showAdvance">
            <span class="advance-text">Advanced Options</span>
            <van-icon name="arrow-down" v-show="advanceVisible"/>
            <van-icon name="arrow-up" v-show="!advanceVisible"/>
          </div>
          <div class="advance-input-box" v-show="advanceVisible">
            <div class="advance-input-item">
              <label>Gas Limit</label>
              <van-field v-model="gasLimit" type="number" class="advance-input"/>
            </div>
            <div class="advance-input-item">
              <label>Max priority fee (GWEI)</label>
              <van-field v-model="maxPriorityFee" type="number" class="advance-input" @input="feeChange"/>
            </div>
            <!-- <div class="advance-input-item">
              <label>Max fee (GWEI)</label>
              <van-field v-model="maxFee" type="number" class="advance-input" error-message=""/>
            </div> -->
          </div>
          <div class="submit-box">
            <el-button type="primary" class="common-form-btn" @click="saveSubmit">Save</el-button>
          </div>
        </div>
    </div>
  </van-popup>
</template>
<script>
import Vue from 'vue';
import { Popup, Button, Tab, Tabs, Toast, Field  } from 'vant';
import { saveToStorage, getFromStorage, removeFromStorage, getInfoFromStorageByKey } from '@/utils/storage';
import { getTokenIsValid, getEstimateGas, getEstimateGasUsedByPrice } from '@/utils/dashBoardTools';

import { LOCATION_HREF } from '../../global'
import { logout } from '@/utils/auth'
import web3 from 'web3'

Vue.use(Popup);
Vue.use(Button);
Vue.use(Toast);
Vue.use(Field);

export default {
  name: 'ConfirmModal',
  props: {
    'show': { type: Boolean, },
    'needColse': {
      type: Boolean,
      default: true
    },
  },
  data() {
    return {
      gasPriceVal: '',
      gasLimitVal: '',
      showPopup: false,
      advanceVisible: false,

      gasLimit: 8000000,
      maxPriorityFee: '',
      maxFee: '',
      fastValue: '',
      estimatedGasFee: '--',
      
      fastPriceData: null,
    }
  },
  watch: {
    show() {
      if (this.show) {
        this.getTokenIsValid()
      }
      this.showPopup = this.show
    },
    
  },
  methods: {
    showAdvance() {
      this.advanceVisible = !this.advanceVisible
    },
    closeModal() {
      this.showPopup = false;
      this.$emit('close',{show: false, submit: false});
    },
    getTokenIsValid() {
      if(!getTokenIsValid(this)){
        Toast('Please Login')
        logout()
        setTimeout(()=>{ window.location.href = LOCATION_HREF }, 2000);
        return false
      }
    },
    async feeChange(event) {
      this.estimatedGasFee = await getEstimateGasUsedByPrice(this.maxPriorityFee.toString())
    },
    async getFastGasPrice() {
      const { hasError, data } = await this.$store.dispatch('GetGasPriceByEtherscan');
      if (data) {
        this.fastPriceData = data 
        // this.lowPrice = data.Low.gasPrice
        // this.highPrice = data.Fast.gasPrice
        // this.mediumPrice = data.Average.gasPrice
      }
    },
    async changeFast(e) {
      if(!this.fastPriceData){return}
      this.maxPriorityFee = this.fastPriceData[`${this.fastValue}`].gasPrice
      this.estimatedGasFee = await getEstimateGasUsedByPrice(this.maxPriorityFee)
    },
    saveSubmit() {
      this.showPopup = false;
      this.$emit('confirm',{show: false, overrides: { gasPrice: this.maxPriorityFee.toString(), gasLimit: this.gasLimit }});
    },
    async getMaxFee() {
      const estimateGas = await getEstimateGas('gasPrice')
      let thisGasPrice = estimateGas.toString()
      this.maxPriorityFee = web3.utils.fromWei(thisGasPrice, 'gwei')
      this.estimatedGasFee = await getEstimateGas('gasUsed')
    },
  },
  async created() {
    this.getTokenIsValid()
    this.getFastGasPrice()
    this.getMaxFee()
  },
}
</script>
<style lang="scss" scoped>
  @import './index.scss';
</style>
