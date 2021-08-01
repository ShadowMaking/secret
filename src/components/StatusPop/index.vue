<template>
  <van-popup v-model="show" class="status-popUp flex flex-center flex-column">
    <i class="icon icon-success"></i>
    <i :class="['icon', {'icon-success':status==='success','icon-failed':status!=='success'}]"></i>
    <span class="main-txt">{{ title }}</span>
    <span class="supplement-txt">{{ timeTxt }}</span>
    <span class="supplement-txt">{{ tip }}</span>
    <van-button block color="#495ABF" class="button" @click="submitOk">确认</van-button>
  </van-popup>
</template>
<script>
import Vue from 'vue';
import { Popup, Button } from 'vant';

Vue.use(Popup);
Vue.use(Button);

export default {
  name: "StatusPop",
  props: ['show', 'title', 'timeTxt', 'tip', 'status'],
  data() {
    return {
      
    }
  },
  methods: {
    submitOk() {
      this.show = false;
      this.$emit('childEvent',{show: false});
    },
  },
}
</script>
<style lang="scss" scoped>
  @import 'index';
</style>