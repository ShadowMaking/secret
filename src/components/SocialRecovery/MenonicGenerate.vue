<template>
  <div class="create-wallet-step1">
    <div class="backup-menonic" >
      <div class="flex flex-content-between">
        <span class="tip">请按顺序抄写助记词，确保备份正确</span>
        <van-button color="#495ABE" plain @click="update" size="small" class="update-mnemonic">update</van-button>
      </div>
      <div class="mnemonic-wrapper">
        <van-grid :column-num="3" v-if="sourceData.length">
          <van-grid-item v-for="(item,index) in sourceData" :key="index" :text="item" />
        </van-grid>
      </div>
      <ul class="tip-info-ul">
        <li>妥善保管助记词至隔离网络的安全地方</li>
        <li>请勿将助记词在联网环境下分享和存储，比如邮件、相册、社交应用等</li>
      </ul>
      <div class="opt-wrapper">
        <van-button block color="#495ABE" class="mb10" @click="confirmBackUp">进行备份</van-button>
      </div>
    </div>
  </div>
</template>
<script>
import Vue from 'vue';
import { Icon, Button, Tag, Grid, GridItem  } from 'vant';

Vue.use(Icon);
Vue.use(Button);
Vue.use(Tag);
Vue.use(Grid);
Vue.use(GridItem);

export default {
  name: 'MenonicGenerate',
  props: ['sourceData'],
  data() {
    return{}
  },
  methods: {
    update() {
      this.$emit('updateMnemonic');
    },
    // 进行备份
    confirmBackUp() {
      this.$emit('childEventConfirm');
    },
  },
}
</script>
<style lang="scss" scoped>
  @import 'index';
</style>
