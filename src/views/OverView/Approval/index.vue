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
      <v-loading v-show="showLoading"/>
      <v-none v-if="!showLoading && approvalList.length==0"/>
    </div>
  </div>
</template>
<script>
import Vue from 'vue'
import web3 from 'web3'
import { ethers } from 'ethers'
import { getFromStorage } from '@/utils/storage'
import { NETWORKSFORTOKEN } from '@/utils/netWorkForToken'
import None from '@/components/None/index'
import Loading from '@/components/Loading'
import { generateTokenList } from '@/utils/dashBoardTools'
import { Toast } from 'vant'
import { TRANSACTION_TYPE } from '@/api/transaction'

Vue.use(Toast)

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
    }
  },
  components: {
    'v-none': None,
    'v-loading': Loading,
  },
  methods: {
    changetTag(id) {
      this.defaultNetWork = id
      this.getApprovalList()
    },
    async declineSubmit(item) {
      if(!this.thirdLogin()) { return }
      if(!this.connectedWallet()) { return }

      const tokenAddress = item.token_address
      if (!tokenAddress) {
        return
      }
      const tokenabiJson = this.getTokenAbi(tokenAddress)
      const gasInfo = { gasLimit: 1000000, gasPrice: 20000000000 }
      const swapAddress = item.swap_address
      

      // const submitData = this.getSubmitData()
      const TokenContract = await this.getContractAt({ tokenAddress: tokenAddress, abi: tokenabiJson })
      const approveTokenAmount = 0;

      TokenContract.approve(swapAddress, approveTokenAmount, gasInfo)
      .then(async res=>{
        const txRes = await res.wait()
        console.log(`Approve Token-res: `, txRes);

        const userAddress = window.ethereum && window.ethereum.selectedAddress;
        const chainId = window.ethereum && window.ethereum.chainId;

        const allowanceTokenData = {
          userId: this.userId,
          network_id: web3.utils.hexToNumberString(chainId),
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
          console.log('SaveUserAllowanceForToken Error', error)
        } else {
          Toast('success')
          this.addTransHistory(txRes, item.token_address)
          this.getApprovalList()
        }
      })
      .catch(err => {
        console.log(`Approve Token-error: `, err);
      })
    },
    async addTransHistory(data, tokenAddress) {
      const submitData = {
        txid: data.transactionHash,
        block_num: data.blockNumber,
        from: data.from,
        to: data.to,
        type: TRANSACTION_TYPE['L2ToL2'],
        status: data.status,
        value: 0,
        name: this.getTokenName(tokenAddress),
        operation: 'Decline',
        network_id: web3.utils.hexToNumber(window.ethereum.chainId)
      }
      console.log(submitData)
      const res = await this.$store.dispatch('AddTransactionHistory', {...submitData});
      if (res.hasError) {
        console.log('Transaction success，but error when add history')
      } else  {
        console.log('add history success')
      }
    },
    async getContractAt({ tokenAddress, abi }) {
      const metamaskProvider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = metamaskProvider.getSigner(0);

      const MyContract = new ethers.Contract(tokenAddress, abi, signer)
      await MyContract.attach(tokenAddress)
      console.log("Contract: ", MyContract.address);

      return MyContract
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
      const chainId = window.ethereum && window.ethereum.chainId;
      const userAddress = window.ethereum && window.ethereum.selectedAddress;
      if (!chainId || !userAddress) {
        Toast('Need Connect Wallet')
        return false
      }
      return true
    },
    async getTokenList() {
      const selectedConnectAddress = window.ethereum.selectedAddress;
      if (!selectedConnectAddress) {
         return
      }
      const { hasError, list } = await this.$store.dispatch('GetAvailableTokenAssets', { selectedConnectAddress, chainInfo: this.currentChainInfo });
      const tokenList = await generateTokenList(_.cloneDeep(list), this, true)
      console.log(tokenList)
      this.myTokeList = tokenList
    },
    
    async getApprovalList() {
      const userId = this.userId
      if (!userId) {
        console.log('can detect userID after third login') 
        return
      }
      const selectedConnectAddress = window.ethereum.selectedAddress;
      if (!selectedConnectAddress) {
        return
      }
      const data = await this.$store.dispatch('QueryApprovalList', {network_id: this.defaultNetWork, user_address: selectedConnectAddress, userId });
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
  },
  mounted() {
    this.getTokenList()
    this.getApprovalList()
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
    }
  },
  created (){
    this.netWorkList = _.cloneDeep(NETWORKSFORTOKEN)
    window.ethereum && (this.defaultNetWork = web3.utils.hexToNumber(window.ethereum.chainId))
  }
}
</script>
<style lang="scss" scoped>
  @import 'index';
  @import '@/assets/style/media.scss';
</style>
