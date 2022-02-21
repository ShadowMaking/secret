<template>
  <div class="export-page">
    <v-navTitle title="Export Account"></v-navTitle >
    <div class="export-box">
      <div class="export-des">Export Account is a secret recovery mechanism,in which you can ask your friends to save and recover your secret or private data with the cryptography of Threshold Secret Share.</div>
      <div class="export-select-box">
        <label class="select-label">Select Address</label>
        <select>
          <option>sd</option>
        </select>
      </div>
      <div class="opt-wrapper">
        <van-button color="#909399" @click="cancel">Cancel</van-button>
        <van-button color="#495ABE" @click="confirm">Next</van-button>
    </div>
    </div>
    
  </div>
</template>
<script>
import Vue from 'vue';
import { Toast } from 'vant'
import navTitle from '@/components/NavTitle/index'
import {  isLogin } from '@/utils/dashBoardTools'


Vue.use(Toast);

export default {
  name: 'exportAccount',
  data() {
    return {
      
    }
  },
  components: {
    "v-navTitle": navTitle,
  },
  
  methods: {
    confirm() {
      this.$router.push({
        path: `/overview`,
        query: {tabActive: 1},
      })
    },
    cancel() {
      Toast('cancel')
    },
  },
  created() {
    if (!isLogin()) {
      Toast('Need Login')
      return
    }
   },
}
</script>
<style lang="scss" scoped>
  @import 'index.scss';
  ::v-deep .van-button {
    padding: 0rem 1.2rem;
    margin-left: 20px;
  }
</style>
