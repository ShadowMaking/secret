<template>
  <div class="create-wallet-step3">
    <!-- 2FA验证提示 -->
    <div class="backup-tip" v-show="showMenonicTip">
      <div class="tip-icon">
        <van-icon name="graphic" size="80"/>
      </div>
      <div class="tip-info">
        <h4>Social Recovery Settings</h4>
        <p>2FA验证让账户更安全</p>
        <ul>
          <li>Social recovery refers to a method to ensure the security of your account through the key stored in the social relationship of your friends.<li>
          <li>Through the friends you added, send your key fragments to your friend's mailbox for backup, so as to restore the key of your personal account.</li>
        </ul>
      </div>
      <div class="opt-wrapper">
        <van-button block color="#495ABE" class="mb10" @click="backupMenonic">Next</van-button>
      </div>
    </div>
    <!-- 2FA验证 -->
    <div class="backup-menonic" v-show="showMenonic">
      <div v-if="showQRCode">
        <div class="tip-info">
          <h4>Set up Authenticator</h4>
          <ul class="tip-info-ul tip">
            <li>Get the Authenticator from the App Store.</li>
            <li>In the App select Set up account.</li>
            <li>Choose Scan barcode.</li>
          </ul>
        </div>
        <div class="QR-confirm">
          <div class="img-QR">
            <div ref="qrCodeUrl"></div>
          </div>
        </div>
      </div>
      <div v-else>
        <div class="tip-info">
          <h4>Set up Authenticator</h4>
          <ul class="tip-info-ul tip">
            <li>Please enter the Google Authenticator 6-digit code.</li>
            <li>If you lose your Authenticator device, you can recreate an Authenticator password.</li>
          </ul>
        </div>
      </div>
      <van-field
        v-model="codeFor2FA"
        type="digit"
        placeholder="Enter the 6-digit code that you see in the app"
        :minlength="6"
        :maxlength="6" />
      <div class="generate-button-wrapper" v-if="!showQRCode">
        <van-popover v-model="showPopover" trigger="click" placement="top-end">
          <div class="generate-QRCode-popover">
            Click Button to Create
            <van-button block color="#495ABE" @click="generateQRSecret" class="create-button" size="small">Create</van-button>
          </div>
          <template #reference>
            <span class="forget-tip">Forget Authentication ?</span>
          </template>
        </van-popover>
      </div>
      <div class="opt-wrapper">
        <van-button
          block color="#495ABE"
          class="mb10"
          @click="verifyQRCode"
          :disabled="!codeFor2FA||codeFor2FA.length!==6||verifyIsLoading">{{ verifyIsLoading?"waiting...":"Confirm" }}</van-button>
      </div>
    </div>
    <!-- 2FA验证 Complete -->
    <div v-show="verifySuccess">
      <v-complete
        key="privatekey-confirm-complete"
        @childEvent="completeCallback" />
    </div>
    <v-thirdlogintip
      key="thirdlogintip"
      :show="showThirdLoginTip"
      @childEvent="closeThirdLoginTip" />
  </div>
</template>
<script>
import Vue from 'vue';
import { Button, Field, Toast, Popover } from 'vant';
import { saveToStorage, getFromStorage } from '@/utils/storage';
import QRCode from 'qrcodejs2'
import _ from 'lodash'
import ThirdLoginTip from '@/components/ThirdLoginTip';
import MenonicConfirmComplete from '@/components/SocialRecovery/MenonicConfirmComplete'

Vue.use(Button);
Vue.use(Field);
Vue.use(Toast);
Vue.use(Popover);

