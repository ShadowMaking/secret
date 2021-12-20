<template>
  <div class="datalist-wrapper" v-if="dataList.length">
    <el-table
      :data="dataList"
      border
      style="width: 100%">
        <el-table-column
          fixed
          prop="CreateTime"
          label="Add Time">
        </el-table-column>
        <el-table-column
          prop="WalletName"
          label="Wallet Name">
        </el-table-column>
        <el-table-column
          prop="Address"
          label="Signer Address/ENS">
        </el-table-column>
        <el-table-column
          label="Operate">
            <template slot-scope="scope">
              <el-button @click="handleClick(scope.row)" type="text" size="small" class="sign-operate agree-btn">Recover</el-button>
              <el-button @click="handleClick(scope.row)" type="text" size="small" class="sign-operate ignore-btn">Ignore</el-button>
              <el-button @click="handleClick(scope.row)" type="text" size="small" class="sign-operate freeze-btn">Freeze</el-button>
            </template>
        </el-table-column>
    </el-table>
  </div>
</template>
<script>
import Vue from 'vue';

export default {
  name: 'signWalletList',
  props: ['dataList'],
  data() {
    return {
      
    }
  },
  
  methods: {
    
  },
}
</script>
<style lang="scss" scoped>
  @import 'index.scss';
</style>
