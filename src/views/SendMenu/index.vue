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
        @change="handleTokenChange">
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
        <div>Network Fee</div>
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
            <v-selectItem :rightVal="gasPriceValue('Average')" labelShow=true leftTitle="Custom"  :icon="require('@/assets/form/gasCustom.png')" @childevent="selectChagne('Custom')"></v-selectItem>
          </ul>
        </div>
      </van-popup>
    </div>
    <v-statusPop
      :status="popStatus"
      :title="statusPopTitle"
      :timeTxt="timeTxt"
      tip=""
      :show="showStatusPop"
      @childEvent="changeVisible" />
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
import { ethers, utils } from 'ethers'
import web3 from 'web3'
import { ETHFORUS } from '@/utils/global';
import { BigNumber } from "bignumber.js";
import { wait, prettyLog } from '@/utils/index'
import { TRANSACTION_TYPE } from '@/api/transaction';
import { NETWORKSFORTOKEN } from '@/utils/netWorkForToken';
import { generateTokenList, getDefaultETHAssets, metamaskNetworkChange } from '@/utils/dashBoardTools';

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
      popStatus: "success",
      statusPopTitle: 'Send Submitted',
      timeTxt: 'Will take effect in one minute',
      showStatusPop: false,
      gasPriceInfo: null,
      selectedGasType: '',
      loadingGas: false,
      currentChainInfo: null,
      defaultNetWork: 1,
      netWorkList: [],
      reciData: [
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
      ],
      
    }
  },
  components: {
    "v-navTitle": navTitle,
    "v-formInput": formInput,
    "v-selectItem": selectItem,
    "v-formSelect": formSelect,
    'v-statusPop': StatusPop,
  },
  computed: {
    exchangeUSForSelectedToken() {
      const selectedToken = this.selectedToken
      if (!selectedToken) { return 0 }
      return selectedToken && (selectedToken.balance * selectedToken.exchangeForUS).toFixed(2)
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
    handleAddressInputChange(data) {
      this.addressForRecipient = data.value
    },
    async getTokenAssetsForAccount() {
      const selectedConnectAddress = window.ethereum.selectedAddress;
      if (!selectedConnectAddress) {
        this.assetsTokenList = []
        return
      }
      const ETHAssets = await getDefaultETHAssets(this);
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
    // TODO
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
      if (!window.ethereum) {
        Toast('need install metamask')
        return
      }
      if (!window.ethereum.selectedAddress) {
        Toast('need connect metamask')
        return
      }
      const sendData = {
        toAddress: this.addressForRecipient,
        selectedToken: this.selectedToken,
        type1Value: this.type1Value,
        type2Value: this.type2Value,
      }
      
      if (!this.checkData(sendData)) { return }

      const gasPrice = this.gasPriceInfo && this.gasPriceInfo[this.selectedGasType === 'Custom'?"Average":this.selectedGasType].gasPrice || '1'
      const metamaskProvider = new ethers.providers.Web3Provider(window.ethereum);
      
      if (this.selectedToken.tokenName === 'ETH') { // send ETH
        this.sendETH(gasPrice, sendData)
      } else { // send token
        this.sendToken(metamaskProvider, gasPrice, sendData)
      }
    },
    sendETH(gasPrice, sendData) {
      const address = {
        selectedConnectAddress: window.ethereum.selectedAddress,
        toAddress: sendData.toAddress
      }
      const transferAmount = utils.parseEther(sendData.type1Value);
      const transferParams = [{
        from: address.selectedConnectAddress,
        to: address.toAddress,
        gas: web3.utils.toHex('21000'), // 21000的16进制 '0x5208
        gasPrice,
        value: transferAmount.toHexString()
      }];
      console.log('submitData', transferParams)
      ethereum.request({
        jsonrpc: "2.0",
        method: "eth_sendTransaction",
        params: transferParams,
        id: 0
      })
      .then(async res=>{
        await this.sendSuccess(res, {...this.selectedToken, amount: sendData.type1Value}, address)
      })
      .catch(error=>{
        this.sendFailed(error)
      })
    },
    sendToken(metamaskProvider, gasPrice, sendData) {
      const address = {
        selectedConnectAddress: window.ethereum.selectedAddress,
        toAddress: sendData.toAddress
      }
      const l1Signer = metamaskProvider.getSigner(0);
      const myContract = new ethers.Contract(this.selectedToken.tokenAddress, this.selectedToken.abiJson, l1Signer)
      const tokenWithdrawAmount = this.web3.utils.toHex(BigNumber(Number(sendData.type1Value*1000000000000000000)).toFixed())
      // address, uint256
      myContract.transfer(sendData.toAddress, tokenWithdrawAmount, { gasLimit: 600000, gasPrice })
      .then(async res=>{
        console.log(res)
        await this.sendSuccess(res, {...this.selectedToken, amount: sendData.type1Value}, address)
      })
      .catch(error => {
        this.sendFailed(error)
      })
    },
    async sendSuccess(res, info, address) {
      const { selectedConnectAddress, toAddress } = address;
      const symbolName = info.tokenName || 'ETH'
      this.tipTxt = 'In progress, waitting';
      const submitData = {
        txid: symbolName === 'ETH' ? res : res.hash,
        from: selectedConnectAddress,
        to: toAddress,
        type: TRANSACTION_TYPE['L2ToL2'],
        status: 1,
        value: info.amount,
        name: symbolName,
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
        this.showStatusPop = true;
        this.statusPopTitle = 'Transfer Submitted'
        this.popStatus = 'success';
        await wait();
        // this.$router.push({ name: 'home' });
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
    handleNetworkChange(data) {
      this.currentChainInfo = data.value;
      metamaskNetworkChange(data, async (res)=>{
        if (!res) {
          await this.getTokenAssetsForAccount()
        }
      })
    },
  },
  created() {
    this.netWorkList = _.cloneDeep(NETWORKSFORTOKEN)
    window.ethereum && (this.defaultNetWork = web3.utils.hexToNumber(window.ethereum.chainId))
  },
  async mounted() {
    const { hasError, forUsdt } = await this.$store.dispatch('GetTokenAxchangeForUS', { changeType: 'ETH/USDT' });
    this.ETHFORUS = forUsdt
    await this.getTokenAssetsForAccount()
  }
};
</script>
<style lang="scss" scoped>
  @import "index";
</style>
