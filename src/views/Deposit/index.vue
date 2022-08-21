<template>
  <div class="deposit-page content-box">
    <v-navTitle :title="navTtile" helpUrl="docs/usage/Send"></v-navTitle >
    <div class="deposit-des">{{navDes}}</div>
    <div class="send-menu content-page">
      <v-InputSelect :label="recipientLable" :placeholder="recipientPlaceholder" :isSearch="true" @inputChange="handleAddressInputChange" v-if="currentModule !== 'dp'"/>
      <v-formSelect 
        label="Token"
        :labelShow="false" 
        placeholder="choose token"
        leftIcon="https://s3.amazonaws.com/token-icons/0x6b175474e89094c44da98b954eedeac495271d0f.png" 
        :dataSource="assetsTokenList"
        @change="handleTokenChange"
        ref="tokenSelect">
      </v-formSelect>
      <div class="send-value-box">
        <div class="send-value-item">
          <v-formInput :label="selectedToken && `${selectedToken.tokenName}`||'ETH'" placeholder="0" :value="type1Value" @inputChange="e=>handleExchangeInputChange(e,'type1')" :limitInput="true"/>
          <label class="blueColor">{{ selectedToken && `${selectedToken.balanceNumberString} ${selectedToken.tokenName}` || "0 ETH"}}</label>
        </div>
        <div class="send-value-item">
          <v-formInput label="USD" placeholder="0" :value="type2Value" @inputChange="e=>handleExchangeInputChange(e,'type2')" :limitInput="true" />
          <label>Max US${{ exchangeUSForSelectedToken }}</label>
        </div>
      </div>
      <div class="gas-price-box">
        <div>Gas Price</div>
        <div class="gas-price-setting">
          <span class="blueColor">{{ selectedGasType }}</span>
          <a class="blueColor" id="gasSetting" @click="gasBtn"><i class="gasPriceSetting"></i></a>
        </div>
      </div>
      <div class="send-btn-box">
        <a class="common-form-btn" @click="sendBtnClick">{{submitTxt}}</a>
      </div>
      <van-popup v-model="gasPopupVisible" round :style="{ width: '260px' }">
        <div v-if="loadingGas" :style="{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '200px' }"><van-loading type="spinner" /></div>
        <div class="gas-popup-box" v-else>
          <div class="header"><h3>Gas Price</h3></div>
          <ul class="gas-price-list">
            <v-selectItem :rightVal="gasPriceValue('Fast')" labelShow=true leftTitle="Fast" :leftDes="gasPriceConfirmTime('Fast')" :icon="require('@/assets/form/gasFast.png')" @childevent="selectChagne('Fast')"></v-selectItem>
            <v-selectItem :rightVal="gasPriceValue('Average')" labelShow=true leftTitle="Average" :leftDes="gasPriceConfirmTime('Average')" :icon="require('@/assets/form/gasAverag.png')" @childevent="selectChagne('Average')"></v-selectItem>
            <v-selectItem :rightVal="gasPriceValue('Average')" labelShow=true leftTitle="Custom"  :icon="require('@/assets/form/gasCustom.png')" @inputChange="inputGasChange" :showInput="true"></v-selectItem>
          </ul>
        </div>
      </van-popup>
    </div>
    <v-loadingPopup :show="showLoading" :showSpinner="false" />
    <v-statusPop
      :status="popStatus"
      :title="statusPopTitle"
      :timeTxt="timeTxt"
      tip=""
      :show="showStatusPop"
      @childEvent="changeVisible" />
    <v-confirmModal
      :show="showTradeConfirm"
      :type="transactionType"
      :metadata="sendMetadata"
      @close="showTradeConfirm=false"
      @reject="cancelSend"
      @confirm="confirmSend" />
    <v-inputPsw :show="showInputPswModal" @cancel="showInputPswModal=false" @ok="confirmPswOk" :btnLoading="confirmPswBtnLoading" />
  </div>
</template>

