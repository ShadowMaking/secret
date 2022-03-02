<template>
  <div class="bind-google-modal">
    <el-dialog
      :visible.sync="thirdLogindialogVisible"
      width="360px"
      center
      :before-close="cancelBindLogin">
      <div style="text-align:center">this module need to bind google email</div>
      <span slot="footer" class="dialog-footer">
        <el-input 
          v-model="bindGoogleEmail" 
          autocomplete="off"
          placeholder="enter your email"
          style="width: 45%">
        </el-input>
        <span class="email-tip">@gmail.com</span>
        <el-button type="primary" @click="agreeBindLogin" :disabled="!bindGoogleEmail||bindLoading" style="padding: 10px;">bind</el-button>
        
      </span>
    </el-dialog>
  </div>
</template>
<script>
import Vue from 'vue';
import { Toast, Dialog } from 'vant'
import { getFromStorage } from '@/utils/storage';
Vue.use(Toast);
Vue.use(Dialog);

export default {
  name: 'bindGoogleEmail',
  // props: {
  //   'show': { type: Boolean, },
  // },
  data() {
    return {
      thirdLogindialogVisible: false,
      bindGoogleEmail: '',
      bindLoading: false,

      fakeEmail: '',
    }
  },
  // watch: {
  //   show() {
  //     this.thirdLogindialogVisible = this.show
  //   },
  // },
  methods: {
    cancelBindLogin() {
      this.$router.push({ path: '/overview' })
    },
    async agreeBindLogin() {
      const userId = getFromStorage('gUID')
      if (!userId||!this.bindGoogleEmail) {
        console.log('usetId or googleemail error')
        Toast('error')
        return
      }
      this.bindLoading = true
      var bindData = {
        userId: userId,
        fake_email: this.fakeEmail,
        email: `${this.bindGoogleEmail.trim()}@gmail.com`
      }
      const { hasError, data, error } = await this.$store.dispatch('metamaskGoogleBind', bindData);
      this.bindLoading = false;
      if (!hasError) {
        this.thirdLogindialogVisible = false
        Toast('Bind Success')
        saveToStorage({ 'metamaskFakeEmail': bindData.email })
      } else {
        Toast(error)
      }
    },
  },
  created() {
    this.fakeEmail = getFromStorage('metamaskFakeEmail') ? getFromStorage('metamaskFakeEmail') : ''
    if (this.fakeEmail.indexOf('.com.test') > -1) {
      this.thirdLogindialogVisible = true
    }
  },
}
</script>
<style lang="scss" scoped>
  .dialog-footer {
    display: flex;
    justify-content: center;
    align-items: center;
  }
  .email-tip {
    margin-left: 5px;
    margin-right: 1.8rem;
  }
</style>