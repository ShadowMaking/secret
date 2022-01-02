<template>
  <div class="social-recovery-introduction-page">
    <div class="tip-wrapper secret">
      <div class="top">
        <h4>Social Recovery</h4>
        <a><router-link to="/backup?type=create">GO</router-link></a>
      </div>
      <span class="tip">Social Recovery is a secret recovery mechanism, allowing you to place your secret or private data in the custody of your friends by Cryptography Threshold Secret Share and multi-sig contract wallet on Layer 2. And the multi-sig wallet will be available in early December.
      </span>
      <span class="tip" style="color:red">Important: all your keys and shares are processed at your computer or device, Eigen team can't access them. </span>
      <span class="tip">Now you can:</span>
      <ul>
        <li>Create Secret: Generate your private key or key recovery phrases randomly, split and send the shares to your friends' email.</li>
        <li>Import Secret： Import your existing secret to create a recovery, split and share it to your friends' email.</li>
        <li>Recover Secret：Collect the shares from your friends, and recover your original secret.</li>
      </ul>
    </div>
    <!-- <div class="tip-wrapper bridge">
      <div class="top">
        <h4>Bridge</h4>
        <a><router-link to="/introduction">GO</router-link></a>
      </div>
      <span class="tip">Bridge realizes the function of asset transfer between L1 and L2.</span>
      <span class="tip">Now You can ：</span>
      <ul>
        <li>Deposit to L2：Transfer assets from the Layer1 wallet to the EigenSecret l2 wallet, or directly deposit through the Layer2 wallet.</li>
        <li>Send to L2：Used for asset transfer between EigenSectet Layer2 wallets, you will enjoy gas-free and real-time transfer.</li>
        <li>Withdraw to L1：Transfer assets from the EigenSecret l2 wallet to the Layer1 wallet.</li>
      </ul>
    </div> -->
    <v-inputPsw :show="showInputPswModal" @cancel="showInputPswModal=false" @ok="confirmPswOk" :btnLoading="confirmPswBtnLoading" />
  </div>
</template>
<script>
import Vue from 'vue';
import { Button, Toast } from 'vant';
import _ from 'lodash';
import web3 from 'web3'
import { ethers } from 'ethers'
import { getQueryString, getLocationParam } from '@/utils/index'
import InputPswModal from '@/components/InputPswModal'
// import * as ecies from "@/utils/ecies";
import { generateEncryptPrivateKeyByPublicKey, generateEncryptPswByPublicKey, generateCR1ByPublicKey, getDecryptPrivateKey } from '@/utils/relayUtils'

Vue.use(Button);

