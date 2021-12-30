<template>
  <div class="datalist-wrapper" v-if="dataList.length">
    <el-table
      :data="dataList"
      border
      style="width: 100%"
      empty-text="no data"
      >
        <el-table-column
          fixed
          prop="createdAt"
          label="Add Time">
        </el-table-column>
        <el-table-column
          prop="name"
          label="Wallet Name">
        </el-table-column>
        <el-table-column
          prop="wallet_address"
          label="Wallet Address">
        </el-table-column>
        <el-table-column
          prop="status"
          label="Operate">
            <template slot-scope="scope">
              <div v-if="scope.row.status == signerStatus['confirmed']">
                <el-button @click="handleClick(scope.row, 'Agree')" type="text" size="small" class="sign-operate agree-btn">Agree</el-button>
                <el-button @click="handleClick(scope.row, 'Reject')" type="text" size="small" class="sign-operate ignore-btn">Reject</el-button>
              </div>
              <!-- <div v-if="scope.row.status == 2">
                <el-button @click="handleClick(scope.row)" type="text" size="small" class="sign-operate agree-btn">Recover</el-button>
                <el-button @click="handleClick(scope.row)" type="text" size="small" class="sign-operate ignore-btn">Ignore</el-button>
                <el-button @click="handleClick(scope.row)" type="text" size="small" class="sign-operate freeze-btn">Freeze</el-button>
              </div> -->
              <div v-if="scope.row.status == signerStatus['active']">
                <el-button @click="handleClick(scope.row, 'Freeze')" type="text" size="small" class="sign-operate freeze-btn">Freeze</el-button>
                <el-button @click="handleClick(scope.row, 'Recover')" type="text" size="small" class="sign-operate agree-btn">Recover</el-button><!-- test -->
              </div>
              <div v-if="scope.row.status == signerStatus['freeze']">
                <span style="color:red">Has been freeze</span>
              </div>
            </template>
        </el-table-column>
    </el-table>
    <van-popup v-model="showLoading" round :close-on-click-overlay="false" class="waiting-modal flex flex-center flex-column">
      <div class="inner-wrapper">
        <van-loading type="spinner" />
      </div>
    </van-popup>
  </div>
</template>
<script>
import Vue from 'vue';
import { ethers } from 'ethers'
import { Toast, Loading, Popup, Dialog } from 'vant'
import { getFromStorage } from '@/utils/storage';
import SecurityModule from "@/assets/contractJSON/SecurityModule.json";
import {  getContractAt, getConnectedAddress, getContractWallet } from '@/utils/dashBoardTools'
import WalletJson from "@/assets/contractJSON/Wallet.json";
import { signerStatus } from '@/utils/global';

Vue.use(Toast);
Vue.use(Loading);
Vue.use(Popup);
Vue.use(Dialog);

export default {
  name: 'signWalletList',
  props: ['dataList'],
  data() {
    return {
      userId: getFromStorage('gUID'),
      showLoading: false,

      securityModuleRouter: '0x17708F66E60Eb7090aF70628596b6780C2B4F0ea',
      securityModuleContract: null,
      
      signerStatus,


      // testData: [{
      //   createdAt: '2021-12-30',
      //   name: 'wallet12',
      //   wallet_address: '0xddbfef6cac565722414756213bcff01582fb0351',
      // }]
    }
  },
  
  methods: {
    handleClick(row, type) {
      switch(type) {
        case 'Agree':
          this.openDialog('Are you sure to agree?', row, this.signerStatus['active'])
          break;
        case 'Reject':
          this.openDialog('Are you sure to reject?', row, this.signerStatus['rejected'])
          break;
        case 'Freeze':
          this.openDialog('Are you sure to freeze?', row, this.signerStatus['freeze'], true)
          break;
        case 'Recover':
          this.openDialog('Are you sure to Recover?', row, this.signerStatus['active'], true)
          break;
        default:
          break;
      }
    },
    openDialog(title, row, status, isContaract) {
      Dialog.confirm({
        message: title,
        confirmButtonText: 'Confirm',
        confirmButtonColor: '#4375f1',
        cancelButtonText: 'Cancel'
      })
      .then(() => {
        this.showLoading = true;
        this.changeSignerStatus(row, status, isContaract)
      })
      .catch((error) => {
        this.showLoading = false;
        console.log(error)
      });
    },
    async changeSignerStatus(row, status, isContaract) {
      if (isContaract) {
        console.log(row)
        this.signMessage(row)
        return
        // let tx = await this.securityModuleContract.connect(row.address).lock(row.wallet_address)
        // console.log(tx)
        // const txwait = await tx.wait()
        // console.log(txwait)
      }
      let data = {
        userId: this.userId,
        walletId: row.wallet_id,
        signerAddress: row.address,
        status: status,
      }
      const { hasError } = await this.$store.dispatch('updateSigner', {...data});
      this.showLoading = false;
      if (hasError) {
        Toast.fail('Update Failed')
      } else {
        Toast('Update success')
        this.$emit('signChild');
      }
    },
    async signMessage(row) {
      let currentWalletAddress = row.wallet_address
      let ownAddress = getConnectedAddress()
      let amount = 0
      const SMABI = [
          "function executeRecovery(address)",
          "function cancelRecovery(address)",
          "function triggerRecovery(address, address)"
      ]
      const walletContract = await getContractAt({ tokenAddress: currentWalletAddress, abi: WalletJson.abi }, this)
      let sequenceId = await walletContract.getNextSequenceId()
      let iface = new ethers.utils.Interface(SMABI)
      let replaceOwnerData = iface.encodeFunctionData("triggerRecovery", [currentWalletAddress, ownAddress])
      const input = `0x${[
        "0x19",
        "0x00",
        this.securityModuleRouter,
        ethers.utils.hexZeroPad(ethers.utils.hexlify(amount), 32),
        replaceOwnerData,
        ethers.utils.hexZeroPad(ethers.utils.hexlify(sequenceId), 32),
      ].map((hex) => hex.slice(2)).join("")}`;
      let hash = ethers.utils.keccak256(input)
      console.log(hash)
      const currentSignerWallet = await getContractWallet(this)
      console.log(currentSignerWallet)
      let sig = await currentSignerWallet.signMessage(hash);
      console.log(sig)
      // let signatures = await helpers.getSignatures(ethers.utils.arrayify(hash), [user1, user2])
    },
  },

  async created() {
    // this.securityModuleContract = await getContractAt({ tokenAddress: this.securityModuleRouter, abi: SecurityModule.abi }, this)
  },
}
</script>
<style lang="scss" scoped>
  @import 'index.scss';
</style>
