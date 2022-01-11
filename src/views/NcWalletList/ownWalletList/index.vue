<template>
  <div class="datalist-wrapper" v-if="dataList.length">
    <el-table
      :data="dataList"
      border
      style="width: 100%"
      empty-text="no data">
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
          prop="wallet_address"
          label="Address">
          <template slot-scope="scope">
              <span @click="copyAddress(scope.row.wallet_address)">{{scope.row.wallet_address}}</span>
          </template>
        </el-table-column>
        <el-table-column
          label="Signer">
            <template slot-scope="scope">
              <el-button @click="handleClick(scope.row)" type="text" size="small">Details</el-button>
            </template>
        </el-table-column>
    </el-table>
  </div>
</template>
<script>
import Vue from 'vue';
import { Toast } from 'vant';
import { saveToStorage } from '@/utils/storage'
import { copyTxt } from '@/utils/index';

Vue.use(Toast)

export default {
  name: 'ownWalletList',
  props: ['dataList'],
  data() {
    return {
      
    }
  },
  
  methods: {
    copyAddress(str) {
      if (copyTxt(str)) {
        Toast.success('Copied');
      }
    },
    handleClick(row) {
      saveToStorage({ 'currentWallet': row.wallet_address });
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
