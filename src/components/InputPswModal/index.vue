<template>
  <div class="left-menu-box" id="leftmenu">
    <van-popup v-model="showPopup" class="status-popup flex flex-center flex-column" @close="closeModal" :close-on-click-overlay="false" :get-container="getContainer">
      <div class="input-psw-container">
        <span>Fund password：</span>
        <span class="psw">
          <input :type="pswType" :class="[{'error': showPswError }]" @keyup="inputChange" v-model="pswVal"/>
          <i :class="[showPsw ?'showpsw':'hidepsw']" @click="changeShowPsw"></i>
        </span>
        <span class="error-tip" v-if=showPswError>{{ pswErrorTxt }}</span>
      </div>
      <div class="status-popup-container">
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
      </div>
    </van-popup>
  </div>
</template>

<script>
import Vue from 'vue';
import { Icon, Popup } from 'vant';

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
      showPsw: false,
      pswType: 'password'
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
    changeShowPsw() {
      this.showPsw=!this.showPsw
      this.pswType = this.showPsw ? 'text' : 'password'
    },
    getContainer() {
      return document.getElementById('leftHeaderBox');
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
