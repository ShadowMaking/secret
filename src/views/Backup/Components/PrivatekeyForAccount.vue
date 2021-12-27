<template>
  <div class="type-privatekey-compo">
    <div v-if="type==='import' && showImport" class="import-opt-area">
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
    </div>
    <div v-else>
      <van-steps :active="activeStepForPrivateKey">
        <van-step>Generate</van-step>
        <van-step>2FA</van-step>
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
      <!-- 2FA -->
      <div v-show="activeStepForPrivateKey===1">
        <v-2FA
          key="privatekey-2FAconfirm"
          :showQRCode="true"
          :showSeetingTip="false"
          :showComplete="true"
          @childEvent="privateKey2FAConfirmCallback" />
      </div>
      <!-- Complete -->
      <div v-show="activeStepForPrivateKey===2">
        <v-complete
          key="privatekey-confirm-complete"
          @childEvent="completeCallback" />
      </div>
    </div>
  </div>
</template>
<script>
import Vue from 'vue';
import { Icon, Tab, Tabs, Step, Steps, Field, Form, Dialog, Popup, Picker, Toast } from 'vant';
import { saveToStorage, getFromStorage } from '@/utils/storage';
import Menonic2FAConfirm from '@/components/SocialRecovery/Menonic2FAConfirm'
import MenonicConfirmComplete from '@/components/SocialRecovery/MenonicConfirmComplete'
import _ from 'lodash'
import { SecLevelEnum, generate_mnemonic, generate_key, split } from '@/utils/secretshare'
import { copyTxt } from '@/utils/index';

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
      activeStepForMnemonic: 0, // 0-Generate 1-Confirm 2-2FA 3-Complete
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
      showImport: this.type==='import'
    }
  },
  components: {
    'v-2FA': Menonic2FAConfirm,
    'v-complete': MenonicConfirmComplete,
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
      this.$emit('createComplete', {});
      this.activeStepForPrivateKey = 1
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
      let copyStr;
      type === 'import' && this.importPrivatekey && (copyStr = this.importPrivatekey)
      type === 'create' && this.privateKey && (copyStr = this.privateKey)
      if (copyStr) {
        copyTxt(this.privateKey)
        Toast('Copied')
      }
    },
   },
  mounted() {
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
