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
      </div>
      <div v-else>
        <div class="tip-info">
          <h4>Set up two-factor authentication (2FA)</h4>
          <ul class="tip-info-ul tip">
            <li>请在您的设置上查看authentication code.<li>
            <li>如果您丢失了您的authentication设备，您可以选择创建一个authentication账户</li>
            <li>新创建账户出现的二维码很重要，扫描时请注意保护好</li>
          </ul>
        </div>
      </div>
      <van-field
        v-model="codeFor2FA"
        type="digit"
        placeholder="please enter 6-digit"
        :minlength="6"
        :maxlength="6" />
      <div class="generate-button-wrapper" v-if="!showQRCode">
        <van-popover v-model="showPopover" trigger="click" placement="top-end">
          <div class="generate-QRCode-popover">
            点击下方按钮重新创建账户
            <van-button block color="#495ABE" @click="generateQRSecret" class="create-button" size="small">Create</van-button>
          </div>
          <template #reference>
            <span class="forget-tip">忘记Authentication账户?</span>
          </template>
        </van-popover>
      </div>
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
import { Button, Field, Toast, Popover } from 'vant';
import { saveToStorage, getFromStorage } from '@/utils/storage';
import QRCode from 'qrcodejs2'
import _ from 'lodash'
import ThirdLoginTip from '@/components/ThirdLoginTip';

Vue.use(Button);
Vue.use(Field);
Vue.use(Toast);
Vue.use(Popover);

export default {
  name: 'memonicBackup',
  props: ['showSeetingTip', 'showQRCode'],
  data() {
    return{
      codeFor2FA: '',
      qrCodeUrl: '',
      verifyIsLoading: false,
      showThirdLoginTip: false,
      showPopover: false,
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
    showMenonicTip() {
      return this.showSeetingTip
    },
    showMenonic() {
      return !this.showSeetingTip
    },
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
      /* const verifyRes = await this.$store.dispatch('VerifyOTPCode', { userId: this.thirdUserId, code: this.codeFor2FA})
      if (!verifyRes.hasError) {
        this.showMenonicTip = false;
        this.showMenonic = false;
        this.$emit('childEvent', this.codeFor2FA);
      } else {
        Toast(verifyRes.error)
      } */
    },
    async getOTPAuthUrl(needDestroy) {
      if (!this.thirdUserId) { return }
      /* const res = await this.$store.dispatch('GetOTPAuthUrl', { userId: this.thirdUserId})
      const { hasError, data } = res;
      if (!hasError) {
        this.qrCodeUrl = data
      } */

      const { secret, url } = await this.$store.dispatch('GenerateOTPAuthUrl', { userId: this.thirdUserId, needDestroy})
      const saveSecretRes = await this.$store.dispatch('SaveOTPSecret', { userId: this.thirdUserId, secret })
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
