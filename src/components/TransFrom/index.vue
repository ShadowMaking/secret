<template>
    <div class="send-from">
      <h3 class="send-from-title">From</h3>
      <div class="send-from-list">
        <el-select 
          v-model="fromVal" 
          placeholder="Choose" 
          style="width: 100%"
          @change="selectChange">
          <el-option-group
            v-for="group in fromOptions"
            :key="group.label"
            :label="group.label">
            <el-option
              v-for="item in group.options"
              :key="item.value"
              :label="item.label"
              :value="item.value">
            </el-option>
          </el-option-group>
        </el-select>
      </div>
    </div>
</template>

<script>
import Vue from 'vue';

export default {
  name: 'selectItem',
  data(){
    return { 
      fromOptions: [{
        label: '',
        options: [{
          value: 'shanghai',
          label: 'shanghai'
        }]
      },{
        label: 'Multisig Wallet',
        options: [{
          value: 'chengdu',
          label: 'chengdu'
        },{
          value: 'beijing',
          label: 'beijing'
        }]
      }],
      fromVal: '', 
    }
  },
  methods: {
    selectChange(value) {
      this.$emit('transFromChange', {value});
    },
  },
};
</script>
<style lang="scss" scoped>
  @import "index";
</style>
