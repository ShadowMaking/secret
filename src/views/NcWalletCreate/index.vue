<template>
  <div class="ncWalletCreate-page content-box">
    <v-navTitle title="Create Multisig Wallet"></v-navTitle>
    <div class="create-wallet-container content-page">
      <p class="create-title">Multisig Wallet</p>
      <p class="create-des">Create one right now!   Add at least one signer,  who can help you to recover your wallet, co-send large amount money, and lock the wallet when you need.</p>
      <p class="create-des" style="margin-top: 15px; color: #2C3E50">Quickly create a Multisig Wallet:</p>
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
    <v-inputPsw :show="showInputPswModal" @cancel="showInputPswModal=false" @ok="confirmPswOk" :btnLoading="confirmPswBtnLoading" />
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
import InputPswModal from '@/components/InputPswModal'
import { getContractAt, getConnectedAddress, getEns, isLogin, getEncryptKeyByAddressFromStore, getDecryptPrivateKeyFromStore,addTransHistory, getBalanceByAddress, getSupportNet, getConnectedNet, initRPCProvider, getEstimateGas} from '@/utils/dashBoardTools';
import SecurityModule from "@/assets/contractJSON/SecurityModule.json";
import WalletJson from "@/assets/contractJSON/Wallet.json";
import ProxyJson from "@/assets/contractJSON/Proxy.json";
import WalletTransaction from "@/assets/contractJSON/TransactionModule.json";
import { BigNumber } from "bignumber.js";
import { getFromStorage, getInfoFromStorageByKey } from '@/utils/storage';
import { timeFormat } from '@/utils/str';
import { securityModuleRouter, proxyRouter, walletTransactionRouter } from '@/utils/global';
import { CHAINMAP } from '@/utils/netWorkForToken';
import { generateEncryptPswByPublicKey, generateCR1ByPublicKey, getDecryptPrivateKey } from '@/utils/relayUtils'
import web3 from 'web3'
import { formatErrorContarct } from '@/utils/index'

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
      statusPopTitle: 'Submited Successfully!',
      timeTxt: '',
      userId: getFromStorage('gUID'),

      showLoading: false,
      showTradeConfirm: false,

      securityModuleRouter,
      proxyRouter,
      walletTransactionRouter,

      overrides: {
        gasLimit: 8000000,
        gasPrice: 20000000000,//wei
      },
      currentChainInfo: null,
      sendMetadata: null,
      defaultNetWork: '',


      // ***************** inputPsw start ***************** //
      userPsw: '',
      publicKey: '',
      aesKey: '', // every decrypt has the same aesKey
      encryptPsw: '',
      encryptPrivateKeyPublicKey: '',
      encryptCr1: '',
      confirmPswBtnLoading: false,
      showInputPswModal: false,
      // ***************** inputPsw end ***************** //
    }
  },
  components: {
    "v-navTitle": navTitle,
    "v-searchSignerModal": searchSignerModal,
    'v-statusPop': StatusPop,
    'v-confirmModal': ConfirmModal,
    'v-loadingPopup': LoadingPopup,
    'v-inputPsw': InputPswModal,
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
    confirmCreate({ overrides }) {
      this.overrides.gasLimit = overrides.gasLimit
      this.overrides.gasPrice = web3.utils.toWei(overrides.gasPrice, 'gwei')
      this.createNcWallet()
    },
    async dealDataBeforeCreate() {
      if (!getSupportNet()) {
        return
      }
      const selectedConnectAddress = getConnectedAddress()
      const connectBalance = await getBalanceByAddress(selectedConnectAddress)
      let estimatedGasFee = await getEstimateGas('gasUsed', 20000000000) * 10
      console.log(connectBalance)
      if (connectBalance < estimatedGasFee) {
        Toast('Not Enough ETH')
        return
      }
      let thisGasPrice = this.overrides.gasPrice.toString()
      let gasPrice = web3.utils.fromWei(thisGasPrice, 'gwei')
      this.sendMetadata = {
        from: getConnectedAddress(),
        to: this.securityModuleRouter,
        gas: this.overrides.gasLimit,
        gasPrice: gasPrice,
        value: 0,
        symbolName: 'ETH',
        netInfo: this.currentChainInfo,
        DATA: '0x',
        estimatedGasFee: estimatedGasFee
      }
      this.showTradeConfirm = true
    },
    async createSubmit() {
      if (!this.checkData()) { return }
      // check privateKey whether is existed
      const privateKey = await getDecryptPrivateKeyFromStore(this)
      if (!privateKey) {
        this.showInputPswModal = true;
        return
      }
      await this.dealDataBeforeCreate()
    },
    async createNcWallet() {
      // if (!this.checkData()) { return }
      this.showLoading = true; 

      const securityModuleContract = await getContractAt({ tokenAddress: this.securityModuleRouter, abi: SecurityModule.abi }, this)
      const proxyContract = await getContractAt({ tokenAddress: this.proxyRouter, abi: ProxyJson.abi }, this)
      const transactionContract = await getContractAt({ tokenAddress: this.walletTransactionRouter, abi: WalletTransaction.abi }, this)
      console.log(transactionContract)
      const saletnew = ethers.utils.randomBytes(32);
      
      let createSignList = this.createSignerSubmit
      // let providertest = new ethers.providers.JsonRpcProvider('https://ropsten.infura.io/v3/9aa3d95b3bc440fa88ea12eaa4456161')
      
      // let user1 = ethers.Wallet.createRandom().connect(providertest)
      // let user2 = ethers.Wallet.createRandom().connect(providertest)
      let walletAddress = await proxyContract.getAddress(saletnew);
      
      proxyContract.create(saletnew,this.overrides).then(async tx=> {
          console.log(tx)
          tx.wait().then(async res => {
            console.log(res)
            const walletContract = await getContractAt({ tokenAddress: walletAddress, abi: WalletJson.abi }, this)
    
            let modules = [ transactionContract.address, securityModuleContract.address ]
            let encoder = ethers.utils.defaultAbiCoder
            let du = ethers.utils.parseEther("15")//one day
            let lap = ethers.utils.parseEther("10")//one 
            let data = [encoder.encode(["uint", "uint"], [du, lap]), encoder.encode(["address[]"], [createSignList])]
            
            walletContract.initialize(
              modules, 
              data, 
              this.overrides
            ).then(async tx=> {
                console.log(tx)
                this.createWallet(walletAddress, tx.hash)
                addTransHistory(tx, 'Create Wallet', this)
                tx.wait().then(async res => {
                  console.log('Create:', res)
                })
            }).catch(error => {
              console.log(error)
              this.showLoading = false
              let errorValue = formatErrorContarct(error)
              Toast.fail(errorValue)
            })
          })
      }).catch(error => {
        console.log(error)
        this.showLoading = false
        let errorValue = formatErrorContarct(error)
        Toast.fail(errorValue)
        return
      })
      
    },
    async createWallet(walletAddress, txhash) {
      const selectedConnectAddress = getConnectedAddress()
      console.log(txhash)
      let data = {
        name: this.createWalletName,
        address: selectedConnectAddress,
        walletAddress: walletAddress.toLocaleLowerCase(),//0xe744919008dd978dfAF9771E5623fDfbEd4C29D3
        signers: this.createSignerSubmit,
        userId: this.userId,
        txid: txhash
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
    async confirmPswOk({ show, psw }) {
      this.userPsw = psw; // password of user input for encrypt privateKey
      this.confirmPswBtnLoading = true
      const { hasError, data: publicKey} = await this.$store.dispatch('GetAllPublicKey')
      if (hasError) {
        Toast('Get PublickKey Failed! Retry')
        this.confirmPswBtnLoading = false
        return
      }
      this.publicKey = publicKey;
      console.log(`GetPublicKey result is: ${publicKey}`)
      
      // const password = ecies.crypto.randomBytes(16).toString("base64");
      const encryptPsw = generateEncryptPswByPublicKey(publicKey, psw); // generate cc1
      const { cr1: encryptCr1, aesKey } = generateCR1ByPublicKey(this.publicKey); // generate cr1
      console.log('aesKey:', aesKey)
      this.aesKey = aesKey
      this.encryptPsw = encryptPsw
      this.encryptCr1 = encryptCr1
      console.log(`encryptPsw: ${encryptPsw}, \n encryptCr1: ${encryptCr1}`)

      // to decrypt privatekey
      const userId = getInfoFromStorageByKey('gUID')
      const address = getConnectedAddress()
      const encryptKey = await getEncryptKeyByAddressFromStore(address, this)
      const decryptInfo = await this.$store.dispatch('DecryptPrivateKeyByEcies', {userId, cr1: this.encryptCr1, c1: this.encryptPsw, cc2: encryptKey })
      if(decryptInfo.hasError) {
        Toast('DecryptPrivateKeyByEcies failed! Retry!')
        this.confirmPswBtnLoading = false
        return
      }
      const decryptedPrivateKey = decryptInfo.data
      const privateKey = getDecryptPrivateKey(decryptedPrivateKey, this.aesKey)
      privateKey && (await this.$store.dispatch('SaveDecryptPrivateKeyInStore', { userId, address, encryptKey, privateKey }))

      this.confirmPswBtnLoading = false
      this.showInputPswModal = false
      await this.dealDataBeforeCreate()
    },
    _handleNetworkChange({ chainInfo, from }) {
      if (from === 'sendMenu') { return }
      this.currentChainInfo = CHAINMAP[web3.utils.numberToHex(chainInfo.id)]
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
    this.overrides.gasPrice = await getEstimateGas('gasPrice', 20000000000)
  },
  async mounted() {
    this.$eventBus.$on('networkChange', this._handleNetworkChange)
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