<template>
  <div class="input-page">
    <div class="input-label">{{label}}</div>
    <div class="input-con">
      <el-autocomplete
        class="input-search-to"
        v-model="toAccount"
        :fetch-suggestions="inputChange"
        :placeholder="placeholder ? placeholder : ''" 
        :trigger-on-focus="false"
        @select="handleSelect"
      >
      </el-autocomplete>
    </div>
    <div class="right-content" v-if="isSupportHide">
      <div class="right-help">
        <el-popover
          placement="top-start"
          title=""
          width="200"
          trigger="hover"
          content="Complete the  transfer to the hidden address by entering the public key of the receiver, The recipient can view this transaction in Privacy-Stealth Address">
          <van-icon name="question-o" slot="reference"/>
        </el-popover>
        
      </div>
      <div class="right-bottom" @click="hideClick">
        <img src="~@/assets/eye.png" class="right-eye" v-show="!isHide">
        <img src="~@/assets/eye-close.png" class="right-eye" v-show="isHide">
        <label class="hide-text">Hide</label>
      </div>
    </div>
  </div>
  
</template>

<script>
import Vue from 'vue';
import { Field, Icon } from 'vant';
import { getInfoFromStorageByKey } from '@/utils/storage';

Vue.use(Field);
Vue.use(Icon);

export default {
  name: 'Input',
  props: ['label', 'placeholder', 'isSearch', 'isSupportHide'],
  data() {
    return {
      toAccount: '',
      isHide: false,
    }
  },
  methods: {
    async inputChange(value, cb) {
      var results = await this.searchUserByEmail(value)
      var showUserList = []
      for (var i = 0; i < results.length; i++) {
        showUserList.push({
          value: results[i].address 
        })
      }
      cb(showUserList);
      this.$emit('inputChange',{ value });
    },
    async searchUserByEmail(value) {
      if (!this.isSearch || value.indexOf("@gmail.com") < 0) {
        return []
      }
      var searchData = {
        userId: getInfoFromStorageByKey('gUID'),
        value: value
      }
      const { hasError, list } = await this.$store.dispatch('searchSigner', searchData);
      return list
    },
    handleSelect(value) {
      console.log(value)
      this.$emit('inputChange', value);
    },
    hideClick() {
      this.isHide = !(this.isHide)
      this.$emit('hideChange', this.isHide);
    },
  },
};
</script>
<style lang="scss" scoped>
  @import "index";
</style>
