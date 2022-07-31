<template>
  <div class="send-menu-page content-box">
    <v-navTitle title="Send" helpUrl="docs/usage/Send"></v-navTitle >
    <div class="send-menu content-page">
      <!-- <v-formSelect 
        label="Recipient" 
        leftIcon="https://s3.amazonaws.com/token-icons/0x6b175474e89094c44da98b954eedeac495271d0f.png" 
        :dataSource="reciData">
      </v-formSelect> -->
      <v-formSelect 
        label="NETWORK"
        :labelShow="false"
        :defaultValue="defaultNetWork"
        :leftIcon="defaultIcon" 
        :dataSource="netWorkList"
        placeholder="choose network"
        @change="handleNetworkChange" />
      <!-- <div class="send-from-box">
        <v-transFrom @transFromChange="transFromChange"></v-transFrom>
      </div> -->
      <!-- <v-formInput label="Recipient" placeholder="Address or Google account" :isSearch="true" @inputChange="handleAddressInputChange" /> -->
      <v-InputSelect :label="recipientLable" :placeholder="recipientPlaceholder" :isSearch="true" :isSupportHide="true" @inputChange="handleAddressInputChange" @hideChange="addressHideChange" />
      <v-formSelect 
        label="Token"
        :labelShow="false" 
        placeholder="chose token"
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
        <a class="common-form-btn" @click="sendSubmit">Send</a>
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
import InputSelect from '@/components/InputSelect/index';
import StatusPop from '@/components/StatusPop';
import ConfirmModal from '@/components/ConfirmModal';
// import TransFrom from '@/components/TransFrom';
import LoadingPopup from '@/components/LoadingPopup';
import InputPswModal from '@/components/InputPswModal'
import { ethers, utils } from 'ethers'
import web3 from 'web3'
import { walletTransactionRouter, multOperation, securityModuleRouter, lockType } from '@/utils/global';
import { BigNumber } from "bignumber.js";
import { TRANSACTION_TYPE } from '@/api/transaction';
import { NETWORKSFORTOKEN, CHAINMAP } from '@/utils/netWorkForToken';
import { getInfoFromStorageByKey, getFromStorage } from '@/utils/storage';
import {
  generateTokenList, getDefaultETHAssets, getConnectedAddress,
  getContractWallet, isLogin, getDATACode, getContractAt, 
  getDecryptPrivateKeyFromStore, getEncryptKeyByAddressFromStore, getEstimateGas, getConnectedUserAddress, getThisProvider, PublickeyToAddress } from '@/utils/dashBoardTools';
