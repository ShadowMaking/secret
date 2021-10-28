<template>
  <div class="type-privatekey-compo">
    <div v-if="type==='import' && showImport" class="import-opt-area">
      <div class="flex flex-center import-mnemonic-wrapper">
        <div class="import-wrapper-inner">
          <van-field
            v-model="importPrivatekey"
            rows="2"
            autosize
            label=""
            type="textarea"
            :disabled="false"
            placeholder="输入私钥"
            @input="handleInputChange"
            @focus="handlesnputFocus"
          />
        </div>
      </div>
      <div class="opt-wrapper">
        <van-button block color="#495ABE" @click="confirmImportPrivatekey" :disabled="!importPrivatekey">Confirm</van-button>
      </div>
    </div>
    <div v-else>
    <van-steps :active="activeStepForPrivateKey">
      <van-step>Generate</van-step>
      <van-step>2FA</van-step>
      <van-step>Complete</van-step>
    </van-steps>
    <!-- Generate -->
    <div v-show="activeStepForPrivateKey===0">
      <div class="privatekey-input">
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
    }
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
      this.activeStepForPrivateKey = 1
    },
    generatePrivatekey() {
      if (!this.thirdUserId) { return }
      return generate_key()
    },
    privateKey2FAConfirmCallback() {
      this.activeStepForPrivateKey= 2;
    },
    async completeCallback() {
      await this.$store.dispatch('UpdatePrivateKeyForStorage', {
        privateKey: this.privateKey,
        updateType: 'store'
      })
      this.$router.push({ name: 'ssendemail', query: {type: 'pk'} })
    },
    handleInputChange(value) {
      console.log(value)
    },
    handlesnputFocus() {},
    confirmImportPrivatekey() {
      if (!this.thirdUserId) {
        this.$emit('notLogin');
        return
      }
      const pvkStr = this.importPrivatekey
      this.privateKey = pvkStr.trim()
      this.showImport = false
    },
  },
  mounted() {
    if (this.type === 'create') {
      const privateKey = this.generatePrivatekey()
      this.privateKey = privateKey
    }
  },
}
</script>
<style lang="scss" scoped>
  @import 'index';
</style>
