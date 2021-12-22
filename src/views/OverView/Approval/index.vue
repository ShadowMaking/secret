<template>
  <div class="approval-box">
    <div class="tag-list">
      <span 
      v-for="(item, index) in netWorkList"
      :key="index"
      :class="['tag-item', defaultNetWork == item.id ? 'active' : '']"
      @click="changetTag(item.id)"
      >{{item.chainName}}</span>
    </div>
    <div class="approval-list">
      <el-row class="list-header">
        <el-col :span="4" class="list-header-item">Approved Time</el-col>
        <el-col :span="4" class="list-header-item">Token</el-col>
        <el-col :span="4" class="list-header-item">Allowance</el-col>
        <el-col :span="12" class="list-header-item">Contract</el-col>
      </el-row>
      <el-row 
        class="list-content" 
        v-for="(item, index) in approvalList"
        :key="index">
        <el-col :span="4" class="list-item">{{item.approved_time}}</el-col>
        <el-col :span="4" class="list-item">{{getTokenName(item.token_address)}}</el-col>
        <el-col :span="4" class="list-item">{{item.allowance}}</el-col>
        <el-col :span="12" class="list-item item-contract">
          <div class="item-con-left">
            <div class="item-icon"><!-- <img src="@/assets/token/tokenImages/defaultToken.png"> --></div>
            <div class="item-left-con">
              <!-- <h3>{{item.token_icon}}</h3> -->
              <p>{{item.swap_address}}</p>
            </div>
          </div>
          <div class="item-con-right"><a @click="declineSubmit(item)">Decline</a></div>
        </el-col>
      </el-row>
      <van-popup v-model="showLoadingModal" round :close-on-click-overlay="false" class="waiting-modal flex flex-center flex-column">
        <div class="inner-wrapper">
          <van-loading type="spinner" />
        </div>
      </van-popup>
      <v-loading v-show="showLoading"/>
      <v-none v-if="!showLoading && approvalList.length==0"/>
      <v-approveModal
      :show="showApproveModal"
      :metadata="approveMetadata"
      @close="showApproveModal=false"
      @reject="cancelApprove"
      @confirm="confirmApprove" />
    </div>
  </div>
</template>
<script>
import Vue from 'vue'
import web3 from 'web3'
import { ethers } from 'ethers'
import { getFromStorage, getInfoFromStorageByKey } from '@/utils/storage';
import { NETWORKSFORTOKEN, CHAINMAP } from '@/utils/netWorkForToken';
import None from '@/components/None/index'
import VLoading from '@/components/Loading'
import { Popup, Toast, Loading } from 'vant';
import { TRANSACTION_TYPE } from '@/api/transaction'
import { generateTokenList, getConnectedAddress, getContractAt } from '@/utils/dashBoardTools';
import ApproveModal from '@/components/ApproveModal';

Vue.use(Toast)
Vue.use(Popup)
Vue.use(Loading)

