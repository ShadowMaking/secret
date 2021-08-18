<template>
  <div class="setnet-page">
    <div class="subtitle">设置网络</div>
    <van-form @submit="onSubmit" class="set-net-form">
      <div class="field-item flex flex-center ">
        <span class="fieldName width120">
          <span>网络类型</span>
          <van-icon name="info-o" size="16"/>
        </span>
        <van-field name="netType" label="" >
          <template #input>
            <van-radio-group v-model="netType" direction="horizontal">
              <van-radio name="L1" class="type-radio">L1</van-radio>
              <van-radio name="L2" class="type-radio">L2</van-radio>
            </van-radio-group>
          </template>
        </van-field>
      </div>
      <div class="field-item">
        <span class="fieldName">网络名称</span>
        <van-field
          v-model="netName"
          name="netName"
          class="field-item-input" />
      </div>
      <div class="field-item">
        <span class="fieldName">新增RPCURL</span>
        <van-field
          v-model="rpcUrl"
          name="rpcUrl"
          class="field-item-input" />
      </div>
     <div class="field-item">
      <span class="fieldName">链ID</span>
      <van-field
        v-model="chainId"
        name="chainId"
        class="field-item-input" />
      </div>
      <div class="field-item">
        <span class="fieldName">符号（选填）</span>
        <van-field
          v-model="chart"
          name="chart"
          class="field-item-input" />
      </div>
      <div class="field-item">
        <span class="fieldName">区块链浏览器URL（选填）</span>
        <van-field
          v-model="browserURL"
          name="browserURL"
          class="field-item-input" />
      </div>
      <div class="opt-wrapper">
        <van-button plain type="info" @click="toPageMywallet">取消</van-button>
        <van-button type="info" native-type="submit"  color="#495ABE">保存</van-button>
      </div>
    </van-form>
  </div>
</template>
<script>
import Vue from 'vue';
import { Form, Button, RadioGroup, Radio, Icon } from 'vant';
import { guid } from '@/utils/index'
Vue.use(Form);
Vue.use(Button);
Vue.use(RadioGroup);
Vue.use(Radio);
Vue.use(Icon);

export default {
  name: 'SetNet',
  data() {
    return {
      netType: 'L1',
      netName: '',
      rpcUrl: '',
      chainId: '',
      chart: '',
      browserURL: '',
    }
  },
  methods: {
    toPageMywallet() {
      this.$router.push({ name: 'MyWallet' })
    },
    onSubmit(values) {
      const key = `net-${guid()}`;
      const netInfo = { key, ...values };
      this.$store.dispatch('updateNetList', netInfo);
      this.$router.push({ name: 'MyWallet' });
    },
  },
}
</script>
<style lang="scss" scoped>
  @import 'index';
</style>