<script>
import _ from 'lodash'
import Vue from 'vue';
import { Popup, Toast, Loading } from 'vant';
import navTitle from '@/components/NavTitle/index';
import formInput from '@/components/Input/index';
import selectItem from '@/components/SelectItem/index';
import formSelect from '@/components/Select/index';
import StatusPop from '@/components/StatusPop';
import ConfirmModal from '@/components/ConfirmModal';
import LoadingPopup from '@/components/LoadingPopup';
import InputPswModal from '@/components/InputPswModal'
import InputSelect from '@/components/InputSelect/index';
import { ethers, utils, BigNumber } from 'ethers'
import web3 from 'web3'
import { walletTransactionRouter, multOperation, securityModuleRouter, lockType, rollupNCRouter } from '@/utils/global';
import { CHAINMAP } from '@/utils/netWorkForToken';
import { getInfoFromStorageByKey, getFromStorage, saveToStorage } from '@/utils/storage';
import {
  generateTokenList, getDefaultETHAssets, getConnectedAddress,
  getContractWallet, isLogin, getDATACode, getContractAt, 
  getDecryptPrivateKeyFromStore, getEncryptKeyByAddressFromStore, getEstimateGas, getConnectedUserAddress, addTransHistory, getThisProvider, getL2DefaultETHAssets  } from '@/utils/dashBoardTools';
import WalletTransaction from "@/assets/contractJSON/TransactionModule.json";
import WalletJson from "@/assets/contractJSON/Wallet.json";
import SecurityModule from "@/assets/contractJSON/SecurityModule.json";
import RollupNC from "@/assets/contractJSON/RollupNC.json";
import { generateEncryptPswByPublicKey, generateCR1ByPublicKey, getDecryptPrivateKey } from '@/utils/relayUtils'
import { promiseValue, formatErrorContarct } from '@/utils/index'
import { Account, accountHelper, Transaction } from '@ieigen/zkzru'
import * as cls from "circomlibjs"
import * as ffjavascript from "ffjavascript"
import { TRANSACTION_TYPE } from '@/api/transaction';

Vue.use(Popup);
Vue.use(Toast)
Vue.use(Loading)

