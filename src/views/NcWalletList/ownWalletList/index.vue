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
          label="Create Time"
          :formatter="formatterTime">
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
        <el-table-column
          label="Operation">
            <template slot-scope="scope">
              <el-button @click="openSetting(scope.row)" type="text" size="small">Setting</el-button>
            </template>
        </el-table-column>
    </el-table>
    <van-popup v-model="showSettingPopup" class="setting-modal-popUp flex flex-center flex-column" closeable>
      <div class="setting-wallet-popup">
        <div class="setting-wallet-list">
          <div class="setting-wallet-item">
            <div class="setting-title">Payment Limit</div>
            <div class="setting-item-contet">
              <div class="setting-item-left">
                <div class="setting-left-row">
                  <p>Max per day</p>
                  <p><input type="number" v-model="maxPerDay"><label>ETH</label></p>
                </div>
                <div class="setting-left-row">
                  <p>Max per transaction</p>
                  <p><input type="number" v-model="maxPerTransaction"><label>ETH</label></p>
                </div>
              </div>
              <div class="setting-item-right">
                <el-button @click="paymentLimitSubmit()" size="small" class="limit-btn">Go</el-button>
              </div>
            </div>
          </div>
          <div class="setting-wallet-item">
            <div class="setting-title">Security Setting</div>
            <div class="setting-item-contet">
              <div class="setting-item-left">
                <div class="setting-left-row">
                  <p>Lock expiry</p>
                  <p><input type="number" v-model="lockExpiry"><label>H</label></p>
                </div>
                <div class="setting-left-row">
                  <p>Recovery expiry</p>
                  <p><input type="number" v-model="recoveryExpiry"><label>H</label></p>
                </div>
              </div>
              <div class="setting-item-right">
                <el-button @click="securitySetSubmit()" size="small" class="limit-btn">Go</el-button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </van-popup>
    <v-loadingPopup :show="showLoading" :showSpinner="false" />
  </div>
</template>
<script>
import Vue from 'vue';
import { Toast, Popup } from 'vant';
import { saveToStorage } from '@/utils/storage'
import { copyTxt, formatErrorContarct } from '@/utils/index';
import { walletStatus, securityModuleRouter, walletTransactionRouter } from '@/utils/global';
import { timeFormat } from '@/utils/str';
import web3 from 'web3'
import LoadingPopup from '@/components/LoadingPopup';
import { BigNumber } from "bignumber.js";

import SecurityModule from "@/assets/contractJSON/SecurityModule.json";
import TransactionModule from "@/assets/contractJSON/TransactionModule.json";
import { getContractAt, addTransHistory } from '@/utils/dashBoardTools'

Vue.use(Toast)
Vue.use(Popup)

export default {
  name: 'ownWalletList',
  props: ['dataList'],
  data() {
    return {
      walletStatus,
      securityModuleRouter,
      walletTransactionRouter,

      showSettingPopup: false,
      showLoading: false,

      maxPerDay: 15,
      maxPerTransaction: 10,

      lockExpiry: 48,
      recoveryExpiry: 48,

      settingWallet: '',
    }
  },
  components: {
    'v-loadingPopup': LoadingPopup,
  },
  methods: {
    formatterTime(row) {
      return timeFormat(row.createdAt, 'yyyy-MM-dd hh:mm:ss')
    },
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
    },
    async openSetting(row) {
      
      this.settingWallet = row.wallet_address
      let securityModuleContract = await getContractAt({ tokenAddress: this.securityModuleRouter, abi: SecurityModule.abi }, this)
      if (!securityModuleContract) {
        this.showSettingPopup = true
        return
      }
      securityModuleContract.getLockedSecurityPeriod(this.settingWallet).then(res => {
        console.log(res)
        this.lockExpiry = web3.utils.hexToNumber(res)/3600
      }).catch(error => {
        console.log(error)
        Toast('Invalid wallet')
      })
      
      securityModuleContract.getLockedSecurityPeriod(this.settingWallet).then(res => {
        console.log(res)
        this.recoveryExpiry = web3.utils.hexToNumber(res)/3600
      }).catch(error => {
        console.log(error)
      })

      let transactionModuleContract = await getContractAt({ tokenAddress: this.walletTransactionRouter, abi: TransactionModule.abi }, this)
      if (!transactionModuleContract) {
        this.showSettingPopup = true
        return
      }
      transactionModuleContract.getDailyUpbound(this.settingWallet).then(res => {
        let dailyWei = web3.utils.toBN(res).toString()
        this.maxPerDay = web3.utils.fromWei(dailyWei, 'ether')
      }).catch(error => {
        console.log(error)
        Toast('Invalid wallet')
      })
      
      transactionModuleContract.getLargeAmountPayment(this.settingWallet).then(res => {
        let perTransWei =  web3.utils.toBN(res).toString()
        this.maxPerTransaction = web3.utils.fromWei(perTransWei, 'ether')
        this.showSettingPopup = true
      }).catch(error => {
        console.log(error)
      })
      
    },
    async paymentLimitSubmit() {
      if (!this.maxPerDay || !this.maxPerTransaction) {
        Toast('Invalid Value')
        return
      }
      this.showLoading = true
      let transactionModuleContract = await getContractAt({ tokenAddress: this.walletTransactionRouter, abi: TransactionModule.abi }, this)
      let dailyWei = web3.utils.toWei(this.maxPerDay, 'ether')
      let perTransWei = web3.utils.toWei(this.maxPerTransaction, 'ether')
      transactionModuleContract.setTMParametar(this.settingWallet, web3.utils.toHex(dailyWei), web3.utils.toHex(perTransWei)).then(tx => {
        this.showLoading = false
        Toast('Submitted Success')
        console.log(tx)
        addTransHistory(tx, 'Payment Limit', this)
        tx.wait().then(async res=>{
          console.log(res)
        }).catch(error => {
          console.log(error)
        })
      }).catch(error => {
        console.log(error)
        this.showLoading = false
        let errorValue = formatErrorContarct(error)
        if(errorValue == 'failed') {errorValue = 'must change at least one parametar'}
        Toast(errorValue)
      })
    },
    async securitySetSubmit() {
      if (!this.lockExpiry || !this.recoveryExpiry) {
        Toast('Invalid Value')
        return
      }
      this.showLoading = true
      let securityModuleContract = await getContractAt({ tokenAddress: this.securityModuleRouter, abi: SecurityModule.abi }, this)
      console.log(web3.utils.toHex(this.lockExpiry))
      securityModuleContract.setSecurityPeriod(this.settingWallet, web3.utils.toHex(this.lockExpiry * 3600), web3.utils.toHex(this.recoveryExpiry * 3600)).then(tx => {
        this.showLoading = false
        Toast('Submitted Success')
        console.log(tx)
        addTransHistory(tx, 'Security Setting', this)
        tx.wait().then(async res=>{
          console.log(res)
        }).catch(error => {
          console.log(error)
        })
      }).catch(error => {
        console.log(error)
        this.showLoading = false
        let errorValue = formatErrorContarct(error)
        if(!errorValue) {errorValue = 'failed'}
        Toast(errorValue)
      })
    },
  },
}
</script>
<style lang="scss" scoped>
  @import 'index.scss';
  .el-table tr { background: #eff1f8;}
  ::v-deep .van-popup__close-icon--top-right {
    top: 6px;
  }
</style>
