<template>
  <van-popup v-model="showPopup" class="confirm-modal-popUp flex flex-center flex-column" @close="closeModal">
    <div class="confirm-modal">
      <div class="confirm-modal-wraper">
        <div class="top-header">
          <div class="eidt">Edit</div>
          <div class="net"><i></i>{{ showValBySourceData('netInfo') }}</div>
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
                  <div class="gasFee"><span class="name">Estimated gas fee</span><span class="value">{{ showValBySourceData('estimatedGasFee') }} ETH</span></div>
                  <div class="gasPrice">
                    <span class="name">GasPrice</span>
                    <span v-if="!showGasPrice" class="value">{{ gasPriceVal }}  Gwei <van-icon name="edit" @click="showEdit('GasPrice')" /></span>
                    <span v-if="showGasPrice" >
                      <input style="width: 80px" type='text' name="formVal" placeholder="0" v-model="gasPriceVal" @input="inputChange" @keyup="e=>hanldeValue(e,'gasPrice')" @blur="showGasPrice=false" />
                      <span> Gwei</span>
                    </span>
                  </div>
                  <div class="gasLimit">
                    <span class="name">GasLimit</span>
                    <span v-if="!showGasLimit" class="value">{{ gasLimitVal||21000 }} <van-icon name="edit" @click="showEdit('GasLimit')" /> </span>
                    <input v-if="showGasLimit" style="width: 80px" type='text' name="formVal2" placeholder="0" v-model="gasLimitVal" @input="inputChange" @keyup="e=>hanldeValue(e,'gasLimit')" @blur="showGasLimit=false" />
                  </div>
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
              <div class="tabs-content data-wraper">
                {{ showValBySourceData('data') }}
              </div>
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
import { Popup, Button, Tab, Tabs, Toast } from 'vant';
import { saveToStorage, getFromStorage, removeFromStorage, getInfoFromStorageByKey } from '@/utils/storage';
import { getTokenIsValid } from '@/utils/dashBoardTools';

import { LOCATION_HREF } from '../../global'
import { logout } from '@/utils/auth'

Vue.use(Popup);
Vue.use(Button);
Vue.use(Tab);
Vue.use(Tabs);
Vue.use(Toast);

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
    }
  },
  computed: {
    host() {
      return window.location.origin
    },
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
          case 'gas':
            return metadata.gas
          case 'total':
            return `${metadata.value} ${metadata.symbolName} + ${metadata.estimatedGasFee} ETH` 
          case 'netInfo':
            return metadata && `${metadata.netInfo.name}`
          case 'data':
            return metadata && `${metadata.DATA}` || '0x'
          case 'estimatedGasFee':
            return metadata && `${metadata.estimatedGasFee}`
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
    hanldeValue(e, type) {
      let value = e.target.value
      value=value.replace(/^\D*(\d*(?:\.\d{0,4})?).*$/g, '$1')
      this[`${type}Val`] = value
    },
    inputChange(e) {
      const val = e.target.value
    },
    showEdit(type) {
      this[`show${type}`] = true
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
