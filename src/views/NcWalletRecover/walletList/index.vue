<template>
  <div class="wallet-list-page" v-if="walletList.length">
    <el-table
      :data="walletList"
      border
      style="width: 100%">
        <el-table-column
          fixed
          prop="createTime"
          label="Create Time">
        </el-table-column>
        <el-table-column
          prop="walletName"
          label="Name">
        </el-table-column>
        <el-table-column
          prop="balance"
          label="Balance">
        </el-table-column>
        <el-table-column
          label="Signer">
            <template slot-scope="scope">
              <el-button @click="signClick(scope.row)" type="text" size="small">Signer</el-button>
            </template>
        </el-table-column>
        <el-table-column
          label="Signer">
            <template slot-scope="scope">
              <el-button @click="recoveryClick(scope.row)" type="text" size="small">Recovery</el-button>
            </template>
        </el-table-column>
    </el-table>
  </div>
</template>

<script>
import Vue from 'vue'
import { Toast } from 'vant'
import { isLogin } from '@/utils/dashBoardTools';

Vue.use(Toast);

export default {
  name: 'Wallet-Recover-list',
  data() {
    return {
      walletList: [],
    }
  },
  methods: {
    signClick() {},
    recoveryClick() {},
    getWalletList() {
      
    },
  },
  created() {
    if (!isLogin()) {
      Toast('Need Login')
      return
    }
    this.getWalletList()
  },
};
</script>
<style lang="scss" scoped>
  @import "index";
</style>