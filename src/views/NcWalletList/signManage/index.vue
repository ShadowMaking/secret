<template>
  <div class="signManage-page">
    <v-navTitle title="Signer"></v-navTitle >
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
import navTitle from '@/components/NavTitle/index'
import searchSignerModal from '@/components/SearchSignerModal/index'

export default {
  name: 'signManage',
  data() {
    return {
      signList: [{
        CreateTime:1,
        WalletName: 2,
        Balance: 3,
        Address: 4,
        State: 5,
        id: 1,
      }],

      searchSignerList: [],

      signerPercent: 0,
      signerTotal: 0,
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
  },
}
</script>
<style lang="scss" scoped>
  @import 'index.scss';
</style>
