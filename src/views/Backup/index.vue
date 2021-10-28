<template>
  <div class="first-wallet-page">
    <div class="page-top">
      <span><i>Choose Backup Method</i></span>
    </div>
    <div class="create-wallet-type">
      <van-tabs @click="oncheckCreateType" v-model="activeCreateWalletType" animated>
        <van-tab name="create" title="Create" class="inner-type-wrapper">
          <span class="tip">If you change browsers or move computers, you will need this mnemonic phrase and you will be able to access your account through it.Keep the mnemonic phrase in a safe place.</span>
          <van-field v-model="createType" label="Type" readonly class="createType-select" @click="showSelectType"/>
          <!-- create mnemonic -->
          <div class="type-create" v-show="createType==='mnemonic'">
            <v-mnemonicType type="create" @notLogin="handleNotLogin" />
          </div>
          <!-- create privateKey -->
          <div class="type-privatekey" v-show="createType==='privateKey'">
            <v-privatekeyType type="create" @notLogin="handleNotLogin" />
          </div>
        </van-tab>
        <van-tab name="import" title="Import" class="inner-type-wrapper">
          <span class="tip">You can choose to backup by mnemonic phrase or json key</span>
          <van-field v-model="importType" label="Type" readonly class="createType-select" @click="showSelectType"/>
          <!-- import mnemonic -->
          <div class="type-create" v-show="importType==='mnemonic'">
            <v-mnemonicType type="import" @notLogin="handleNotLogin" />
          </div>
          <!-- import privateKey -->
          <div class="type-privatekey" v-show="importType==='privateKey'">
            <v-privatekeyType type="import" @notLogin="handleNotLogin" />
          </div>
        </van-tab>
      </van-tabs>
    </div>
    <van-popup v-model="showCreateTypePopup" round position="bottom">
      <van-picker
        show-toolbar
        :value="selectType"
        :columns="typeList"
        @cancel="showCreateTypePopup = false"
        @confirm="onConfirmSelectType" />
    </van-popup>
    <v-thirdlogintip
      key="thirdlogintip"
      :show="showThirdLoginTip"
      @childEvent="closeThirdLoginTip" />
  </div>
</template>
<script>
import Vue from 'vue';
import _ from 'lodash'
import { Field, Popup, Tab, Tabs, } from 'vant';
import { saveToStorage, getFromStorage } from '@/utils/storage';
import MnemonicForAccount from './Components/MnemonicForAccount'
import PrivatekeyForAccount from './Components/PrivatekeyForAccount'
import ThirdLoginTip from '@/components/ThirdLoginTip';

Vue.use(Field)
Vue.use(Popup)
Vue.use(Tab)
Vue.use(Tabs)

export default {
  name: 'Backup',
  components: {
    'v-mnemonicType': MnemonicForAccount,
    'v-privatekeyType': PrivatekeyForAccount,
    'v-thirdlogintip': ThirdLoginTip,
  },
  data() {
    return {
      activeCreateWalletType: 'create', // create | import
      createType: 'mnemonic', // mnemonic || privateKey
      importType: 'mnemonic', // mnemonic || privateKey
      showCreateTypePopup: false,
      typeList: [{ key: 'mnemonic', text: 'Mnemonic'}, { key: 'privateKey', text: 'privateKey' }],
      selectType: 'mnemonic',
      showThirdLoginTip: false
    }
  },
  watch: {
    $route(to, from) {
      if (this.$route.query.type) {
        this.activeCreateWalletType = this.$route.query.type
      }
    }
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
    oncheckCreateType(tabType) {
      // this.activeStepForMnemonic = 0;
      if (tabType === 'create') {
        this.selectType = this.createType
        this.$router.replace({ name: 'backup', query: { type: 'create' }})
      } else {
        this.selectType = this.importType
        this.$router.replace({ name: 'backup', query: { type: 'import' }})
      }
      // this.showWalletTip = false
    },
    showSelectType() {
      this.showCreateTypePopup =  true
    },
    onConfirmSelectType(val) {
      console.log(val, this.activeCreateWalletType)
      this.activeCreateWalletType === 'create' && (this.createType = val['key']);
      this.activeCreateWalletType === 'import' && (this.importType = val['key']);
      this.showCreateTypePopup = false;
    },
    handleNotLogin() {
      this.showThirdLoginTip = true
    },
    closeThirdLoginTip(info) {
      this.showThirdLoginTip = info.show
    }
  },
  created() {
  },
  mounted() {
    const query = this.$route.query
    if (query) {
      this.activeCreateWalletType = query.type
    }
  },
}
</script>
<style lang="scss" scoped>
  @import 'index';
</style>
