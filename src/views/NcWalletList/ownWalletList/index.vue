<template>
  <div class="datalist-wrapper" v-if="dataList.length">
    <el-table
      :data="dataList"
      border
      style="width: 100%">
        <el-table-column
          fixed
          prop="createdAt"
          label="Create Time">
        </el-table-column>
        <el-table-column
          prop="name"
          label="Wallet Name">
        </el-table-column>
        <el-table-column
          prop="balance"
          label="Balance">
        </el-table-column>
        <el-table-column
          prop="address"
          label="Address">
        </el-table-column>
        <el-table-column
          label="Signer">
            <template slot-scope="scope">
              <el-button @click="handleClick(scope.row)" type="text" size="small">Manage</el-button>
            </template>
        </el-table-column>
    </el-table>
  </div>
</template>
<script>
import Vue from 'vue';
import { saveToStorage } from '@/utils/storage'

export default {
  name: 'ownWalletList',
  props: ['dataList'],
  data() {
    return {
      
    }
  },
  
  methods: {
    handleClick(row) {
      saveToStorage({ 'currentWallet': row.address });
      this.$router.push({
        path: `/signManage/${row.wallet_id}`,
      })
    }
  },
}
</script>
<style lang="scss" scoped>
  @import 'index.scss';
</style>