export default {
  name: 'Home',
  data() {
    return {
      approvalList: [],
      netWorkList: _.cloneDeep(NETWORKSFORTOKEN),
      defaultNetWork: 1,
      showLoading: true,
      userId: getFromStorage('gUID'),
      currentChainInfo: null,
      myTokeList: [],
      userAddress: '',

      showLoadingModal: false,
      showApproveModal: false,
      approveMetadata: null,

      declinetokenAddress: '',
      declineSwapAddress: '',
    }
  },
  components: {
    'v-none': None,
    'v-loading': VLoading,
    'v-approveModal': ApproveModal,
  },
  computed: {
    getTokenName() {
      return function(tokenAddress) {
        if (!tokenAddress) return
        if (this.myTokeList.length == 0) return
        return this.myTokeList.filter(item => {
          return item.tokenAddress == tokenAddress
        })[0].symbol
      }
    },
  },
  methods: {
    async changetTag(id) {
      this.defaultNetWork = id
      const chainInfo = CHAINMAP[web3.utils.numberToHex(id)]
      this.currentChainInfo = chainInfo
      await this.$store.dispatch('StoreSelectedNetwork', { netInfo: this.currentChainInfo })
      this.getApprovalList()

    },
    async declineSubmit(item) {
      if(!this.thirdLogin()) { return }
      if(!this.connectedWallet()) { return }

      const tokenAddress = item.token_address
      if (!tokenAddress) {
        return
      }
      this.declinetokenAddress = tokenAddress
      this.declineSwapAddress = item.swap_address
      const userAddress = getConnectedAddress()
      
      this.approveMetadata = {
        userAddress: userAddress,
        tokenName: this.getTokenName(tokenAddress),
        tokenAddress: tokenAddress,
        gas: 21000,
        gasPrice: 20,
        netInfo: this.currentChainInfo,
      }
      console.log(this.approveMetadata)
      this.showApproveModal = true
    },
    async addTransHistory(data, tokenAddress) {
      const chainId = this.currentChainInfo && this.currentChainInfo['id']
      const submitData = {
        txid: data.transactionHash,
        block_num: data.blockNumber,
        from: data.from,
        to: (data.to).toLocaleLowerCase(),
        type: TRANSACTION_TYPE['L1ToL1'],
        status: data.status,
        value: 0,
        name: this.getTokenName(tokenAddress),
        operation: 'Approve',
        network_id: chainId
      }
      console.log(submitData)
      const res = await this.$store.dispatch('AddTransactionHistory', {...submitData});
      if (res.hasError) {
        console.log('Transaction success，but error when add history')
      } else  {
        console.log('add history success')
      }
    },
    cancelApprove() {
      this.showApproveModal = false
      Toast('Cancel Approve')
    },
    async confirmApprove() {
      const gasInfo = { gasLimit: 1000000, gasPrice: 20000000000 }
      const swapAddress = this.declineSwapAddress
      const tokenAddress = this.declinetokenAddress
      const tokenabiJson = this.getTokenAbi(tokenAddress)
      

      const TokenContract = await getContractAt({ tokenAddress, abi: tokenabiJson }, this)
      const approveTokenAmount = 0;
      this.showLoadingModal = true
      TokenContract.approve(swapAddress, approveTokenAmount, gasInfo)
      .then(async res=>{
        console.log(`Approve Token tx: `, res);
        const txRes = await res.wait()
        console.log(`Approve Token res: `, txRes);

        const userAddress = getConnectedAddress()
        const chainId = this.currentChainInfo && this.currentChainInfo['id']

        const allowanceTokenData = {
          userId: this.userId,
          network_id: chainId,
          token_address: tokenAddress,
          user_address: userAddress,
          swap_address: swapAddress,
        }

        const saveTokenData = {
          ...allowanceTokenData,
          allowance: approveTokenAmount
        }
        //change approval status
        const { hasError, data, error } = await this.$store.dispatch('SaveUserAllowanceForToken', {...saveTokenData})
        if (hasError) {
          this.showLoadingModal = false
          console.log('SaveUserAllowanceForToken Error', error)
        } else {
          await this.addTransHistory(txRes, tokenAddress)
          await this.getApprovalList()
          this.showLoadingModal = false
          Toast('success')
        }
      })
      .catch(err => {
        this.showLoadingModal = false
        console.log(`Approve Token-error: `, err);
      })
    },
    thirdLogin() {
      const userId = this.userId
      if (!userId) {
        Toast('You need Login')
        console.log('can detect userID after third login') 
        return false
      }
      return true
    },
    connectedWallet() {
      const chainId = this.currentChainInfo && this.currentChainInfo['id']
      const selectedConnectAddress = getConnectedAddress()
      if (!chainId || !selectedConnectAddress) {
        Toast('Need Connect Wallet')
        return false
      }
      return true
    },
    async getTokenList() {
      const selectedConnectAddress = this.userAddress;
      if (!selectedConnectAddress) {
         return
      }
      const { hasError, list } = await this.$store.dispatch('GetAvailableTokenAssets', { selectedConnectAddress, chainInfo: this.currentChainInfo });
      const tokenList = await generateTokenList(_.cloneDeep(list), this, true)
      console.log('tokenList', tokenList)
      this.myTokeList = tokenList
    },
    
    async getApprovalList() {
      const userId = this.userId
      if (!userId) {
        console.log('can detect userID after third login') 
        return
      }
      const selectedConnectAddress = this.userAddress;
      if (!selectedConnectAddress) {
        return
      }
      const chainId = this.currentChainInfo && this.currentChainInfo['id'] || this.defaultNetWork
      const data = await this.$store.dispatch('QueryApprovalList', {network_id: chainId, user_address: selectedConnectAddress, userId });
      if (data) {
        this.showLoading = false
        this.approvalList = data
      }
    },

    getTokenAbi(tokenAddress) {
      return this.myTokeList.filter(item => {
        return item.tokenAddress == tokenAddress
      })[0].abiJson
    },
    async handleAccountChange(addressInfo) {
      this.showLoading = true;
      await this.getTokenList()
      await this.getApprovalList()
    },
  },
  async created (){
    this.$eventBus.$on('changeAccout', this.handleAccountChange)
    this.netWorkList = _.cloneDeep(NETWORKSFORTOKEN)
    // window.ethereum && (this.defaultNetWork = web3.utils.hexToNumber(window.ethereum.chainId))
    // window.ethereum && window.ethereum.selectedAddress && (this.userAddress = (window.ethereum.selectedAddress).toLowerCase());
    const selectedConnectAddress = getConnectedAddress()
    selectedConnectAddress && (this.userAddress = selectedConnectAddress)

    const { data: netInfo } = await this.$store.dispatch('GetSelectedNetwork')
    if (netInfo) {
      this.currentChainInfo = CHAINMAP[web3.utils.numberToHex(netInfo['id'])]
    } else {
      this.currentChainInfo = CHAINMAP[web3.utils.numberToHex(this.defaultNetWork)]
    }
    this.defaultNetWork = this.currentChainInfo['id']

    if(!this.connectedWallet()) { return }

    await this.getTokenList()
    await this.getApprovalList()
  }
}
</script>
<style lang="scss" scoped>
  @import 'index';
</style>
