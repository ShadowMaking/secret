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
import { saveToStorage, getFromStorage } from '@/utils/storage';
import { ACCOUNT_LIMIT } from '@/utils/global'
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
      let accountList = [];
      if (getFromStorage('walletAccount')) {
        accountList = window.JSON.parse(getFromStorage('walletAccount'))
        if (accountList.length === ACCOUNT_LIMIT) {
          Toast(`当前账户数已达上限: ${ACCOUNT_LIMIT}`);
          return
        }
      }
      const index = this.getAccountIndex(accountList);
      const accountInfo = {
        index,
        name: `Account${index}`,
        psw: values.psw
      }
      saveToStorage({ 'walletAccount': window.JSON.stringify([].concat(accountList, accountInfo)) });
      this.$emit('childEvent', accountInfo);
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
