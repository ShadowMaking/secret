<template>
  <div class="exchange-page content-box">
    <v-navTitle title="Exchange"></v-navTitle>
    <div class="exchange-content content-page">
      <div class="from-box">
        <v-formSelect 
          label="NETWORK"
          :labelShow="false" 
          :defaultValue="defaultNetWork"
          :leftIcon="require('@/assets/network/defaultNetwork.png')"
          :dataSource="netWorkList"
          placeholder="chose network"
          @change="handleNetworkChange" />
      </div>
      <div class="from-box">
        <v-exchangItem
          key="fromToken"
          isMax=true
          type="From"
          :sourceData="assetsTokenList"
          @selectChagne="val=>selectChagne('exchangFrom', val)"
          @inputChange="val=>inputChange('exchangFrom', val)" />
      </div>
      <div class="from-box">
        <v-exchangItem
          key="toToken"
          type="To"
          :sourceData="allTokenList"
          :inputDisabled="true"
          @selectChagne="val=>selectChagne('exchangTo', val)"
          @inputChange="val=>inputChange('exchangeTo', val)" />
      </div>
      <ul class="setting-box">
        <li>
          <h3 class="setting-title">Transaction Settings</h3>
          <van-icon name="setting" @click="settingBtn" class="setting-icon"/>
        </li>
        <li><h3>Slippage Tolerance</h3><h3>{{slippageVal}}%</h3></li>
        <!-- <li><h3>Allowance</h3><h3>limited</h3></li> -->
        <li><h3>Estimated Gas Fee</h3><h3>${{gasVal}}</h3></li>
        <li><h3>Gas Price</h3><h3>{{networkFee}}</h3></li>
        <div v-if="showSettingData">
          
        </div>
      </ul>
      <div class="exchange-btn-box">
        <a class="common-form-btn" @click="approveSubmit">Allow CowSwap to use your JBX</a>
      </div>
      <div class="exchange-btn-box">
        <a class="common-form-btn" @click="exchangeSubmit">Exchange</a>
      </div>
      <van-popup v-model="settingPopVisibel" round :style="{ maxWidth: '320px', width: '50%' }">
        <div class="setting-popup-box">
          <div class="header"><h3>Slippage Tolerance</h3></div>
          <div class="slippage-list">
            <a :class="{active: slippageKey == 2}" @click="slippageBtn(2, false)">2%</a>
            <a :class="{active: slippageKey == 3}" @click="slippageBtn(3, false)">3%</a>
            <span class="slippage-input" :class="{active: slippageKey == 4}" @input="slippageBtn('4', true)"><input type="number" name="slippage" v-model="slippageInput" placeholder="3">%</span>
          </div>
          <div class="header"><h3>Gas Price</h3></div>
          <div>
            <div v-if="loadingGas" :style="{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '200px' }"><van-loading type="spinner" /></div>
            <ul class="gas-price-list" v-else>
              <v-selectItem :class="{gasActive: gasKey == 'Fast'}" :rightVal="gasPriceValue('Fast')" labelShow=true leftTitle="Fast" :leftDes="gasPriceConfirmTime('Fast')" :icon="require('@/assets/form/gasFast.png')" @childevent="gasChagne('Fast')"></v-selectItem>
              <v-selectItem :class="{gasActive: gasKey == 'Average'}" :rightVal="gasPriceValue('Average')" labelShow=true leftTitle="Average" :leftDes="gasPriceConfirmTime('Average')" :icon="require('@/assets/form/gasAverag.png')" @childevent="gasChagne('Average')"></v-selectItem>
              <v-selectItem :class="{gasActive: gasKey == 'Custom'}" :rightVal="gasPriceValue('Average')" labelShow=true leftTitle="Custom" :icon="require('@/assets/form/gasCustom.png')" @childevent="gasChagne('Custom')"></v-selectItem>
            </ul>
          </div>
        </div>
      </van-popup>
    </div>
  </div>
</template>

