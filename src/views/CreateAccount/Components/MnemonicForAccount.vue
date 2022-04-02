<template>
  <div class="type-mnemonic-compo">
    <!-- <div v-if="type==='import' && showImport" class="import-opt-area">
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
    </div> -->
    <div>
    <van-steps :active="activeStepForMnemonic">
      <van-step>Generate</van-step>
      <!-- <van-step>Confirm</van-step> -->
      <!-- <van-step>2FA</van-step> -->
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
      
      <!-- complete -->
      <v-createResult
      v-show="activeStepForMnemonic===1"
      @childEvent="completeCallback">
      </v-createResult>
      <!-- <v-complete
        key="menonic-confirm-complete"
        v-show="activeStepForMnemonic===0"
        @childEvent="completeCallback" /> -->
    </div>
    </div>
    <v-loadingPopup :show="showLoading" :showSpinner="false" />
    <v-inputPsw :show="showInputPswModal" :canCloseByBtn="true" @cancel="showInputPswModal=false" @ok="confirmPswOk" :btnLoading="confirmPswBtnLoading" />
  </div>
</template>
<script>
import Vue from 'vue';
import _ from 'lodash'
import { ethers } from 'ethers'
import { Tab, Tabs, Field, Toast } from 'vant';
import { saveToStorage, getFromStorage, getInfoFromStorageByKey } from '@/utils/storage';
import MenonicGenerate from '@/components/SocialRecovery/MenonicGenerate'
// import MenonicBackup from '@/components/SocialRecovery/MenonicBackup'
import MenonicConfirmComplete from '@/components/SocialRecovery/MenonicConfirmComplete'
import InputPswModal from '@/components/InputPswModal'
import LoadingPopup from '@/components/LoadingPopup'
import CreateResult from './CreateResult'
import { SecLevelEnum, generate_mnemonic, generate_key, split, isValidMenmonic } from '@/utils/secretshare'
import { copyTxt } from '@/utils/index';
import { generateEncryptPrivateKeyByPublicKey, generateEncryptPswByPublicKey, generateCR1ByPublicKey } from '@/utils/relayUtils'
import web3 from 'web3'

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
    // 'v-complete': MenonicConfirmComplete,
    'v-inputPsw': InputPswModal,
    'v-loadingPopup': LoadingPopup,
    'v-createResult': CreateResult,
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

      showLoading: false,
      creatAccount: '',

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
      // if (!this.hasBackupSettingData()) {
      //   Toast('Name is Required!')
      //   return
      // }
      this.showInputPswModal = true
      this.$emit('createComplete', {});
      // this.conformList = _.cloneDeep(this.mnemonic);
      // this.activeStepForMnemonic = 1;
    },
    menonicConfirmCallback() {
      this.activeStepForMnemonic = 2;
    },
    async completeCallback() {
      this.settingData = { ...this.settingData, name: this.creatAccount }
      
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
      if (!isValidMenmonic(this.importMnemonic)) {
        Toast('Invalid Mnemonic')
        return
      }
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
      if (!this.need2FA) { return }
      const mnemonicStr = this.importMnemonic
      if (mnemonicStr) {
        copyTxt(mnemonicStr)
        Toast('Copied')
      }
    },
    _handleImportedAccountByPassword() {
      this.importMnemonic = ''
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
      // console.log(`GetPublicKey result is: ${publicKey}`)
      
      const encryptPsw = generateEncryptPswByPublicKey(publicKey, psw); // generate cc1
      const { cr1: encryptCr1, aesKey } = generateCR1ByPublicKey(this.publicKey); // generate cr1
      this.aesKey = aesKey
      this.encryptPsw = encryptPsw
      this.encryptCr1 = encryptCr1
      // console.log(`encryptPsw: ${encryptPsw}, \n encryptCr1: ${encryptCr1}`)
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
      wallet = ethers.Wallet.fromMnemonic(this.mnemonic);
      privateKey = wallet.privateKey
      address = wallet.address
      this.creatAccount = address
      const userId = getInfoFromStorageByKey('gUID')
      
      const encryptPrivateKeyPublicKey = generateEncryptPrivateKeyByPublicKey(this.publicKey, privateKey)
      this.encryptPrivateKeyPublicKey = encryptPrivateKeyPublicKey;
      console.log('encryptPrivateKeyPublicKey', encryptPrivateKeyPublicKey)
      let userpswHex = web3.utils.toHex(this.userPsw)
      console.log(ethers.utils.sha256(userpswHex))
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
        this.showLoading = false
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
      this.activeStepForMnemonic = 1;
    },
  },
  mounted() {
    this.$eventBus.$on('importedAccountByPassword', this._handleImportedAccountByPassword)
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
