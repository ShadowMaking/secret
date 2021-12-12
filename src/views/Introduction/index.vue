<template>
  <div class="social-recovery-introduction-page">
    <div class="tip-wrapper secret">
      <div class="top">
        <h4>Social Recovery</h4>
        <a><router-link to="/backup?type=create">GO</router-link></a>
      </div>
      <span class="tip">Social Recovery is a secret recovery mechanism, allowing you to place your secret or private data in the custody of your friends by Cryptography Threshold Secret Share and multi-sig contract wallet on Layer 2. And the multi-sig wallet will be available in early December.
      </span>
      <span class="tip" style="color:red">Important: all your keys and shares are processed at your computer or device, Eigrn team can't access them. </span>
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
  </div>
</template>
<script>
import Vue from 'vue';
import { Button, Toast } from 'vant';
import _ from 'lodash';
import { ethers } from 'ethers'
import { encryptKey } from '@/utils/index'
import { getQueryString, getLocationParam } from '@/utils/index'

Vue.use(Button);

export default {
  name: "Introduction",
  computed: { },
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

      // console.log(address, privateKey, mnemonic)

      const { hasError: encryptError, data: encryptPrivateKey } = await this.$store.dispatch('EncryptPrivateKey', { userId, privateKey: privateKey }) 
      if (encryptError) {
        Toast('EncrpytKey Failed')
        return
      }
      const { hasError } = await this.$store.dispatch('UploadEncrpytKey', { userId, address, encryptKey: encryptPrivateKey })
      if (hasError) {
        Toast('Upload EncrpytKey Failed')
        return
      }
      await this.$store.dispatch('StoreBindingGoogleUserInfo', { userId, encryptPrivateKey, privateKey, address })
      this.$eventBus.$emit('BindingUserInfoAferThirdLogin', { thirdUserId: userId });
    },
    /**
     * @description: 
     * step1: get userInfo base on userId after third login
     * step2: get encryptKey through download server
     * step3: get decryptKey(privateKey) throuh KMS
     * step4: recovery account  by privateKey
     */    
    async getDecryptPrivateKey(thirdLoginInfo) {
      const userId = getLocationParam('id')
      const { data: userInfo } = await this.$store.dispatch('GetBindingGoogleUserInfo', { userId  })
      const { data } = await this.$store.dispatch('DownloadEncrpytKey', { userId, address: userInfo['address'] })
      const { cipher_key: encryptKey, address } = data
      const decryptInfo = await this.$store.dispatch('DecryptPrivateKey', {userId, encryptKey })
      const { hasError, data: privateKey } = decryptInfo
      if (hasError) {
        Toast('Get PrivateKey Faild')
        return
      }
      const accountWallet = new ethers.Wallet(privateKey);
      await this.$store.dispatch('StoreBindingGoogleUserInfo', { userId, encryptPrivateKey:encryptKey, privateKey, address: accountWallet.address })
      this.$eventBus.$emit('BindingUserInfoAferThirdLogin', { thirdUserId: userId });
    },
    async getUserBindingInfo(isNewUser) {
      if (isNewUser) {
        await this.createAccountForThirdLoginUser()
      } else {
        await this.getDecryptPrivateKey()
      }
      this.clearLoading()
    },
  },
  async mounted() {
    const googleUserId = getLocationParam('id')
    const googleAuthToken = getLocationParam('auth_token')
    const newUser = getLocationParam('new')
    const isNewUser = newUser === '1'
    console.log('isNewUser', isNewUser)
    if (googleUserId) {
      await this.$store.dispatch('StoreGoogleUserId', {userId: googleUserId })
      await this.$store.dispatch('StoreGoogleAuthToken', {authToken: googleAuthToken })
      const { hasError, data: userInfo } = await this.$store.dispatch('GetUserInfoById', { userId: googleUserId })
      this.$eventBus.$emit('thirdLogin', { success: !hasError, userInfo });

      this.showLoading();
      await this.getUserBindingInfo(isNewUser)
    }
  },
  created() {},
}
</script>
<style lang="scss" scoped>
  @import 'index';
</style>