export default {
  name: 'memonicBackup',
  props: ['showSeetingTip', 'showQRCode', 'showComplete'],
  data() {
    return{
      codeFor2FA: '',
      qrCodeUrl: '',
      verifyIsLoading: false,
      showThirdLoginTip: false,
      showPopover: false,
      verifySuccess: false,
      showMenonic: true,
      saveSecretDisabled: false,
    }
  },
  components: {
    'v-thirdlogintip': ThirdLoginTip,
    'v-complete': MenonicConfirmComplete,
  },
  computed: {
    walletIsLock() {
      return this.$store.state.metamask.walletIsLock;
    },
    thirdUserId() {
     return getFromStorage('gUID')
    },
    showMenonicTip() {
      return this.showSeetingTip
    },
    /* showMenonic() {
      return !this.showSeetingTip
    }, */
  },
  methods: {
    creatQrCode() {
      const refNode = this.$refs.qrCodeUrl  // childNodes(array)  childElementCount(as same as elemnt.children.length)
      // if (this.walletIsLock || !refNode || refNode && refNode.childElementCount > 0) {
      if (!refNode || refNode && refNode.childElementCount > 0) {
        return;
      }
      console.log('this.qrCodeUrl', this.qrCodeUrl)
      new QRCode(this.$refs.qrCodeUrl, {
        text: this.qrCodeUrl,
        width: 120,
        height: 120,
        colorDark: '#000000',
        colorLight: '#ffffff',
        correctLevel: QRCode.CorrectLevel.H,
      })
    },
    backupMenonic() {
      if (!this.thirdUserId) {
        this.showThirdLoginTip = true
        console.log('need login')
        return
      }
      this.showMenonicTip = false;
      this.showMenonic = true;
      this.creatQrCode();
    },
    async verifyQRCode() {
      if (this.saveSecretDisabled) {
        console('save OTP failed, can not verify OTP code')
      }
      this.verifyIsLoading = true;
      const verifyRes = await this.$store.dispatch('VerifyCode', { userId: this.thirdUserId, code: this.codeFor2FA})
      this.verifyIsLoading = false
      if (!verifyRes.hasError) {
        this.showMenonicTip = false;
        this.showMenonic = false;
        if (this.showComplete) {
          this.verifySuccess = true
        } else {
          this.$emit('childEvent', this.codeFor2FA);
        }
        // this.$emit('childEvent', this.codeFor2FA);
      } else {
        Toast(verifyRes.error)
      }

      /* const verifyRes = await this.$store.dispatch('VerifyOTPCode', { userId: this.thirdUserId, code: this.codeFor2FA})
      this.verifyIsLoading = false
      if (!verifyRes.hasError) {
        this.showMenonicTip = false;
        this.showMenonic = false;
        this.verifySuccess = true
        // this.$emit('childEvent', this.codeFor2FA);
      } else {
        Toast(verifyRes.error)
      } */
    },
    completeCallback() {
      this.$emit('childEvent', this.codeFor2FA);
    },
    async getOTPAuthUrl(needDestroy) {
      if (!this.thirdUserId) { return }
      this.saveSecretDisabled = false
      /* const res = await this.$store.dispatch('GetOTPAuthUrl', { userId: this.thirdUserId})
      const { hasError, data } = res;
      if (!hasError) {
        this.qrCodeUrl = data
      } */
      const { hasError, data: userInfo } = await this.$store.dispatch('GetUserInfoById', { userId: this.thirdUserId })
      const { secret, url } = await this.$store.dispatch('GenerateOTPAuthUrl', { userId: this.thirdUserId, needDestroy, userInfo})
      const saveSecretRes = await this.$store.dispatch('SaveOTPSecret', { userId: this.thirdUserId, secret })
      if (saveSecretRes.hasError) {
        this.saveSecretDisabled = true
        console.log('can not save OTP secret')
      }
      this.qrCodeUrl = url
      return url
    },
    closeThirdLoginTip(info) {
      this.showThirdLoginTip = info.show
    },
    async generateQRSecret() {
      this.showPopover = false
      this.showQRCode = false
      const url = await this.getOTPAuthUrl(true)
      if (url) {
        this.showQRCode = true
        window.setTimeout(()=>{
          this.creatQrCode();
        },0)
      } else {
        Toast('创建失败，稍后重试')
      }
    },
  },
  created() {
  },
  async mounted() {
    await this.getOTPAuthUrl();
    if (this.qrCodeUrl) {
      this.creatQrCode();
    }
  },
}
</script>
<style lang="scss" scoped>
  @import 'index';
</style>
