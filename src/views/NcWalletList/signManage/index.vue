<template>
  <div class="signManage-page">
    <v-navTitle title="Signer" :backIcon="true" :backEvent="backEvent"></v-navTitle >
    <div class="sign-manage-des">Non-custodial Wallet is the most reliable asset management method. It confirms each transaction by setting up one or more signers to make asset transactions more secure.</div>
    <div class="signlist-wrapper" v-if="signList.length">
      <el-table
        :data="signList"
        border
        style="width: 100%"
        empty-text="no data">
          <el-table-column
            fixed
            prop="createdAt"
            label="Add Time">
          </el-table-column>
          <el-table-column
            prop="name"
            label="Name">
          </el-table-column>
          <el-table-column
            prop="address"
            label="Signer Address/ENS">
          </el-table-column>
          <el-table-column
            prop="status"
            label="State"
            v-if="!isRecover">
            <template slot-scope="scope">
              <div v-if="scope.row.status == signerStatus['confirmed']">
                <el-tag>To be confirmed</el-tag>
              </div>
              <div v-else-if="scope.row.status == signerStatus['rejected']">
                <el-tag type="danger">Rejected</el-tag>
              </div>
              <div v-else-if="scope.row.status == signerStatus['freeze']">
                <el-tag type="info">Freeze</el-tag>
              </div>
              <div v-else>
                <el-tag type="success">Active</el-tag>
              </div>
            </template>
          </el-table-column>
          <el-table-column
            label="Operate"
            v-if="!isRecover">
              <template slot-scope="scope">
                <el-button @click="deleteSigner(scope.row)" type="text" size="small">Delete</el-button>
              </template>
          </el-table-column>
      </el-table>
      <div class="add-signer-box" v-if="!isRecover">
        <v-searchSignerModal
          :dataSource="searchSignerList"
          @confirm="confirmSearchSigner"
          @addConfirm="confirmAddSigner" 
          v-if="!isHasFreeze"/>
      </div>
      <div class="add-signer-tip">Any transaction requires the confirmation of: {{signerPercent}} out of {{signerTotal}} signer(s)</div>
      <van-popup v-model="showLoading" round :close-on-click-overlay="false" class="waiting-modal flex flex-center flex-column">
        <div class="inner-wrapper">
          <van-loading type="spinner" />
        </div>
      </van-popup>
    </div>
    
  </div>
</template>
<script>
import Vue from 'vue';
import { Toast, Loading, Dialog } from 'vant'
import navTitle from '@/components/NavTitle/index'
import searchSignerModal from '@/components/SearchSignerModal/index'
import {  isLogin, getContractAt } from '@/utils/dashBoardTools'
import { getFromStorage, removeFromStorage } from '@/utils/storage'
import SecurityModule from "@/assets/contractJSON/SecurityModule.json";
import { signerStatus, securityModuleRouter } from '@/utils/global';

Vue.use(Toast);
Vue.use(Loading);
Vue.use(Dialog);

export default {
  name: 'signManage',
  props: ['id'],
  data() {
    return {
      signList: [],
      searchSignerList: [],
      signerStatus,

      signerPercent: 0,
      signerTotal: 0,
      
      userId: getFromStorage('gUID'),
      walletAddress: getFromStorage('currentWallet'),
      isHasFreeze: false,
      showLoading: false,
      isRecover: false,

      securityModuleRouter,
      securityModuleContract: null,
    }
  },
  components: {
    "v-navTitle": navTitle,
    "v-searchSignerModal": searchSignerModal,
  },
  
  methods: {
    backEvent() {
      removeFromStorage(['currentWallet'])
      this.$router.go(-1)
    },
    deleteSigner(row) {
      Dialog.confirm({
        message: 'Are you sure to delete this address?',
        confirmButtonText: 'Confirm',
        confirmButtonColor: '#4375f1',
        cancelButtonText: 'Cancel'
      })
      .then(() => {
        this.confirmDeleteSigner(row)
      })
      .catch(() => {
        console.log('cancel')
      });
    },
    async confirmDeleteSigner(row) {
      console.log(row)
      this.showLoading = true
      let tx = await this.securityModuleContract.removeSigner(
      this.walletAddress, row.address)
      console.log(tx)
      const txwait = await tx.wait()
      console.log(txwait)
      this.deleteSignerSubmit(row);
    },
    async deleteSignerSubmit(row) {//todo
      let deleteData = {
        userId: this.userId,
        walletId: this.$route.params.id,
        signerAddress: row.address,
      }
      const { hasError, list } = await this.$store.dispatch('deleteSigner', {...deleteData});
      this.showLoading = false
      if (hasError) {
        Toast.fail('Delete Failed')
      } else {
        Toast('Delete success')
        this.getSignerListByid()
      }
    },
    async confirmSearchSigner(value) {
      var searchData = {
        userId: this.userId,
        value: value
      }
      const { hasError, list } = await this.$store.dispatch('searchSigner', searchData);
      this.searchSignerList = list
    },
    async confirmAddSigner(address) {
     if (!address) {
        Toast('Need Choose Signer')
        return
      }
      this.showLoading = true
      let tx = await this.securityModuleContract.addSigner(
      this.walletAddress, address)
      console.log(tx)
      const txwait = await tx.wait()
      this.addSignerSubmit(address);
    }, 
    async addSignerSubmit(address) {
      let addData = {
        userId: this.userId,
        walletId: this.$route.params.id,
        address: address.toLocaleLowerCase(),
        name: 'signer'
      }
      const { hasError, list } = await this.$store.dispatch('addSigner', {...addData});
      this.showLoading = false
      if (hasError) {
        Toast.fail('Create Failed')
      } else {
        Toast('Create success')
        this.getSignerListByid()
      }
    },
    async getSignerListByid() {
      let data = {
        userId: this.userId,
        walletId: this.$route.params.id
      }
      const { hasError, list } = await this.$store.dispatch('getSignerList', {...data})
      this.signList = list
      this.signerTotal = list.length
      this.signerPercent = Math.ceil(this.signerTotal/2)
      // this.getIsFreeze(list)
    },
    async getIsFreeze(list) {//todo判断是否isHasFreeze
      
      for(let i=0; i<list.length;i+=1) {
        if (list[i].status == 1) {
          // let walletAddress = await this.securityModuleContract.isSigner('0x5EDF4660113d32bbB94D8ac1a5B815f4BfeB2863',list[i].address)
          // console.log(walletAddress)
        }
      }
    },
  },
  async created() {
    if (!isLogin()) {
      Toast('Need Login')
      return
    }
    this.isRecover = this.$route.query.isRecover
    this.getSignerListByid()

    this.securityModuleContract = await getContractAt({ tokenAddress: this.securityModuleRouter, abi: SecurityModule.abi }, this)
    const signerin = await this.securityModuleContract.getSigners(this.walletAddress)
    console.log(signerin)
  },
}
</script>
<style lang="scss" scoped>
  @import 'index.scss';
</style>
