<template>
  <div class="type-mnemonic-compo">
    <div v-if="type==='import' && showImport" class="import-opt-area">
      <div class="flex flex-center import-mnemonic-wrapper">
        <div class="import-wrapper-inner" @click="copyMnemonic">
          <van-field
            v-model="importMnemonic"
            rows="2"
            autosize
            label=""
            type="textarea"
            :disabled="false"
            placeholder="enter the mnemonic，leave a blank space"
            @input="handleInputChange"
            @focus="handlesnputFocus"
          />
        </div>
      </div>
      <div class="opt-wrapper">
        <van-button block color="#495ABE" @click="confirmImportMnemonic" :disabled="!importMnemonic">Next</van-button>
      </div>
    </div>
    <div v-else>
    <van-steps :active="activeStepForMnemonic">
      <van-step>Generate</van-step>
      <!-- <van-step>Confirm</van-step> -->
      <van-step>2FA</van-step>
      <van-step>Send Email</van-step>
    </van-steps>
    <div>
      <!-- generate mnemonic -->
      <v-menonicGenerate
        key="menonic-create"
        :type="type"
        :sourceData="mnemonicList"
        @updateMnemonic="updateMnemonic"
        @childEventConfirm="menonicbackupConfirmCallback"
        v-show="activeStepForMnemonic===0" />
      <!-- confirm mnemonic -->
      <!-- <v-menonicConfirm
        key="menonic-confirm"
        v-show="activeStepForMnemonic===1"
        :sourceData="conformList"
        @childEvent="menonicConfirmCallback" /> -->
      <!-- 2FA -->
      <v-2FA
        key="menonic-2FAconfirm"
        :showQRCode="true"
        :showSeetingTip="false"
        :showComplete="true"
        v-show="activeStepForMnemonic===1"
        @childEvent="menonic2FAConfirmCallback" />
      <!-- complete -->
      <v-complete
        key="menonic-confirm-complete"
        v-show="activeStepForMnemonic===2"
        @childEvent="completeCallback" />
    </div>
    </div>
  </div>
</template>
<script>
import Vue from 'vue';
import _ from 'lodash'
import { Tab, Tabs, Field, Toast } from 'vant';
import { saveToStorage, getFromStorage } from '@/utils/storage';
import MenonicGenerate from '@/components/SocialRecovery/MenonicGenerate'
// import MenonicBackup from '@/components/SocialRecovery/MenonicBackup'
import Menonic2FAConfirm from '@/components/SocialRecovery/Menonic2FAConfirm'
import MenonicConfirmComplete from '@/components/SocialRecovery/MenonicConfirmComplete'
import { SecLevelEnum, generate_mnemonic, generate_key, split } from '@/utils/secretshare'
import { copyTxt } from '@/utils/index';

Vue.use(Tab);
Vue.use(Tabs);
Vue.use(Field);

export default {
  name: 'MnemonicForAccount',
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
  components: {
    'v-menonicGenerate': MenonicGenerate,
    // 'v-menonicConfirm': MenonicBackup,
    'v-2FA': Menonic2FAConfirm,
    'v-complete': MenonicConfirmComplete,
  },
  data() {
    return{
      self: this,
      activeCreateWalletType: 'create', // create | import
      activeStepForMnemonic: 0, // 0-Generate 1-Confirm 2-2FA 3-Complete
      mnemonic: '',
      strength: SecLevelEnum.WEAK,
      showWalletTip: false,
      privateKey: '',
      createType: 'mnemonic', // mnemonic || privateKey
      showCreateTypePopup: false,
      typeList: [{ key: 'mnemonic', text: 'Mnemonic'}, { key: 'privateKey', text: 'privateKey' }],
      /* for import */
      importMnemonic: '',
      showImport: this.type==='import',
    }
  },
  computed: {
    mnemonicList() {
      return this.mnemonic && this.mnemonic.split(' ')||[];
      // return 'message cream element broken shoulder alert input improve kick banner sing fork'.split(' ')
    },
    conformList() {
      const list = this.mnemonic && this.mnemonic.split(' ') || []
      return this.mnemonic && this.mnemonic.split(' ')||[];
    },
    thirdUserId() {
     return getFromStorage('gUID')
    },
  },
  methods: {
    generateMnemonic() {
      if (!this.thirdUserId) { return }
      return generate_mnemonic(this.strength);
    },
    updateMnemonic() {
      const mnemonic = this.generateMnemonic();
      this.mnemonic = mnemonic
    },
    menonicbackupConfirmCallback() {
      if (!this.thirdUserId) {
        this.$emit('notLogin');
        return
      }
      if (!this.hasBackupSettingData()) {
        Toast('Name is Required!')
        return
      }
      this.$emit('createComplete', {});
      this.conformList = _.cloneDeep(this.mnemonic);
      this.activeStepForMnemonic = 1;
    },
    menonicConfirmCallback() {
      this.activeStepForMnemonic = 2;
    },
    menonic2FAConfirmCallback() {
      this.completeCallback()
      // this.activeStepForMnemonic = 2;
    },
    async completeCallback() {
      if (!this.thirdUserId) {
        console.log('can detect userID after third login') 
        return
      }
      await this.$store.dispatch('UpdateMnemonicForStorage', {
        mnemonic: this.mnemonic,
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
      saveToStorage({ 'viewSecretType': ('mnemonic-'+ this.type) })
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
          this.$router.push({ name: 'addfriends', query: {type: 'mn'} })
        } else {
          this.$router.push({ name: 'ssendemail', query: {type: 'mn'} })
        }
      }
    },
    handleInputChange(value) {
      console.log(value)
    },
    handlesnputFocus() {},
    confirmImportMnemonic() {
      if (!this.need2FA) {
        this.$emit('createComplete', this.importMnemonic.split(' ').filter(i=>!!i).join(' '), 'mnemonic');
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
      const mnStr = this.importMnemonic
      this.mnemonic = mnStr.split(' ').filter(i=>!!i).join(' ')
      this.showImport = false
    },
    hasBackupSettingData() {
      return !(!this.settingData || this.settingData && !this.settingData.name)
    },
    copyMnemonic() {
      const mnemonicStr = this.importMnemonic
      if (mnemonicStr) {
        copyTxt(mnemonicStr)
        Toast('Copied')
      }
    },
  },
  mounted() {
    if (this.type === 'create') {
      let mnemonic = this.generateMnemonic()
      this.mnemonic = mnemonic
    }
    if (getFromStorage('settingdata') && getFromStorage('viewSecretType')) {
      let viewSecretType = getFromStorage('viewSecretType').split('-');
      let viewSecretValue = viewSecretType[0];
      let viewSecretTab = viewSecretType[1];
      if (viewSecretValue == 'mnemonic' && viewSecretTab == 'create') {
        this.mnemonic = getFromStorage('mnemonic')
      }
      if (viewSecretValue == 'mnemonic' && viewSecretTab == 'import') {
        // import accout to create wallet for user directly do not set value from storage of backupdata
        if (!this.need2FA) { return }
        this.importMnemonic = getFromStorage('mnemonic')
      }
    }
  },
}
</script>
<style lang="scss" scoped>
  @import 'index';
</style>
