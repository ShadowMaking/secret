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
        <van-button block color="#495ABE" class="mb10" @click="backupMenonic">Confirm</van-button>
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
        placeholder="Please enter 6-digit" />
      <div class="opt-wrapper">
        <van-button block color="#495ABE" class="mb10" @click="confirmBackUp">submit</van-button>
      </div>
    </div>
  </div>
</template>
<script>
import Vue from 'vue';
import { Button, Field, Toast } from 'vant';
import { saveToStorage, getFromStorage } from '@/utils/storage';
import QRCode from 'qrcodejs2'
import _ from 'lodash'

Vue.use(Button);
Vue.use(Field);
Vue.use(Toast);

export default {
  name: 'memonicBackup',
  data() {
    return{
      showMenonicTip: true,
      showMenonic: false,
      codeFor2FA: ''
    }
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
        text: '0x4F5FD0eA6724DfBf825714c2742A37E0c0d6D7d9',
        width: 120,
        height: 120,
        colorDark: '#000000',
        colorLight: '#ffffff',
        correctLevel: QRCode.CorrectLevel.H,
      })
    },
    backupMenonic() {
      if (!this.thirdUserId) {
        Toast('请进行社交登录')
        return
      }
      this.showMenonicTip = false;
      this.showMenonic = true;
      this.creatQrCode();
    },
    confirmBackUp() {
      this.showMenonicTip = false;
      this.showMenonic = false;
      this.$emit('childEvent');
    },
  },
  mounted() {
    this.creatQrCode();
  },
}
</script>
<style lang="scss" scoped>
  @import 'index';
</style>
