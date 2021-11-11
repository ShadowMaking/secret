<template>
  <div class="first-wallet-page">
    <div class="page-top">
      <span><i>Create Recovery</i></span>
    </div>
    <div class="create-wallet-type">
      <van-tabs @click="oncheckCreateType" v-model="activeCreateWalletType" animated>
        <van-tab name="create" title="Create" class="inner-type-wrapper">
          <h4>For your eyes only</h4>
          <span class="tip">Your secret recovery phrase or private key can help you backup and recover the secret. Don’t expose your private key or secret recovery phase in the public network.</span>
          <!-- backup-setting -->
          <div class="backup-setting-wrapper">
            <van-cell-group>
              <van-field v-model="createType" label="Type" readonly class="createType-select" :disabled="createTypeDisabled" @click="showSelectType('create')"/>
              <van-field v-model="backupName" label="Name" :formatter="formatterTrim"  placeholder="name(Only alphanumeric)" :disabled="createTypeDisabled" :error-message="nameErrorMsg"/>
              <van-field
                v-model="backupComment"
                rows="1"
                :disabled="createTypeDisabled"
                autosize
                label="Description"
                type="textarea"
                maxlength="150"
                show-word-limit
                placeholder="enter description" />
            </van-cell-group>
          </div>
          <!-- create mnemonic -->
          <div class="type-create" v-if="createType==='mnemonic'">
            <v-mnemonicType
              type="create"
              @notLogin="handleNotLogin"
              :settingData="settingDataForCreate"
              @createComplete="hanldeCreateComplete" />
          </div>
          <!-- create privateKey -->
          <div class="type-privatekey" v-if="createType==='privateKey'">
            <v-privatekeyType
              type="create"
              @notLogin="handleNotLogin"
              :settingData="settingDataForCreate"
              @createComplete="hanldeCreateComplete"/>
          </div>
        </van-tab>
        <van-tab name="import" title="Import" class="inner-type-wrapper">
          <span class="tip">Add an existing account by secret recovery phrase or private key.</span>
          <!-- backup-setting -->
          <div class="backup-setting-wrapper">
            <van-cell-group>
              <van-field v-model="importType" label="Type" readonly class="createType-select" :disabled="importTypeDisabled" @click="showSelectType('import')"/>
              <van-field v-model="backupNameForImport" :formatter="formatterTrim" label="Name" placeholder="name(not Chinese characters)" :disabled="importTypeDisabled" :error-message="nameErrorMsg" />
              <van-field
                v-model="backupCommentForImport"
                rows="1"
                :disabled="importTypeDisabled"
                autosize
                label="Descridption"
                type="textarea"
                maxlength="150"
                show-word-limit
                placeholder="enter description" />
            </van-cell-group>
          </div>
          <!-- import mnemonic -->
          <div class="type-create" v-if="importType==='mnemonic'">
            <v-mnemonicType type="import" @notLogin="handleNotLogin" :settingData="settingDataForImport" @createComplete="hanldeCreateComplete" />
          </div>
          <!-- import privateKey -->
          <div class="type-privatekey" v-if="importType==='privateKey'">
            <v-privatekeyType type="import" @notLogin="handleNotLogin" :settingData="settingDataForImport" @createComplete="hanldeCreateComplete" />
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
import { Field, Popup, Tab, Tabs, Toast, CellGroup } from 'vant';
import { saveToStorage, getFromStorage } from '@/utils/storage';
import MnemonicForAccount from './Components/MnemonicForAccount'
import PrivatekeyForAccount from './Components/PrivatekeyForAccount'
import ThirdLoginTip from '@/components/ThirdLoginTip';
import { formatTrim, objHasOwnProperty } from '@/utils/str';

Vue.use(Field)
Vue.use(Popup)
Vue.use(Tab)
Vue.use(Tabs)
Vue.use(Toast)
Vue.use(CellGroup)

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
      showThirdLoginTip: false,
      createTypeDisabled: false,
      importTypeDisabled: false,
      nameErrorMsg: '',

      backupName: '',
      backupComment: '',
      backupNameForImport: '',
      backupCommentForImport: '',
    }
  },
  computed: {

    settingDataForCreate() {
      return {
        name: this.backupName,
        desc: this.backupComment
      };
    },
    settingDataForImport() {
      return {
        name: this.backupNameForImport,
        desc: this.backupCommentForImport
      };
    },
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
    showSelectType(type) {
      const disabled = type === 'create' && this.createTypeDisabled || type === 'import' && this.importTypeDisabled;
      if (disabled) { return }
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
    },
    hanldeCreateComplete() {
      this.activeCreateWalletType==='create'&&(this.createTypeDisabled = true)
      this.activeCreateWalletType==='import'&&(this.importTypeDisabled = true)
    },
    formatterTrim(value) {
      return formatTrim(value)
    },
    handlesInputFocus() {
      var settingdata = JSON.parse(getFromStorage('settingdata'));
      if (settingdata) {
        if (objHasOwnProperty(settingdata, 'id')) {
          this.createTypeDisabled = true
          this.importTypeDisabled = true
          this.nameErrorMsg = 'Click `Recover Secret` and continue the previous backup'
        } else {
          if (getFromStorage('mnemonic')) {
            this.backView(settingdata, 'name', 'backupName')
            this.backView(settingdata, 'desc', 'backupComment')
          }
          if (getFromStorage('privateKey')) {
            this.backView(settingdata, 'name', 'backupNameForImport')
            this.backView(settingdata, 'desc', 'backupCommentForImport')
          }
        }
      }
    },
    backView(storageObj, storageName, viewName) {
      objHasOwnProperty(storageObj, storageName)&&(this[viewName] = storageObj[storageName])
    },
  },
  created() {
  },
  mounted() {
    const query = this.$route.query
    if (query) {
      this.activeCreateWalletType = query.type
    }
    this.handlesInputFocus()
  },
}
</script>
<style lang="scss" scoped>
  @import 'index';
</style>
