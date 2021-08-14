<template>
  <div class="setnet-page">
    <div class="subtitle">设置网络</div>
    <van-form @submit="onSubmit" class="set-net-form">
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
        v-model="linkId"
        name="linkId"
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
import { Form, Button } from 'vant';
Vue.use(Form);
Vue.use(Button);

export default {
  name: 'SetNet',
  data() {
    return {
      netName: '',
      rpcUrl: '',
      linkId: '',
      chart: '',
      browserURL: '',
    }
  },
  methods: {
    toPageMywallet() {
      this.$router.push({ name: 'MyWallet' })
    },
    onSubmit(values) {
      console.log(values)
      this.$router.push({ name: 'MyWallet' })
    },
  },
}
</script>
<style lang="scss" scoped>
  @import 'index';
</style>
