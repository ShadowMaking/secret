<template>
  <div class="datalist-wrapper" v-if="dataList.length">
    <el-table
      :data="dataList"
      border
      style="width: 100%">
        <el-table-column
          fixed
          prop="createdAt"
          label="Add Time">
        </el-table-column>
        <el-table-column
          prop="name"
          label="Wallet Name">
        </el-table-column>
        <el-table-column
          prop="address"
          label="Signer Address/ENS">
        </el-table-column>
        <el-table-column
          prop="status"
          label="Operate">
            <template slot-scope="scope">
              <div v-if="scope.row.status == 1">
                <el-button @click="handleClick(scope.row, 'Agree')" type="text" size="small" class="sign-operate agree-btn">Agree</el-button>
                <el-button @click="handleClick(scope.row, 'Reject')" type="text" size="small" class="sign-operate ignore-btn">Reject</el-button>
              </div>
              <div v-if="scope.row.status == 2">
                <el-button @click="handleClick(scope.row)" type="text" size="small" class="sign-operate agree-btn">Recover</el-button>
                <el-button @click="handleClick(scope.row)" type="text" size="small" class="sign-operate ignore-btn">Ignore</el-button>
                <el-button @click="handleClick(scope.row)" type="text" size="small" class="sign-operate freeze-btn">Freeze</el-button>
              </div>
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
    handleClick(row, type) {
      switch(type) {
        case 'Agree':
          this.agreeStatus(row)
          break;
        case 'Reject':
          this.datesource = this.getXList(dateChange)
          break;
        default:
          break;
      }
    },
    agreeStatus(row) {
      
    }
  },
}
</script>
<style lang="scss" scoped>
  @import 'index.scss';
</style>
