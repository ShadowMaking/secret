<template>
  <div class="create-wallet-step3">
    <div class="conform-menonic">
      <span class="tip">请按顺序点击助记词，以确认您正确备份</span>
      <div class="menonic-selected">
        <ul>
          <li v-for="(item,index) in menonicList" :key="index">
            <van-tag color="#ccc" text-color="#333" size="large" plain>{{item}}</van-tag>
          </li>
        </ul>
      </div>
      <div class="menonic-messy">
        <ul>
          <li v-for="(item,index) in menonicList2" :key="index">
            <van-tag color="#ccc" text-color="#333" size="large" plain>{{item}}</van-tag>
          </li>
        </ul>
      </div>
      <div class="opt-wrapper">
        <van-button block color="#495ABE" @click="confirm" :disabled="menonicList.length==0">下一步</van-button>
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
  name: 'memonicConfirm',
  data() {
    return{
      menonicList: ['josn','sdsd'],
      menonicList2: ['sdsd','josn'],
    }
  },
  methods: {
    confirm() {
      this.$emit('childEvent');
    },
  },
}
</script>
<style lang="scss" scoped>
  @import 'index'
</style>
