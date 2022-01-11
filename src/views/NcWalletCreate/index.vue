<template>
  <div class="ncWalletCreate-page content-box">
    <v-navTitle title="Create Multisig Wallet"></v-navTitle>
    <div class="create-wallet-container content-page">
      <p class="create-title">Multisig Wallet</p>
      <p class="create-des">Create one right now!   Add at least one signer,  who can help you to recover your wallet, co-send large amount money, and lock the wallet when you need.</p>
      <p class="create-des" style="margin-top: 15px;">Quickly create a Multisig Wallet:</p>
      <div class="create-wallet-form">
        <el-form label-position="left">
          <el-form-item label="Set Wallet Name" label-width="135px">
            <el-input v-model="createWalletName"></el-input>
          </el-form-item>
          <el-form-item label="Set Signer">
            <el-table :data="createSignerList" border style="width: 100%" v-if="createSignerList.length">
                <el-table-column fixed prop="addTime" label="Add Time"></el-table-column>
                <el-table-column fixed prop="signAddress" label="Signer Address/ENS"></el-table-column>
            </el-table>
          </el-form-item>
        </el-form>
        <v-searchSignerModal
          :dataSource="searchSignerList"
          @confirm="confirmSearchSigner"
          @addConfirm="confirmAddSigner" />
        <div class="add-signer-tip">Any transaction requires the confirmation of: {{signerPercent}} out of {{signerTotal}} signer(s)</div>
        <div class="create-btn-box">
          <a class="common-form-btn" @click="createSubmit">Create</a>
        </div>
        <v-statusPop
          :status="popStatus"
          :title="statusPopTitle"
          :timeTxt="timeTxt"
          tip=""
          :show="showStatusPop"
          @childEvent="changeVisible" />
        <!-- <van-popup v-model="showLoading" round :close-on-click-overlay="false" class="waiting-modal flex flex-center flex-column">
          <div class="inner-wrapper">
            <van-loading type="spinner" />
          </div>
        </van-popup> -->
        <v-loadingPopup :show="showLoading" :showSpinner="false" />
      </div>
    </div>
    <v-confirmModal
      :show="showTradeConfirm"
      type="Create Wallet"
      :metadata="sendMetadata"
      @close="showTradeConfirm=false"
      @reject="cancelCreate"
      @confirm="confirmCreate" />
  </div>
</template>

<script>
import Vue from 'vue'
import { Toast, Dialog, Popup, Loading } from 'vant'
import { ethers } from 'ethers'
import navTitle from '@/components/NavTitle/index'
import searchSignerModal from '@/components/SearchSignerModal/index'
import StatusPop from '@/components/StatusPop';
import ConfirmModal from '@/components/ConfirmModal';
import LoadingPopup from '@/components/LoadingPopup';
import { getContractAt, getConnectedAddress, getEns, isLogin } from '@/utils/dashBoardTools';
import SecurityModule from "@/assets/contractJSON/SecurityModule.json";
import WalletJson from "@/assets/contractJSON/Wallet.json";
import ProxyJson from "@/assets/contractJSON/Proxy.json";
import WalletTransaction from "@/assets/contractJSON/TransactionModule.json";
import { BigNumber } from "bignumber.js";
import { getFromStorage, getInfoFromStorageByKey } from '@/utils/storage';
import { timeFormat } from '@/utils/str';
import { securityModuleRouter, proxyRouter, walletTransactionRouter } from '@/utils/global';
import { CHAINMAP } from '@/utils/netWorkForToken';
import web3 from 'web3'

Vue.use(Toast);
Vue.use(Dialog);
Vue.use(Loading);
Vue.use(Popup);

