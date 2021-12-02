<template>
  <div class="exchange-page content-box">
    <v-navTitle title="Exchange"></v-navTitle>
    <div class="exchange-content content-page">
      <div class="from-box">
        <v-formSelect 
          label="NETWORK"
          :labelShow="false" 
          :defaultValue="defaultNetWork" 
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
        <li><h3>Network Fee</h3><h3>{{networkFee}}</h3></li>
        <div v-if="showSettingData">
          
        </div>
      </ul>
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
      overrides: { gasLimit: 1000000, gasPrice: 20000 }
      // *********************** uniswap2 test ************************************/
    }
  },
  components: {
    "v-navTitle": navTitle,
    "v-exchangItem": exchangItem,
    "v-selectItem": selectItem,
    "v-formSelect": formSelect,
  },
  computed: {
    
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
      if (!data.tokenFrom && this.exchangFromToken) {
        Toast.fail('Nonsupport ETH')
        return false
      }

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
    // DAIAmount: BigNumber, ETHAmount: BigNumber
    async addLiquidity(DAIAmount, ETHAmount) {
      const metamaskProvider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = metamaskProvider.getSigner(0);
      // const myContract = new ethers.Contract(SWAPADDRESS, abi, signer)
      // console.log('myContract', myContract)
      // await myContract.attach(SWAPADDRESS)

      // let DAI = await ethers.getContractAt(IERC20.abi, fromToken);
      // console.log("DAI: ", DAI.address);
      const DAIContract = new ethers.Contract(this.fromToken, IERC20.abi, signer)
      await DAIContract.attach(this.fromToken)
      console.log("DAI: ", DAIContract.address);
      
      // let WETH = await ethers.getContractAt(IWETH.abi, toToken);
      // console.log("WETH: ", WETH.address);
      const WETHContract = new ethers.Contract(this.toToken, IWETH.abi, signer)
      await WETHContract.attach(this.toToken)
      console.log("WETH: ", WETHContract.address);
      

      // let ROUTER = await ethers.getContractAt(IUniswapV2Router02.abi, routerAddress);
      // console.log(`ROUTER: ${ROUTER.address}`);
      let ROUTERContract = new ethers.Contract(this.routerAddress, IUniswapV2Router02.abi, signer)
      await ROUTERContract.attach(this.routerAddress)
      console.log(`ROUTER: ${ROUTERContract.address}`);

      let tx;
      let res;

      // tx = await DAI.approve(ROUTER.address, DAIAmount, overrides);
      tx = await DAIContract.approve(ROUTERContract.address, DAIAmount, this.overrides);
      res = await tx.wait();
      console.log("Approve DAI: ", res);
      /* tx = await ROUTER.addLiquidityETH(
        DAI.address,
        DAIAmount,
        DAIAmount,
        ETHAmount,
        user.address,
        ethers.constants.MaxUint256,
        {
          ...overrides,
          value: ETHAmount,
        }
      ); */
      tx = await ROUTERContract.addLiquidityETH(
        DAIContract.address,
        DAIAmount,
        DAIAmount,
        ETHAmount,
        window.ethereum.selectedAddress,
        ethers.constants.MaxUint256,
        {
          ...this.overrides,
          value: ETHAmount,
        }
      );
      res = await tx.wait();
      console.log("ROUTER.addLiquidityETH: ", res);
    },
    async eth_dai() {
      // ETH -> DAI
      let tx;
      let res;
      let DAIAmount = ethers.utils.parseUnits("10");
      let ETHAmount = ethers.utils.parseEther("0.1");
      let amountIn = ethers.utils.parseUnits("1");

      await this.addLiquidity(DAIAmount, ETHAmount);

      const metamaskProvider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = metamaskProvider.getSigner(0);
      
      const DAIContract = new ethers.Contract(this.fromToken, IERC20.abi, signer)
      await DAIContract.attach(this.fromToken)
      console.log("DAI: ", DAIContract.address);

      let ROUTERContract = new ethers.Contract(this.routerAddress, IUniswapV2Router02.abi, signer)
      await ROUTERContract.attach(this.routerAddress)
      console.log(`ROUTER: ${ROUTERContract.address}`);

      const WETHContract = new ethers.Contract(this.toToken, IWETH.abi, signer)
      await WETHContract.attach(this.toToken)
      console.log("WETH: ", WETHContract.address);



      // tx = await DAI.approve(ROUTER.address, DAIAmount, overrides);
      tx = await DAIContract.approve(ROUTERContract.address, DAIAmount, this.overrides);
      res = await tx.wait();
      console.log("Approve DAI: ", res);

      // tx = await ROUTER.swapExactTokensForTokensSupportingFeeOnTransferTokens(
      tx = await ROUTERContract.swapExactTokensForTokensSupportingFeeOnTransferTokens(
        amountIn,
        0,
        // [DAI.address, WETH.address],
        [DAIContract.address, WETHContract.address],
        // user.address,
        window.ethereum.selectedAddress,
        ethers.constants.MaxUint256,
        this.overrides
      );
      res = await tx.wait();
      console.log("swapExactTokensForTokensSupportingFeeOnTransferTokens: ", res);
    },
    async swapInAndOut() {
      console.log("swap in and out");
      [user] = await ethers.getSigners();
      if (user === undefined) {
        throw new Error("Invalid user");
      }
      console.log(`user = ${user.address}`);

      DAI = await ethers.getContractAt(IERC20.abi, fromToken);
      console.log("DAI: ", DAI.address);
      WETH = await ethers.getContractAt(IWETH.abi, toToken);
      console.log("WETH: ", WETH.address);

      ROUTER = await ethers.getContractAt(IUniswapV2Router02.abi, this.routerAddress);
      console.log(`ROUTER: ${ROUTER.address}`);

      /* const metamaskProvider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = metamaskProvider.getSigner(0);
      const myContract = new ethers.Contract(tokenAddress, abi, signer)

      const selectedConnectAddress = window.ethereum.selectedAddress; */
      
    },
    // *********************************************************** uniswap2 test ropsten *********************************************************** /
    async exchangeSubmit() {
      // await swapInAndOut();
      await this.eth_dai()
      return
      console.log(this.exchangFrom)
      console.log(this.exchangeTo)
      const data = {
        tokenFrom: this.exchangFromToken && this.exchangFromToken['tokenAddress'],
        tokenTo: this.exchangToToken && this.exchangToToken['tokenAddress'],
        amountin: this.exchangFrom, // 100
        amountmin: BigNumber(this.exchangFrom||0).minus((BigNumber(this.exchangFrom||0) * BigNumber(this.slippageKey).div(100))),
        fee: 3000,
        gasInfo: { gasLimit: 1000000, gasPrice: 10 } // const gasInfo = { gasLimit: 100000, gasPrice: 29859858 }
      }
      console.log('exchangeData', data)
      if (!this.checkData(data)) {
        return
      }

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
