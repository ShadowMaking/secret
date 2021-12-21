<template>
  <div class="ncWalletCreate-page content-box">
    <v-navTitle title="Create NC-Wallet"></v-navTitle>
    <div class="create-wallet-container content-page">
      <p class="create-title">Non-custodial Wallet</p>
      <p class="create-des">Non-custodial Wallet is the most reliable asset management method. It confirms each transaction by setting up one or more guardians to make asset transactions more secure.</p>
      <p class="create-des" style="margin-top: 15px;">Quickly create a Non-custodial Wallet:</p>
      <div class="create-wallet-form">
        <el-form label-position="left">
          <el-form-item label="Set Wallet Name" label-width="130px">
            <el-input v-model="createWalletName"></el-input>
          </el-form-item>
          <el-form-item label="Set Signer">
            <el-table :data="createSignerList" border style="width: 100%" v-if="createSignerList.length">
                <el-table-column fixed prop="AddTime" label="Add Time"></el-table-column>
                <el-table-column fixed prop="Name" label="Name"></el-table-column>
                <el-table-column fixed prop="Name" label="Signer Address/ENS"></el-table-column>
            </el-table>
          </el-form-item>
        </el-form>
        <v-searchSignerModal
              :dataSource="searchSignerList"
              @confirm="confirmSearchSigner" />
            <div class="add-signer-tip">Any transaction requires the confirmation of: {{signerPercent}} out of {{signerTotal}} signer(s)</div>
        <div class="create-btn-box">
          <a class="common-form-btn" @click="createSubmit">Create</a>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import Vue from 'vue'
import { Tab, Tabs} from 'vant'
import navTitle from '@/components/NavTitle/index'
import searchSignerModal from '@/components/SearchSignerModal/index'

Vue.use(Tab);
Vue.use(Tabs);

export default {
  name: 'NC-Wallet',
  data() {
    return {
      createWalletName: '',
      createSignerList: [],
      signerTotal: 0,
      signerPercent: 0,

      searchSignerList: [],
    }
  },
  components: {
    "v-navTitle": navTitle,
    "v-searchSignerModal": searchSignerModal,
  },
  methods: {
    confirmSearchSigner() {
      console.log('confirm')
    },
    createSubmit() {

    },
  },
  created() {
    
  },
};
</script>
<style lang="scss" scoped>
  @import "index";
  ::v-deep .el-form-item__label {
    font-weight: bold;
    font-size: 0.96rem;
  }
</style>