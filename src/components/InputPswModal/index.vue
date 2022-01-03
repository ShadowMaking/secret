<template>
  <div class="left-menu-box" id="leftmenu">
    <van-popup v-model="showPopup" class="status-popUp flex flex-center flex-column" @close="closeModal" :close-on-click-overlay="false">
      <span class="main-txt"></span>
      <div class="input-psw-container">
        <span>Password：</span>
        <input type="password" :class="[{'error': showPswError }]" @keyup="inputChange" v-model="pswVal"/>
        <span class="error-tip" v-if=showPswError>{{ pswErrorTxt }}</span>
      </div>
      <div class="psw-tip">
        <span>1. 设置的密码将用于加密钱包账户使用</span>
        <span>2. 密码遗失将丢失钱包账户信息</span>
        <span>3. 密码至少6位，包含至少一个大写字母，一个小写字母，一个数字，一个特殊字符(!@#$%^&*)</span>
        <span>4. 请您记住并妥善保管该密码</span>
        <span>5. 若您忘记密码，可以重新导入账户来重置密码</span>
      </div>
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
};
</script>
<style lang="scss" scoped>
  @import "index";
</style>
