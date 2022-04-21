<template>
  <div class="ncWallet-signer-page">
    <v-navTitle title="Signers" helpUrl="docs/usage/MultisigWallet"></v-navTitle>
    <div class="page-section-border">
      <van-tabs color="#4375f1" title-active-color="#4375f1" line-width="50%" :before-change="beforeChange">
        <van-tab :title="tabTitle" title-style="font-weight: bold; border-bottom: 2px solid #dfdfdf;">
          <v-signerList v-if="currentAccountType=='wallet'" :dataList="dataList" :signerPercent="signerPercent" @signerChange="getSignerList"></v-signerList>
          <v-walletList v-if="currentAccountType=='normal'" :dataList="dataList"></v-walletList>
          
          <div class="no-data-container" v-if="!initShowLoading && dataList.length==0">
            <v-none />
          </div>
          <v-loading v-show="initShowLoading" />
        </van-tab>
        <van-tab title="" title-style="border-bottom: 2px solid #dfdfdf;"></van-tab>
      </van-tabs>
    </div>
  </div>
</template>

<script>
import Vue from 'vue'
import { Toast, Tab, Tabs } from 'vant'
import { ethers } from 'ethers'

import navTitle from '@/components/NavTitle/index'
import Loading from '@/components/Loading'
import None from '@/components/None/index'
import SignerList from './signerList/index'
import WalletList from './walletList/index'

import { isLogin, getEncryptKeyByAddressFromStore, getDecryptPrivateKeyFromStore, getConnectedAccountType, getConnectedNet,
  getConnectedAddress, getContractAt } from '@/utils/dashBoardTools';
import { signerStatus, securityModuleRouter, lockType } from '@/utils/global';
import SecurityModule from "@/assets/contractJSON/SecurityModule.json";
import { getFromStorage, getInfoFromStorageByKey } from '@/utils/storage';
import { CHAINMAP } from '@/utils/netWorkForToken';
import { generateEncryptPswByPublicKey, generateCR1ByPublicKey, getDecryptPrivateKey } from '@/utils/relayUtils'
import web3 from 'web3'
import { formatErrorContarct } from '@/utils/index'
import { supportNetWorkForContract } from '@/utils/netWorkForToken'

Vue.use(Toast);
Vue.use(Tab);
Vue.use(Tabs);

export default {
  name: 'NC-Wallet-Recover',
  data() {
    return {
      userId: getFromStorage('gUID'),

      currentChainInfo: null,
      defaultNetWork: '',
      
      initShowLoading: true,
      dataList: [],
      signerPercent: 0,
      
      tabTitle: 'who I protect',
      currentAccountType: 'normal',

      securityModuleRouter,
      signerStatus,
    }
  },
  components: {
    "v-navTitle": navTitle,
    'v-loading': Loading,
    'v-none': None,
    'v-signerList': SignerList,
    'v-walletList': WalletList,
  },
  methods: {
    checkClick() {},
    beforeChange(index) {
      if(index == 1) {return false}
      return true
    },
    async getSignerList() {
      const walletInfo = getInfoFromStorageByKey('currentWalletInfo')
      const walletId = walletInfo && walletInfo['wallet_id']
      let data = {
        network_id: getConnectedNet().id,
        walletId: walletId
      }
      const { hasError, list } = await this.$store.dispatch('getSignerList', {...data})
      if (hasError) {
        Toast('get error')
        return
      }
      this.initShowLoading = false
      this.dataList = list
      const signerTotal = list.length
      this.signerPercent = Math.ceil(signerTotal/2)
    },
    async getWalletAsSigner() {
      console.log(getConnectedAddress())
      let data = {
        network_id: getConnectedNet().id,
        address: getConnectedAddress(),
      }
      const { hasError, list } = await this.$store.dispatch('getWalletListAsSign', data)
      this.dataList = list
      this.initShowLoading = false
      // this.dataList = await this.generateWalletStatus(list)
      if (hasError) {
        Toast('Get Error')
      }
    },
    async generateWalletStatus(list) {
      const securityModuleContract = await getContractAt({ tokenAddress: this.securityModuleRouter, abi: SecurityModule.abi }, this)
      if (!securityModuleContract) {
        console.log('privateKey: null')
        return list
      }
      const currentChainInfo = getConnectedNet()
      if (supportNetWorkForContract.indexOf(currentChainInfo.id) < 0) {
        return false
      }
      for(var i=0; i<list.length; i++) {
        
        var walletTime = new Date(list[i].createdAt).getTime()
        var canTime = new Date('2022-03-12 07:50:40.092 +00:00').getTime()
        let lockStatus = 0
        if (walletTime >= canTime) {
          lockStatus = await securityModuleContract.isLocked(list[i].wallet_address)
        }
        console.log("lockStatus:" + lockStatus)
        let thisIsLocked = (lockStatus == lockType['GlobalLock'] || lockStatus == lockType['GlobalAndSigner']) ? true : false
        this.$set(list[i], 'isLocked', thisIsLocked)
        let isInRecovery = await securityModuleContract.isInRecovery(list[i].wallet_address)
        console.log("isInRecovery:" + isInRecovery)
        let thisIsInRecovery = isInRecovery ? isInRecovery : false
        this.$set(list[i], 'isInRecovery', thisIsInRecovery)
      }
      return list
    },
    getInitWalltInfo() {
      this.tabTitle = 'who protect me'
      this.getSignerList()
    },
    getInitNormalData() {
      this.tabTitle = 'who I protect'
      this.getWalletAsSigner()
    },
    getInitData() {
      this.initShowLoading = true
      this.dataList = []
      this.currentAccountType = getConnectedAccountType()
      if (this.currentAccountType == 'wallet') {
        this.getInitWalltInfo()
      } else if (this.currentAccountType == 'normal') {
        this.getInitNormalData()
      }
    },
    getDefaultNetWork() {
      const info = getInfoFromStorageByKey('netInfo')
      return info && info['id'] || 1
    },
    _handleNetworkChange({ chainInfo, from }) {
      this.currentChainInfo = CHAINMAP[web3.utils.numberToHex(chainInfo.id)]
      this.getInitData()
    },
    handleAccountChange(addressInfo) {
      this.getInitData()
    },
  },
  async created() {
    if (!isLogin()) {
      Toast('Please Login')
      return
    }
    this.defaultNetWork = this.getDefaultNetWork()
    const { data: netInfo } = await this.$store.dispatch('GetSelectedNetwork')
    if (netInfo) {
      this.currentChainInfo = CHAINMAP[web3.utils.numberToHex(netInfo['id'])]
    } else {
      this.currentChainInfo = CHAINMAP[web3.utils.numberToHex(this.defaultNetWork)]
    }
    this.getInitData()
  },
  mounted() {
    this.$eventBus.$on('networkChange', this._handleNetworkChange)
    this.$eventBus.$on('changeAccout', this.handleAccountChange)
  },
};
</script>
<style lang="scss" scoped>
  @import "index";
  ::v-deep .setting-set .el-button {
    padding: 0.6rem 5rem;
    border-radius: 20px;
  }
</style>