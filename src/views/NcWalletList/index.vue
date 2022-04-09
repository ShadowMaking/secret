<template>
  <div class="ncWalletList-page">
    <v-navTitle title="Multisig Wallet"></v-navTitle >
    <div class="nc-wallet-des">Multisig Wallet provides functionalities, including Social recovery, Multiple signature transaction, Payment limit, Lock and unlock to prevent user's funds from being lost or stolen.</div>
    <van-tabs color="#4375f1" title-active-color="#4375f1">
      <van-tab title="I am The Owner" title-style="font-weight: bold">
        <div>
          <v-ownWalletList
          :dataList="ownWalletList"
           />
        </div>
        <div class="no-data-container" v-if="!ownShowLoading && ownWalletList.length==0">
          <v-none />
        </div>
        <v-loading v-show="ownShowLoading" />
      </van-tab>
      <van-tab title="I am The Signer" title-style="font-weight: bold">
        <div>
          <v-signWalletList
          :dataList="signWalletList"
          @signChild="getWalletAsSigner"
           />
        </div>
        <div class="no-data-container" v-if="!signShowLoading && signWalletList.length==0">
          <v-none />
        </div>
        <v-loading v-show="signShowLoading" />
      </van-tab>
    </van-tabs>
  </div>
</template>

<script>
import Vue from 'vue'
import { Tab, Tabs, Toast} from 'vant'
import { ethers } from 'ethers'
import navTitle from '@/components/NavTitle/index'
import ownWalletList from './ownWalletList/index'
import signWalletList from './signWalletList/index'
import None from '@/components/None/index'
import Loading from '@/components/Loading'
import { getFromStorage } from '@/utils/storage'
import {  isLogin, getBalanceByAddress, getConnectedAddress, getContractAt, getConnectedNet  } from '@/utils/dashBoardTools';
import { signerStatus, securityModuleRouter, lockType } from '@/utils/global';
import SecurityModule from "@/assets/contractJSON/SecurityModule.json";
import { supportNetWorkForContract } from '@/utils/netWorkForToken'

Vue.use(Tab);
Vue.use(Tabs);
Vue.use(Toast);

export default {
  name: 'NcWalletList',
  data() {
    return {
      signerStatus,
      tabActive: 0,
      ownWalletList: [],
      signWalletList: [],
      
      ownShowLoading: true,
      signShowLoading: true,
      
      userId: getFromStorage('gUID'),
      securityModuleRouter,
      securityModuleContract: null,
    }
  },
  components: {
    "v-navTitle": navTitle,
    "v-ownWalletList": ownWalletList,
    "v-signWalletList": signWalletList,
    'v-none': None,
    'v-loading': Loading,
  },
  
  methods: {
    async getWalletAsOwner() {
      let data = {
        network_id: getConnectedNet().id,
        address: getConnectedAddress(),
      }
      const { hasError, list } = await this.$store.dispatch('getWalletListAsOwner', data)
      for(let i=0; i<list.length;i+=1) {
        this.$set(list[i], 'balance', '0.0')
      }
      this.ownWalletList = list
      this.ownShowLoading = false
      this.ownWalletList = await this.generateWalletStatus(list)
      console.log(this.ownWalletList)
      
      this.resetBalance(list)
      if (hasError) {
        Toast('Get Error')
      }
    },
    async resetBalance(list) {
      for(let i=0; i<list.length;i+=1) {
        let itemBalance = await this.getBalance(list[i].wallet_address)
        this.$set(list[i], 'balance', itemBalance)
      }
      this.ownWalletList = list
    },
    async getWalletAsSigner() {
      let data = {
        network_id: getConnectedNet().id,
        address: getConnectedAddress()
      }
      const { hasError, list } = await this.$store.dispatch('getWalletListAsSign', data)
      // let newList = list.filter((item, index)=>{
      //     return item.status !== this.signerStatus['rejected']
      // });
      this.signWalletList = list
      this.signShowLoading = false
      this.signWalletList = await this.generateWalletStatus(list)
      console.log(this.signWalletList)
      if (hasError) {
        Toast('Get Error')
      } else {
        this.signShowLoading = false
      }
    },
    async getBalance(address) {
      const balanceString = await getBalanceByAddress(address)
      return balanceString
    },
    async generateWalletStatus(list) {
      this.securityModuleContract = await getContractAt({ tokenAddress: this.securityModuleRouter, abi: SecurityModule.abi }, this)
      if (!this.securityModuleContract) {
        console.log('privateKey: null')
        return list
      }
      for(var i=0; i<list.length; i++) {
        const currentChainInfo = getConnectedNet()
        if (supportNetWorkForContract.indexOf(currentChainInfo.id) < 0) {
          return false
        }
        var walletTime = new Date(list[i].createdAt).getTime()
        var canTime = new Date('2022-03-12 07:50:40.092 +00:00').getTime()
        let lockStatus = 0
        if (walletTime >= canTime) {
          lockStatus = await this.securityModuleContract.isLocked(list[i].wallet_address)
        }
        console.log("lockStatus:" + lockStatus)
        let thisIsLocked = (lockStatus == lockType['GlobalLock'] || lockStatus == lockType['GlobalAndSigner']) ? true : false
        this.$set(list[i], 'isLocked', thisIsLocked)
        let isInRecovery = await this.securityModuleContract.isInRecovery(list[i].wallet_address)
        console.log("isInRecovery:" + isInRecovery)
        let thisIsInRecovery = isInRecovery ? isInRecovery : false
        this.$set(list[i], 'isInRecovery', thisIsInRecovery)
      }
      return list
    },
    reloadData() {
      this.ownWalletList = []
      this.ownShowLoading = true
      this.signWalletList = []
      this.signShowLoading = true
      this.getWalletAsOwner()
      this.getWalletAsSigner()
    },
    handleAccountChange(addressInfo) {
      this.reloadData()
    },
    _handleNetworkChange({ chainInfo, from }) {
      this.reloadData()
    },
  },
  created() {
    if (!isLogin()) {
      Toast('Need Login')
      return
    }
    this.getWalletAsOwner()
    this.getWalletAsSigner()
  },
  mounted() {
    this.$eventBus.$on('changeAccout', this.handleAccountChange)
    this.$eventBus.$on('networkChange', this._handleNetworkChange)
  },
};
</script>
<style lang="scss" scoped>
  @import "index";
  ::v-deep .van-tabs__nav--line {
    width: 250px;
  }
  ::v-deep .van-tabs__line {
    width: 100px;
  }
</style>