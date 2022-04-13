<template>
  <div class="login-in-page">
    <div class="login-in-content">
      <v-navTitle title="Connect to Eigen"></v-navTitle >
      <div class="connect-type-warp">
        <ul class="connect-type-list">
          <li class="connect-type-item">
            <p class="connect-type-title">连接Google Account</p>
            <div class="connect-item-btn" @click="login('google')">
              <i class="login-icon logo-google"></i>
              <span>Google Account</span>
            </div>
          </li>
          <li class="connect-type-item">
            <p class="connect-type-title">连接钱包</p>
            <div class="connect-item-btn" @click="login('metamask')">
              <i class="login-icon logo-metamsk"></i>
              <span>MetaMask</span>
            </div>
          </li>
        </ul>
      </div>
    </div>
  </div>
</template>
<script>
import Vue from 'vue';
import _ from 'lodash';
import { ethers } from 'ethers'
import navTitle from '@/components/NavTitle/index'
import { Toast, Dialog} from 'vant'
import { installWeb3WalletMetamask } from '@/utils/web3'
import { saveToStorage, getFromStorage } from '@/utils/storage';

Vue.use(Toast);
Vue.use(Dialog);

export default {
  name: 'loginIn',
  data() {
    return {
      
    }
  },
  components: {
    "v-navTitle": navTitle,
  },
  
  methods: {
    login(type) {
      Toast.loading({
        duration: 0,
        message: 'loading...',
        forbidClick: true,
        loadingType: 'spinner',
      });
      if (type === 'google') {
        this.googleLogin()
      } else if (type === 'metamask') {
        this.metamaskLogin()
      }
    },
    async googleLogin() {
      const loginRes = await this.$store.dispatch('GoogleLogin');
      Toast.clear()
      const { hasError, url } = loginRes;
      if (hasError) {
        Toast(hasError)
        return
      }
      window.location.href = url
    },
    async metamaskLogin() {
      if (!installWeb3WalletMetamask) {
        this.openDialogInstallMetamask()
        return
      }
      await ethereum.request({
        method: 'wallet_requestPermissions',
        params:  [{ "eth_accounts": {} }]
      })
      const accounts = await ethereum.request({ method: 'eth_requestAccounts' })
      const thisAccount = accounts[0]
      let Logindata = { address: thisAccount }
      const metamaskRes = await this.$store.dispatch('metamaskLogin', Logindata)
      const metaMaskData = metamaskRes.data
      if (metamaskRes.hasError) {
        let toastMsg = metaMaskData && metaMaskData.message
        Toast(toastMsg) 
        return
      }
      const provider = new ethers.providers.Web3Provider(
          window.ethereum,
      )
      const thisSigner = provider.getSigner()
      const signNonce = metaMaskData && metaMaskData.data
      const signature = await thisSigner.signMessage(signNonce)

      const storageEmail = getFromStorage('metamaskFakeEmail')
      const nowTime = new Date()
      const fakeEmail = nowTime.getTime() + '@gmail.com.test'
      let thisEmail = storageEmail ? storageEmail : fakeEmail
      
      const { hasError, data } = await this.$store.dispatch('metamaskVerify', {
        signature: signature,
        address: thisAccount,
        email: thisEmail
      });
      if (hasError) {
        Toast('login failed')
        return
      }
      let backUrl = data.data
      saveToStorage({ 'metamaskFakeEmail': thisEmail })
      window.location.href = backUrl
    },
    openDialogInstallMetamask() {
      Dialog.confirm({
        message: 'Install Metamask?',
        confirmButtonText: 'Confirm',
        confirmButtonColor: '#4375f1',
        cancelButtonText: 'Cancel'
      })
      .then(() => {
        let url = 'https://metamask.io/'
        window.open(url, '_blank');
      })
      .catch((error) => {
        console.log(error)
      });
    },
  },
  created() {
    
  },
}
</script>
<style lang="scss" scoped>
  @import 'index.scss';
</style>
