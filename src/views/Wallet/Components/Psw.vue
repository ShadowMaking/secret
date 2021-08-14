<template>
  <div class="create-wallet-step1">
    <van-form @submit="onSubmit">
      <van-field
        v-model="psw"
        type="password"
        name="psw"
        label="密码"
        :rules="ruleForPsw" />
      <van-field
        v-model="repsw"
        type="password"
        name="repsw"
        label="确认密码"
        :rules="ruleForRePsw" />
      <div class="opt-wrapper">
        <van-button type="info" native-type="submit" block color="#495ABE">创建密码</van-button>
      </div>
    </van-form>
  </div>
</template>
<script>
import Vue from 'vue';
import { Form, Field, Button, Toast } from 'vant';
import { saveToStorage, getFromStorage, removeFromStorage } from '@/utils/storage';
import { ACCOUNT_LIMIT } from '@/utils/global'
import { removeWallet } from '@/utils/auth'
import _ from 'lodash'

Vue.use(Form);
Vue.use(Field);
Vue.use(Button);

export default {
  name: 'PSW',
  data() {
    return{
      psw: '',
      repsw: '',
      ruleForPsw: [
        { required: true, message: '请输入密码' },
        { required: true, validator: this.validatorPsw, message: '密码格式不正确' },
      ],
      ruleForRePsw: [
        { required: true, message: '请输入密码' },
        { required: true, validator: this.validatorPsw, message: '密码格式不正确' },
        { required: true, validator: this.validatorRePsw, message: '两次密码不一致' },
      ],
    }
  },
  methods: {
    onSubmit(values) {
      // 如果本地存储已有钱包则清除，并清除钱包相关的一且信息。包括账户
      removeWallet();
      const index = this.getAccountIndex([]);
      const accountInfo = {
        index,
        name: `Account${index}`,
        psw: values.psw
      }

      // 拿到随机生成的钱包信息
      const wallet = this.ethers.Wallet.createRandom();
      const { mnemonic, privateKey, publicKey, address} = wallet;
      // 获取助记词
      const mnemonicValues = mnemonic['phrase'];
      console.log("钱包助记词：",mnemonicValues)
      const walletInfo = {
        address,
        privateKey,
      }
      saveToStorage({ 'walletInfo': window.JSON.stringify(Object.assign({}, walletInfo)) });
      saveToStorage({ 'walletAccount': window.JSON.stringify([].concat([{...accountInfo}])) });
      this.$emit('childEvent', {
        accountInfo,
        walletInfo: Object.assign({}, { ...walletInfo, mnemonic: mnemonicValues })
      });
    },
    getAccountIndex(list) {
      if (list.length===0) {
        return 1
      }
      return _.maxBy(list, 'index')['index'] + 1;
    },
    validatorPsw(val) {
      return val.length >= 1
    },
    validatorRePsw(val) {
      return this.psw == this.repsw;
    },
  },
}
</script>
<style lang="scss" scoped>
  @import 'index'
</style>
