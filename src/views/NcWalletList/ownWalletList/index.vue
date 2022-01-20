<template>
  <div class="datalist-wrapper" v-if="dataList.length">
    <el-table
      :data="dataList"
      style="width: 100%"
      empty-text="no data"
      :header-cell-style="{background:'#eff1f8'}">
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
            prop="status"
            label="State"
            >
            <template slot-scope="scope">
              <div v-if="scope.row.wallet_status == walletStatus['Creating']">
                <el-tag>Creating</el-tag>
              </div>
              <div v-else-if="scope.row.wallet_status == walletStatus['Active']">
                <el-tag type="success">Active</el-tag>
              </div>
              <div v-else-if="scope.row.wallet_status == walletStatus['Fail']">
                <el-tag type="danger">Fail</el-tag>
              </div>
              <div v-else-if="scope.row.wallet_status == walletStatus['Freezing']">
                <el-tag>Freezing</el-tag>
              </div>
              <div v-else-if="scope.row.wallet_status == walletStatus['Frozen']">
                <el-tag type="info">Frozen</el-tag>
              </div>
              <div v-else-if="scope.row.wallet_status == walletStatus['Recovering']">
                <el-tag>Recovering</el-tag>
              </div>
              <div v-else-if="scope.row.wallet_status == walletStatus['Unlocking']">
                <el-tag>Unlocking</el-tag>
              </div>
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
import { walletStatus } from '@/utils/global';

Vue.use(Toast)

export default {
  name: 'ownWalletList',
  props: ['dataList'],
  data() {
    return {
      walletStatus,
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
  .el-table tr { background: #eff1f8;}
</style>
