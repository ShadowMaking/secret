<template>
  <div class="wallet-list-page" >
    <p class="wallet-des">Click the NC-Wallet that has been backed up to recover</p>
    <div v-if="walletList.length">
    <el-table
      :data="walletList"
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
          label="Operate">
            <template slot-scope="scope">
              <el-button @click="recoveryClick(scope.row)" type="text" size="small">Recovery</el-button>
            </template>
        </el-table-column>
    </el-table>
    </div>
    <v-none v-if="!showLoading && walletList.length==0" />
    <v-loading v-show="showLoading" />
  </div>
</template>

<script>
import Vue from 'vue'
import { Toast } from 'vant'
import { isLogin, getBalanceByAddress} from '@/utils/dashBoardTools';
import { getFromStorage, saveToStorage } from '@/utils/storage'
import None from '@/components/None/index'
import Loading from '@/components/Loading'

Vue.use(Toast);

export default {
  name: 'Wallet-Recover-list',
  data() {
    return {
      walletList: [],
      userId: getFromStorage('gUID'),

      showLoading: false,
    }
  },
  components: {
    'v-none': None,
    'v-loading': Loading,
  },
  methods: {
    signClick(row) {
      saveToStorage({ 'currentWallet': row.wallet_address });
      this.$router.push({
        path: `/signManage/${row.wallet_id}`,
        query: {
          isRecover: true
        }
      })
    },
    recoveryClick() {
      this.$emit('recoverChild');
    },
    async getWalletList() {
      let data = {
        userId: this.userId
      }
      const { hasError, list } = await this.$store.dispatch('getWalletList', data)
      for(let i=0; i<list.length;i+=1) {
        let itemBalance = await this.getBalance(list[i].wallet_address)
        list[i]['balance'] = itemBalance
      }
      this.walletList = list
      if (hasError) {
        this.showLoading = true
      } else {
        this.showLoading = false
      }
    },
    async getBalance(address) {
      const balanceString = await getBalanceByAddress(address)
      return balanceString
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