<template>
  <van-popup v-model="show" class="status-popUp flex flex-center flex-column">
    <i :class="['icon', {'icon-success':status==='success','icon-failed':status!=='success'}]"></i>
    <span class="main-txt">{{ title }}</span>
    <span class="supplement-txt" v-show="status==='success' && timeTxt">{{ timeTxt }}</span>
    <span class="supplement-txt" v-show="status==='success' && tip">{{ tip }}</span>
    <van-button block color="#495ABF" class="button" @click="submitOk">{{ buttonTxt}}</van-button>
  </van-popup>
</template>
<script>
import Vue from 'vue';
import { Popup, Button } from 'vant';

Vue.use(Popup);
Vue.use(Button);

export default {
  name: "StatusPop",
  props: {
    'show': { type: Boolean, },
    'title': { type: String, },
    'timeTxt': { type: String, },
    'tip': { type: String, default: ''},
    'status': { type: String, },
    'needColse': {
      type: Boolean,
      default: true
    },
    'buttonTxt': {
      type: String,
      default: 'OK'
    },
  },
  data() {
    return {
      
    }
  },
  methods: {
    submitOk() {
      if (this.needColse) {
        this.show = false;
      }
      this.$emit('childEvent',{show: false});
    },
  },
}
</script>
<style lang="scss" scoped>
  @import 'index';
</style>