export default {
  name: 'SendMenu',
  data() {
    return {
      gasPopupVisible: false,
      addressForRecipient: '',
      assetsTokenList: [],
      selectedToken: null,
      type1Value: '',
      type2Value: '',
      showLoading: false,
      popStatus: "success",
      statusPopTitle: 'Send Submitted',
      timeTxt: 'Will take effect in one minute',
      showStatusPop: false,
      gasPriceInfo: null,
      selectedGasType: '',
      loadingGas: false,
      currentChainInfo: null,
      defaultNetWork: '',
    
      sendType: '', // eth||token
      sendMetadata: null,
      showTradeConfirm: false,


      transFromType: 1, //1-account address ,2-wallet address
      transFromAddress: getConnectedAddress(),
      walletTransactionRouter,
      
      multOperation,
      securityModuleRouter,
      rollupNCRouter,

      recipientLable: 'Recipient',
      recipientPlaceholder: 'Address or Google account',

      navTtile: 'Deposit to L2',
      navDes: 'Pledge the money from main network to L2.',
      submitTxt: 'Deposit',
      currentModule: this.$route.query.type,
      
      overrides: {
        gasLimit: 8000000,
        gasPrice: 20000000000,//wei
      },
      
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
    "v-formInput": formInput,
    "v-selectItem": selectItem,
    "v-formSelect": formSelect,
    'v-statusPop': StatusPop,
    'v-confirmModal': ConfirmModal,
    'v-loadingPopup': LoadingPopup,
    'v-inputPsw': InputPswModal,
    'v-InputSelect': InputSelect,
  },
  watch: {
    "$route": function(to, from) {
      this.currentModule = this.$route.query.type;
      console.log(this.$route.query.type)
      this.getCurrentModuleTxt()
      this.getTokenAssetsForAccount()
    }
  },
  computed: {
    exchangeUSForSelectedToken() {
      const selectedToken = this.selectedToken
      if (!selectedToken) { return 0 }
      
      const value = ethers.utils.formatUnits(selectedToken.balance, selectedToken.decimals)
      return selectedToken && (value * selectedToken.exchangeForUS).toFixed(2)
      // return selectedToken && (selectedToken.balance * selectedToken.exchangeForUS).toFixed(2)
    },
    // Send for ETH ; Transfer for token
    transactionType() {
      return this.sendType === 'eth' ? 'Send' : 'Transfer'
    },
  },
  methods: {
    getCurrentModuleTxt() {
      switch(this.currentModule) {
        case 'dp'://Deposit
          this.navTtile = 'Deposit to L2'
          this.navDes = 'Pledge the money from main network to L2.'
          this.submitTxt = 'Deposit'
          break;
        case 'wd'://Withdraw
          this.navTtile = 'Withdraw to L1'
          this.navDes = 'Transfer funds from L2 to main network.'
          this.submitTxt = 'Withdraw'
          break;
        case 'sd'://send
          this.navTtile = 'Send in L2'
          this.navDes = 'Transfer between L2 networks, support plaintext and ciphertext transfer.'
          this.submitTxt = 'Send'
          break;
        default:
          break;
      }
    },
    getDefaultNetWork() {
      const info = getInfoFromStorageByKey('netInfo')
      return info && info['id'] || 1
    },
    gasPriceValue(type) {//gas set
      return this.gasPriceInfo && this.gasPriceInfo[type].gasPrice;
    },
    gasPriceConfirmTime(type) {
      return `${this.gasPriceInfo && this.gasPriceInfo[type].confirmationTime}sec`
    },
    changeVisible(eventInfo) {//
      this.showStatusPop = eventInfo.show;
      if (this.popStatus == 'success') {
        this.$router.push({
          path: `/history`,
          // query: {tabActive: 1},
        })
      }
    },
    async gasBtn() {
      this.loadingGas = true;
      this.gasPopupVisible = true
      await this.getGasPrice()
      this.loadingGas = false;
    },
    selectChagne(type) {
      this.gasPopupVisible = false
      console.log(type)
      this.selectedGasType = type;
    },
    inputGasChange(value) {
      this.selectedGasType = 'Custom';
      this.gasPriceInfo['Custom'] = { gasPrice: value.value }
    },
    handleAddressInputChange(data) {
      this.addressForRecipient = data.value
    },
    getTokenAssetsForAccount() {
      if (this.currentModule == 'dp') {
        this.getL1assets()
      } else {
        this.getL2Assets()
      }
    },
    async getL1assets() {
      this.assetsTokenList = []
      const selectedConnectAddress = this.transFromAddress ? this.transFromAddress : getConnectedAddress()
      console.log(selectedConnectAddress)
      if (!selectedConnectAddress) { return }
      const currentChainId = this.currentChainInfo && this.currentChainInfo['id']
      const hexChainId = currentChainId && web3.utils.numberToHex(currentChainId)
      const rpcUrl = hexChainId && CHAINMAP[hexChainId]['rpcUrls'][0]
      const ETHAssets = await getDefaultETHAssets(this, rpcUrl, selectedConnectAddress);
      const tokenListRes = await this.$store.dispatch('GetAvailableTokenAssets', { selectedConnectAddress, chainInfo: this.currentChainInfo });
      const { hasError, list } = tokenListRes
      const tokenList = await generateTokenList(_.cloneDeep(list), this, true, selectedConnectAddress)
      console.log('tokenList', tokenList)
      this.assetsTokenList = [].concat([ETHAssets], tokenList)
      console.log(this.assetsTokenList)
    },
    async getL2Assets() {
      this.assetsTokenList = []
      const selectedConnectAddress = this.transFromAddress ? this.transFromAddress : getConnectedAddress()
      const ETHAssets = await getL2DefaultETHAssets(this, selectedConnectAddress)
      this.assetsTokenList = [ETHAssets]
      console.log(this.assetsTokenList)
    },
    handleTokenChange(data) {
      this.selectedToken = data.value;
      this.type1Value = ''
      this.type2Value = ''
    },
    cancelSend() {
      this.showTradeConfirm = false
      Toast('Cancel Transaction')
    },
    async confirmSend({ overrides }) {
      this.showLoading = true
      this.showTradeConfirm = false
      const sendType = this.sendType
      const toSendAddress = this.addressForRecipient
      this.isShowInputPwd()
    },
    async checkData(data) {
      console.log('checkData')
      if (!utils.isAddress(data.toAddress)
        && this.currentModule !== 'dp') {
        return this.checkFalsed(`Invalid Address`)
      }
      if (!data.selectedToken) {
        return this.checkFalsed(`Choose Token`)
      }
      if (!data.type1Value) {
        return this.checkFalsed(`Please enter the amount`)
      }
      if (data.selectedToken.balanceNumberString < data.type1Value) {
        return this.checkFalsed(`Insufficient Balance`)
      }
      const selectedConnectAddress = getConnectedAddress()
      const currentInfo = await this.getAccountInfo(selectedConnectAddress)
      console.log(currentInfo)
      if (!currentInfo) {
        return this.checkFalsed(`Failed to get current user information`)
      }
      if (this.currentModule == 'dp') {
        if (currentInfo && currentInfo.length > 0) {
          return this.checkFalsed(`You have deposited`)
        }
      } else if (this.currentModule == 'sd') {
        if (!currentInfo || currentInfo.length == 0) {
          return this.checkFalsed(`You need to deposit first`)
        }

        const receiveInfo = await this.getAccountInfo(this.addressForRecipient)
        console.log(receiveInfo)
        if (!receiveInfo || receiveInfo.length == 0) {
          return this.checkFalsed(`Recipient need to deposit first`)
        }
      } else {
        if (!currentInfo || currentInfo.length == 0) {
          return this.checkFalsed(`You need to deposit first`)
        }
      }
      return true
    },
    checkFalsed(tip) {
      this.showLoading = false
      Toast(tip)
      return false
    },
    async dealDataBeforeSend() {
      this.showLoading = true
      console.log(this.transFromType)
      // if (this.transFromType == 2) {
      //   let securityModuleContract = await getContractAt({ tokenAddress: this.securityModuleRouter, abi: SecurityModule.abi }, this)
      //   let lockStatus = await securityModuleContract.isLocked(this.transFromAddress)
      //   console.log('lockstatus:' + lockStatus)
      //   if (lockStatus == lockType['GlobalLock'] || lockStatus == lockType['GlobalAndSigner']) {
      //     Toast('Wallet is locked')
      //     return
      //   }
      // }
      const sendData = {
        toAddress: this.addressForRecipient,
        selectedToken: this.selectedToken,
        type1Value: this.type1Value,
        type2Value: this.type2Value,
      }

      const isChecked = await this.checkData(sendData)
      console.log(isChecked)
      
      if (!isChecked) { return }

      const ETHToken = _.find(this.assetsTokenList, {tokenName: 'ETH'})
      console.log(ETHToken.balance)
      if (ETHToken && ETHToken.balance == 0) {
        Toast('Insufficient Balance')
        return
      }
      
      this.showGasModal()
    },
    async showGasModal() {
      let gasPrice = '20' // 20 Gwei
      if (this.selectedGasType) {
        gasPrice = this.gasPriceInfo && this.gasPriceInfo[this.selectedGasType].gasPrice
      } else {
        let gasPriceWei = await getEstimateGas('gasPrice')
        gasPrice = web3.utils.fromWei(gasPriceWei.toString(), 'gwei')
      }

      const tokenName = this.selectedToken.tokenName
      this.sendType = tokenName === 'ETH' ? 'eth':'token'

      let datacode = '0x'; // transaction DATA
      let estimatedGasFee = await getEstimateGas('gasUsed')
      this.sendMetadata = {
        from: this.transFromAddress,
        to: this.rollupNCRouter,
        gas: 8000000, // gasLimit default is 21000
        gasPrice,
        value: this.type1Value,
        symbolName: tokenName,
        netInfo: this.currentChainInfo,
        DATA: datacode,
        estimatedGasFee: estimatedGasFee
      }
      this.showLoading = false
      this.showTradeConfirm = true
    },
    async sendBtnClick() {
      const selectedConnectAddress = getConnectedAddress()
      if (!selectedConnectAddress) {
        Toast('Please Login')
        return
      }
      await this.dealDataBeforeSend()
    },
    getTokenType() {
      // const tokenName = this.selectedToken.tokenName
      // console.log(tokenName)
      // const tokenType = tokenName == 'ETH' ? 1 : 2
      const tokenType = 1
      return tokenType
    },
    getAmount() {
      const amountWei = web3.utils.toWei(this.type1Value, 'ether')
      // const aomuntGwei = web3.utils.fromWei(amountWei, 'gwei') 
      return amountWei
    },
    async getL2Pubkey() {
      const privateKey = await getDecryptPrivateKeyFromStore(this)
      const l2Pubkey = await accountHelper.generatePubkey(privateKey)
      return l2Pubkey
    },
    async getNonce(address) {
      const { hasError, data} = await this.$store.dispatch('getAccountNonce', address)
      const nonce = data.nonce || 0
      return nonce
    },
    async withdrawSubmit() {
      this.sendInitTx('withdraw')
    },
    async sendSubmit() {
      this.sendInitTx('send')
    },
    async sendInitTx(type) {
      const selectedConnectAddress = getConnectedAddress()
      const receiveAddress = this.addressForRecipient
      const tokenType = this.getTokenType()
      const l2Pubkey = await this.getL2Pubkey()
      const sendInfo = await this.getAccountInfo(selectedConnectAddress)
      const fromPrivateKey = await getDecryptPrivateKeyFromStore(this)
      
      if (!sendInfo || sendInfo.length == 0) {
        this.showLoading = false
        this.sendFailed('You need to deposit first')
        return
      }
      let receivePubKeyX, receivePubKeyY, amountWei;
      amountWei = this.getAmount()
      if (type == 'withdraw') {
        // amountWei = ethers.utils.parseEther(this.type1Value) //eth
        receivePubKeyX = 0
        receivePubKeyY = 0
      } else {
        // amountWei = this.getAmount() //gwei
        const receiveInfo = await this.getAccountInfo(receiveAddress)
        console.log('receiveInfo:', receiveInfo)
        if (!receiveInfo || receiveInfo.length == 0) {
          this.showLoading = false
          this.sendFailed('Recipient need to deposit first')
          return
        }
        const receivePubKey = this.fromHexString(receiveInfo[0].pubkey)
        receivePubKeyX = receivePubKey.slice(2, 34)
        receivePubKeyY = receivePubKey.slice(34, 66)
      }
      const sendIndex = sendInfo[(sendInfo.length-1)].account_index
      //todo
      // const sendNonce = sendInfo[(sendInfo.length-1)].nonce//send nonce
      const sendNonce = await this.getNonce(selectedConnectAddress)
      
      
      console.log("sendIndex:", sendIndex)
      console.log(typeof(sendIndex))
      console.log("sendNonce:", sendNonce)
      console.log("amountWei:", amountWei)
      console.log("tokenType:", tokenType)
      var tx = new Transaction(l2Pubkey[0], l2Pubkey[1], sendIndex, receivePubKeyX, receivePubKeyY, sendNonce, amountWei, tokenType)
      
      //SIGN
      await tx.initialize()
      tx.hashTx();
      tx.signTxHash(fromPrivateKey);
      console.log(tx)
      const fdfd = await this.toDecString(tx.hash)
      tx.checkSignature()
      if (type == 'withdraw') {
        const withdrawData = await this.withDrawSign(fromPrivateKey, sendNonce, receiveAddress)
        console.log(withdrawData)
        this.addZkzruTx(tx, type, sendIndex, sendNonce, amountWei, tokenType, withdrawData, receiveAddress)
      } else {//send
        console.log(tx)
        this.addZkzruTx(tx, type, sendIndex, sendNonce, amountWei, tokenType)
      }
    },
    async updateNonce(address, nonce) {
      const upNonce = {
        address: address,
        nonce: nonce + 1,
      }
      const { hasError, data} = await this.$store.dispatch('updateAccountNonce', upNonce)
      console.log(data)
    },
    async withDrawSign(fromPrivateKey, sendNonce, receiveAddress) {
      const buildEddsa = cls.buildEddsa
      const buildMimc7 = cls.buildMimc7
      const buildBabyjub = cls.buildBabyjub
      const mimcjs = await buildMimc7()
      const eddsa = await buildEddsa()
      const babyJub = await buildBabyjub()
      let F = mimcjs.F
      var pubKey = eddsa.prv2pub(fromPrivateKey)
      var m = mimcjs.multiHash([sendNonce, receiveAddress])
      const msg = F.e(m);
      var signature = eddsa.signMiMC(fromPrivateKey, msg);
      var verify = eddsa.verifyMiMC(msg, signature, pubKey)
      const inputs = {
        Ax: F.toString(pubKey[0]),
        Ay: F.toString(pubKey[1]),
        R8x: F.toString(signature.R8[0]),
        R8y: F.toString(signature.R8[1]),
        S: signature.S.toString(),
        M: F.toString(msg)
      }
      return inputs

    },
    async addZkzruTx(tx, type, sendIndex, sendNonce, amountWei, tokenType, withdrawData, receiveAddress) {
      console.log(tx)
      const r8x = this.toHexString(tx.R8x)
      const r8y = this.toHexString(tx.R8y)
      const s = ffjavascript.utils.stringifyBigInts(tx.S)
      let receiverPubkey
      let senderPubkey
      if (tx.toX == 0 && tx.toY == 0 || type == 'withdraw') {
        receiverPubkey = '0'
      } else {
        let toX = this.toHexString(tx.toX)
        let toY = this.toHexString(tx.toY)
        receiverPubkey = '0x' + '04' + toX + toY
      }
      if (tx.fromX == 0 && tx.fromY == 0) {
        senderPubkey = '0'
      } else {
        let fromX = this.toHexString(tx.fromX)
        let fromY = this.toHexString(tx.fromY)
        senderPubkey = '0x' + '04' + fromX + fromY
      }
      let submitData = {
        network_id: this.currentChainInfo['id'].toString(),
        from_index: sendIndex,
        senderPubkey: senderPubkey,
        r8x: r8x,
        r8y: r8y,
        s: s,
        receiverPubkey: receiverPubkey,
        tokenTypeFrom: tokenType,
        amount: amountWei,
        nonce: sendNonce,
        status: 0,
      }
      if (type == 'withdraw') {//txid=9
        console.log(withdrawData)
        submitData.withdraw_r8x = withdrawData.R8x
        submitData.withdraw_r8y = withdrawData.R8y
        submitData.withdraw_s = withdrawData.S
        submitData.withdraw_msg = withdrawData.M
        submitData.recipient = receiveAddress
      }
      console.log("addtx:", submitData)
      const { hasError, data, error} = await this.$store.dispatch('zkzruTx', submitData)
      if (hasError) {
        let tip = error || 'Add tx failed'
        this.sendFailed(tip)
      } else {
        const selectedConnectAddress = getConnectedAddress()
        this.updateNonce(selectedConnectAddress, sendNonce)
        this.sendSuccess()
        // if (type == 'withdraw') {
          // this.saveTxInfo(data)
        // }
      }
    },
    /**
    saveTxInfo(data) {
      this.listenUpdateState()
    },
    async listenUpdateState() {
      // rollupNCContract.on('RequestDeposit', (author, oldValue, newValue, event) => {
      //   console.log(event)
      // })
      const l2Pubkey = await this.getL2Pubkey()
      const hexPubkeyX = this.toHexString(l2Pubkey[0])
      const hexPubkeyY = this.toHexString(l2Pubkey[1])
      let hexPubkey = [hexPubkeyX, hexPubkeyY]
      const l2PubkeyUncompressed = '0x' + '04' + hexPubkey[0] + hexPubkey[1]
      const { hasError, data} = await this.$store.dispatch('getWithdrawList', l2PubkeyUncompressed)
      console.log(data)
      // const withdrawTxList = getInfoFromStorageByKey('withdrawTx') || []
      for (var i = 0; i < data.length; i++) {
        const item = data[i]
        await this.getWithdrawTx(item.tx_id)
      }
    },
    async getWithdrawTx(txid) {
      const { hasError, data} = await this.$store.dispatch('getZkzruTxStatus', txid)
      const txStatus = data[0] && data[0].status
      if (txStatus == 1) {//0-confirming 1-confirmed
        await this.getWithdrawInfo(txid)
      }
    },
    async getWithdrawInfo(txid) {
      const { hasError, data} = await this.$store.dispatch('getWithdrawInfo', {tx_id: txid})
      console.log(data)
      if (!data) {
        return
      }
      await this.withdrawContrant(data, txid)
    },
    async withdrawContrant(data, txid) {
      const withdrawTxInfo = data
      const txInfo = withdrawTxInfo.txInfo
      let rollupNCContract = await getContractAt({ tokenAddress: this.rollupNCRouter, abi: RollupNC.abi }, this)
      const selectedConnectAddress = getConnectedAddress()
      txInfo.amount = BigNumber.from(txInfo.amount)
      rollupNCContract.withdraw(txInfo, withdrawTxInfo.recipient, withdrawTxInfo.withdrawProof, { from: selectedConnectAddress, ...this.overrides }).then(async tx=> {
          console.log(tx)
          tx.wait().then(async res => {
            console.log('withdraw:', res)
            this.deleteWithTx(txid)
          }).catch(error => {
          console.log(error)
         })
      }).catch(error => {
        console.log(error)
      })
    },
    async deleteWithTx(txid) {
      const { hasError, data} = await this.$store.dispatch('updateWithdrawStatus', {tx_id: txid})
      console.log(data)
      // let withdrawTxList = getInfoFromStorageByKey('withdrawTx')
      // for (var i = 0; i < withdrawTxList.length; i++) {
      //   if (withdrawTxList[i] == txid) {
      //     withdrawTxList.splice(i, 1)
      //   }
      // }
      // saveToStorage({'withdrawTx': withdrawTxList})
    },
    */
    async getAccountInfo(address) {
      const { hasError, data} = await this.$store.dispatch('getZkzruAccountInfo', address)
      return data
    },
    async depositSubmit() {
      const currentUserAds = getConnectedAddress()
      let rollupNCContract = await getContractAt({ tokenAddress: this.rollupNCRouter, abi: RollupNC.abi }, this)
      const privateKey = await getDecryptPrivateKeyFromStore(this)
      // const coordinatorPrvkey = this.generatePrvkey(privateKey)
      const l2Pubkey = await accountHelper.generatePubkey(privateKey)
      console.log('l2Pubkey:', l2Pubkey)
      const decPubkeyX = await this.toDecString(l2Pubkey[0])
      const decPubkeyY = await this.toDecString(l2Pubkey[1])
      let decPubkey = [decPubkeyX, decPubkeyY]
      console.log("decpubkey:", decPubkey)

      const hexPubkeyX = this.toHexString(l2Pubkey[0])
      const hexPubkeyY = this.toHexString(l2Pubkey[1])
      let hexPubkey = [hexPubkeyX, hexPubkeyY]
      console.log("hexPubkey:", hexPubkey)
      const tokenType = this.getTokenType()
      const aomuntWei = this.getAmount()
      const aomuntEth = ethers.utils.parseEther(this.type1Value)//eth 
      let transData
      if (tokenType == 1) {//eth
        transData = {
          value: aomuntEth,
          from: currentUserAds
        }
      } else {//token
        transData = {
          from: currentUserAds
        }
      }
      rollupNCContract.deposit(decPubkey, aomuntWei, tokenType, { ...transData, ...this.overrides }).then(async tx=> {
          console.log(tx)
          tx.wait().then(async res => {
            this.addDeposit(privateKey, hexPubkey, tokenType, aomuntWei, res)
            console.log('Deposit:', res)
          }).catch(error => {
           console.log(error)
           let errorValue = formatErrorContarct(error)
           this.sendFailed(errorValue)
          })
      }).catch(error => {
        console.log(error)
        let errorValue = formatErrorContarct(error)
        this.sendFailed(errorValue)
      })
    },
    toHexString(bytes) {
      return bytes.reduce((str, byte) => str + byte.toString(16).padStart(2, '0'), '')
    },
    async toDecString(bytes) {
      const buildMimc7 = cls.buildMimc7
      let mimcjs = await buildMimc7()
      let F = mimcjs.F
      let pubkey = F.toString(bytes)
      return pubkey
    },

    fromHexString(hexString) {
      return Uint8Array.from(hexString.match(/.{1,2}/g).map((byte) => parseInt(byte, 16)))
    },

    async addDeposit(privateKey, hexPubkey, tokenType, aomuntWei, tx) {
      const selectedConnectAddress = getConnectedAddress()
      const fromNonce = 0
      const coordinatorPubkeyUncompressed = '0x' + '04' + hexPubkey[0] + hexPubkey[1]
      let submitData = {
        network_id: this.currentChainInfo['id'].toString(),
        // index: fromNonce,
        pubkey: coordinatorPubkeyUncompressed,
        tokenType: tokenType,
        balance: aomuntWei,
        nonce: fromNonce,
        // prvkey: privateKey,
        address: selectedConnectAddress,
      }
      const { hasError, data} = await this.$store.dispatch('zkzruAccout', submitData)
      if (hasError) {
        this.sendFailed('Failed to add account')
      } else {
        this.sendSuccess()
        tx.hash = tx.transactionHash
        addTransHistory(tx, 'Deposit', this, this.type1Value, null, null, TRANSACTION_TYPE['L1ToL2'])
      }
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
      // console.log(`GetPublicKey result is: ${publicKey}`)
      
      // const password = ecies.crypto.randomBytes(16).toString("base64");
      const encryptPsw = generateEncryptPswByPublicKey(publicKey, psw); // generate cc1
      const { cr1: encryptCr1, aesKey } = generateCR1ByPublicKey(this.publicKey); // generate cr1
      // console.log('aesKey:', aesKey)
      this.aesKey = aesKey
      this.encryptPsw = encryptPsw
      this.encryptCr1 = encryptCr1
      // console.log(`encryptPsw: ${encryptPsw}, \n encryptCr1: ${encryptCr1}`)

      // to decrypt privatekey
      const userId = getInfoFromStorageByKey('gUID')
      const address = getConnectedUserAddress()
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
      this.contractSubmit()
    },
    
    sendSuccess() {
      this.showLoading = false
      this.showStatusPop = true;
      this.statusPopTitle = 'Submitted'
      this.popStatus = 'success';
    },
    sendFailed(error) {
      this.showLoading = false
      this.showStatusPop = true;
      this.statusPopTitle = error
      this.popStatus = 'fail';
    },
    async handleExchangeInputChange(data, type) {
      console.log(type, data)
      const value = data.value
      this[`${type}Value`] = value
      if (type === 'type1') {
        this.type2Value = !this.selectedToken ? value * this.ETHFORUS : value * this.selectedToken.exchangeForUS
      }
      if (type === 'type2') {
        this.type1Value = !this.selectedToken ? value * this.ETHFORUS : value * this.selectedToken.exchangeForUS
      }
    },
    async getGasPrice() {
      const { hasError, data } = await this.$store.dispatch('GetGasPriceByEtherscan');
      console.log(data)
      if (data) { this.gasPriceInfo = data }
    },
    async transFromChange(data) {
      let dataArray = data.split('-')
      this.transFromType = dataArray[0]
      this.transFromAddress = dataArray[1]
      await this.getTokenAssetsForAccount()
      console.log(this.transFromAddress)
    },
    async handleAccountChange(addressInfo) {
      this.showLoading = true;
      this.transFromAddress = getConnectedAddress()
      await this.getCurrentAccountType()
      await this.getTokenAssetsForAccount()
      this.showLoading = false;
    },
    _handleNetworkChange({ chainInfo, from }) {
      if (from === 'sendMenu') { return }
      this.defaultNetWork = chainInfo.id
    },
    getCurrentAccountType() {
      const userId = getFromStorage('gUID')
      if (userId) {
        const userMap = getInfoFromStorageByKey('userMap');
        const userData = userMap && userMap[userId]
        if (userData['walletAddress']) {
          this.transFromType = 2
        } else {
          this.transFromType = 1
        }
      } else {
        this.transFromType = 1
      }
    },
    async isShowInputPwd() {
      const privateKey = await getDecryptPrivateKeyFromStore(this)
      if (!privateKey) {
        this.showInputPswModal = true;
        return
      }
      this.contractSubmit()
    },
    contractSubmit() {
      if (this.currentModule == 'dp') {
        this.depositSubmit()
      } else if (this.currentModule == 'sd') {
        this.sendSubmit()
      } else if (this.currentModule == 'wd') {
        this.withdrawSubmit()
      }
    },
  },
  async created() {
    this.defaultNetWork = this.getDefaultNetWork()
    
    const { data: netInfo } = await this.$store.dispatch('GetSelectedNetwork')
    console.log(netInfo)
    if (netInfo) {
      this.currentChainInfo = CHAINMAP[web3.utils.numberToHex(netInfo['id'])]
    } else {
      this.currentChainInfo = CHAINMAP[web3.utils.numberToHex(this.defaultNetWork)]
    }
    this.getCurrentAccountType()//get account type ;normal,wallet
    this.getCurrentModuleTxt()//get show text
    await this.$store.dispatch('StoreSelectedNetwork', { netInfo: this.currentChainInfo })
    // this.isShowInputPwd()//is has privatekey
    console.log(this.rollupNCRouter)
    // this.updateNonce('0x28ef362ba842842df918bae66ee02ab47185e358', 1)
    // const nonce = this.getNonce('0x28ef362ba842842df918bae66ee02ab47185e358')
    // let rollupNCContract = await getContractAt({ tokenAddress: this.rollupNCRouter, abi: RollupNC.abi }, this)
    // console.log(rollupNCContract)
    // const root = await rollupNCContract.queueNumber()//
    // console.log(root)
    // console.log(web3.utils.hexToNumber(root))
    
    // const root2 = await rollupNCContract.currentRoot()//
    // console.log(root2)
    // console.log(root2.toString())
    // const root1 = await rollupNCContract.pendingDeposits(0)//
    // console.log(root1)
    // console.log(root1.toString())
    // console.log(web3.utils.hexToNumber(root))
   // console.log(ethers.utils.computeAddress('0x04fb31711201464adcc4623d4a86cf11a6275f5e4b6fb47541e01420d4bc7cf101e85fab8385dd77e2a27cf8a4dce1f64836d40de13a31c040f1be4b978882aa19'))
  },
  async mounted() {
    if (!isLogin()) {
      Toast('Please Login')
      return
    }
    this.$eventBus.$on('networkChange', this._handleNetworkChange)
    this.$eventBus.$on('changeAccout', this.handleAccountChange)
    await this.$store.dispatch('StoreSelectedNetwork', { netInfo: this.currentChainInfo })
    const { hasError, forUsdt } = await this.$store.dispatch('GetTokenAxchangeForUS', { changeType: 'ETH/USDT' });
    this.ETHFORUS = forUsdt
    await this.getTokenAssetsForAccount()
  }
};
</script>
<style lang="scss" scoped>
  @import "index";
</style>
