<template>
  <div class="pairingnet-page">
    <span class="subtitle">配置网络对</span>
    <van-form @submit="onSubmit" class="set-net-form">
      <div class="field-item">
        <span class="fieldName">L1网络</span>
        <van-field
          v-model="netForL1"
          name="netForL1"
          class="field-item-input"
          readonly
          @click="showNetPopupByType('l1')" />
      </div>
      <div class="field-item">
        <span class="fieldName">L2网络</span>
        <van-field
          v-model="netForL2"
          name="netForL2"
          class="field-item-input"
          readonly
          @click="showNetPopupByType('l2')" />
      </div>
      <div class="opt-wrapper">
        <van-button plain type="info" @click="toPageMywallet">取消</van-button>
        <van-button type="info" native-type="submit"  color="#495ABE">保存</van-button>
      </div>
    </van-form>
    <van-popup v-model="showNetPopup" round position="bottom">
      <van-picker
        show-toolbar
        :columns="netList"
        @cancel="showNetPopup = false"
        @confirm="onConfirm"
      />
    </van-popup>
  </div>
</template>
<script>
import Vue from 'vue';
import { Form, Button, Popup, Picker } from 'vant';
Vue.use(Form);
Vue.use(Button);
Vue.use(Popup);
Vue.use(Picker);

export default {
  name: 'PairingNet',
  data() {
    return {
      netForL1: '',
      netForL2: '',
      netType: 'l1',
      showNetPopup: false,
    }
  },
  computed: {
    netList() {
      const l1List = [1];
      const l2List = [11];
      if (this.netType === 'l1') {
        return l1List
      }
      if (this.netType === 'l2') {
        return l2List
      }
      return []
    },
  
  },
  methods: {
    toPageMywallet() {
      this.$router.push({ name: 'MyWallet' })
    },
    onSubmit(values) {
      console.log(values)
      this.$router.push({ name: 'MyWallet' })
    },
    showNetPopupByType(netType) {
      this.netType = netType;
      this.showNetPopup = true;
    },
    onConfirm(value) {
      this.netType === 'l1' && (this.netForL1 = value)
      this.netType === 'l2' && (this.netForL2 = value)
      this.showNetPopup = false;
    },
  },
}
</script>
<style lang="scss" scoped>
  @import 'index'
</style>