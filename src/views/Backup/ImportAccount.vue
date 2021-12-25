<template>
  <div class="first-wallet-page">
    <div class="page-top">
      <span><i>Import Account</i></span>
    </div>
    <div class="create-wallet-type">
      <div class="inner-type-wrapper">
        <span class="tip">Add an existing account by secret recovery phrase or private key.</span>
        <!-- backup-setting -->
        <div class="backup-setting-wrapper" style="border: none">
          <van-cell-group>
            <van-field v-model="importType" label="Type" readonly class="createType-select" :disabled="importTypeDisabled" @click="showSelectType('import')"/>
            <!-- <van-field v-model="backupNameForImport" :formatter="formatterTrim" label="Name" placeholder="name(Only alphanumeric)" :disabled="importTypeDisabled" :error-message="nameErrorMsg" />
            <van-field
              v-model="backupCommentForImport"
              rows="1"
              :disabled="importTypeDisabled"
              autosize
              label="Descridption"
              type="textarea"
              maxlength="150"
              show-word-limit
              placeholder="enter description" /> -->
          </van-cell-group>
        </div>
        <!-- import mnemonic -->
        <div class="type-create" v-if="importType==='mnemonic'">
          <v-mnemonicType type="import" :need2FA="false" @notLogin="handleNotLogin" :settingData="settingDataForImport" @createComplete="hanldeCreateComplete" />
        </div>
        <!-- import privateKey -->
        <div class="type-privatekey" v-if="importType==='privateKey'">
          <v-privatekeyType type="import" :need2FA="false" @notLogin="handleNotLogin" :settingData="settingDataForImport" @createComplete="hanldeCreateComplete" />
        </div>
      </div>
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
import { ethers } from 'ethers'
import { Field, Popup, Tab, Tabs, Toast, CellGroup } from 'vant';
import { saveToStorage, getFromStorage, getInfoFromStorageByKey } from '@/utils/storage';
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
      activeCreateWalletType: 'import', // create | import
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
    async hanldeCreateComplete(val, type) {
      console.log(val, type)
      let wallet;
      let address;
      let privateKey
      if (type === 'privateKey') {
        wallet = new ethers.Wallet(val);
        address = wallet.address
        privateKey = val
      } else {
        wallet = ethers.Wallet.fromMnemonic(val);
        privateKey = wallet.privateKey
        address = wallet.address
      }
      const userId = getInfoFromStorageByKey('gUID')
      const { hasError: encryptError, data: encryptPrivateKey } = await this.$store.dispatch('EncryptPrivateKey', { userId, privateKey }) 
      if (encryptError) {
        console.log('EncrpytKey Failed')
        Toast('Import Failed')
        return
      }
      const { hasError } = await this.$store.dispatch('UploadEncrpytKeyByAddress', { userId, address, encryptKey: encryptPrivateKey })
      if (hasError) {
        console.log('Upload EncrpytKey Failed')
        Toast('Import Failed')
        return
      }
      await this.$store.dispatch('StoreBindingGoogleUserInfoList', { userId, encryptPrivateKey, privateKey, address })
      Toast('Import Account Successfully')
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
    this.handlesInputFocus()
  },
}
</script>
<style lang="scss" scoped>
  @import 'index';
</style>
