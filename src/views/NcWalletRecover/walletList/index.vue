<template>
  <div class="wallet-list-page" >
    <p class="wallet-des">Click the Multisig Wallet that has been backed up to recover</p>
    <div v-if="walletList.length">
    <el-table
      :data="walletList"
      style="width: 100%"
      empty-text="no data"
      :header-cell-style="{background:'#eff1f8'}" >
        <el-table-column
          fixed
          prop="createdAt"
          label="Create Time"
          :formatter="formatterTime">
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
              <a @click="signClick(scope.row)" style="color: #409EFF">{{scope.row.signer_count}}</a>
            </template>
        </el-table-column>
        <el-table-column
          label="Operation">
            <template slot-scope="scope">
              <a @click="recoveryClick(scope.row)" style="color: #409EFF">Recovery</a>
            </template>
        </el-table-column>
    </el-table>
    </div>
    <div v-if="!showLoading && walletList.length==0" class="no-data-container">
      <v-none />
    </div>
    <v-loading v-show="showLoading" />
  </div>
</template>

<script>
import Vue from 'vue'
import { Toast } from 'vant'
import { isLogin, getBalanceByAddress, getContractAt,getConnectedAddress} from '@/utils/dashBoardTools';
import { getFromStorage, saveToStorage } from '@/utils/storage'
import None from '@/components/None/index'
import Loading from '@/components/Loading'
import { walletStatus, securityModuleRouter } from '@/utils/global';
import SecurityModule from "@/assets/contractJSON/SecurityModule.json";
import { timeFormat } from '@/utils/str';

Vue.use(Toast);

export default {
  name: 'Wallet-Recover-list',
  data() {
    return {
      walletList: [],
      userId: getFromStorage('gUID'),

      showLoading: true,
      walletStatus,

      securityModuleRouter,
      securityModuleContract: null,
    }
  },
  components: {
    'v-none': None,
    'v-loading': Loading,
  },
  methods: {
    formatterTime(row) {
      return timeFormat(row.createdAt, 'yyyy-MM-dd hh:mm:ss')
    },
    signClick(row) {
      saveToStorage({ 'currentWallet': row.wallet_address });
      this.$router.push({
        path: `/signManage/${row.wallet_id}`,
        query: {
          isRecover: true
        }
      })
    },
    async recoveryClick(row) {
      if (row.wallet_status == walletStatus['Active'] ||
        row.wallet_status == walletStatus['Recovering'] ||
        row.wallet_status == walletStatus['Frozen']) {
        
        if (!this.securityModuleContract) {
          this.securityModuleContract = await getContractAt({ tokenAddress: this.securityModuleRouter, abi: SecurityModule.abi }, this)
        }
        let isSigner = await this.securityModuleContract.isSigner(row.wallet_address, getConnectedAddress())
        if (isSigner) {
          Toast('Signer Cannot Recover Wallet')
        } else {
          this.$emit('recoverChild', row);
        }
      } else {
        Toast('Wallet is Unavailable')
      }
      
    },
    async getWalletList() {
      let data = {
        userId: this.userId
      }
      const { hasError, list } = await this.$store.dispatch('getWalletList', data)
      // for(let i=0; i<list.length;i+=1) {
      //   let itemBalance = await this.getBalance(list[i].wallet_address)
      //   list[i]['balance'] = itemBalance
      // }
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
  async created() {
    if (!isLogin()) {
      Toast('Need Login')
      return
    }
    this.securityModuleContract = await getContractAt({ tokenAddress: this.securityModuleRouter, abi: SecurityModule.abi }, this)
    this.getWalletList()
  },
};
</script>
<style lang="scss" scoped>
  @import "index";
</style>