export default {
  name: 'NC-Wallet',
  data() {
    return {
      createWalletName: '',
      createSignerList: [],
      createSignerSubmit: [],
      signerTotal: 0,
      signerPercent: 0,//more than 1/2

      searchSignerList: [],

      showStatusPop: false,
      popStatus: "success",
      statusPopTitle: 'Created Successfully!',
      timeTxt: '',
      userId: getFromStorage('gUID'),

      showLoading: false,
      showTradeConfirm: false,

      securityModuleRouter,
      proxyRouter,
      walletTransactionRouter,

      overrides: {
        gasLimit: 8000000,
        gasPrice: 5000000000,
      },
      currentChainInfo: null,
      sendMetadata: null,
      defaultNetWork: '',
    }
  },
  components: {
    "v-navTitle": navTitle,
    "v-searchSignerModal": searchSignerModal,
    'v-statusPop': StatusPop,
    'v-confirmModal': ConfirmModal,
    'v-loadingPopup': LoadingPopup,
  },
  methods: {
    async confirmSearchSigner(value) {
      var searchData = {
        userId: this.userId,
        value: value
      }
      const { hasError, list } = await this.$store.dispatch('searchSigner', searchData);
      this.searchSignerList = list
    },
    async confirmAddSigner(value) {
      if (!value) {
        Toast('Please Choose Signer')
        return
      }
      let currentOwner = getConnectedAddress()
      if (value.toLocaleLowerCase() == currentOwner) {
        Toast('This Owner Can Not To Be This Signer')
        return
      }
      let isSignerExist = this.createSignerList.findIndex(function(item) {
        return item.signAddress == value
      })
      if (isSignerExist > -1) {
        Toast('This Signer Already Exists')
        return
      }
      var nowDate = new Date()
      var nowTime = timeFormat(nowDate, 'yyyy-MM-dd hh:mm:ss')
      const signAddress = await getEns(value)
      console.log(this.createSignerList)
      this.createSignerList.push({
        signAddress: signAddress,
        addTime: nowTime,
      })
      this.createSignerSubmit.push(signAddress.toLocaleLowerCase())
      this.signerTotal = this.createSignerList.length
      this.signerPercent = Math.ceil(this.signerTotal/2)
    },
    cancelCreate() {
      this.showTradeConfirm = false
      Toast('Cancel create')
    },
    confirmCreate() {
      this.createNcWallet()
    },
    createSubmit() {
      this.sendMetadata = {
        from: getConnectedAddress(),
        to: this.securityModuleRouter,
        gas: this.overrides.gasLimit,
        gasPrice: this.overrides.gasPrice,
        value: 0,
        symbolName: 'ETH',
        netInfo: this.currentChainInfo,
        DATA: '',
        estimatedGasFee: '0' // todo
      }
      this.showTradeConfirm = true
    },
    async createNcWallet() {
      if (!this.checkData()) { return }
      this.showLoading = true; 

      const securityModuleContract = await getContractAt({ tokenAddress: this.securityModuleRouter, abi: SecurityModule.abi }, this)
      const proxyContract = await getContractAt({ tokenAddress: this.proxyRouter, abi: ProxyJson.abi }, this)
      const transactionContract = await getContractAt({ tokenAddress: this.walletTransactionRouter, abi: WalletTransaction.abi }, this)
      const saletnew = ethers.utils.randomBytes(32);
      
      let createSignList = this.createSignerSubmit
      // let providertest = new ethers.providers.JsonRpcProvider('https://ropsten.infura.io/v3/9aa3d95b3bc440fa88ea12eaa4456161')
      
      // let user1 = ethers.Wallet.createRandom().connect(providertest)
      // let user2 = ethers.Wallet.createRandom().connect(providertest)
      
      let walletAddress = await proxyContract.getAddress(saletnew);
      console.log('walletAddress:' + walletAddress)
      
      const tx = await proxyContract.create(saletnew,this.overrides);
      console.log(tx)
      const tswait = await tx.wait()
      console.log(tswait)
      
      const walletContract = await getContractAt({ tokenAddress: walletAddress, abi: WalletJson.abi }, this)
    
      let modules = [ transactionContract.address, securityModuleContract.address ]
      let encoder = ethers.utils.defaultAbiCoder
      let du = ethers.utils.parseEther("15")//one day
      let lap = ethers.utils.parseEther("10")//one 
      let data = [encoder.encode(["uint", "uint"], [du, lap]), encoder.encode(["address[]"], [createSignList])]
      let initTx = await walletContract.initialize(modules, data, this.overrides);
      console.log(initTx)
      const initTxwait = await initTx.wait()
      console.log(initTxwait)
      this.createWallet(walletAddress)
    },
    async createWallet(walletAddress) {
      const selectedConnectAddress = getConnectedAddress()
      let data = {
        name: this.createWalletName,
        address: selectedConnectAddress,
        walletAddress: walletAddress.toLocaleLowerCase(),//0xe744919008dd978dfAF9771E5623fDfbEd4C29D3
        signers: this.createSignerSubmit,
        userId: this.userId,
      }
      // let data = {
      //   name: 'wallet271',
      //   address: '0x72756a6a48777019D9c414bb1f84550E8458cEf9',
      //   signers: ['0xbb2eD316211dBB0E5A68E417E0420A0dfCaD6259'],
      //   userId: '1040',
      // }
      console.log(data)
      const { hasError } = await this.$store.dispatch('addWallet', {...data});
      this.showLoading = false;
      if (hasError) {
        Toast.fail('Create Failed')
      } else {
        this.showStatusPop = true
      }
    },
    checkData() {
      if (!this.createWalletName) {
        Toast.fail('Need Input Name')
        return false
      }
      if (!this.userId) {
        Toast.fail('Need Login')
        return false
      }
      if (this.createSignerSubmit.length == 0) {
        Toast.fail('Set Signer')
        return false
      }
      return true
    },
    changeVisible() {
      this.showStatusPop = false;
      this.$router.push({ name: 'ncWalletList' })
    },
    getDefaultNetWork() {
      const info = getInfoFromStorageByKey('netInfo')
      return info && info['id'] || 1
    },
  },
  async created() {
    this.defaultNetWork = this.getDefaultNetWork()
    if (!isLogin()) {
      Toast('Need Login')
      return
    }
    const { data: netInfo } = await this.$store.dispatch('GetSelectedNetwork')
    console.log(netInfo)
    if (netInfo) {
      this.currentChainInfo = CHAINMAP[web3.utils.numberToHex(netInfo['id'])]
    } else {
      this.currentChainInfo = CHAINMAP[web3.utils.numberToHex(this.defaultNetWork)]
    }
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