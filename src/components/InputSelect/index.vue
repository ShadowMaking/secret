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
  </div>
  
</template>

<script>
import Vue from 'vue';
import { Field } from 'vant';
import { getInfoFromStorageByKey } from '@/utils/storage';

Vue.use(Field);

export default {
  name: 'Input',
  props: ['label', 'placeholder', 'isSearch'],
  data() {
    return {
      toAccount: '',
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
  },
};
</script>
<style lang="scss" scoped>
  @import "index";
</style>
