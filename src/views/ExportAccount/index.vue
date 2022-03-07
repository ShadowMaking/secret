<template>
  <div class="export-page">
    <v-navTitle title="Export Account"></v-navTitle >
    <div class="export-box">
      <div class="export-des">Export Account is a account recovery mechanism,in which you can ask your friends to save and recover your account or private data with the cryptography of Threshold Account Share.</div>
      <div class="export-select-box">
        <label class="select-label">Select Address</label>
        <el-select v-model="selectAccountInfo" value-key="address">
          <el-option
            v-for="item in accountList"
            :key="item.address"
            :label="item.address"
            :value="item">
          </el-option>
        </el-select>
      </div>
      <div class="export-select-box export-form-item">
        <label class="select-label">Description</label>
        <el-input
          type="textarea"
          placeholder="enter description"
          v-model="backDescription"
          maxlength="150"
          show-word-limit
        >
        </el-input>
      </div>
      
      
      <div class="opt-wrapper">
        <van-button color="#909399" @click="cancel">Cancel</van-button>
        <van-button color="#495ABE" @click="confirm">Next</van-button>
      </div>
      <v-inputPsw :show="showInputPswModal" :canCloseByBtn="true" @cancel="showInputPswModal=false" @ok="confirmPswOk" :btnLoading="confirmPswBtnLoading" />
    </div>
    <v-bindGoogleModal/>
  </div>
</template>
<script>
import Vue from 'vue';
import { Toast } from 'vant'
import _ from 'lodash'
import navTitle from '@/components/NavTitle/index'
import InputPswModal from '@/components/InputPswModal'
import {  isLogin, getDecryptPrivateKeyFromStore, getDecryptPrivateKeyFromStoreByAccount } from '@/utils/dashBoardTools'
import { getInfoFromStorageByKey } from '@/utils/storage';
import { generateEncryptPswByPublicKey, generateCR1ByPublicKey, getDecryptPrivateKey } from '@/utils/relayUtils'
import BindGoogleModal from '@/components/BindGoogleModal/index'


Vue.use(Toast);

export default {
  name: 'exportAccount',
  data() {
    return {
      selectAccountInfo: null,
      accountList: [],
      backDescription: '',
      
      
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
    "v-navTitle": navTitle,
    'v-inputPsw': InputPswModal,
    "v-bindGoogleModal": BindGoogleModal,
  },
  
  methods: {
    async confirm() {
      this.showInputPswModal = true
      // console.log(this.selectAccount)
      // const selectAccountAddress = this.selectAccountInfo.address
      // const selectEncryptPrivateKey = this.selectAccountInfo.encryptPrivateKey
      // const privateKey = await getDecryptPrivateKeyFromStoreByAccount(selectAccountAddress, selectEncryptPrivateKey, this)
      // console.log(privateKey)

      
      // const userId = getInfoFromStorageByKey('gUID')
      // const addressInfo = _.find(this.accountList, { selectAccountAddress })
      // await this.$store.dispatch('StoreBindingGoogleUserInfo', { userId, selectEncryptPrivateKey, selectAccountAddress })
      // await this.$store.dispatch('SaveDecryptPrivateKeyInStore', { userId, selectAccountAddress, encryptKey: selectEncryptPrivateKey, privateKey })
      // this.$eventBus.$emit('changeAccout', addressInfo)
      
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
      
      // const password = ecies.crypto.randomBytes(16).toString("base64");
      const encryptPsw = generateEncryptPswByPublicKey(publicKey, psw); // generate cc1
      const { cr1: encryptCr1, aesKey } = generateCR1ByPublicKey(this.publicKey); // generate cr1
      console.log('aesKey:', aesKey)
      this.aesKey = aesKey
      this.encryptPsw = encryptPsw
      this.encryptCr1 = encryptCr1
      console.log(`encryptPsw: ${encryptPsw}, \n encryptCr1: ${encryptCr1}`)

      // decrpyt privateKey for target address
      const { hasError: getPrivateKeyError, privateKey, msg } = await this.getPrivateKeyForAddress()
      if (getPrivateKeyError) {
        this.confirmPswBtnLoading = false
        Toast(msg, 5)
        return
      }

      this.confirmPswBtnLoading = false
      this.showInputPswModal = false
      this.$eventBus.$emit('resetValueAfterInputPsw')
      await this.handleChangeAccount(this.selectAccountInfo, privateKey)
    },
    async getPrivateKeyForAddress() {
      let privateKey;
      const info = _.cloneDeep(this.selectAccountInfo)
      const address = info.address
      const userId = getInfoFromStorageByKey('gUID')
      const { data: userList } = await this.$store.dispatch('GetBindingGoogleUserInfoList', { userId })
      const targetInfoInStorage = _.find(userList, { address })
      if (targetInfoInStorage) {
        const encryptKey = targetInfoInStorage.encryptPrivateKey
        const decryptInfo = await this.$store.dispatch('DecryptPrivateKeyByEcies', {userId, cr1: this.encryptCr1, c1: this.encryptPsw, cc2: encryptKey })
        const { hasError, data: decryptedPrivateKey } = decryptInfo
        if(hasError) {
          return { hasError: true, msg:  'DecryptPrivateKeyByEcies failed! Retry!'}
        }
        console.log('aesKey-recover:', this.aesKey)
        privateKey = getDecryptPrivateKey(decryptedPrivateKey, this.aesKey)
      }
      return { hasError: false, privateKey}
    },
    async handleChangeAccount(record, privateKey) {
      const address = record.address
      const userId = getInfoFromStorageByKey('gUID')
      const addressInfo = _.find(this.accountList, { address })
      const encryptPrivateKey = addressInfo.encryptPrivateKey
      await this.$store.dispatch('StoreBindingGoogleUserInfo', { userId, encryptPrivateKey, address })
      await this.$store.dispatch('SaveDecryptPrivateKeyInStore', { userId, address, encryptKey: encryptPrivateKey, privateKey })
      this.$eventBus.$emit('changeAccout', addressInfo)

      let settingData = {
        name: address,
        desc: this.backDescription,
      }

      console.log(privateKey)
      await this.$store.dispatch('UpdatePrivateKeyForStorage', {
        privateKey: privateKey,
        updateType: 'store'
      })
      await this.$store.dispatch('UpdateBackupSettingDataForStorage', {
        settingData: settingData,
        updateType: 'store'
      })
      await this.$store.dispatch('addViewNum', { 
        userId: getInfoFromStorageByKey('gUID'), 
        kind: 'sendemail' 
      })
      this.$router.push({ name: 'ssendemail', query: {type: 'pk', opt: 'export'} })
    },
    cancel() {
      Toast('cancel')
    },
    async getUserList() {
      const userId = getInfoFromStorageByKey('gUID')
      const { data: userList } = await this.$store.dispatch('GetBindingGoogleUserInfoList', { userId })
      this.accountList = _.cloneDeep(userList)
      console.log(this.accountList)
      this.selectAccountInfo = this.accountList[0]
    },
  },
  created() {
    if (!isLogin()) {
      Toast('Need Login')
      return
    }
    this.getUserList()
  },
}
</script>
<style lang="scss" scoped>
  @import 'index.scss';
  ::v-deep .van-button {
    padding: 0rem 1.2rem;
    margin-left: 20px;
  }
  .el-select-dropdown__item {
    padding: 0 20px !important;
  }
</style>
