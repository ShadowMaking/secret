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
                  <p><input type="text" v-model="maxPerDay"><label>ETH</label></p>
                </div>
                <div class="setting-left-row">
                  <p>Max per transaction</p>
                  <p><input type="text" v-model="maxPerTransaction"><label>ETH</label></p>
                </div>
              </div>
              <div class="setting-item-right">
                <el-button @click="paymentLimitSubmit()" size="small" class="limit-btn">Go</el-button>
              </div>
            </div>
          </div>
          <div class="setting-wallet-item">
            <div class="setting-title">Security setting</div>
            <div class="setting-item-contet">
              <div class="setting-item-left">
                <div class="setting-left-row">
                  <p>Lock expiry</p>
                  <p><input type="text" v-model="lockExpiry"><label>H</label></p>
                </div>
                <div class="setting-left-row">
                  <p>Recovery expiry</p>
                  <p><input type="text" v-model="recoveryExpiry"><label>H</label></p>
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
  </div>
</template>
<script>
import Vue from 'vue';
import { Toast, Popup } from 'vant';
import { saveToStorage } from '@/utils/storage'
import { copyTxt } from '@/utils/index';
import { walletStatus } from '@/utils/global';
import { timeFormat } from '@/utils/str';

Vue.use(Toast)
Vue.use(Popup)

export default {
  name: 'ownWalletList',
  props: ['dataList'],
  data() {
    return {
      walletStatus,

      showSettingPopup: false,
      maxPerDay: 5,
      maxPerTransaction: 5,
      lockExpiry: 48,
      recoveryExpiry: 48,
      settingWallet: '',
    }
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
    openSetting(row) {
      this.showSettingPopup = true
      this.settingWallet = row.wallet_address
    },
    paymentLimitSubmit() {
      
    },
    securitySetSubmit() {

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
