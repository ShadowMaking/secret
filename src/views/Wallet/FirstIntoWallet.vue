<!--
 * @Author       : skyeGao
 * @Email        : yingyinggao@sohu-inc.com
 * @DateTime     : 2021-08-12 01:01:42
 * @Description  : Description
-->
<template>
  <div class="first-wallet-page">
    <div class="page-top">
      <van-icon name="arrow-left" size="25" @click="goBack"/>
      <span>第一次使用钱包<i> EigenSecret ？</i></span>
    </div>
    <div class="create-wallet-type">
      <van-tabs @click="oncheckCreateType" v-model="activeCreateWalletType">
        <van-tab name="password" title="创建钱包" class="inner-type-wrapper">
          <span class="tip">第一次使用钱包，为您创建钱包账户和助记词</span>
          <div class="type-create">
            <van-steps :active="activeStepForPsw">
              <van-step>创建密码</van-step>
              <van-step>助记词备份</van-step>
              <van-step>助记词验证</van-step>
              <van-step>创建完成</van-step>
            </van-steps>
            <div>
              <!-- 创建密码 -->
              <v-psw key="wallet-for-psw" @childEvent="walletPswCallback" v-show="activeStepForPsw===0" />
              <!-- 助记词备份 -->
              <v-menonicbackup
                key="menonic-backup"
                @childEvent="menonicbackupCallback"
                @childEventAfter="menonicbackupAfterCallback"
                @childEventConfirm="menonicbackupConfirmCallback"
                v-show="activeStepForPsw===1" />
              <!-- 助记词验证 -->
              <v-menonicConfirm
                key="menonic-confirm"
                v-show="activeStepForPsw===2"
                @childEvent="menonicConfirmCallback" />
              <v-complete
                key="menonic-confirm-complete"
                v-show="activeStepForPsw===3" />
            </div>
          </div>
        </van-tab>
        <van-tab name="momenic" title="导入钱包" class="inner-type-wrapper">
          <!-- <span class="tip">已经有账户助记词，用来恢复钱包</span> -->
          <span class="tip">您需要输入已经有的账户助记词，用来恢复钱包</span>
          <div class="type-import">
            <div class="menonic-input">
              <van-field
                v-model="menonic"
                rows="4"
                autosize
                label=""
                type="textarea"
                placeholder="请输入助记词，英文逗号分隔"
                @input="handleAddressInputChange"
              />
            </div>
            <van-form @submit="onSubmit">
              <van-field
                v-model="psw"
                type="password"
                name="psw"
                label="密码"
                placeholder="钱包密码"
                :rules="ruleForPsw" />
              <van-field
                v-model="repsw"
                type="password"
                name="repsw"
                label="确认密码"
                placeholder="重复输入钱包密码"
                :rules="ruleForRePsw" />
              <div class="opt-wrapper">
                <van-button
                  type="info"
                  native-type="submit"
                  block
                  color="#495ABE"
                  :disabled="!psw||!repsw||!menonic"
                  @click="handleImportWallet">导入钱包</van-button>
              </div>
            </van-form>
          </div>
        </van-tab>
      </van-tabs>
    </div>
    <v-statusPop
      status="success"
      title="恭喜您，导入成功"
      timeTxt=""
      tip=""
      :show="showStatusPop"
      @childEvent="handleImportComplete" />
  </div>
</template>
<script>
import Vue from 'vue';
import { Icon, Tab, Tabs, Step, Steps, Field, Form } from 'vant';
import StatusPop from '@/components/StatusPop';
import PSW from './Components/Psw'
import MenonicBackup from './Components/MenonicBackup'
import MenonicConfirm from './Components/MenonicConfirm'
import MenonicConfirmComplete from './Components/MenonicConfirmComplete'

Vue.use(Icon);
Vue.use(Tab);
Vue.use(Tabs);
Vue.use(Step);
Vue.use(Steps);
Vue.use(Field);
Vue.use(Form);

export default {
  name: 'FirstIntoWallet',
  components: {
    'v-psw': PSW,
    'v-menonicbackup': MenonicBackup,
    'v-menonicConfirm': MenonicConfirm,
    'v-complete': MenonicConfirmComplete,
    'v-statusPop': StatusPop,
  },
  data() {
    return {
      activeCreateWalletType: 'password', // password | momenic
      activeStepForPsw: 0, // 0-创建密码 1-助记词备份 2-助记词验证 3-创建完成
      menonic: '',
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
      showStatusPop: false,
    }
  },
  methods: {
    validatorPsw(val) {
      return val.length >= 1
    },
    validatorRePsw(val) {
      return this.psw == this.repsw;
    },
    goBack() {
      this.$router.push({ name: 'Home' });
    },
    oncheckCreateType() {
      this.activeStepForPsw = 0;
    },
    // 导入钱包
    handleImportWallet() {
      this.showStatusPop = true
    },
    handleImportComplete() {
      this.$router.push({name:'Home'})
    },
    // 创建密码回调
    walletPswCallback(accountInfo) {
      console.log('accountInfo', accountInfo)
      if (accountInfo) {
        this.activeStepForPsw = 1;
      }
    },
    // 立即备份回调
    menonicbackupCallback(menonicList) {
      console.log('menonicList', menonicList)
    },
    // 稍后备份回调
    menonicbackupAfterCallback() {

    },
    // 助记词确认备份后回调
    menonicbackupConfirmCallback() {
      this.activeStepForPsw = 2; // 进入助记词验证
    },
    // 助记词验证通过后回调
    menonicConfirmCallback() {
      this.activeStepForPsw = 3; // 成功提示
    },
  },
}
</script>
<style lang="scss" scoped>
  @import 'index';
</style>
