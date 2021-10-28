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
      <div class="tip-info">
        <h4>Set up two-factor authentication (2FA)</h4>
        <ul class="tip-info-ul tip">
          <li>Scan the QR code or enter your secret key by Google Authenticator.<li>
          <li>Use Google Authenticator Authenticator to further secure your assets.You can download the Google Authenticator in app store.</li>
        </ul>
      </div>
      <div class="QR-confirm">
        <div class="img-QR">
          <div ref="qrCodeUrl"></div>
        </div>
      </div>
      <van-field
        v-model="codeFor2FA"
        type="digit"
        placeholder="please enter 6-digit"
        :minlength="6"
        :maxlength="6" />
      <div class="opt-wrapper">
        <van-button
          block color="#495ABE"
          class="mb10"
          @click="confirmBackUp"
          :disabled="!codeFor2FA||codeFor2FA.length!==6||verifyIsLoading">{{ verifyIsLoading?"waiting...":"Confirm" }}</van-button>
      </div>
    </div>
    <v-thirdlogintip
      key="thirdlogintip"
      :show="showThirdLoginTip"
      @childEvent="closeThirdLoginTip" />
  </div>
</template>
<script>
import Vue from 'vue';
import { Button, Field, Toast } from 'vant';
import { saveToStorage, getFromStorage } from '@/utils/storage';
import QRCode from 'qrcodejs2'
import _ from 'lodash'
import ThirdLoginTip from '@/components/ThirdLoginTip';

Vue.use(Button);
Vue.use(Field);
Vue.use(Toast);

export default {
  name: 'memonicBackup',
  data() {
    return{
      showMenonicTip: true,
      showMenonic: false,
      codeFor2FA: '',
      qrCodeUrl: '',
      verifyIsLoading: false,
      showThirdLoginTip: false,
    }
  },
  components: {
    'v-thirdlogintip': ThirdLoginTip,
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
    creatQrCode() {
      const refNode = this.$refs.qrCodeUrl  // childNodes(array)  childElementCount(as same as elemnt.children.length)
      // if (this.walletIsLock || !refNode || refNode && refNode.childElementCount > 0) {
      if (!refNode || refNode && refNode.childElementCount > 0) {
        return;
      }
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
    async confirmBackUp() {
      this.verifyIsLoading = true;
      const verifyRes = await this.$store.dispatch('VerifyCode', { userId: this.thirdUserId, code: this.codeFor2FA})
      this.verifyIsLoading = false
      if (!verifyRes.hasError) {
        this.showMenonicTip = false;
        this.showMenonic = false;
        this.$emit('childEvent', this.codeFor2FA);
      } else {
        Toast(verifyRes.error)
      }
    },
    async getOTPAuthUrl() {
      if (!this.thirdUserId) { return }
      const res = await this.$store.dispatch('GetOTPAuthUrl', { userId: this.thirdUserId})
      const { hasError, data } = res;
      if (!hasError) {
        this.qrCodeUrl = data
      }
    },
    closeThirdLoginTip(info) {
      this.showThirdLoginTip = info.show
    }
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
