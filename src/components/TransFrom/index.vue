<template>
    <div class="send-from">
      <!-- <h3 class="send-from-title">From</h3> -->
      <div class="send-from-list">
        <p class="wallt-trans-title">From</p>
        <el-select 
          v-model="fromVal" 
          placeholder="Choose" 
          class="select-box"
          @change="selectChange">
          <el-option-group
            v-for="group in fromOptions"
            :key="group.label"
            :label="group.label">
            <el-option
              v-for="item in group.options"
              :key="item.value"
              :label="item.label"
              :value="item.value">
            </el-option>
          </el-option-group>
        </el-select>
      </div>
    </div>
</template>

<script>
import Vue from 'vue';
import { getConnectedAddress, getContractAt, getConnectedNet } from '@/utils/dashBoardTools';
import { getFromStorage } from '@/utils/storage'
import SecurityModule from "@/assets/contractJSON/SecurityModule.json"
import { securityModuleRouter, walletStatus, lockType } from '@/utils/global';

export default {
  name: 'selectItem',
  data(){
    return { 
      // fromOptions: [{
      //   label: '',
      //   options: [{
      //     value: 'shanghai',
      //     label: 'shanghai'
      //   }]
      // },{
      //   label: 'Multisig Wallet',
      //   options: [{
      //     value: 'chengdu',
      //     label: 'chengdu'
      //   },{
      //     value: 'beijing',
      //     label: 'beijing'
      //   }]
      // }],
      fromOptions: [{
        label: '',
        options: []
      }, {
        label: 'Multisig Wallet',
        options: []
      }],
      fromVal: '', 

      userId: getFromStorage('gUID'),
      securityModuleRouter,
      walletStatus,
    }
  },
  methods: {
    selectChange(value) {
      this.$emit('transFromChange', value);
    },
    getFromOrigin() {
      let currentUserAddress = getConnectedAddress()
      if (currentUserAddress) {
        this.fromOptions[0].options.push({
          value: '1-' + currentUserAddress,
          label: currentUserAddress,
        })
      }
      this.getWalletAsOwner()
    },
    async getWalletAsOwner() {
      let data = {
        network_id: getConnectedNet().id,
        address: getConnectedAddress(),
      }
      this.fromOptions[1].options = []
      const { hasError, list } = await this.$store.dispatch('getWalletListAsOwner', data)
      if (hasError) {return}
      this.securityModuleContract = await getContractAt({ tokenAddress: this.securityModuleRouter, abi: SecurityModule.abi }, this)
      let isLocked = false, isInRecovery = false;
      list.map(async item =>{
        if (this.securityModuleContract) {

          var walletTime = new Date(item.createdAt).getTime()
          var canTime = new Date('2022-03-12 07:50:40.092 +00:00').getTime()
          let lockStatus = 0
          if (walletTime >= canTime) {
            lockStatus = await this.securityModuleContract.isLocked(item.wallet_address)
          }

          isLocked = (lockStatus == lockType['GlobalLock'] || lockStatus == lockType['GlobalAndSigner']) ? true : false
          isInRecovery = await this.securityModuleContract.isInRecovery(item.wallet_address)
        }
        if (isLocked || isInRecovery || item.wallet_status !== walletStatus['Active']) {return}
        this.fromOptions[1].options.push({
          value: '2-' + item.wallet_address,
          label: item.name + '-' + item.wallet_address,
        })
      })
    },
  },
  created() {
    this.getFromOrigin()
    this.fromVal = getConnectedAddress()
  },
};
</script>
<style lang="scss" scoped>
  @import "index";
</style>
