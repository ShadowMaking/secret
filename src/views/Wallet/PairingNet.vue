<template>
  <div class="pairingnet-page">
    <span class="subtitle">配置网络对</span>
    <van-form @submit="onSubmit" class="set-net-form">
      <div class="field-item">
        <span class="fieldName">L1网络</span>
        <van-field
          v-model="l1SelectedNetName"
          name="netForL1"
          class="field-item-input"
          readonly
          @click="showNetPopupByType('l1')" />
      </div>
      <div class="field-item">
        <span class="fieldName">L2网络</span>
        <van-field
          v-model="l2SelectedNetName"
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
        :default-index=2
        @cancel="showNetPopup = false"
        @confirm="onConfirm">
        <template #option="item">
          <span>{{ item.netName }}</span>
        </template>
      </van-picker>
    </van-popup>
  </div>
</template>
<script>
import Vue from 'vue';
import { Form, Button, Popup, Picker, Toast } from 'vant';
import { guid } from '@/utils/index'
Vue.use(Form);
Vue.use(Button);
Vue.use(Popup);
Vue.use(Picker);

export default {
  name: 'PairingNet',
  data() {
    return {
      netForL1: null,
      netForL2: null,
      netType: 'l1',
      netList: [],
      showNetPopup: false,
    }
  },
  computed: {
    l1SelectedNetName() {
      return this.netForL1 && this.netForL1['netName']||'';
    },
    l2SelectedNetName() {
      return this.netForL2 && this.netForL2['netName']||'';
    },
  },
  watch: {
    // 网络类型变化重新设置L1和L2的可选网络（因为公用一个select）
    netType(newValue, oldValue) {
      this.setNetList();
    },
  },
  methods: {
    toPageMywallet() {
      this.$router.push({ name: 'MyWallet' })
    },
    onSubmit(values) {
      const { netForL1, netForL2 } = this;
      console.log(values, netForL1, netForL2);
      // 存储网络配对信息
      this.$store.dispatch('saveNetPairList', {
        key: `pair-${netForL1['key']}-${netForL2['key']}`,
        netName: `${netForL1.netName}-${netForL2.netName}`,
        netType: 'pair', // 标识网络对
        pairkeys: [netForL1['key'],netForL2['key']],
      })
      .then(res=>{
        this.$router.push({ name: 'MyWallet' });
      })
      .catch(errMsg=>{
        Toast(errMsg)
      })
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
    // 设置可选的L1和L2网络数据
    async setNetList() {
      const allNetList = await this.$store.dispatch('getAllNetList');
      const l1List = _.filter(allNetList, {netType: 'L1'});
      const l2List = _.filter(allNetList, {netType: 'L2'});
      if (this.netType === 'l1') {
        this.netList = l1List
        return
      }
      if (this.netType === 'l2') {
        this.netList = l2List
        return
      }
      this.netList = []
    },
  },
  async mounted() {
    await this.setNetList();
  },
  
}
</script>
<style lang="scss" scoped>
  @import 'index'
</style>