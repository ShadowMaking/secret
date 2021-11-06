<template>
  <van-dialog v-model="showThirdLoginGuidDialog" title="Authorization Tip" :showConfirmButton="false" class="google-auth-dialog-wrapper">
      <div class="google-auth-dialog">
        <van-icon name="cross" class="closeDialog" @click="closeDialog"  size="20" />
        <span class="tip">您需要进行登录才可进行该操作</span>
        <div class="btn-wrapper">
          <van-button @click="toPage('tlogin')" block color="#495ABE" class="btn">Login</van-button>
        </div>
      </div>
    </van-dialog>
</template>

<script>
import Vue from 'vue';
import { Dialog } from 'vant';

Vue.use(Dialog);

export default {
  name: 'ThirdLoginTip',
  props: ['show'],
  data() {
    return { }
  },
  watch: {
    show() {
      this.showThirdLoginGuidDialog = this.show
    },
  },
  computed: {
    showThirdLoginGuidDialog() {
      return this.show;
    },
  },
  methods: {
    toPage(pathName) {
      this.$router.push({ name: pathName })
    },
    closeDialog() {
      this.showThirdLoginGuidDialog = false;
      this.$emit('childEvent',{show: false});
    },
  },
};
</script>
<style lang="scss" scoped>
  @import "index";
</style>
