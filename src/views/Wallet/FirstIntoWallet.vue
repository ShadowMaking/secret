<template>
  <div class="first-wallet-page">
    <div class="page-top">
      <van-icon name="arrow-left" size="25" @click="goBack"/>
      <span>第一次使用钱包<i> EigenSecret ？</i></span>
    </div>
    <div class="create-wallet-type">
      <van-tabs @click="oncheckCreateType" v-model="activeCreateWalletType" animated>
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
                :sourceData="mnemonicList"
                @childEvent="menonicbackupCallback"
                @childEventAfter="menonicbackupAfterCallback"
                @childEventConfirm="menonicbackupConfirmCallback"
                v-show="activeStepForPsw===1" />
              <!-- 助记词验证 -->
              <v-menonicConfirm
                key="menonic-confirm"
                v-show="activeStepForPsw===2"
                :sourceData="conformList"
                @childEvent="menonicConfirmCallback" />
              <v-complete
                key="menonic-confirm-complete"
                v-show="activeStepForPsw===3" />
            </div>
          </div>
        </van-tab>
        <van-tab name="mnemonic" title="导入钱包" class="inner-type-wrapper">
          <!-- <span class="tip">已经有账户助记词，用来恢复钱包</span> -->
          <span class="tip">您需要输入已经有的账户助记词，用来恢复钱包</span>
          <div class="type-import">
            <div class="menonic-input">
              <van-field
                v-model="mnemonic"
                rows="4"
                autosize
                label=""
                type="textarea"
                placeholder="请输入助记词，英文逗号分隔"
                @input="handleInputChange"
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
                  :disabled="!psw||!repsw||!mnemonic"
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
    <v-walletStatus :showWalletTip="showWalletTip" title="应用检测到您已有钱包账号" />
  </div>
</template>
<script>
import Vue from 'vue';
import { Icon, Tab, Tabs, Step, Steps, Field, Form, Dialog } from 'vant';
import StatusPop from '@/components/StatusPop';
import WalletStatusDialog from '@/components/WalletStatusDialog';
import { saveToStorage, getFromStorage } from '@/utils/storage';
import PSW from './Components/Psw'
import MenonicBackup from './Components/MenonicBackup'
import MenonicConfirm from './Components/MenonicConfirm'
import MenonicConfirmComplete from './Components/MenonicConfirmComplete'
import _ from 'lodash'

Vue.use(Icon);
Vue.use(Tab);
Vue.use(Tabs);
Vue.use(Step);
Vue.use(Steps);
Vue.use(Field);
Vue.use(Form);
Vue.use(Dialog);

export default {
  name: 'FirstIntoWallet',
  components: {
    'v-psw': PSW,
    'v-menonicbackup': MenonicBackup,
    'v-menonicConfirm': MenonicConfirm,
    'v-complete': MenonicConfirmComplete,
    'v-statusPop': StatusPop,
    'v-walletStatus': WalletStatusDialog,
  },
  data() {
    return {
      activeCreateWalletType: 'password', // password | mnemonic
      activeStepForPsw: 0, // 0-创建密码 1-助记词备份 2-助记词验证 3-创建完成
      mnemonic: '',
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
      showWalletTip: false,
    }
  },
  computed: {
    mnemonicList() {
      const list = this.mnemonic && this.mnemonic.split(' ') || []
      return this.mnemonic && this.mnemonic.split(' ')||[];
      // return 'message cream element broken shoulder alert input improve kick banner sing fork'.split(' ')
    },
    conformList() {
      const list = this.mnemonic && this.mnemonic.split(' ') || []
      return this.mnemonic && this.mnemonic.split(' ')||[];
    },
  },
  /* beforeRouteEnter (to, from, next) {
    // 在渲染该组件的对应路由被 confirm 前调用
    // 不！能！获取组件实例 `this`
    // 因为当守卫执行前，组件实例还没被创建
  },
  beforeRouteUpdate (to, from, next) {
    // 在当前路由改变，但是该组件被复用时调用
    // 举例来说，对于一个带有动态参数的路径 /foo/:id，在 /foo/1 和 /foo/2 之间跳转的时候，
    // 由于会渲染同样的 Foo 组件，因此组件实例会被复用。而这个钩子就会在这个情况下被调用。
    // 可以访问组件实例 `this`
  },
  beforeRouteLeave (to, from, next) {
    // 导航离开该组件的对应路由时调用
    // 可以访问组件实例 `this`
  }, */
  methods: {
    // 判断是否已经有钱包账户
    checkWallet() {
      let walletInfo = null;
      if (getFromStorage('walletInfo')) {
        walletInfo = window.JSON.parse(getFromStorage('walletInfo'))
        this.showWalletTip = true
      }
    },
    validatorPsw(val) {
      return val.length >= 1
    },
    validatorRePsw(val) {
      return this.psw == this.repsw;
    },
    goBack() {
      this.$router.push({ name: 'Home' });
    },
    oncheckCreateType(tabType) {
      this.activeStepForPsw = 0;
      if (tabType === 'password') {
        this.$router.replace({ name: 'FirstIntoWallet', query: { type: 'psw' }})
      } else {
        this.$router.replace({ name: 'FirstIntoWallet', query: { type: 'mnemonic' }})
      }
      this.showWalletTip = false
    },
    // 导入钱包
    handleImportWallet() {
      this.showStatusPop = true
    },
    handleImportComplete() {
      this.$router.push({name:'Home'})
    },
    // 创建密码回调
    walletPswCallback({accountInfo, walletInfo}) {
      console.log('accountInfo', accountInfo, walletInfo)
      if (accountInfo || walletInfo) {
        this.activeStepForPsw = 1;
        this.mnemonic = walletInfo['mnemonic']; // message cream element broken shoulder alert input improve kick banner sing fork
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
      this.conformList = _.cloneDeep(this.mnemonic);
      this.activeStepForPsw = 2; // 进入助记词验证
    },
    // 助记词验证通过后回调
    menonicConfirmCallback() {
      this.activeStepForPsw = 3; // 成功提示
    },
    handleInputChange(value) {
      console.log(value)
    },
    onSubmit() {},
  },
  created() {
    this.checkWallet();
  },
  mounted() {
  },
}
</script>
<style lang="scss" scoped>
  @import 'index';
</style>
