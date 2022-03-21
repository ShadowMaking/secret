<template>
  <div class="recover-confirm-page">
    <div class="recover-confirm-title">
      <p>You are trying to recover Eigen Wallet <span>{{currentWalletAddress}}</span> to Account <span>{{currentUserAddress}}</span></p>
      <p>Please ask at least <span>{{signerNeedTotal}}</span> guardians below to help you recover wallet and ask them to login Eigen to confirm your request</p>
    </div>
    <div class="confirm-signer-list">
      <div class="confrim-signer-item" v-for="(item,index) in signerList" :key="index">
        <div class="confirm-signer-item-left">
          <img src="~@/assets/icon_logo.png">
        </div>
        <div class="confirm-signer-item-middle">
          <p>signer{{index}}</p>
          <p>{{item.address}}</p>
        </div>
        <div class="confirm-signer-item-right">
          <el-tag type="success" effect="dark" v-if="item.status == signerStatus['agreeRecover']">Guardian已确认您的找回需求，24h36min36s将会过期</el-tag>
          <el-tag type="info" effect="dark" v-if="item.status == signerStatus['ignoreRecover']">Guardian拒绝了您的找回需求，24h36min36s可重新申请</el-tag>
          <el-tag type="info" effect="dark" v-if="item.status == signerStatus['startRecover']">等待Guardian确认，6小时候申请将自动过期</el-tag>
        </div>
      </div>
    </div>
    <div class="confirm-btn-box">
      <div>
        <el-button :type="!confirmBtn1Disabled ? 'primary' : 'info'" :disabled="confirmBtn1Disabled" @click="ownerStartRecover">向所有Guardians发送找回申请</el-button>
      </div>
      <div>
        <el-button :type="!confirmBtn2Disabled ? 'primary' : 'info'" :disabled="confirmBtn2Disabled" @click="ownerExcuteRecover">将此智能钱包导入到此账号下</el-button>
      </div>
      <div>
        <el-button type="danger" plain @click="cancelExcuteRecover">取消此智能合约钱包的找回</el-button>
      </div>
    </div>
  </div>
</template>

<script>
import Vue from 'vue'
import { Toast } from 'vant'

import { isLogin, getConnectedNet, getConnectedAddress } from '@/utils/dashBoardTools';
import { signerStatus, securityModuleRouter, multOperation } from '@/utils/global'
import { getFromStorage } from '@/utils/storage'

Vue.use(Toast);

export default {
  name: 'recover-confirm',
  // props: ['currentWalletId', 'currentWalletAddress'],
  data() {
    return {
      currentWalletId: 195,
      currentWalletAddress: '0x6d4143f1404bd78c15a22c7e02ad00317fd2d2bc',
      confirmBtn1Disabled: false,
      confirmBtn2Disabled: true,

      signerList: [],
      currentUserAddress: '',
      signerNeedTotal: 0,
      signerStatus,
      multOperation,
      securityModuleRouter,
      isStartRecover: false,
    }
  },
  components: {
    // 'v-none': None,
  },
  methods: {
    ownerStartRecover() {
      this.updateOwner()
    },
    async updateOwner() {
      let data = {
        walletId: this.currentWalletId,
        ownerAddress: this.currentUserAddress,
        network_id: getConnectedNet().id,
      }
      const { hasError } = await this.$store.dispatch('updateOwnerAddress', {...data});
      if (hasError) {
        Toast('Update Owner Failed')
      } else {
        console.log('Update Owner success')
        this.addMultTx()
      }
    },
    async addMultTx() {
      const submitData = {
        user_id: getFromStorage('gUID'),
        wallet_address: this.currentWalletAddress,
        to: this.securityModuleRouter,
        value: 0,
        network_id: getConnectedNet().id,
        data: '',
        operation: multOperation['Recovery']
      }
      const res = await this.$store.dispatch('addMultTx', submitData);
      if (res.hasError) {
        console.log('addMultTx Failed')
      } else {
        console.log('addMultTx success')
        Toast('Send success')
        this.confirmBtn1Disabled = false
        for (var i=0; i<list.length; i++) {//waiting for signer agree
          await this.updateSigner(list[i].address, signerStatus['startRecover'])
        }
        this.getSignerListByid()
      }
    },
    async updateSigner(signerAddress, status) {
      let data = {
        walletId: this.currentWalletId,
        signerAddress: signerAddress,
        status: status,
        network_id: getConnectedNet().id,
      }
      const { hasError } = await this.$store.dispatch('updateSigner', {...data});
      if (hasError) {
        console.log('Update Signer Failed')
      } else {
        console.log('Update Signer success')
      }
    },
    ownerExcuteRecover() {},
    cancelExcuteRecover() {},
    async getSignerListByid() {
      let data = {
        network_id: getConnectedNet().id,
        walletId: this.currentWalletId
      }
      this.confirmBtn1Disabled = false
      const { hasError, list } = await this.$store.dispatch('getSignerList', {...data})
      for (var i=0; i<list.length; i++) {
        if (list[i].status >= 5) {
          this.confirmBtn1Disabled = true
        }
      }
      this.signerList = list
      this.signerNeedTotal = Math.ceil(this.signerList.length/2)
    },
  },
  async created() {
    if (!isLogin()) {
      Toast('Need Login')
      return
    }
    this.currentUserAddress = getConnectedAddress()
    this.getSignerListByid()
  },
};
</script>
<style lang="scss" scoped>
  @import "index";
  ::v-deep .confirm-btn-box .el-button {
    width: 320px;
    height: 40px;
    margin-bottom:20px;
  }
</style>