export default {
  name: "Introduction",
  computed: { },
  components: {
    'v-inputPsw': InputPswModal
  },
  data() {
    return {
      userPsw: '',
      publicKey: '',
      aesKey: '', // every decrypt has the same aesKey
      encryptPsw: '',
      encryptPrivateKeyPublicKey: '',
      encryptCr1: '',
      confirmPswBtnLoading: false,
      showInputPswModal: false,
    }
  },
  methods: {
    showLoading() {
      Toast.loading({
        duration: 0,
        message: 'loading...',
        forbidClick: true,
        loadingType: 'spinner',
      });
    },
    clearLoading() {
      Toast.clear()
    },
    /**
     * @description: 
     *  sep1: create new account(privateKey)
     *  step2: encrypt privateKey of new account
     *  step3: store in storage encryptKey and upload it to the endServer
     */
    async createAccountForThirdLoginUser() {
      const userId = getLocationParam('id')
      const accountWallet = ethers.Wallet.createRandom()
      const mnemonic = accountWallet.mnemonic.phrase
      const privateKey = accountWallet.privateKey
      const address = accountWallet.address

      const encryptPrivateKeyPublicKey = generateEncryptPrivateKeyByPublicKey(this.publicKey, privateKey)
      this.encryptPrivateKeyPublicKey = encryptPrivateKeyPublicKey;
      console.log('encryptPrivateKeyPublicKey', encryptPrivateKeyPublicKey)

      /* const { hasError: encryptError, data: encryptPrivateKey } = await this.$store.dispatch('EncryptPrivateKey', { userId, privateKey: privateKey }) 
      if (encryptError) {
        Toast('EncrpytKey Failed')
        return
      } */

      const { hasError: encryptError, data: encryptPrivateKey } = await this.$store.dispatch('EncryptPrivateKeyByEcies', { userId, c1: this.encryptPrivateKeyPublicKey, cc1: this.encryptPsw }) 
      if (encryptError) {
        this.showInputPswModal = true;
        Toast('EncrpytKey Failed! Retry!')
        return
      }

      // const { hasError } = await this.$store.dispatch('UploadEncrpytKey', { userId, address, encryptKey: encryptPrivateKey })
      const { hasError } = await this.$store.dispatch('UploadEncrpytKeyByAddress', { userId, address, encryptKey: encryptPrivateKey })
      if (hasError) {
        this.showInputPswModal = true;
        Toast('Upload EncrpytKey Failed! Retry!')
        return
      }
      await this.$store.dispatch('StoreBindingGoogleUserInfo', { userId, encryptPrivateKey, privateKey, address })
      await this.$store.dispatch('StoreBindingGoogleUserInfoList', { userId, encryptPrivateKey, privateKey, address })
      this.$eventBus.$emit('BindingUserInfoAferThirdLogin', { thirdUserId: userId });
    },
    /**
     * @description: 
     * step1: get encryptKey through download server
     * step2: if encryptKey is not exist and create new account(privateKey) or run step3
     * step3: get decryptKey(privateKey) throuh KMS
     * step4: recovery account  by privateKey
     */
    async getDecryptPrivateKey(thirdLoginInfo) {
      const userId = getLocationParam('id')
      /* const { data: userInfo } = await this.$store.dispatch('GetBindingGoogleUserInfo', { userId  })
      if (!userInfo) {
        Toast({
          message: 'Get User Encrypt Faild',
          duration: 5000
        });
        console.log('Get User Encrypt Faild')
        return
      } */
      // const { data } = await this.$store.dispatch('DownloadEncrpytKey', { userId, address: userInfo['address'] })
      const { data } = await this.$store.dispatch('DownloadEncrpytKey', { userId })
      if (!data) {
        console.log('This is old user, but have no encryptKey')
        await this.createAccountForThirdLoginUser()
        return
      }
      const { cipher_key: encryptKey } = data
      const decryptInfo = await this.$store.dispatch('DecryptPrivateKey', {userId, encryptKey })
      const { hasError, data: privateKey } = decryptInfo
      if (hasError) {
        Toast('Get PrivateKey Faild')
        return
      }
      const accountWallet = new ethers.Wallet(privateKey);
      await this.$store.dispatch('StoreBindingGoogleUserInfo', { userId, encryptPrivateKey:encryptKey, privateKey, address: accountWallet.address })
      await this.$store.dispatch('StoreBindingGoogleUserInfoList', { userId, encryptPrivateKey:encryptKey, privateKey, address: accountWallet.address })
      this.$eventBus.$emit('BindingUserInfoAferThirdLogin', { thirdUserId: userId });
    },
    /**
     * @description: 
     * step1: get encryptKey through download server
     * step2: if encryptKey is not exist and create new account(privateKey) or run step3
     * step3: get decryptKey(privateKey) throuh KMS
     * step4: recovery account  by privateKey
     */
    async getAllDecryptPrivateKey() {
      const userId = getLocationParam('id')
      const { data } = await this.$store.dispatch('DownloadAllEncrpytKey', { userId })
      if (!data.length) {
        console.log('This is old user, but have no encryptKey')
        await this.createAccountForThirdLoginUser()
        return
      }
      // TODO
      for(let i=0; i<data.length; i++) {
        const { cipher_key: encryptKey, user_address } = data[i]
        // const decryptInfo = await this.$store.dispatch('DecryptPrivateKey', {userId, encryptKey })
        const decryptInfo = await this.$store.dispatch('DecryptPrivateKeyByEcies', {userId, cr1: this.encryptCr1, c1: this.encryptPsw, cc2: encryptKey })
        const { hasError, data: decryptedPrivateKey } = decryptInfo
        if(hasError) {
          this.showInputPswModal = true;
          console.log('DecryptPrivateKeyByEcies failed! Retry!')
          return
        }
        console.log('还原私钥用的 aesKey：', this.aesKey)
        const privateKey = getDecryptPrivateKey(decryptedPrivateKey, this.aesKey)
        if (!privateKey) {
          this.showInputPswModal = true;
          console.log('Recovery privateKey failed! Retry!')
          return
        }
        const accountWallet = new ethers.Wallet(privateKey);
        if (i === 0) { // connect first account address
          await this.$store.dispatch('StoreBindingGoogleUserInfo', { userId, encryptPrivateKey:encryptKey, privateKey, address: accountWallet.address })
        }
        await this.$store.dispatch('StoreBindingGoogleUserInfoList', { userId, encryptPrivateKey:encryptKey, privateKey, address: accountWallet.address })
        this.$eventBus.$emit('BindingUserInfoAferThirdLogin', { thirdUserId: userId });
      }
    },
    async getUserBindingInfo(isNewUser) {
      if (isNewUser) {
        await this.createAccountForThirdLoginUser()
      } else {
        // await this.getDecryptPrivateKey()
        await this.getAllDecryptPrivateKey()
      }
      this.userPsw = ''
      this.showInputPswModal = false
      this.clearLoading()
    },
    async confirmPswOk({ show, psw }) {
      this.userPsw = psw; // password of user input for encrypt privateKey
      this.confirmPswBtnLoading = true
      const { hasError, data: publicKey} = await this.$store.dispatch('GetAllPublicKey')
      if (hasError) {
        Toast('Get PublickKey fasiled! Retry')
        this.confirmPswBtnLoading = false
        return
      }
      this.publicKey = publicKey;
      console.log(`GetPublicKey result is: ${publicKey}`)
      
      // const password = ecies.crypto.randomBytes(16).toString("base64");
      const encryptPsw = generateEncryptPswByPublicKey(publicKey, psw); // generate cc1
      // const test = generateEncryptPswByPublicKey(publicKey, psw); // generate cc1
      // console.log('test', encryptPsw, test)
      const { cr1: encryptCr1, aesKey } = generateCR1ByPublicKey(this.publicKey); // generate cr1
      console.log('生成cr1的 aesKey：', aesKey)
      this.aesKey = aesKey
      this.encryptPsw = encryptPsw
      this.encryptCr1 = encryptCr1
      console.log(`encryptPsw: ${encryptPsw}, \n encryptCr1: ${encryptCr1}`)
      this.confirmPswBtnLoading = false
      this.showInputPswModal = false
      this.showLoading();
      await this.getUserBindingInfo(this.isNewUser)
    },
  },
  async mounted() {
    const googleUserId = getLocationParam('id')
    const googleAuthToken = getLocationParam('auth_token')
    const newUser = getLocationParam('new')
    const isNewUser = newUser === '1'
    console.log('isNewUser', isNewUser)
    this.isNewUser = isNewUser

    // FOR DEBUG
    // this.showInputPswModal = true
    // return

    if (googleUserId) {
      await this.$store.dispatch('StoreGoogleUserId', {userId: googleUserId })
      await this.$store.dispatch('StoreGoogleAuthToken', {authToken: googleAuthToken })
      const { hasError, data: userInfo } = await this.$store.dispatch('GetUserInfoById', { userId: googleUserId })
      this.$eventBus.$emit('thirdLogin', { success: !hasError, userInfo });

      // this.showLoading();
      this.showInputPswModal = true; // input password
      // await this.getUserBindingInfo(isNewUser)
    }
  },
  created() {},
}
</script>
<style lang="scss" scoped>
  @import 'index';
</style>
