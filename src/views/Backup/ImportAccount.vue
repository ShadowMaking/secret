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
          <div class="backup-setting-content">
            <label>Type</label>
            <el-select v-model="importType" class="backup-setting-select" @change="onConfirmSelectType">
              <el-option-group>
                <el-option value="mnemonic" label="mnemonic"></el-option>
                <el-option value="privatekey" label="privatekey"></el-option>
              </el-option-group>
            </el-select>
          </div>
          
          <!-- <van-cell-group> -->
            <!-- <van-field v-model="importType" label="Type" readonly class="createType-select" :disabled="importTypeDisabled" @click="showSelectType('import')"/> -->
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
          <!-- </van-cell-group> -->
        </div>
        <!-- import mnemonic -->
        <div class="type-create" v-if="importType==='mnemonic'">
          <v-mnemonicType type="import" :need2FA="false" @notLogin="handleNotLogin" :settingData="settingDataForImport" @createComplete="hanldeCreateComplete" />
        </div>
        <!-- import privateKey -->
        <div class="type-privatekey" v-if="importType==='privatekey'">
          <v-privatekeyType type="import" :need2FA="false" @notLogin="handleNotLogin" :settingData="settingDataForImport" @createComplete="hanldeCreateComplete" />
        </div>
      </div>
    </div>
    <!-- <van-popup v-model="showCreateTypePopup" round position="bottom">
      <van-picker
        show-toolbar
        :value="selectType"
        :columns="typeList"
        @cancel="showCreateTypePopup = false"
        @confirm="onConfirmSelectType" />
    </van-popup> -->
    <v-thirdlogintip
      key="thirdlogintip"
      :show="showThirdLoginTip"
      @childEvent="closeThirdLoginTip" />
    <v-loadingPopup :show="showLoading" :showSpinner="false" />
    <v-inputPsw :show="showInputPswModal" :canCloseByBtn="true" @cancel="showInputPswModal=false" @ok="confirmPswOk" :btnLoading="confirmPswBtnLoading" />
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
import InputPswModal from '@/components/InputPswModal'
import LoadingPopup from '@/components/LoadingPopup';
import { formatTrim, objHasOwnProperty } from '@/utils/str';
import { generateEncryptPrivateKeyByPublicKey, generateEncryptPswByPublicKey, generateCR1ByPublicKey } from '@/utils/relayUtils'
import web3 from 'web3'
import {  isLogin } from '@/utils/dashBoardTools'

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
    'v-inputPsw': InputPswModal,
    'v-loadingPopup': LoadingPopup,
  },
  data() {
    return {
      activeCreateWalletType: 'import', // create | import
      createType: 'mnemonic', // mnemonic || privateKey
      importType: 'mnemonic', // mnemonic || privateKey
      showCreateTypePopup: false,
      typeList: [{ key: 'mnemonic', text: 'Mnemonic'}, { key: 'privatekey', text: 'privatekey' }],
      selectType: 'mnemonic',
      showThirdLoginTip: false,
      createTypeDisabled: false,
      importTypeDisabled: false,
      nameErrorMsg: '',

      backupName: '',
      backupComment: '',
      backupNameForImport: '',
      backupCommentForImport: '',
      
      showLoading: false,

      // ***************** inputPsw start ***************** //
      userPsw: '',
      publicKey: '',
      aesKey: '', // every decrypt has the same aesKey
      encryptPsw: '',
      encryptPrivateKeyPublicKey: '',
      encryptCr1: '',
      confirmPswBtnLoading: false,
      showInputPswModal: false,
      // ***************** inputPsw end ***************** //
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
    // onConfirmSelectType(val) {
    //   console.log(val, this.activeCreateWalletType)
    //   this.activeCreateWalletType === 'create' && (this.createType = val['key']);
    //   this.activeCreateWalletType === 'import' && (this.importType = val['key']);
    //   this.showCreateTypePopup = false;
    // },
    onConfirmSelectType(val){
      console.log(val)
      this.activeCreateWalletType === 'create' && (this.createType = val);
      this.activeCreateWalletType === 'import' && (this.importType = val);
    },
    handleNotLogin() {
      this.showThirdLoginTip = true
    },
    closeThirdLoginTip(info) {
      this.showThirdLoginTip = info.show
    },
    async hanldeCreateComplete(val, type) {
      if (!this.encryptPsw) {
        this.showInputPswModal = true
        return
      }
      this.showLoading = true

      console.log(val, type)
      let wallet;
      let address;
      let privateKey
      if (type === 'privatekey') {
        wallet = new ethers.Wallet(val);
        address = wallet.address
        privateKey = val
      } else {
        wallet = ethers.Wallet.fromMnemonic(val);
        privateKey = wallet.privateKey
        address = wallet.address
      }
      const userId = getInfoFromStorageByKey('gUID')
      
      /* const { hasError: encryptError, data: encryptPrivateKey } = await this.$store.dispatch('EncryptPrivateKey', { userId, privateKey }) 
      if (encryptError) {
        console.log('EncrpytKey Failed')
        Toast('Import Failed')
        return
      } */
      const encryptPrivateKeyPublicKey = generateEncryptPrivateKeyByPublicKey(this.publicKey, privateKey)
      this.encryptPrivateKeyPublicKey = encryptPrivateKeyPublicKey;
      // console.log('encryptPrivateKeyPublicKey', encryptPrivateKeyPublicKey)
      let userpswHex = web3.utils.toHex(this.userPsw)
      const { hasError: encryptError, data: encryptPrivateKey, error: errorMsg } = await this.$store.dispatch('EncryptPrivateKeyByEcies', { userId, c1: this.encryptPrivateKeyPublicKey, cc1: this.encryptPsw, hash: ethers.utils.sha256(userpswHex) }) 
      if (encryptError) {
        this.showLoading = false
        if (errorMsg) {
          Toast(errorMsg, 5)
        } else {
          Toast('EncrpytKey Failed', 5)
        }
        return
      }
      const { hasError } = await this.$store.dispatch('UploadEncrpytKeyByAddress', { userId, address, encryptKey: encryptPrivateKey })
      if (hasError) {
        console.log('Upload EncrpytKey Failed')
        Toast('Import Failed', 5)
        return
      }
      const { data } = await this.$store.dispatch('GetBindingGoogleUserInfo', { userId })
      // if (!data) {
        await this.$store.dispatch('StoreBindingGoogleUserInfo', { userId, encryptPrivateKey, address })
        await this.$store.dispatch('SaveDecryptPrivateKeyInStore', { userId, address, encryptKey: encryptPrivateKey, privateKey })
      // }
      await this.$store.dispatch('StoreBindingGoogleUserInfoList', { userId, encryptPrivateKey, address })
      this.$eventBus.$emit('BindingUserInfoAferThirdLogin', { thirdUserId: userId });
      this.showLoading = false
      Toast('Import Account Successfully', 5)
      this.userPsw = '';
      this.$eventBus.$emit('importedAccountByPassword')
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
    // input password modal confirm callback
    async confirmPswOk({ show, psw }) {
      this.userPsw = psw; // password of user input for encrypt privateKey
      this.confirmPswBtnLoading = true
      const { hasError, data: publicKey} = await this.$store.dispatch('GetAllPublicKey')
      if (hasError||!publicKey) {
        Toast('Get PublickKey fasiled! Retry')
        this.confirmPswBtnLoading = false
        return
      }
      this.publicKey = publicKey;
      // console.log(`GetPublicKey result is: ${publicKey}`)
      
      const encryptPsw = generateEncryptPswByPublicKey(publicKey, psw); // generate cc1
      const { cr1: encryptCr1, aesKey } = generateCR1ByPublicKey(this.publicKey); // generate cr1
      this.aesKey = aesKey
      this.encryptPsw = encryptPsw
      this.encryptCr1 = encryptCr1
      // console.log(`encryptPsw: ${encryptPsw}, \n encryptCr1: ${encryptCr1}`)
      this.confirmPswBtnLoading = false
      this.showInputPswModal = false;
    },
  },
  created() {
  },
  mounted() {
    if (!isLogin()) {
      Toast('Please Login')
      return
    }
    // this.handlesInputFocus()
    this.showInputPswModal = true;
  },
}
</script>
<style lang="scss" scoped>
  @import 'index';
</style>
