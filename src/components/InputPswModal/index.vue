<template>
  <div class="left-menu-box" id="leftmenu">
    <van-popup v-model="showPopup" class="status-popUp flex flex-center flex-column" @close="closeModal" :close-on-click-overlay="false">
      <span class="main-txt"></span>
      <div class="input-psw-container">
        <span>Password：</span>
        <input type="password" :class="[{'error': showPswError }]" @keyup="inputChange" v-model="pswVal"/>
        <span class="error-tip" v-if=showPswError>{{ pswErrorTxt }}</span>
      </div>
      <!-- <div class="psw-tip">
        <span>1. Password is used to enhance the security of your KMS/HSM encrypted private key, and should be alphanumeric with at least 6 characters. Combining with Social Login and TEE technology, Eigen guarantees only you can access your plain private key.</span>
        <span>2. IMPORTANT: If you forget your password, you can not recover your private key, you can use NCW to realize the social recovery.</span>
        <span>3. Biometric technology will be adopted to realize the no-password authentication in the future.</span>
      </div> -->
      <ul class="psw-tip">
        <li>Password is used to enhance the security of your KMS/HSM encrypted private key,  and should be alphanumeric with at least 6 characters that contains at least one uppercase, one lowercase,  a number and a special character,  like 123@Abc.  Combining with Social Login and TEE technology, Eigen guarantees only you can access your plain private key.</li>
        <li>IMPORTANT:  If you forget your password, you will not be able recover your private key, But you can use the NCW to realize the social recovery.</li>
        <li>Biometric technology will be adopted to realize the no-password authentication in the future.</li>
      </ul>
      <van-button v-if="!canCloseByBtn" block color="#495ABF" class="button" @click="confirmPsw" :disabled="showPswError||!pswVal||btnLoading">{{ btnLoading?"loading":"Confirm" }}</van-button>
      <div v-else class="opt-container">
        <van-button @click="closeModal">Cancel</van-button>
        <van-button color="#495ABF" class="button" @click="confirmPsw" :disabled="showPswError||!pswVal||btnLoading">{{ btnLoading?"loading":"Confirm" }}</van-button>
      </div>
    </van-popup>
  </div>
</template>

<script>
import Vue from 'vue';
import { Icon, Popup } from 'vant';
// import { saveToStorage, getFromStorage, removeFromStorage, getInfoFromStorageByKey } from '@/utils/storage';

Vue.use(Icon);
Vue.use(Popup);

export default {
  name: 'InputPswModal',
  props: {
    'show': { type: Boolean, },
    'btnLoading': { type: Boolean, },
    'canCloseByBtn': { type: Boolean, default: false},
  },
  data() {
    return {
      pswVal: '',
      showPopup: false,
      showPswError: false,
    }
  },
  computed: {
    pswErrorTxt() {
      if (!this.pswVal.trim()) {
        return 'password is required'
      }
      return 'password is invalid'
    }
  },
  mounted() {
    
  },
  watch: {
    show() {
      this.showPopup = this.show
    },
  },
  methods: {
    inputChange(e) {
      const value = e.target.value
      const reg = /^\S*(?=\S{6,})(?=\S*\d)(?=\S*[A-Z])(?=\S*[a-z])(?=\S*[!@#$%^&*? ])\S*$/
      this.showPswError = false
      if (!reg.test(value)) {
        this.showPswError = true
      }
    },
    closeModal() {
      this.showPopup = false;
      this.$emit('cancel', { show: false });
    },
    confirmPsw() {
      this.$emit('ok', {show: false, psw: this.pswVal.trim()});
    },
  },
  mounted() {
    this.$eventBus.$on('resetValueAfterInputPsw', () => {
      this.pswVal = ''
    })
  }
};
</script>
<style lang="scss" scoped>
  @import "index";
</style>