import WalletTransaction from "@/assets/contractJSON/TransactionModule.json";
import WalletJson from "@/assets/contractJSON/Wallet.json";
import SecurityModule from "@/assets/contractJSON/SecurityModule.json";
import { generateEncryptPswByPublicKey, generateCR1ByPublicKey, getDecryptPrivateKey } from '@/utils/relayUtils'
import { promiseValue, formatErrorContarct } from '@/utils/index'
import { PublicKey, Message } from '@/utils/anonymousAddress'
import { Buffer } from 'buffer'

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
      defaultIcon: null,
      netWorkList: [],
      /* reciData: [
       {
        rightVal: 144,
        leftTitle: 'fast',
        leftDes: '45sec',
        icon: 'https://s3.amazonaws.com/token-icons/0x6b175474e89094c44da98b954eedeac495271d0f.png'
       },
       {
        rightVal: 109,
        leftTitle: 'Average',
        leftDes: '45sec',
        icon: 'https://token-icons.s3.amazonaws.com/0x0cb8d0b37c7487b11d57f1f33defa2b1d3cfccfe.png'
       }
      ], */
      
      sendType: '', // eth||token
      sendMetadata: null,
      showTradeConfirm: false,

      transFromType: 1, //1-account address ,2-wallet address
      transFromAddress: getConnectedAddress(),
      walletTransactionRouter,
      modelData: '',

      multOperation,
      securityModuleRouter,

      recipientLable: 'Recipient',
      recipientPlaceholder: 'Address or Google account',
      isHideAddress: false,
      hideMessage: '',
      stealthPublicKey: '',

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
    // 'v-transFrom': TransFrom,
    'v-loadingPopup': LoadingPopup,
    'v-inputPsw': InputPswModal,
    'v-InputSelect': InputSelect,
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
    getDefaultNetWork() {
      const info = getInfoFromStorageByKey('netInfo')
      return info && info['id'] || 1
    },
    gasPriceValue(type) {
      return this.gasPriceInfo && this.gasPriceInfo[type].gasPrice;
    },
    gasPriceConfirmTime(type) {
      return `${this.gasPriceInfo && this.gasPriceInfo[type].confirmationTime}sec`
    },
    changeVisible(eventInfo) {
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
    async getTokenAssetsForAccount() {
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
      const toSendAddress = await this.getToSendAddress()
      const data = {
        gasPrice: overrides.gasPrice || this.sendMetadata.gasPrice,
        gasLimit: overrides.gasLimit || this.sendMetadata.gas,
        toAddress: toSendAddress,//address or publickey
        selectedToken: this.selectedToken,
        type1Value: this.type1Value,
        type2Value: this.type2Value,
      }
      if (this.transFromType == 1) {//from is account address
        if (sendType === 'eth') {
          await this.sendETH(data)
        } else {
          console.log('token')
          await this.sendToken(data)
        }
      } else {//from is transfrom wallet
        this.walletTrans(data)
      }
    },
    async getToSendAddress() {
      let thisComputeAddress = this.addressForRecipient
      if (this.isHideAddress) {
        const receivePubKey = this.addressForRecipient
        const selectedConnectAddress = getConnectedAddress()
        const contractProvider = await getThisProvider()
        const nonce = await contractProvider.getTransactionCount(selectedConnectAddress)
        const senderPrivateKeyHex = await getDecryptPrivateKeyFromStore(this)
        
        const currentWallet = await getContractWallet(this)
        const senderPublicKey = currentWallet.publicKey
        
        this.hideMessage = await Message(nonce, senderPublicKey, receivePubKey, this.type1Value)//this.type1Value
        console.log(this.hideMessage)
        this.stealthPublicKey = PublicKey(receivePubKey, Buffer.from(this.hideMessage), nonce, senderPrivateKeyHex)
        console.log(this.stealthPublicKey)
        thisComputeAddress = PublickeyToAddress(this.stealthPublicKey)
        console.log(thisComputeAddress)
      }
      return thisComputeAddress
    },
    checkData(data) {
      console.log('checkData')
      if (!utils.isAddress(data.toAddress) && !this.isHideAddress) {
        Toast(`Invalid Address`);
        return false;
      }
      if (!data.selectedToken) {
        Toast(`Choose Token`);
        return false;
      }
      if (!data.type1Value) {
        Toast(`input amount`);
        return false;
      }
      if (new BigNumber(data.selectedToken.balanceNumberString).lt(new BigNumber(data.type1Value)) ||
      new BigNumber(data.selectedToken.balanceNumberString).eq(new BigNumber(0))) {
        Toast(`Insufficient Balance`);
        return false;
      }
      return true
    },
    async dealDataBeforeSend() {
      if (this.transFromType == 2) {
        let securityModuleContract = await getContractAt({ tokenAddress: this.securityModuleRouter, abi: SecurityModule.abi }, this)
        let lockStatus = await securityModuleContract.isLocked(this.transFromAddress)
        console.log('lockstatus:' + lockStatus)
        if (lockStatus == lockType['GlobalLock'] || lockStatus == lockType['GlobalAndSigner']) {
          Toast('Wallet is locked')
          return
        }
      }
      const toSendAddress = await this.getToSendAddress()
      const sendData = {
        toAddress: toSendAddress,
        selectedToken: this.selectedToken,
        type1Value: this.type1Value,
        type2Value: this.type2Value,
      }

      const ETHToken = _.find(this.assetsTokenList, {tokenName: 'ETH'})
      if (ETHToken && ETHToken.balance.lte(0)) {
        Toast('Not Enough ETH')
        return
      }
      
      if (!this.checkData(sendData)) { return }
      this.showLoading = true

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
      let tempgasfixlimit = '0'; // transaction estimate gas fee
      if (this.sendType !== 'eth') {
        const abi = this.selectedToken.abiJson
        const decimals = BigNumber(10).pow(this.selectedToken.decimals).toNumber() // 1000000000000000000
        const amount = this.web3.utils.toHex(BigNumber(Number(sendData.type1Value*decimals)).toFixed())
        // const params = [sendData.toAddress, amount, { gasLimit: 600000, gasPrice: web3.utils.toWei(gasPrice, 'gwei') }]
        const params = [sendData.toAddress, amount]
        datacode = getDATACode(abi, 'transfer', params)

        const contractWithSigner = await getContractAt({ tokenAddress: this.selectedToken.tokenAddress, abi: this.selectedToken.abiJson }, this)
        console.log(contractWithSigner)
        // tempgasfixlimit = await contractWithSigner.estimateGas.transfer(sendData.toAddress, amount, { gasLimit: 600000, gasPrice: web3.utils.toWei(gasPrice, 'gwei') })
        const { hasError,res } = await promiseValue(contractWithSigner.estimateGas['transfer'](
            sendData.toAddress, amount, { gasLimit: 600000, gasPrice: web3.utils.toWei(gasPrice, 'gwei') }
          ))
        hasError && console.log(res)
        !hasError && res && (tempgasfixlimit = res)
      }
      console.log('datacode', datacode)
      console.log('tempgasfixlimit', tempgasfixlimit)
      
      this.modelData = datacode
      this.sendMetadata = {
        from: this.transFromAddress,
        to: this.addressForRecipient,
        gas: this.sendType !== 'eth' ? 600000 : 462693, // gasLimit default is 21000
        gasPrice,
        value: this.type1Value,
        symbolName: tokenName,
        netInfo: this.currentChainInfo,
        DATA: datacode,
        estimatedGasFee: utils.formatEther(tempgasfixlimit) // todo
      }
      this.showLoading = false
      this.showTradeConfirm = true
    },
    async sendSubmit() {
      /* if (!window.ethereum) {
        Toast('need install metamask')
        return
      }
      if (!window.ethereum.selectedAddress) {
        Toast('need connect metamask')
        return
      } */

      const selectedConnectAddress = getConnectedAddress()
      if (!selectedConnectAddress) {
        Toast('Please Login')
        return
      }

      // check privateKey whether is existed
      const privateKey = await getDecryptPrivateKeyFromStore(this)
      if (!privateKey) {
        this.showInputPswModal = true;
        return
      }
      await this.dealDataBeforeSend()
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
      await this.dealDataBeforeSend()
    },
    async sendETH(data) {
      const contractWallet = await getContractWallet(this)
      // const transactionCount = await contractWallet.getTransactionCount()
      // console.log('transactionCount', transactionCount)
      
      const selectedConnectAddress = getConnectedAddress()
      const transferAmount = utils.parseEther(data.type1Value);
      const sendData = {
        from: selectedConnectAddress,
        to: data.toAddress,
        gasLimit: web3.utils.toHex(data.gasLimit),
        gasPrice: web3.utils.toHex(web3.utils.toWei(data.gasPrice, 'gwei')),
        value: transferAmount.toHexString(),
        chainId: this.currentChainInfo['id'],
        // nonce: transactionCount + 1,
      }
      console.log('sendData', sendData)
      contractWallet.sendTransaction({...sendData})
      .then(async tx=>{
        console.log('sendETH tx:', tx)
        await this.sendSuccess(tx, {...this.selectedToken, amount: data.type1Value}, {selectedConnectAddress, toAddress: data.toAddress})
        tx.wait()
        .then(async res => {
          console.log('sendETH tx wait res:', res)
          
          this.showLoading = false
        })
      })
      .catch(error=>{
        this.sendFailed(error)
        this.showLoading = false
      })
    },
    async sendToken(data) {
      const { gasPrice, gasLimit, ...sendData } = data
      const selectedConnectAddress = getConnectedAddress()
      const address = {
        selectedConnectAddress,
        toAddress: sendData.toAddress
      }

      const decimals = BigNumber(10).pow(this.selectedToken.decimals).toNumber() // 1000000000000000000
      // const tokenWithdrawAmount = this.web3.utils.toHex(BigNumber(Number(sendData.type1Value*1000000000000000000)).toFixed())
      const tokenWithdrawAmount = this.web3.utils.toHex(BigNumber(Number(sendData.type1Value*decimals)).toFixed())
      

      this.showLoading = true
      const contractWallet = await getContractWallet(this)
      let contractWithSigner = new ethers.Contract(this.selectedToken.tokenAddress, this.selectedToken.abiJson, contractWallet)
      const logData = {
        1: sendData.toAddress,
        2: tokenWithdrawAmount,
        ...{ gasLimit, gasPrice: web3.utils.toWei(gasPrice, 'gwei') }
      }
      console.log('sendData', logData)
      // address, uint256
      contractWithSigner.transfer(sendData.toAddress, tokenWithdrawAmount, { gasLimit, gasPrice: web3.utils.toWei(gasPrice, 'gwei') })
      .then(async tx=>{
        console.log('sendToken tx:', tx)
        await this.sendSuccess(tx, {...this.selectedToken, amount: sendData.type1Value}, address)
        tx.wait()
        .then(async res => {
          console.log('sendToken tx wait res:', res)
          
          this.showLoading = false
        })
      })
      .catch(error => {
        console.log(error)
        this.sendFailed(error)
        this.showLoading = false
      })
    },
    async walletTrans(data) {
      let thisWalletAddress = this.transFromAddress
      let inputValue = data.type1Value
      const walletTransactionContract = await getContractAt({ tokenAddress: this.walletTransactionRouter, abi: WalletTransaction.abi }, this)
      walletTransactionContract.getLargeAmountPayment(thisWalletAddress).then(res => {
        let perTransWei =  web3.utils.toBN(res).toString()
        let maxPerTransaction = web3.utils.fromWei(perTransWei, 'ether')
        if (inputValue >= maxPerTransaction && this.sendType == 'eth') {//large transaction need multicall
          this.walletLargeTrans(data)
        } else {//litte transaction
          this.walletSamllTrans(data)
        }
      }).catch(error => {
        console.log(error)
      }) 
    },
    async walletSamllTrans(data) {
      console.log(data)
      const expireTime = Math.floor((new Date().getTime()) / 1000) + 1800; // 60 seconds
      
      let txData = '0x'
      let thisWalletAddress = this.transFromAddress
      let amount = ethers.utils.parseEther(data.type1Value)
      let transTo = data.toAddress
      let transAmount = amount
      
      if (this.sendType !== 'eth') {
        let iface = new ethers.utils.Interface(data.selectedToken.abiJson)
        txData = iface.encodeFunctionData("transfer", [data.toAddress, amount])
        transTo = data.selectedToken.tokenAddress
        transAmount = 0
      }
      console.log(txData)

      const walletContract = await getContractAt({ tokenAddress: this.transFromAddress, abi: WalletJson.abi }, this)
      let sequenceId = await walletContract.getNextSequenceId()
      
      const walletTransactionContract = await getContractAt({ tokenAddress: this.walletTransactionRouter, abi: WalletTransaction.abi }, this)
      console.log(walletTransactionContract)
      
      
      walletTransactionContract.executeTransaction(
            thisWalletAddress,
            [transTo, transAmount, txData, sequenceId, expireTime], {gasLimit: data.gasLimit, gasPrice: web3.utils.toWei(data.gasPrice, 'gwei')}
      ).then(async tx=>{
        console.log(tx)
        await this.sendSuccess(tx, {...this.selectedToken, amount: data.type1Value}, {selectedConnectAddress: this.transFromAddress, toAddress: data.toAddress}, true)
        tx.wait().then(async res=>{
          console.log(res)
          this.showLoading = false
        }).catch(error => {
          this.sendFailed(error)
          this.showLoading = false
        })
      }).catch(error => {
        this.sendFailed(error)
        this.showLoading = false
      })
    },
    async walletLargeTrans(data) {
      // let tx ={
      //   hash: null
      // }
      // await this.sendSuccess(tx, {...this.selectedToken, amount: data.type1Value}, {selectedConnectAddress: this.transFromAddress, toAddress: data.toAddress}, true)
      let securityModuleContract = await getContractAt({ tokenAddress: this.securityModuleRouter, abi: SecurityModule.abi }, this)
      const submitData = {
        user_id: getFromStorage('gUID'),
        wallet_address: this.transFromAddress,
        to: data.toAddress,
        value: data.type1Value,
        network_id: web3.utils.hexToNumber(this.currentChainInfo['id']),
        data: this.modelData,
        operation: multOperation['LargeTransaction']
      }
      const res = await this.$store.dispatch('addMultTx', submitData);
      this.showLoading = false
      if (res.hasError) {
        this.showStatusPop = false;
        console.log('Transaction success，but error when add history')
      } else  {
        this.showStatusPop = true;
        this.statusPopTitle = 'Please waiting for another signer to confirm the transaction in "Overview-History-Multisig Wallt"'
        this.popStatus = 'success';
        this.$eventBus.$emit('addTransactionHistory')
      }
    },
    async sendSuccess(res, info, address, isWallet) {
      const { selectedConnectAddress, toAddress } = address;
      const symbolName = info.tokenName || 'ETH'
      this.tipTxt = 'In progress, waitting';
      const submitData = {
        txid: res.hash,
        // block_num: res.blockNumber,
        from: isWallet ? selectedConnectAddress : (res.from || selectedConnectAddress),
        to: toAddress || res.to, // res.to is diffrent from toAddress wthen sendToken by contract
        type: TRANSACTION_TYPE['L1ToL1'],
        status: 0,
        value: info.amount,
        name: symbolName,
        operation: symbolName === 'ETH' ? 'Send' : 'Transfer', // send、transfer、approve、swap ……
        network_id: web3.utils.hexToNumber(this.currentChainInfo['id']),
        from_type: isWallet ? 1 : 0,
      }
      this.addHistoryData = _.cloneDeep(submitData);
      console.log(submitData)
      await this.addHistory(submitData);
      if (this.isHideAddress) {
        await this.addStealHistory(res, address, symbolName);
      }
    },
    sendFailed(error) {
      if (error.code == '4001') {
        Toast('Cancel Transaction')
        return
      }
      console.log(error)
      this.showLoading = false

      this.showStatusPop = true;
      let errorValue = formatErrorContarct(error)
      this.statusPopTitle = errorValue
      this.popStatus = 'fail';
    },
    async addStealHistory(res, address, symbolName) {
      const { selectedConnectAddress, toAddress } = address
      const currentWallet = await getContractWallet(this)
      const senderPublicKey = currentWallet.publicKey
      const userId = getFromStorage('gUID')
      const receiverAddress = PublickeyToAddress(this.addressForRecipient)
      const submitData = {
        sender_public_key: senderPublicKey,
        sender_address: selectedConnectAddress,
        stealth_address: toAddress,
        stealth_public_key: this.stealthPublicKey,
        message: this.hideMessage,
        nonce: res.nonce,
        amount: this.type1Value,
        user_id: userId,
        token_name: symbolName,
        receiver_address: receiverAddress.toLocaleLowerCase(),
      }
      const result = await this.$store.dispatch('addStealth', {...submitData})
      console.log(result)
    },
    async addHistory(data) {
      const submitData = data || this.addHistoryData;
      if (!submitData) {
        Toast('Params Error');
        return;
      }
      const res = await this.$store.dispatch('AddTransactionHistory', {...submitData});
      this.showLoading = false
      if (res.hasError) {
        this.showStatusPop = false;
        console.log('Transaction success，but error when add history')
      } else  {
        this.showStatusPop = true;
        this.statusPopTitle = 'Submitted'
        this.popStatus = 'success';
        this.$eventBus.$emit('addTransactionHistory')
      }
      return { hasError: res.hasError };
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
    async handleNetworkChange(data, emitEvent) {
      this.$refs.tokenSelect!==undefined && this.$refs.tokenSelect.resetSelectVal()
      this.assetsTokenList = []
      const chainInfo = CHAINMAP[web3.utils.numberToHex(data.value.id)]
      this.currentChainInfo = chainInfo
      await this.$store.dispatch('StoreSelectedNetwork', { netInfo: this.currentChainInfo })
      // emitEvent && (this.$eventBus.$emit('networkChange', { chainInfo, from:'sendMenu' }))
      this.$eventBus.$emit('networkChange', { chainInfo, from:'sendMenu' })
      await this.getTokenAssetsForAccount()
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
      this.defaultIcon = chainInfo.icon
      this.handleNetworkChange({value:{id:chainInfo.id}}, true)
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
    addressHideChange(isHide) {
      this.isHideAddress = isHide
      if (isHide) {
        this.recipientLable = 'Receiver Public Key'
        this.recipientPlaceholder = 'Public key only'
      } else {
        this.recipientLable = 'Recipient'
        this.recipientPlaceholder = 'Address or Google account'
      }
    }
  },
  async created() {
    this.defaultNetWork = this.getDefaultNetWork()
    this.netWorkList = _.cloneDeep(NETWORKSFORTOKEN)
    this.netWorkList.map(item => {
      if (item.id == this.defaultNetWork) {
        this.defaultIcon = item.icon
      }
    })
    const { data: netInfo } = await this.$store.dispatch('GetSelectedNetwork')
    console.log(netInfo)
    if (netInfo) {
      this.currentChainInfo = CHAINMAP[web3.utils.numberToHex(netInfo['id'])]
    } else {
      this.currentChainInfo = CHAINMAP[web3.utils.numberToHex(this.defaultNetWork)]
    }
    this.getCurrentAccountType()
    await this.$store.dispatch('StoreSelectedNetwork', { netInfo: this.currentChainInfo })
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
