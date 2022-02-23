<template>
  <div class="create-wallet-step1">
    <div class="backup-menonic" >
      <div class="update-wrapper" v-if="type!=='import'">
        <span class="tip"><!-- Your secret recovery phrase or private key can help you backup and recover the secret. --></span>
        <van-button color="#495ABE" plain @click="update" size="small" class="update-mnemonic">update</van-button>
      </div>
      <div class="mnemonic-wrapper" @click="copyMnemonic">
        <van-grid :column-num="3" v-if="sourceData.length">
          <van-grid-item v-for="(item,index) in sourceData" :key="index" :text="item" />
        </van-grid>
      </div>
      <ul class="tip-info-ul">
        <li>Don’t expose your account recovery phrase or private key to anyone else. Once any person acquires your account recovery phrase or private key, he/she could control your account.</li>
        <li>Don’t share or save your account recovery phase in the public network, including e-mail, album, social applications.</li>
      </ul>
      <div class="opt-wrapper">
        <van-button block color="#495ABE" class="mb10" @click="confirmBackUp">Next</van-button>
      </div>
    </div>
  </div>
</template>
<script>
import Vue from 'vue';
import { Icon, Button, Tag, Grid, GridItem, Toast  } from 'vant';
import { copyTxt } from '@/utils/index';

Vue.use(Icon);
Vue.use(Button);
Vue.use(Tag);
Vue.use(Grid);
Vue.use(GridItem);
Vue.use(Toast);

export default {
  name: 'MenonicGenerate',
  props: ['sourceData','type'],
  data() {
    return{}
  },
  methods: {
    update() {
      this.$emit('updateMnemonic');
    },
    copyMnemonic() {
      if (this.sourceData.length > 0) {
        const mnemonicStr = this.sourceData.join(' ')
        copyTxt(mnemonicStr)
        Toast('Copied')
      }
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
