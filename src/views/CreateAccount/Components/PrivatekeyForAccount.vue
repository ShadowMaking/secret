<template>
  <div class="type-privatekey-compo">
    <!-- <div v-if="type==='import' && showImport" class="import-opt-area">
      <div class="flex flex-center import-mnemonic-wrapper">
        <div class="import-wrapper-inner" @click="copyPrivateKey('import')">
          <van-field
            v-model="importPrivatekey"
            rows="2"
            autosize
            label=""
            type="textarea"
            :disabled="false"
            placeholder="enter the privatekey"
            @input="handleInputChange"
            @focus="handlesnputFocus"
          />
        </div>
      </div>
      <div class="opt-wrapper">
        <van-button block color="#495ABE" @click="confirmImportPrivatekey" :disabled="!importPrivatekey">Next</van-button>
      </div>
    </div> -->
    <div>
      <van-steps :active="activeStepForPrivateKey">
        <van-step>Generate</van-step>
        <!-- <van-step>2FA</van-step> -->
        <van-step>Send Email</van-step>
      </van-steps>
      <!-- Generate -->
      <div v-show="activeStepForPrivateKey===0">
        <div class="flex flex-content-between" v-if="type!=='import'">
          <span></span>
          <van-button color="#495ABE" plain @click="update" size="small" class="update-privatekey">update</van-button>
        </div>
        <div class="privatekey-input" @click="copyPrivateKey('create')">
          <van-field
            v-model="privateKey"
            rows="2"
            autosize
            label=""
            :readonly="true"
            type="textarea"
          />
        </div>
        <div class="opt-wrapper">
          <van-button
            type="info"
            block
            color="#495ABE"
            :disabled="!privateKey"
            @click="privateKeyCreateNext">Next</van-button>
        </div>
      </div>
      <v-createResult
      v-show="activeStepForPrivateKey===1"
      @childEvent="completeCallback">
      </v-createResult>
      <!-- 2FA -->
      <!-- <div v-show="activeStepForPrivateKey===1">
        <v-2FA
          key="privatekey-2FAconfirm"
          :showQRCode="true"
          :showSeetingTip="false"
          :showComplete="true"
          @childEvent="privateKey2FAConfirmCallback" />
      </div> -->
      <!-- Complete -->
      <!-- <div v-show="activeStepForPrivateKey===2">
        <v-complete
          key="privatekey-confirm-complete"
          @childEvent="completeCallback" />
      </div> -->
    </div>
    <v-inputPsw :show="showInputPswModal" :canCloseByBtn="true" @cancel="showInputPswModal=false" @ok="confirmPswOk" :btnLoading="confirmPswBtnLoading" />
    <v-loadingPopup :show="showLoading" :showSpinner="false" />
  </div>
</template>
<script>
import Vue from 'vue';
import { ethers } from 'ethers'
import { Icon, Tab, Tabs, Step, Steps, Field, Form, Dialog, Popup, Picker, Toast } from 'vant';
import { saveToStorage, getFromStorage, getInfoFromStorageByKey } from '@/utils/storage';
// import Menonic2FAConfirm from '@/components/SocialRecovery/Menonic2FAConfirm'
// import MenonicConfirmComplete from '@/components/SocialRecovery/MenonicConfirmComplete'
import InputPswModal from '@/components/InputPswModal'
import LoadingPopup from '@/components/LoadingPopup'
import CreateResult from './CreateResult'
import _ from 'lodash'
import { SecLevelEnum, generate_mnemonic, generate_key, split, isValidPrivateKey } from '@/utils/secretshare'
import { copyTxt } from '@/utils/index';
import { generateEncryptPrivateKeyByPublicKey, generateEncryptPswByPublicKey, generateCR1ByPublicKey } from '@/utils/relayUtils'

Vue.use(Icon);
Vue.use(Tab);
Vue.use(Tabs);
Vue.use(Step);
Vue.use(Steps);
Vue.use(Field);
Vue.use(Form);
Vue.use(Dialog);
Vue.use(Popup);
Vue.use(Picker);
Vue.use(Toast);

