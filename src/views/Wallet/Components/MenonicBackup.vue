<template>
  <div class="create-wallet-step2">
    <!-- 备份助记词提示 -->
    <div class="backup-tip" v-show="showMenonicTip">
      <div class="tip-icon">
        <van-icon name="graphic" size="80"/>
      </div>
      <div class="tip-info">
        <h4>备份提示</h4>
        <p>获取助记词等于拥有钱包资产所有权</p>
        <ul>
          <li>助记词由英文单词组成，请抄写并妥善保管。</li>
          <li>助记词丢失，无法找回，请务必备份好助记词</li>
        </ul>
      </div>
      <div class="opt-wrapper">
        <van-button block color="#495ABE" class="mb10" @click="backupMenonic">立即备份</van-button>
        <van-button block color="#495ABE" plain @click="backupMenonicAfter">稍后备份</van-button>
      </div>
    </div>
    <!-- 备份助记词 -->
    <div class="backup-menonic" v-show="showMenonic">
      <span class="tip">请按顺序抄写助记词，确保备份正确</span>
      <div class="menonic">
        <van-grid :column-num="3">
          <!-- <van-grid-item v-for="value in 12" :key="value" text="JSON" /> -->
          <van-grid-item v-for="(item,index) in sourceData" :key="index" :text="item" />
        </van-grid>
      </div>
      <ul class="tip-info-ul">
        <li>妥善保管助记词至隔离网络的安全地方</li>
        <li>请勿将助记词在联网环境下分享和存储，比如邮件、相册、社交应用等</li>
      </ul>
      <div class="opt-wrapper">
        <van-button block color="#495ABE" class="mb10" @click="confirmBackUp">已确认备份</van-button>
      </div>
    </div>
  </div>
</template>
<script>
import Vue from 'vue';
import { Icon, Button, Tag, Grid, GridItem  } from 'vant';
import { saveToStorage, getFromStorage } from '@/utils/storage';
import _ from 'lodash'


Vue.use(Icon);
Vue.use(Button);
Vue.use(Tag);
Vue.use(Grid);
Vue.use(GridItem);

export default {
  name: 'memonicBackup',
  props: ['sourceData'],
  data() {
    return{
      showMenonicTip: true,
      showMenonic: false,
    }
  },
  methods: {
    backupMenonic() {
      const menonic = []; // 助记词
      this.showMenonicTip = false;
      this.showMenonic = true;
      // this.$emit('childEvent', menonic);
    },
    backupMenonicAfter() {
      this.$emit('childEventAfter');
    },
    // 确认备份
    confirmBackUp() {
      this.showMenonicTip = false;
      this.showMenonic = false;
      this.$emit('childEventConfirm');
    },
  },
}
</script>
<style lang="scss" scoped>
  @import 'index';
</style>
