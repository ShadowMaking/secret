<template>
  <div class="signManage-page">
    <v-navTitle title="Signer" :backIcon="true"></v-navTitle >
    <div class="sign-manage-des">Non-custodial Wallet is the most reliable asset management method. It confirms each transaction by setting up one or more signers to make asset transactions more secure.</div>
    <div class="signlist-wrapper" v-if="signList.length">
      <el-table
        :data="signList"
        border
        style="width: 100%">
          <el-table-column
            fixed
            prop="CreateTime"
            label="Add Time">
          </el-table-column>
          <el-table-column
            prop="WalletName"
            label="Name">
          </el-table-column>
          <el-table-column
            prop="Address"
            label="Signer Address/ENS">
          </el-table-column>
          <el-table-column
            prop="State"
            label="State">
            <template slot-scope="scope">
              <div v-if="scope.row.State == 1">
                <el-tag>To be confirmed</el-tag>
              </div>
              <div v-else-if="scope.row.State == 2">
                <el-tag type="danger">Rejected</el-tag>
              </div>
              <div v-else-if="scope.row.State == 2">
                <el-tag type="success">Active</el-tag>
              </div>
              <div v-else>
                <el-tag type="info">Freeze</el-tag>
              </div>
            </template>
          </el-table-column>
          <el-table-column
            label="Operate">
              <template slot-scope="scope">
                <el-button @click="deleteSigner(scope.row)" type="text" size="small">Delete</el-button>
              </template>
          </el-table-column>
      </el-table>
      <div class="add-signer-box">
        <v-searchSignerModal
          :dataSource="searchSignerList"
          @confirm="confirmSearchSigner" />
      </div>
      <div class="add-signer-tip">Any transaction requires the confirmation of: {{signerPercent}} out of {{signerTotal}} signer(s)</div>
    </div>
    
  </div>
</template>
<script>
import Vue from 'vue';
import { Toast } from 'vant'
import navTitle from '@/components/NavTitle/index'
import searchSignerModal from '@/components/SearchSignerModal/index'
import {  isLogin } from '@/utils/dashBoardTools'
import { getFromStorage } from '@/utils/storage'

Vue.use(Toast);

export default {
  name: 'signManage',
  props: ['id'],
  data() {
    return {
      signList: [],

      searchSignerList: [],

      signerPercent: 0,
      signerTotal: 0,
      
      userId: getFromStorage('gUID'),
    }
  },
  components: {
    "v-navTitle": navTitle,
    "v-searchSignerModal": searchSignerModal,
  },
  
  methods: {
    deleteSigner(row) {

    },
    confirmSearchSigner() {

    },
    async getSignerListByid() {
      let data = {
        userId: this.userId,
        walletId: this.$route.params.id
      }
      const { hasError, list } = await this.$store.dispatch('getSignerList', {...data})
      this.signList = list
    },
  },
  created() {
    if (!isLogin()) {
      Toast('Need Login')
      return
    }
    this.getSignerListByid()
  },
}
</script>
<style lang="scss" scoped>
  @import 'index.scss';
</style>