<script>
import _ from 'lodash'
import Vue from 'vue';
import { Icon, Loading, Toast } from 'vant';
import navTitle from '@/components/NavTitle/index';
import exchangItem from '@/components/ExchangItem/index';
import formSelect from '@/components/Select/index';
import selectItem from '@/components/SelectItem/index';
import { NETWORKSFORTOKEN } from '@/utils/netWorkForToken';
import { generateTokenList, getDefaultETHAssets, metamaskNetworkChange } from '@/utils/dashBoardTools';
import { ethers, utils } from 'ethers'
import web3 from 'web3'
import { BigNumber } from "bignumber.js";
import { SWAPADDRESS } from '@/utils/global'
import { saveToStorage, getFromStorage, removeFromStorage, getInfoFromStorageByKey } from '@/utils/storage';
import swapJson from './Swap.json'

import IUniswapV2Router02 from "./JSON/IUniswapV2Router02.json";
import IERC20 from "./JSON/IERC20.json";
// import IWETH from "./JSON/IWETH.json";
import IWETH from "./JSON/WETH9.json";

Vue.use(Icon);
Vue.use(Loading);
Vue.use(Toast);


export default {
  name: 'Exchange',
  data() {
    return {
      currentChainInfo: null,
      defaultNetWork: 1,
      netWorkList: _.cloneDeep(NETWORKSFORTOKEN),
      assetsTokenList: [],
      allTokenList: [],
      loadingGas: false,
      gasPriceInfo: null,

      exchangFrom: '',
      exchangeTo: '',
      settingPopVisibel: false,
      showSettingData: false,
      slippageKey: 2,
      gasKey: 'Fast',
      slippageVal: 2,
      gasVal: 1,
      networkFee: '~~',
      slippageInput: 3,

      // *********************** uniswap2 test ************************************/
      user: null,
      DAI: null,
      WETH: null,
      ROUTER: null,
      routerAddress: "0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D", // Uniswap v2 Router02
      fromToken: `0xad6d458402f60fd3bd25163575031acdce07538d`, // Ropsten DAI
      toToken: `0xc778417e063141139fce010982780140aa0cd5ab`, // Ropsten WETH
      // overrides: { gasLimit: 1000000, gasPrice: 20000 }
      overrides: { gasLimit: 1000000, gasPrice: 20000000000 }
      // *********************** uniswap2 test ************************************/
    }
  },
  components: {
    "v-navTitle": navTitle,
    "v-exchangItem": exchangItem,
    "v-selectItem": selectItem,
    "v-formSelect": formSelect,
  },
  methods: {
    gasPriceValue(type) {
      return this.gasPriceInfo && this.gasPriceInfo[type].gasPrice;
    },
    gasPriceConfirmTime(type) {
      return `${this.gasPriceInfo && this.gasPriceInfo[type].confirmationTime}sec`
    },
    selectChagne(type, record) {
      this[`${type}Token`] = record
    },
    async inputChange(type, record) {
      if (type === 'exchangFrom') {
        const tokenA = this.exchangFromToken
        const tokenB = this.exchangToToken
        const tokenASymbol = tokenA && !!tokenA['tokenAddress'] ?  tokenA['symbol'] : 'ETH'
        const tokenBSymbol = tokenB && tokenB['symbol']
        const changeType = `${tokenASymbol}/${tokenBSymbol}`
        const { hasError, forUsdt } = await this.$store.dispatch('GetTokenAxchangeForUS', {changeType});
        this.exchangTo = record && `${record}*${forUsdt}` || 0.00
      }
      this[type] = record
    },
    checkData(data) {
      /* if (!data.tokenFrom && this.exchangFromToken) {
        Toast.fail('Nonsupport ETH')
        return false
      } */

      if (!this.exchangFromToken || !this.exchangToToken) {
        Toast.fail('Choose Token')
        return false
      }

      if (!data.amountin) {
        Toast.fail('Need Input Amountin')
        return false
      }

      if (new BigNumber(this.exchangFromToken.balanceNumberString).lt(new BigNumber(data.amountin)) ||
      new BigNumber(this.exchangFromToken.balanceNumberString).eq(new BigNumber(0))) {
        Toast.fail(`Insufficient Balance`);
        return false;
      }

      return true
    },
    // *********************************************************** uniswap2 test ropsten *********************************************************** /
    async getContractAt({ tokenAddress, abi }) {
      const metamaskProvider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = metamaskProvider.getSigner(0);

      const MyContract = new ethers.Contract(tokenAddress, abi, signer)
      await MyContract.attach(tokenAddress)
      console.log("Contract: ", MyContract.address);

      return MyContract
    },
    // TokenAmount: BigNumber, ETHAmount: BigNumber
    async addLiquidity(TokenAmount, ETHAmount, tokenType, gasInfo) {
      const tokenInfo = tokenType === 'from' ? this.exchangFromToken : this.exchangToToken
      const { tokenAddress, abiJson } = tokenInfo
      const TokenContract = await this.getContractAt({ tokenAddress, abi: abiJson })
      const ROUTERContract = await this.getContractAt({ tokenAddress: this.routerAddress, abi: IUniswapV2Router02.abi })

      let tx;
      let res;
      const overrides = { ...gasInfo }
      // tx = await TokenContract.approve(ROUTERContract.address, TokenAmount, overrides);
      // res = await tx.wait();
      // console.log("Approve Token: ", res);
      // https://docs.uniswap.org/protocol/V2/reference/smart-contracts/router-02#addliquidityeth
      tx = await ROUTERContract.addLiquidityETH(
        TokenContract.address,
        TokenAmount,
        TokenAmount,
        ETHAmount,
        window.ethereum.selectedAddress,
        ethers.constants.MaxUint256,
        {
          ...overrides,
          value: ETHAmount,
        }
      );
      res = await tx.wait();
      console.log("ROUTER.addLiquidityETH: ", res);
    },
    // ETH exchange for Token
    async exchangeETH2Token(data) {
      await this.exchangeToken('to', data)
    },
    // Token exchange for Token
    async exchangeToken2Token(data) {
      await this.exchangeToken('from', data)
    },

    // type: to || from (to:ETH2token, from:token2token)
    async exchangeToken(type, data) {
      const { hasError, isApprove } = await this.getUserAllowanceForToken()
      if (!isApprove && type === 'from') {
        Toast('Please Allow CowSwap to use your JBX')
        return
      }

      const overrides = { ...data.gasInfo }
      const DAIAmount = ethers.utils.parseUnits("10");
      
      const amountIn = ethers.utils.parseUnits(data.amountin);
      // const approveTokenAmount = ethers.utils.parseUnits(BigNumber(data.amountin).multipliedBy(100).toString())

      if (type === 'to') {
        // const TokenAmount = ethers.utils.parseUnits("10");
        const TokenAmount = ethers.utils.parseUnits(this.exchangeTo);
        const ETHAmount = ethers.utils.parseEther(data.amountin);
        await this.addLiquidity(TokenAmount, ETHAmount, `${type}`, overrides);
      }

      const ROUTERContract = await this.getContractAt({ tokenAddress: this.routerAddress, abi: IUniswapV2Router02.abi })

      if (type === 'from') {
        // https://docs.uniswap.org/protocol/V2/reference/smart-contracts/router-02#swapexacttokensfortokenssupportingfeeontransfertokens
        let tx = await ROUTERContract.swapExactTokensForTokensSupportingFeeOnTransferTokens(
          amountIn,
          0, // TODO
          // [DAI.address, WETH.address],
          [data.tokenFrom, data.tokenTo],
          // user.address,
          window.ethereum.selectedAddress,
          ethers.constants.MaxUint256,
          overrides
        );
        // let res = await tx.wait();
        // console.log("swapExactTokensForTokensSupportingFeeOnTransferTokens: ", res);
        tx.wait()
        .then(res=>{
          console.log("swapExactTokensForTokensSupportingFeeOnTransferTokens: ", res);
          console.log('success')
        })
        .catch(error => {
          console.log("swapExactTokensForTokensSupportingFeeOnTransferTokens: ", error);
          console.log('error')
        })
      } else {
        // https://docs.uniswap.org/protocol/V2/reference/smart-contracts/router-02#swapexactethfortokenssupportingfeeontransfertokens
        let tx = await ROUTERContract.swapExactETHForTokensSupportingFeeOnTransferTokens(
          // amountIn,
          0, // TODO
          // [DAI.address, WETH.address],
          [data.tokenFrom, data.tokenTo],
          // user.address,
          window.ethereum.selectedAddress,
          ethers.constants.MaxUint256,
          overrides
        );
        // let res = await tx.wait();
        // console.log("swapExactETHForTokensSupportingFeeOnTransferTokens: ", res);
        tx.wait()
        .then(res=>{
          console.log("swapExactETHForTokensSupportingFeeOnTransferTokens: ", res);
          console.log('success')
        })
        .catch(error => {
          console.log("swapExactETHForTokensSupportingFeeOnTransferTokens: ", error);
          console.log('error')
        })
      }
    },
    // *********************************************************** uniswap2 test ropsten *********************************************************** /
    getSubmitData() {
      const data = {
        tokenFrom: this.exchangFromToken && this.exchangFromToken['tokenAddress'],
        tokenTo: this.exchangToToken && this.exchangToToken['tokenAddress'],
        amountin: this.exchangFrom, // 100
        amountmin: BigNumber(this.exchangFrom||0).minus((BigNumber(this.exchangFrom||0) * BigNumber(this.slippageKey).div(100))),
        fee: 3000,
        gasInfo: { gasLimit: 1000000, gasPrice: 20000000000 } // const gasInfo = { gasLimit: 100000, gasPrice: 29859858 }
      }
      console.log('exchangeData', data)
      return data
    },
    async getUserAllowanceForToken() {
      const token = this.exchangFromToken;
      const chainId = window.ethereum && window.ethereum.chainId;
      const userAddress = window.ethereum && window.ethereum.selectedAddress;
      const allowanceTokenData = {
        userId: getFromStorage('gUID'),
        network_id: web3.utils.hexToNumberString(chainId),
        token_address: token['tokenAddress'],
        user_address: userAddress,
        swap_address: this.routerAddress,
      }
      const { hasError, isApprove } = await this.$store.dispatch('GetUserAllowanceForToken', {...allowanceTokenData})
      return { hasError, isApprove, allowanceTokenData }
    },
    thirdLogin() {
      const userId = getFromStorage('gUID')
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
    async approveSubmit() {
      if(!this.thirdLogin()) { return }
      if(!this.connectedWallet()) { return }

      const token = this.exchangFromToken
      console.log(token)
      if (!token) {
        Toast('Choose Token')
        return
      }

      // fromToken is ETH
      if (token && !token['tokenAddress']) {
        Toast('Do not need approve')
        return
      }

      const { hasError, isApprove, allowanceTokenData } = await this.getUserAllowanceForToken()
      if (isApprove) {
        Toast('Already Approved')
        return
      }

      const submitData = this.getSubmitData()
      const TokenContract = await this.getContractAt({ tokenAddress: token.tokenAddress, abi: token.abiJson })
      const approveTokenAmount = ethers.constants.MaxUint256; // max
      const overrides = submitData.gasInfo

      TokenContract.approve(this.routerAddress, approveTokenAmount, overrides)
      .then(async res=>{
        const txRes = await res.wait()
        console.log(`Approve Token-${token.tokenName} res: `, txRes);
        return

        const saveTokenData = {
          ...allowanceTokenData,
          allowance: approveTokenAmount
        }
        const { hasError, data, error } = await this.$store.dispatch('SaveUserAllowanceForToken', {...saveTokenData})
        if (hasError) {
          console.log('SaveUserAllowanceForToken Error', error)
        }
      })
      .catch(err => {
        console.log(`Approve Token-${token.tokenName} error: `, err);
      })
    },
    async exchangeSubmit() {
      if(!this.thirdLogin()) { return }
      if(!this.connectedWallet()) { return }
      
      console.log(this)
      const data = this.getSubmitData()
      if (!this.checkData(data)) { return }

      // fromToken is ETH
      if (!data.tokenFrom && this.exchangFromToken) {
        await this.exchangeETH2Token(data)
      } else { // fromToken is token and toToken is token too
        await this.exchangeToken2Token(data)
      }
      return

      const tokenA = data.tokenFrom; // '0x5076d190F242ae67E607CaAa081bF28F93Dc224D'
      const tokenB = data.tokenTo; // '0x8730786a6cd94bE7F3100F4c5C0e67b0517Cda6B'

      const abi = swapJson.abi
      const metamaskProvider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = metamaskProvider.getSigner(0);
      const myContract = new ethers.Contract(SWAPADDRESS, abi, signer)
      console.log('myContract', myContract)

      await myContract.attach(SWAPADDRESS)
      myContract.swapExactInputSingle(tokenA, tokenB, data.fee, data.amountin, data.amountmin, data.gasInfo)
      .then(async res => {
        console.log('res1', res)
        await res.wait()
        myContract.swapExactOutputSingle(tokenA, tokenB, data.fee, data.amountin, data.amountmin, data.gasInfo)
        .then(async res => {
          console.log('res2', res)
          await res.wait()
        })
        .catch(error=>{
          console.log(error)
        })
      })
      .catch(error=>{
        console.log(error)
      })
    },
    async getGasPrice() {
      const { hasError, data } = await this.$store.dispatch('GetGasPriceByEtherscan');
      if (data) { this.gasPriceInfo = data }
    },
    async settingBtn() {
      this.loadingGas = true;
      this.settingPopVisibel = true
      await this.getGasPrice()
      this.loadingGas = false;

      this.showSettingData = true
      this.slippageVal = 2
      this.gasVal = this.gasPriceInfo['Fast']['gasPrice']
      this.networkFee = 'Fast'
    },
    gasChagne(type) {
      this.gasKey = this.networkFee = type
      this.gasVal = this.gasPriceInfo[type === 'Custom'?'Average': type]['gasPrice']
    },
    slippageBtn(val,isInput) {
      this.slippageKey = val
      isInput ? (this.slippageVal = this.slippageInput) : (this.slippageVal = val)
    },
    handleNetworkChange(data) {
      this.currentChainInfo = data.value;
      metamaskNetworkChange(data, async (res)=>{
        if (!res) {
          await this.getTokenList(true)
        }
      })
    },
    async getTokenList(forAccounts) {
      const selectedConnectAddress = window.ethereum.selectedAddress;
      if (!selectedConnectAddress) {
        this.allTokenList = []
        this.assetsTokenList = []
        return
      }
      const methodName = forAccounts ? 'GetAvailableTokenAssets' : 'GetAllTokenList'
      const { hasError, list } = await this.$store.dispatch(methodName, { selectedConnectAddress, chainInfo: this.currentChainInfo });
      const tokenList = await generateTokenList(_.cloneDeep(list), this, forAccounts)
      if (forAccounts) {
        const ETHAssets = await getDefaultETHAssets(this);
        this.assetsTokenList = [].concat([ETHAssets], tokenList)
        this.exchangFromToken = this.assetsTokenList[0]
      } else {
        this.allTokenList = _.cloneDeep(tokenList)
        this.exchangeToToken = this.allTokenList[0]
      }
    },
  },
  created() {
    this.netWorkList = _.cloneDeep(NETWORKSFORTOKEN)
    window.ethereum && (this.defaultNetWork = web3.utils.hexToNumber(window.ethereum.chainId))
  },
  async mounted() {
    await this.getTokenList(true)
    await this.getTokenList()
  },
  
};
</script>
<style lang="scss" scoped>
  @import "index";
</style>