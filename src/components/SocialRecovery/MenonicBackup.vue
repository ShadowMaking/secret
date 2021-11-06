<template>
  <div class="create-wallet-step2">
    <div class="conform-menonic">
      <span class="tip" style="display:none">请按顺序点击助记词，以确认您正确备份</span>
      <div class="menonic-selected">
        <ul>
          <li v-for="(item,index) in menonicList" :key="index">
            <van-tag color="#ccc" text-color="#333" size="large" plain class="mnemonicItem">{{item}}</van-tag>
          </li>
        </ul>
      </div>
      <div class="menonic-messy">
        <ul>
          <li
            v-for="(item,index) in menonicListForOutOfOrder"
            :key="index"
            @click="handleCheckMnemonicItem(item)"
            :class="[{'disabled': isSelected(item)}]">
            <van-tag color="#ccc" text-color="#333" size="large" plain class="mnemonicItem" >{{item}}</van-tag>
          </li>
        </ul>
      </div>
      <div class="opt-wrapper">
        <van-button block color="#495ABE" @click="confirm" :disabled="menonicList.length<12 || !checkedMnemonic()">下一步</van-button>
      </div>
    </div>
  </div>
</template>
<script>
import Vue from 'vue';
import { Button, Toast  } from 'vant';
import _ from 'lodash'

Vue.use(Button);
Vue.use(Toast);

export default {
  name: 'memonicConfirm',
  props: ['sourceData'],
  data() {
    return{
      menonicList: [],
    }
  },
  computed: {
    menonicListForOutOfOrder() {
      // random for array
      return _.shuffle(_.cloneDeep(this.sourceData).reverse())
    },
  
  },
  methods: {
    confirm() {
      // 验证助记词顺序是否正确
      if (this.checkedMnemonic()) {
        this.$emit('childEvent');
      } else {
        Toast('检查助记词顺序');
      }
    },
    // 点选助记词
    handleCheckMnemonicItem(record) {
      if (this.menonicList.includes(record)) {
        return
      }
      this.menonicList = [].concat(this.menonicList, [record])
    },
    isSelected(value) {
      return this.menonicList.some(item => {
        return item === value
      })
    },
    checkedMnemonic() {
      return _.isEqual(this.menonicList, this.sourceData)
    },
  },
}
</script>
<style lang="scss" scoped>
  @import 'index';
</style>