export default {
  name: 'PrivatekeyForAccount',
  props: {
    type: {
      type: String,
      default: 'create', // create || import
    },
    settingData: {
      type: Object,
      default: null, // {name:'',desc:''}
    },
    need2FA: {
      type: Boolean,
      default: true
    },
  },
  data() {
    return{
      activeCreateWalletType: 'create', // create | import
      activeStepForPrivateKey: 0, // 0-Generate 1-2FA 2-Complete
      // mnemonic: '',
      strength: SecLevelEnum.WEAK,
      showWalletTip: false,
      privateKey: '',
      createType: 'mnemonic', // mnemonic || privateKey
      showCreateTypePopup: false,
      typeList: [{ key: 'mnemonic', text: 'Mnemonic'}, { key: 'privateKey', text: 'privateKey' }],
      /* for import */
      importPrivatekey: '',
      showImport: this.type==='import',
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
  components: {
    // 'v-2FA': Menonic2FAConfirm,
    // 'v-complete': MenonicConfirmComplete,
    'v-createResult': CreateResult,
    'v-inputPsw': InputPswModal,
    'v-loadingPopup': LoadingPopup,
  },
  computed: {
    walletIsLock() {
      return this.$store.state.metamask.walletIsLock;
    },
    thirdUserId() {
     return getFromStorage('gUID')
    },
  },
  methods: {
    privateKeyCreateNext() {
      if (!this.thirdUserId) {
        this.$emit('notLogin');
        return
      }
      if (!this.hasBackupSettingData()) {
        Toast('Name is Required!')
        return
      }
      this.showInputPswModal = true
      this.$emit('createComplete', {});
      // this.activeStepForPrivateKey = 1
    },
    generatePrivatekey() {
      if (!this.thirdUserId) { return }
      return generate_key()
    },
    privateKey2FAConfirmCallback() {
      this.completeCallback()
      // this.activeStepForPrivateKey= 2;
    },
    async completeCallback() {
      if (!this.thirdUserId) {
        console.log('can detect userID after third login') 
        return
      }
      await this.$store.dispatch('UpdatePrivateKeyForStorage', {
        privateKey: this.privateKey,
        updateType: 'store'
      })
      await this.$store.dispatch('UpdateBackupSettingDataForStorage', {
        settingData: this.settingData,
        updateType: 'store'
      })
      await this.$store.dispatch('addViewNum', { 
        userId: this.thirdUserId, 
        kind: 'sendemail' 
      })
      //backview use
      saveToStorage({ 'viewSecretType': ('privateKey-'+ this.type) })
      // this.type == 'import' ? (saveToStorage({ 'importPrivateKey': this.privateKey })) : (saveToStorage({ 'createPrivateKey': this.privateKey }))
      this.getAllMyFriendsList();
    },
    async getAllMyFriendsList() {
      const userId = this.thirdUserId;
      if (!userId) {
        console.log('can detect userID after third login') 
        return
      }
      const { hasError, list, error } = await this.$store.dispatch('GetMyFriendsList', {userId,status: 1});
      if (!hasError) {
        if (list.length < 2) {
          this.$router.push({ name: 'addfriends', query: {type: 'pk'} })
        } else {
          this.$router.push({ name: 'ssendemail', query: {type: 'pk'} })
        }
      }
    },
    handleInputChange(value) {
      console.log(value)
    },
    handlesnputFocus() {},
    confirmImportPrivatekey() {
      if (!isValidPrivateKey(this.importPrivatekey)) {
        Toast('Invalid PrivateKey')
        return
      }
      if (!this.need2FA) {
        this.$emit('createComplete', this.importPrivatekey.trim(), 'privateKey');
        return
      }
      if (!this.thirdUserId) {
        this.$emit('notLogin');
        return
      }
      if (!this.hasBackupSettingData()) {
        Toast('Name is Required!')
        return
      }
      this.$emit('createComplete', {});
      const pvkStr = this.importPrivatekey
      this.privateKey = pvkStr.trim()
      this.showImport = false
    },
    hasBackupSettingData() {
      return !(!this.settingData || this.settingData && !this.settingData.name)
    },
    update() {
      const privateKey = this.generatePrivatekey()
      this.privateKey = privateKey
    },
    copyPrivateKey(type) {
      if (!this.need2FA) { return }
      let copyStr;
      type === 'import' && this.importPrivatekey && (copyStr = this.importPrivatekey)
      type === 'create' && this.privateKey && (copyStr = this.privateKey)
      if (copyStr) {
        copyTxt(this.privateKey)
        Toast('Copied')
      }
    },
    _handleImportedAccountByPassword() {
      this.importPrivatekey = ''
    },
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
      console.log(`GetPublicKey result is: ${publicKey}`)
      
      const encryptPsw = generateEncryptPswByPublicKey(publicKey, psw); // generate cc1
      const { cr1: encryptCr1, aesKey } = generateCR1ByPublicKey(this.publicKey); // generate cr1
      this.aesKey = aesKey
      this.encryptPsw = encryptPsw
      this.encryptCr1 = encryptCr1
      console.log(`encryptPsw: ${encryptPsw}, \n encryptCr1: ${encryptCr1}`)
      this.confirmPswBtnLoading = false
      this.showInputPswModal = false;

      this.createAccountSubmit()
    },
    async createAccountSubmit() {
      if (!this.encryptPsw) {
        this.showInputPswModal = true
        return
      }
      this.showLoading = true

      let wallet;
      let address;
      let privateKey
      console.log(this.privateKey)
      wallet = new ethers.Wallet(this.privateKey);
      address = wallet.address
      privateKey = this.privateKey
      const userId = getInfoFromStorageByKey('gUID')
      
      const encryptPrivateKeyPublicKey = generateEncryptPrivateKeyByPublicKey(this.publicKey, privateKey)
      this.encryptPrivateKeyPublicKey = encryptPrivateKeyPublicKey;
      console.log('encryptPrivateKeyPublicKey', encryptPrivateKeyPublicKey)
      
      const { hasError: encryptError, data: encryptPrivateKey } = await this.$store.dispatch('EncryptPrivateKeyByEcies', { userId, c1: this.encryptPrivateKeyPublicKey, cc1: this.encryptPsw }) 
      if (encryptError) {
        Toast('EncrpytKey Failed', 5)
        return
      }
      const { hasError } = await this.$store.dispatch('UploadEncrpytKeyByAddress', { userId, address, encryptKey: encryptPrivateKey })
      if (hasError) {
        console.log('Upload EncrpytKey Failed')
        Toast('Create Failed', 5)
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
      // Toast('Create Account Successfully', 5)
      this.userPsw = '';
      this.activeStepForPrivateKey = 1;
    },
   },
  mounted() {
    this.$eventBus.$on('importedAccountByPassword', this._handleImportedAccountByPassword)
    if (this.type === 'create') {
      let privateKey = this.generatePrivatekey()
      this.privateKey = privateKey
    }
    if (getFromStorage('settingdata') && getFromStorage('viewSecretType')) {
      let viewSecretType = getFromStorage('viewSecretType').split('-');
      let viewSecretValue = viewSecretType[0];
      let viewSecretTab = viewSecretType[1];
      if (viewSecretValue == 'privateKey' && viewSecretTab == 'create') {
        this.privateKey = getFromStorage('privateKey')
      }
      if (viewSecretValue == 'privateKey' && viewSecretTab == 'import') {
        // import accout to create wallet for user directly do not set value from storage of backupdata
        if (!this.need2FA) { return }
        this.importPrivatekey = getFromStorage('privateKey')
      }
    }
  },
}
</script>
<style lang="scss" scoped>
  @import 'index';
</style>
