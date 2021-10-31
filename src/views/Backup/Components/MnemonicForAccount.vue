<template>
  <div class="type-mnemonic-compo">
    <div v-if="type==='import' && showImport" class="import-opt-area">
      <div class="flex flex-center import-mnemonic-wrapper">
        <div class="import-wrapper-inner">
          <van-field
            v-model="importMnemonic"
            rows="2"
            autosize
            label=""
            type="textarea"
            :disabled="false"
            placeholder="输入助记词，空格间隔"
            @input="handleInputChange"
            @focus="handlesnputFocus"
          />
        </div>
      </div>
      <div class="opt-wrapper">
        <van-button block color="#495ABE" @click="confirmImportMnemonic" :disabled="!importMnemonic">Confirm</van-button>
      </div>
    </div>
    <div v-else>
    <van-steps :active="activeStepForMnemonic">
      <van-step>Generate</van-step>
      <!-- <van-step>Confirm</van-step> -->
      <van-step>2FA</van-step>
      <van-step>SendEmail</van-step>
    </van-steps>
    <div>
      <!-- generate mnemonic -->
      <v-menonicGenerate
        key="menonic-create"
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
        Toast('请设置备份名称')
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
      await this.$store.dispatch('UpdateMnemonicForStorage', {
        mnemonic: this.mnemonic,
        updateType: 'store'
      })
      await this.$store.dispatch('UpdateBackupSettingDataForStorage', {
        settingData: this.settingData,
        updateType: 'store'
      })
      this.$router.push({ name: 'ssendemail', query: {type: 'mn'} })
    },
    handleInputChange(value) {
      console.log(value)
    },
    handlesnputFocus() {},
    confirmImportMnemonic() {
      if (!this.thirdUserId) {
        this.$emit('notLogin');
        return
      }
      if (!this.hasBackupSettingData()) {
        Toast('请设置备份名称')
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
  },
  mounted() {
    if (this.type === 'create') {
      const mnemonic = this.generateMnemonic();
      this.mnemonic = mnemonic
    }
  },
}
</script>
<style lang="scss" scoped>
  @import 'index';
</style>
