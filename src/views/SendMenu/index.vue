<template>
  <div class="send-menu-page content-box">
    <v-navTitle title="Send"></v-navTitle >
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
        placeholder="chose network"
        @change="handleNetworkChange" />
      <v-formInput label="Recipient" placeholder="Address" @inputChange="handleAddressInputChange" />
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
    <van-popup v-model="showLoading" round :close-on-click-overlay="false" class="waiting-modal flex flex-center flex-column">
      <div class="inner-wrapper">
        <van-loading type="spinner" />
      </div>
    </van-popup>
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
import { ethers, utils } from 'ethers'
import web3 from 'web3'
import { ETHFORUS } from '@/utils/global';
import { BigNumber } from "bignumber.js";
import { wait, prettyLog } from '@/utils/index'
import { TRANSACTION_TYPE } from '@/api/transaction';
import { NETWORKSFORTOKEN, CHAINMAP } from '@/utils/netWorkForToken';
import { saveToStorage, getFromStorage, removeFromStorage, getInfoFromStorageByKey } from '@/utils/storage';
import { generateTokenList, getDefaultETHAssets, metamaskNetworkChange, getConnectedAddress, initRPCProvider, getContractWallet, isLogin, getDATACode, getContractAt } from '@/utils/dashBoardTools';

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
    }
  },
  components: {
    "v-navTitle": navTitle,
    "v-formInput": formInput,
    "v-selectItem": selectItem,
    "v-formSelect": formSelect,
    'v-statusPop': StatusPop,
    'v-confirmModal': ConfirmModal,
  },
  computed: {
    defaultNetWork() {
      const info = getInfoFromStorageByKey('netInfo')
      return info && info['id'] || 1
    },
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
    gasPriceValue(type) {
      return this.gasPriceInfo && this.gasPriceInfo[type].gasPrice;
    },
    gasPriceConfirmTime(type) {
      return `${this.gasPriceInfo && this.gasPriceInfo[type].confirmationTime}sec`
    },
    changeVisible(eventInfo) {
      this.showStatusPop = eventInfo.show;
      this.$router.push({ name: 'overView' })
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
      const selectedConnectAddress = getConnectedAddress()
      if (!selectedConnectAddress) {
        this.assetsTokenList = []
        return
      }
      const currentChainId = this.currentChainInfo && this.currentChainInfo['id']
      const hexChainId = currentChainId && web3.utils.numberToHex(currentChainId)
      const rpcUrl = hexChainId && CHAINMAP[hexChainId]['rpcUrls'][0]
      const ETHAssets = await getDefaultETHAssets(this, rpcUrl);
      const tokenListRes = await this.$store.dispatch('GetAvailableTokenAssets', { selectedConnectAddress, chainInfo: this.currentChainInfo });
      const { hasError, list } = tokenListRes
      const tokenList = await generateTokenList(_.cloneDeep(list), this, true)
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
    async confirmSend() {
      this.showLoading = true
      this.showTradeConfirm = false
      const sendType = this.sendType
      const data = {
        gasPrice: this.sendMetadata.gasPrice,
        toAddress: this.addressForRecipient,
        selectedToken: this.selectedToken,
        type1Value: this.type1Value,
        type2Value: this.type2Value,
      }
      if (sendType === 'eth') {
        await this.sendETH(data)
      } else {
        await this.sendToken(data)
      }
    },
    checkData(data) {
      console.log('checkData')
      if (!utils.isAddress(data.toAddress)) {
        Toast.fail(`Wrong Address`);
        return false;
      }
      if (!data.selectedToken) {
        Toast.fail(`Choose Token`);
        return false;
      }
      if (!data.type1Value) {
        Toast.fail(`input amount`);
        return false;
      }
      if (new BigNumber(data.selectedToken.balanceNumberString).lt(new BigNumber(data.type1Value)) ||
      new BigNumber(data.selectedToken.balanceNumberString).eq(new BigNumber(0))) {
        Toast.fail(`Insufficient Balance`);
        return false;
      }
      return true
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
        Toast('Need Login')
        return
      }

      const sendData = {
        toAddress: this.addressForRecipient,
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
      }
      // gasPrice = web3.utils.toWei(gasPrice, 'gwei')

      const data = { gasPrice, ...sendData }
      const tokenName = this.selectedToken.tokenName
      
      this.sendType = tokenName === 'ETH' ? 'eth':'token'

      let datacode = '0x'
      let tempgasfixlimit = '0'
      if (this.sendType !== 'eth') {
        const abi = this.selectedToken.abiJson
        const decimals = BigNumber(10).pow(this.selectedToken.decimals).toNumber() // 1000000000000000000
        const amount = this.web3.utils.toHex(BigNumber(Number(sendData.type1Value*decimals)).toFixed())
        // const params = [sendData.toAddress, amount, { gasLimit: 600000, gasPrice: web3.utils.toWei(gasPrice, 'gwei') }]
        const params = [sendData.toAddress, amount]
        datacode = getDATACode(abi, 'transfer', params)

        const contractWithSigner = await getContractAt({ tokenAddress: this.selectedToken.tokenAddress, abi: this.selectedToken.abiJson }, this)
        tempgasfixlimit = await contractWithSigner.estimateGas.transfer(sendData.toAddress, amount, { gasLimit: 600000, gasPrice: web3.utils.toWei(gasPrice, 'gwei') })
      }
      console.log('datacode', datacode)
      console.log('tempgasfixlimit', tempgasfixlimit)
      
      this.sendMetadata = {
        from: selectedConnectAddress,
        to: this.addressForRecipient,
        gas: 21000,
        gasPrice,
        value: this.type1Value,
        symbolName: tokenName,
        netInfo: this.currentChainInfo,
        DATA: datacode,
        estimatedGasFee: utils.formatEther(tempgasfixlimit) // todo
      }
      this.showLoading = false
      this.showTradeConfirm = true
      return
      console.log('Transaction Data', data)
      if (this.selectedToken.tokenName === 'ETH') { // send ETH
        this.sendType = 'eth'
        this.sendETH(data)
      } else { // send token
        this.sendType = 'token'
        this.sendToken(data)
      }
    },
    /* async getContractWallet() {
      const url = this.currentChainInfo.rpcUrls[0]
      const provider = initRPCProvider(url)
      const userId = getInfoFromStorageByKey('gUID')
      const { data: userInfo } = await this.$store.dispatch('GetBindingGoogleUserInfo', {userId})
      const encryptKey = userInfo.encryptPrivateKey
      const decryptInfo = await this.$store.dispatch('DecryptPrivateKey', {userId, encryptKey })
      const { hasError, data: privateKey } = decryptInfo

      const wallet = new ethers.Wallet(privateKey, provider);
      return wallet
    }, */
    async sendETH(data) {
      // const contractWallet = await this.getContractWallet()
      const contractWallet = await getContractWallet(this)
      // const transactionCount = await contractWallet.getTransactionCount()
      // console.log('transactionCount', transactionCount)
      
      const selectedConnectAddress = getConnectedAddress()
      const transferAmount = utils.parseEther(data.type1Value);
      const sendData = {
        from: selectedConnectAddress,
        to: data.toAddress,
        // gasLimit: web3.utils.toHex('21000'),
        gasLimit: web3.utils.toHex('462693'),
        gasPrice: web3.utils.toHex(web3.utils.toWei(data.gasPrice, 'gwei')),
        value: transferAmount.toHexString(),
        chainId: this.currentChainInfo['id'],
        // nonce: transactionCount + 1,
      }
      console.log('sendData', sendData)
      contractWallet.sendTransaction({...sendData})
      .then(async tx=>{
        console.log('sendETH tx:', tx)
        tx.wait()
        .then(async res => {
          console.log('sendETH tx wait res:', res)
          await this.sendSuccess(res, {...this.selectedToken, amount: data.type1Value}, {selectedConnectAddress, toAddress: data.toAddress})
          this.showLoading = false
        })
      })
      .catch(error=>{
        this.sendFailed(error)
        this.showLoading = false
      })
    },
    async sendToken(data) {
      const { gasPrice, ...sendData } = data
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
        ...{ gasLimit: 600000, gasPrice: web3.utils.toWei(gasPrice, 'gwei') }
      }
      console.log('sendData', logData)
      // address, uint256
      contractWithSigner.transfer(sendData.toAddress, tokenWithdrawAmount, { gasLimit: 600000, gasPrice: web3.utils.toWei(gasPrice, 'gwei') })
      .then(async tx=>{
        console.log('sendToken tx:', tx)
        tx.wait()
        .then(async res => {
          console.log('sendToken tx wait res:', res)
          await this.sendSuccess(res, {...this.selectedToken, amount: sendData.type1Value}, address)
          this.showLoading = false
        })
      })
      .catch(error => {
        this.sendFailed(error)
        this.showLoading = false
      })
    },
    async sendSuccess(res, info, address) {
      const { selectedConnectAddress, toAddress } = address;
      const symbolName = info.tokenName || 'ETH'
      this.tipTxt = 'In progress, waitting';
      const submitData = {
        txid: res.transactionHash,
        block_num: res.blockNumber,
        from: res.from || selectedConnectAddress,
        to: toAddress || res.to, // res.to is diffrent from toAddress wthen sendToken by contract
        type: TRANSACTION_TYPE['L2ToL2'],
        status: res.status || 1,
        value: info.amount,
        name: symbolName,
        operation: symbolName === 'ETH' ? 'Send' : 'Transfer', // send、transfer、approve、swap ……
        network_id: web3.utils.hexToNumber(window.ethereum.chainId)
      }
      this.addHistoryData = _.cloneDeep(submitData);
      await this.addHistory(submitData);
    },
    sendFailed(error) {
      if (error.code == '4001') {
        Toast('Cancel Transaction')
        return
      }
      console.log(error)
      this.showLoading = false

      this.showStatusPop = true;
      this.statusPopTitle = 'Send Failed'
      this.popStatus = 'fail';
    },
    async addHistory(data) {
      const submitData = data || this.addHistoryData;
      if (!submitData) {
        Toast('Params Error');
        return ;
      }
      const res = await this.$store.dispatch('AddTransactionHistory', {...submitData});
      if (res.hasError) {
        this.showStatusPop = false;
        console.log('Transaction success，but error when add history')
      } else  {
        this.showLoading = false

        this.showStatusPop = true;
        this.statusPopTitle = 'Send Submitted'
        this.popStatus = 'success';
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
      if (data) { this.gasPriceInfo = data }
    },
    async handleNetworkChange(data) {
      this.$refs.tokenSelect.resetSelectVal()
      const chainInfo = CHAINMAP[web3.utils.numberToHex(data.value.id)]
      this.currentChainInfo = chainInfo
      await this.$store.dispatch('StoreSelectedNetwork', { netInfo: this.currentChainInfo })
      await this.getTokenAssetsForAccount()
    },
    async handleAccountChange(addressInfo) {
      this.showLoading = true;
      await this.getTokenAssetsForAccount()
      this.showLoading = false;
    },
  },
  async created() {
    this.netWorkList = _.cloneDeep(NETWORKSFORTOKEN)
    this.netWorkList.map(item => {
      if (item.id == this.defaultNetWork) {
        this.defaultIcon = item.icon
      }
    })
    const { data: netInfo } = await this.$store.dispatch('GetSelectedNetwork')
    if (netInfo) {
      this.currentChainInfo = CHAINMAP[web3.utils.numberToHex(netInfo['id'])]
    } else {
      this.currentChainInfo = CHAINMAP[web3.utils.numberToHex(this.defaultNetWork)]
    }
    await this.$store.dispatch('StoreSelectedNetwork', { netInfo: this.currentChainInfo })
  },
  async mounted() {
    if (!isLogin()) {
      Toast('Need Login')
      return
    }
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
