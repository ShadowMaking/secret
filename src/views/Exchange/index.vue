<template>
  <div class="exchange-page content-box">
    <v-navTitle title="Exchange"></v-navTitle>
    <div class="exchange-content content-page">
      <div class="from-box">
        <v-formSelect 
          label="NETWORK"
          :labelShow="false" 
          :defaultValue="defaultNetWork"
          :leftIcon="defaultIcon"
          :dataSource="netWorkList"
          placeholder="chose network"
          @change="handleNetworkChange" />
      </div>
      <div class="from-box">
        <v-formSelect 
          label="PROTOCOL"
          :labelShow="false" 
          :defaultValue="protocolList[0]['id']"
          :dataSource="protocolList"
          placeholder="chose protocol"
          @change="handleProtocolChange" />
      </div>
      <div class="from-box">
        <v-exchangItem
          key="fromToken"
          isMax=true
          type="From"
          :sourceData="assetsTokenList"
          @selectChagne="val=>selectChagne('exchangeFrom', val)"
          @inputChange="val=>inputChange('exchangeFrom', val)" />
      </div>
      <div class="from-box">
        <v-exchangItem
          key="toToken"
          type="To"
          :sourceData="allTokenList"
          :inputDisabled="true"
          :inputDefaultValue="exchangeTo"
          @selectChagne="val=>selectChagne('exchangeTo', val)"
          @inputChange="val=>inputChange('exchangeTo', val)" />
      </div>
      <ul class="setting-box">
        <li>
          <h3 class="setting-title">Transaction Settings</h3>
          <van-icon name="setting" @click="settingBtnClick" class="setting-icon"/>
        </li>
        <li><h3>Slippage Tolerance</h3><h3>{{slippageVal}}%</h3></li>
        <!-- <li><h3>Allowance</h3><h3>limited</h3></li> -->
        <li><h3>Estimated Gas Fee</h3><h3>${{gasVal}}</h3></li>
        <li><h3>Gas Price</h3><h3>{{gasPriceType}}</h3></li>
        <div v-if="showSettingData">
          
        </div>
      </ul>
      <div class="exchange-btn-box">
        <a class="common-form-btn" @click="approveSubmit" v-show="showApproveButton">
          {{ approveBtnTxt }}
        </a>
      </div>
      <div class="exchange-btn-box">
        <a class="common-form-btn" @click="exchangeSubmit">Exchange</a>
      </div>
      <van-popup v-model="settingPopVisibel" round :style="{ maxWidth: '320px', width: '50%' }">
        <div class="setting-popup-box">
          <div class="header"><h3>Slippage Tolerance</h3></div>
          <div class="slippage-list">
            <a :class="{active: slippageKey == 2}" @click="slippageBtnClick(2, false)">2%</a>
            <a :class="{active: slippageKey == 3}" @click="slippageBtnClick(3, false)">3%</a>
            <span class="slippage-input" :class="{active: slippageKey == 4}" @input="slippageBtnClick('4', true)"><input type="number" name="slippage" v-model="slippageInput" placeholder="3">%</span>
          </div>
          <div class="header"><h3>Gas Price</h3></div>
          <div>
            <div v-if="loadingGas" :style="{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '200px' }"><van-loading type="spinner" /></div>
            <ul class="gas-price-list" v-else>
              <v-selectItem :class="{gasActive: gasKey == 'Fast'}" :rightVal="gasPriceValue('Fast')" labelShow=true leftTitle="Fast" :leftDes="gasPriceConfirmTime('Fast')" :icon="require('@/assets/form/gasFast.png')" @childevent="gasChagne('Fast')"></v-selectItem>
              <v-selectItem :class="{gasActive: gasKey == 'Average'}" :rightVal="gasPriceValue('Average')" labelShow=true leftTitle="Average" :leftDes="gasPriceConfirmTime('Average')" :icon="require('@/assets/form/gasAverag.png')" @childevent="gasChagne('Average')"></v-selectItem>
              <v-selectItem :class="{gasActive: gasKey == 'Custom'}" :rightVal="gasPriceValue('Average')" labelShow=true leftTitle="Custom" :icon="require('@/assets/form/gasCustom.png')" @inputChange="inputGasChange" :showInput="true"></v-selectItem>
            </ul>
          </div>
        </div>
      </van-popup>
      <van-popup v-model="showLoading" round :close-on-click-overlay="false" class="waiting-modal flex flex-center flex-column">
        <div class="inner-wrapper">
          <van-loading type="spinner" />
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
import { Icon, Loading, Toast, Popup } from 'vant';
import navTitle from '@/components/NavTitle/index';
import exchangItem from '@/components/ExchangItem/index';
import formSelect from '@/components/Select/index';
import selectItem from '@/components/SelectItem/index';
import { NETWORKSFORTOKEN } from '@/utils/netWorkForToken';
import { generateTokenList, getDefaultETHAssets, metamaskNetworkChange, getContractAt } from '@/utils/dashBoardTools';
import { ethers, utils } from 'ethers'
import web3 from 'web3'
import { BigNumber } from "bignumber.js";
import { SWAPADDRESS } from '@/utils/global'
import { saveToStorage, getFromStorage, removeFromStorage, getInfoFromStorageByKey } from '@/utils/storage';
import swapJson from './Swap.json'
import { CHAINIDMAP } from '@/utils/netWorkForToken'
import { PROTOCOLList, PROTOCOLMAP } from '@/utils/swap.js'
import StatusPop from '@/components/StatusPop';
import { TRANSACTION_TYPE } from '@/api/transaction';
import IUniswapV2Router02 from "./JSON/IUniswapV2Router02.json";
import { IUniswapV3Router, approveV3Router } from '@/utils/v3swap.js'

Vue.use(Icon);
Vue.use(Loading);
Vue.use(Toast);
Vue.use(Popup);

export default {
  name: 'Exchange',
  data() {
    return {
      currentChainInfo: null,
      defaultNetWork: 1,
      defaultIcon: null,
      netWorkList: _.cloneDeep(NETWORKSFORTOKEN),
      assetsTokenList: [],
      allTokenList: [],
      loadingGas: false,
      gasPriceInfo: null,
      exchangeFrom: '',
      exchangeTo: '',
      exchangeFromToken: null,
      exchangeToToken: null,
      settingPopVisibel: false,
      showSettingData: false,
      slippageKey: 2,
      gasKey: 'Fast',
      slippageVal: 2,
      gasVal: 1,
      gasPriceType: '~~',
      slippageInput: 3,
      showApproveButton: false,
      showLoading: false,
      showStatusPop: false,
      statusPopTitle: 'Exchange Submitted',
      popStatus: "success",
      timeTxt: 'Will take effect in one minute',
      // *********************** uniswap2 test ************************************/
      routerAddress: "0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D", // Uniswap v2 
      v3routerAddress: "0xE592427A0AEce92De3Edee1F18E0157C05861564", // Uniswap v3 Router02
      WETHAddress: "0xc778417e063141139fce010982780140aa0cd5ab", // Ropsten WETH
      // *********************** uniswap2 test ************************************/
      currentProtocolType: 'v2',
      protocolList: _.cloneDeep(PROTOCOLList),
    }
  },
  components: {
    "v-navTitle": navTitle,
    "v-exchangItem": exchangItem,
    "v-selectItem": selectItem,
    "v-formSelect": formSelect,
    'v-statusPop': StatusPop,
  },
  computed: {
    approveBtnTxt() {
      const protocolName = PROTOCOLMAP[this.currentProtocolType]['name']
      const tokenName = this.exchangeFromToken && this.exchangeFromToken['tokenName']
      return `Allow ${protocolName} to use your ${tokenName}`
    },
  },
  methods: {
    changeVisible(eventInfo) {
      this.showStatusPop = eventInfo.show;
      this.$router.push({ name: 'overView' })
    },
    gasPriceValue(type) {
      return this.gasPriceInfo && this.gasPriceInfo[type].gasPrice;
    },
    gasPriceConfirmTime(type) {
      return `${this.gasPriceInfo && this.gasPriceInfo[type].confirmationTime}sec`
    },
    selectChagne(type, record) {
      this[`${type}Token`] = record
      this.setShowApproveButton()
    },
    async inputChange(type, record) {
      if (type === 'exchangeFrom') {
        const tokenA = this.exchangeFromToken
        const tokenB = this.exchangeToToken
        const tokenASymbol = tokenA && !!tokenA['tokenAddress'] ?  tokenA['symbol'] : 'ETH'
        const tokenBSymbol = tokenB && tokenB['symbol']
        const changeType = `${tokenASymbol}/${tokenBSymbol}`
        const { hasError, forUsdt } = await this.$store.dispatch('GetTokenAxchangeForUS', {changeType});
        this.exchangeTo = record && (BigNumber(record).multipliedBy(BigNumber(forUsdt))).toFixed(4,1)
      }
      this[type] = record
    },
    checkData(data) {
      /* if (!data.tokenFrom && this.exchangeFromToken) {
        Toast.fail('Nonsupport ETH')
        return false
      } */
      if (!data.tokenFrom && this.exchangeFromToken && !data.tokenTo && this.exchangeToToken) {
        Toast.fail('Nonsupport')
        return false
      }
      if (!this.exchangeFromToken || !this.exchangeToToken) {
        Toast.fail('Choose Token')
        return false
      }
      if (!data.amountin) {
        Toast.fail('Need Input Amountin')
        return false
      }
      if (new BigNumber(this.exchangeFromToken.balanceNumberString).lt(new BigNumber(data.amountin)) ||
      new BigNumber(this.exchangeFromToken.balanceNumberString).eq(new BigNumber(0))) {
        Toast.fail(`Insufficient Balance`);
        return false;
      }
      return true
    },
    // *********************************************************** uniswap2 test ropsten *********************************************************** /
    // TokenAmount: BigNumber, ETHAmount: BigNumber
    async addLiquidity(TokenAmount, ETHAmount, tokenType, gasInfo) {
      const tokenInfo = tokenType === 'from' ? this.exchangeFromToken : this.exchangeToToken
      const { tokenAddress, abiJson } = tokenInfo
      const TokenContract = await getContractAt({ tokenAddress, abi: abiJson })
      const ROUTERContract = await getContractAt({ tokenAddress: this.routerAddress, abi: IUniswapV2Router02.abi })
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
    // TokenAmount: BigNumber, ETHAmount: BigNumber
    async addLiquidityForToken(tokenInfo, TokenAAmount, TokenBmount, amountAMin, amountBMin, gasInfo) {
      const tokenA = tokenInfo.tokenA['tokenAddress']
      const tokenB = tokenInfo.tokenB['tokenAddress'] 
      const tokenAAddress = tokenA['tokenAddress']
      const tokenBAddress = tokenB['tokenAddress']
      
      const TokenAContract = await getContractAt({ tokenAAddress, abi: tokenA['abiJson'] })
      const TokenBContract = await getContractAt({ tokenBAddress, abi: tokenB['abiJson'] })
      const ROUTERContract = await getContractAt({ tokenAddress: this.routerAddress, abi: IUniswapV2Router02.abi })
      let tx;
      let res;
      const overrides = { ...gasInfo }
      // tx = await TokenContract.approve(ROUTERContract.address, TokenAmount, overrides);
      // res = await tx.wait();
      // console.log("Approve Token: ", res);
      // https://docs.uniswap.org/protocol/V2/reference/smart-contracts/router-02#addliquidity
      tx = await ROUTERContract.addLiquidity(
        tokenAAddress,
        tokenBAddress,
        TokenAAmount,
        TokenBmount,
        amountAMin,
        amountBMin,
        window.ethereum.selectedAddress,
        ethers.constants.MaxUint256,
        {
          ...overrides,
        }
      );
      res = await tx.wait();
      console.log("ROUTER.addLiquidity: ", res);
    },
    // ETH exchange for Token
    async exchangeETH2Token(data) {
      await this.exchangeToken('to', data)
    },
    // Token exchange for Token
    async exchangeToken2Token(data) {
      await this.exchangeToken('from', data)
    },
    // WETH exchange for Token
    async exchangeWETH2Token(data) {
      const overrides = { ...data.gasInfo }
      const ROUTERContract = await getContractAt({ tokenAddress: this.routerAddress, abi: IUniswapV2Router02.abi })
      
      let amount = ethers.utils.parseUnits(this.exchangeFrom);
      this.showLoading = true
      const inputData = {
        token: [data.tokenFrom, data.tokenTo],
        userAddress: window.ethereum.selectedAddress,
        deadline: ethers.constants.MaxUint256,
        ...overrides,
        originValue: this.exchangeFrom,
        value: amount,
      }
      console.log('input Data', inputData)
      ROUTERContract.swapExactETHForTokensSupportingFeeOnTransferTokens(
        0,
        // [WETH.address, DAI.address],
        [data.tokenFrom, data.tokenTo],
        // user.address,
        window.ethereum.selectedAddress,
        ethers.constants.MaxUint256,
        {
          ...overrides,
          value: amount,
        }
      )
      .then(async tx=>{
        tx.wait()
        .then(async res=>{
          console.log("swapExactETHForTokensSupportingFeeOnTransferTokens: ", res);
          console.log('success')
          await this.exchangeSuccess(res, data)
          this.showLoading = false
          Toast(`Exchange Suucess`)
        })
        .catch(error => {
          this.showLoading = false
          Toast(`Exchange Failed`)
          console.log("swapExactETHForTokensSupportingFeeOnTransferTokens: ", error);
          console.log('error')
        })
      })
      .catch(error=>{
        this.showLoading = false
        Toast(`Exchange Failed`)
      })
    },
    // Token exchange for WETH
    async exchangeToken2WETH(data) {
      const overrides = { ...data.gasInfo }
      const ROUTERContract = await getContractAt({ tokenAddress: this.routerAddress, abi: IUniswapV2Router02.abi })
      
      let amount = ethers.utils.parseUnits(this.exchangeFrom);
      this.showLoading = true
      const inputData = {
        token: [data.tokenFrom, data.tokenTo],
        userAddress: window.ethereum.selectedAddress,
        deadline: ethers.constants.MaxUint256,
        ...overrides,
        originValue: this.exchangeFrom,
        value: amount,
      }
      console.log('input Data', inputData)
      ROUTERContract.swapExactTokensForETHSupportingFeeOnTransferTokens(
        amount,
        0,
        // [DAI.address, WETH.address],
        [data.tokenFrom, data.tokenTo],
        // user.address,
        window.ethereum.selectedAddress,
        ethers.constants.MaxUint256,
        {
          ...overrides,
        }
      )
      .then(async tx=>{
        tx.wait()
        .then(async res=>{
          console.log("swapExactTokensForETHSupportingFeeOnTransferTokens: ", res);
          console.log('success')
          await this.exchangeSuccess(res, data)
          this.showLoading = false
          Toast(`Exchange Success`)
        })
        .catch(error => {
          this.showLoading = false
          Toast(`Exchange Failed`)
          console.log("swapExactTokensForETHSupportingFeeOnTransferTokens: ", error);
          console.log('error')
        })
      })
      .catch(error=>{
        this.showLoading = false
        Toast(`Exchange Failed`)
      })
    },
    async exchangeSuccess(res, data) {
      // this.tipTxt = 'In progress, waitting';
      const submitData = {
        txid: res.transactionHash,
        block_num: res.blockNumber,
        from: window.ethereum.selectedAddress,
        to: window.ethereum.selectedAddress,
        type: TRANSACTION_TYPE['L1ToL1'],
        status: 1,
        value: data.amountin,
        name: this.exchangeFromToken['tokenName'],
        operation: 'Swap',  // send、transfer、approve、swap ……
        network_id: web3.utils.hexToNumber(window.ethereum.chainId)
      }
      this.addHistoryData = _.cloneDeep(submitData);
      await this.addHistory(submitData);
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
        this.statusPopTitle = 'Exchange Submitted'
        this.popStatus = 'success';
      }
      return { hasError: res.hasError };
    },
    // type: to || from (to:ETH2token, from:token2token)
    async exchangeToken(type, data) {
      const { hasError, isApprove } = await this.getUserAllowanceForToken()
      const fromTokenIsWETH = this.exchangeFromToken && this.exchangeFromToken['tokenName'] === 'WETH'
      if (!isApprove && type === 'from' && !fromTokenIsWETH) {
        Toast(`Please Allow EigenSwap to use your ${this.exchangeFromToken&&this.exchangeFromToken['tokenName']}`)
        return
      }
      const overrides = { ...data.gasInfo }
      // const DAIAmount = ethers.utils.parseUnits("10");
      
      const amountIn = ethers.utils.parseUnits(data.amountin);
      // const approveTokenAmount = ethers.utils.parseUnits(BigNumber(data.amountin).multipliedBy(100).toString())
      if (type === 'to') {
        const TokenAmount = ethers.utils.parseUnits(this.exchangeTo);
        const ETHAmount = ethers.utils.parseEther(data.amountin);
        await this.addLiquidity(TokenAmount, ETHAmount, `${type}`, overrides);
      } else {
        const tokenA = this.exchangeFromToken
        const tokenB = this.exchangeToToken
        const amountADesired = ethers.utils.parseUnits(this.exchangeFrom);
        const amountBDesired = ethers.utils.parseUnits(this.exchangeTo);
        const amountAMin = 0;
        const amountBMin = 0;
        // await this.addLiquidityForToken({tokenA,tokenB}, amountADesired, amountBDesired, amountAMin, amountBMin, overrides);
      }
      const ROUTERContract = await getContractAt({ tokenAddress: this.routerAddress, abi: IUniswapV2Router02.abi })
      if (type === 'from') {
        this.showLoading = true
        const logData = {
          1: amountIn,
          2: [data.tokenFrom, data.tokenTo],
          3: window.ethereum.selectedAddress,
          overrides
        }
        console.log('inputData', logData)
        // https://docs.uniswap.org/protocol/V2/reference/smart-contracts/router-02#swapexacttokensfortokenssupportingfeeontransfertokens
        ROUTERContract.swapExactTokensForTokensSupportingFeeOnTransferTokens(
          amountIn,
          0, // TODO
          // [DAI.address, WETH.address],
          [data.tokenFrom, data.tokenTo],
          // user.address,
          window.ethereum.selectedAddress,
          ethers.constants.MaxUint256,
          overrides
        )
        .then(async tx=>{
          tx.wait()
          .then(async res=>{
            console.log("swapExactTokensForTokensSupportingFeeOnTransferTokens: ", res);
            console.log('success')
            await this.exchangeSuccess(res, data)
            this.showLoading = false
            Toast(`Exchange Suucess`)
          })
          .catch(error => {
            this.showLoading = false
            Toast(`Exchange Failed`)
            console.log("swapExactTokensForTokensSupportingFeeOnTransferTokens: ", error);
            console.log('error')
          })
        })
        .catch(error=>{
          this.showLoading = false
          console.log("swapExactTokensForTokensSupportingFeeOnTransferTokens: ", error);
        })
      } else {
        this.showLoading = true
        // https://docs.uniswap.org/protocol/V2/reference/smart-contracts/router-02#swapexactethfortokenssupportingfeeontransfertokens
        const ETHAmount = ethers.utils.parseUnits(this.exchangeFrom)
        ROUTERContract.swapExactETHForTokensSupportingFeeOnTransferTokens(
          0, // TODO
          // [DAI.address, WETH.address],
          [data.tokenFrom, data.tokenTo],
          // user.address,
          window.ethereum.selectedAddress,
          ethers.constants.MaxUint256,
          {
            ...overrides,
            value: ETHAmount,
          }
        )
        .then(async tx=>{
          tx.wait()
          .then(async res=>{
            console.log("swapExactETHForTokensSupportingFeeOnTransferTokens: ", res);
            console.log('success')
            await this.exchangeSuccess(res, data)
            this.showLoading = false
            Toast(`Exchange Suucess`)
          })
          .catch(error => {
            this.showLoading = false
            Toast(`Exchange Failed`)
            console.log("swapExactETHForTokensSupportingFeeOnTransferTokens: ", error);
            console.log('error')
          })
        })
        .catch(error=>{
          this.showLoading = false
          console.log("swapExactETHForTokensSupportingFeeOnTransferTokens: ", error);
        })
        
      }
    },
    // *********************************************************** uniswap2 test ropsten *********************************************************** /
    getSubmitData() {
      let gasPrice = '20' // 20 Gwei
      if (this.gasPriceType !== '~~') {
        // gasPrice = this.gasPriceInfo && this.gasPriceInfo[this.gasPriceType === 'Custom'?"Average":this.gasPriceType].gasPrice
        gasPrice = this.gasPriceInfo && this.gasPriceInfo[this.gasPriceType].gasPrice
      }
      gasPrice = web3.utils.toWei(gasPrice, 'gwei')
      const data = {
        tokenFrom: this.exchangeFromToken && this.exchangeFromToken['tokenAddress'],
        tokenTo: this.exchangeToToken && this.exchangeToToken['tokenAddress'],
        amountin: this.exchangeFrom, // 100
        amountmin: BigNumber(this.exchangeFrom||0).minus((BigNumber(this.exchangeFrom||0) * BigNumber(this.slippageKey).div(100))),
        fee: 3000,
        gasInfo: { gasLimit: 1000000, gasPrice } // const gasInfo = { gasLimit: 100000, gasPrice: 20000000000 }
      }
      console.log('exchangeData', data)
      return data
    },
    async getUserAllowanceForToken() {
      const token = this.exchangeFromToken;
      const chainId = window.ethereum && window.ethereum.chainId;
      const userAddress = window.ethereum && window.ethereum.selectedAddress;
      const allowanceTokenData = {
        userId: getFromStorage('gUID'),
        network_id: web3.utils.hexToNumberString(chainId),
        token_address: token['tokenAddress'],
        user_address: userAddress,
        swap_address: (this.currentProtocolType === 'v3') ? this.v3routerAddress : this.routerAddress,
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
      
      const token = this.exchangeFromToken
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
      if (this.currentProtocolType === 'v3') {
        approveV3Router(this.exchangeFromToken).then(async res => {
          console.log(res)
          if (res) {
            Toast('Approve success')
            const saveTokenData = {
              ...allowanceTokenData,
              allowance: "Infinite"
            }
            saveTokenData.swap_address = this.v3routerAddress
            const { hasError, data, error } = await this.$store.dispatch('SaveUserAllowanceForToken', {...saveTokenData})
            if (!hasError) {
              console.log(`SaveUserAllowanceForToken  Success`)
            } else {
              console.log('SaveUserAllowanceForToken Error', error)
            }
          } else {
            Toast('Approve Failed')
          }
        })
        // Toast('Comming Soon')
        return 
      }
      const submitData = this.getSubmitData()
      const TokenContract = await getContractAt({ tokenAddress: token.tokenAddress, abi: token.abiJson })
      const approveTokenAmount = ethers.constants.MaxUint256; // max
      const overrides = submitData.gasInfo
      this.showLoading = true
      const logData = {
        1: this.routerAddress,
        2: approveTokenAmount,
        overrides
      }
      console.log('approveData', logData)
      TokenContract.approve(this.routerAddress, approveTokenAmount, overrides)
      .then(async res=>{
        res.wait()
        .then(async txRes => { // approve success
          console.log(`Approve Token-${token.tokenName} res: `, txRes);
          const saveTokenData = {
            ...allowanceTokenData,
            // allowance: approveTokenAmount
            allowance: "Infinite"
          }
          const { hasError, data, error } = await this.$store.dispatch('SaveUserAllowanceForToken', {...saveTokenData})
          if (!hasError) {
            console.log(`SaveUserAllowanceForToken ${token.tokenName} Suucess`)
          } else {
            console.log('SaveUserAllowanceForToken Error', error)
          }
          this.showLoading = false
        })
        .catch(error=>{
          this.showLoading = false
          Toast(`Approve ${token.tokenName} Failed`)
          console.log(`Approve Token-${token.tokenName} error: `, err);
        })
      })
      .catch(err => {
        this.showLoading = false
        Toast(`Approve ${token.tokenName} Failed`)
        console.log(`Approve Token-${token.tokenName} error: `, err);
      })
    },
    async exchangeV3(type, data, isNeedApprove) {
      console.log(type)
      // if (isNeedApprove) {
      //   const { hasError, isApprove } = await this.getUserAllowanceForToken()
      //   const fromTokenIsWETH = this.exchangeFromToken && this.exchangeFromToken['tokenName'] === 'WETH'
      //   if (!isApprove && type === 'from' && !fromTokenIsWETH) {
      //     Toast(`Please Allow EigenSwap to use your ${this.exchangeFromToken&&this.exchangeFromToken['tokenName']}`)
      //     return
      //   }
      // }
      IUniswapV3Router(type, data).then(async res => {
        if (res) {
          console.log("swapv3success: ", res);
          await this.exchangeSuccess(res, data)
          this.showLoading = false
        } else {
          this.showLoading = false
          Toast(`Exchange Failed`)
          console.log("swapv3error: ", error);
        }
      })
    },
    async exchangeSubmit() {
      
      if(!this.thirdLogin()) { return }
      if(!this.connectedWallet()) { return }
      
      const data = this.getSubmitData()
      if (!this.checkData(data)) { return }

      const netWorkIsROPSTEN = window.ethereum.chainId === CHAINIDMAP['ROPSTEN']
      if (this.currentProtocolType === 'v3') {
        if (!netWorkIsROPSTEN) { 
          Toast('Comming Soon') 
          return 
        }
        console.log(data)//fromToken or toToken is not ETH,WETH
        if (data.tokenFrom !== this.WETHAddress && data.tokenTo !== this.WETHAddress && data.tokenFrom && data.tokenTo) {
          this.exchangeV3('multiple', data)
        } else {
          !data.tokenFrom && (data.tokenFrom = this.WETHAddress)
          !data.tokenTo && (data.tokenTo = this.WETHAddress)
          this.exchangeV3('single', data)
        }
        return
      }
      // fromToken is ETH or WETH
      if (!data.tokenFrom && this.exchangeFromToken) {
        // fromToken selected is ETH = WETH in Ropsten
        const WETH_DATA = {
          ...data,
          tokenFrom: this.WETHAddress // For WETH tokenAddress
        }
        await this.exchangeWETH2Token(WETH_DATA)
      } else { // fromToken is token and toToken is token too
        if (!data.tokenTo && this.exchangeToToken) {
          const WETH_DATA = {
            ...data,
            tokenTo: this.WETHAddress // For WETH tokenAddress
          }
          await this.exchangeToken2WETH(WETH_DATA)
        } else {
          await this.exchangeToken2Token(data)
        }
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
    async settingBtnClick() {
      this.loadingGas = true;
      this.settingPopVisibel = true
      await this.getGasPrice()
      this.loadingGas = false;
      this.showSettingData = true
      this.slippageVal = 2
      // this.gasVal = this.gasPriceInfo['Fast']['gasPrice']
      this.gasPriceType = 'Fast'
    },
    gasChagne(type) {
      this.gasKey = this.gasPriceType = type
      // this.gasVal = this.gasPriceInfo[type === 'Custom'?'Average': type]['gasPrice']
    },
    inputGasChange(value) {
      this.gasKey = this.gasPriceType = 'Custom'
      this.gasPriceInfo['Custom'] = { gasPrice: value.value }
    },
    slippageBtnClick(val,isInput) {
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
    handleProtocolChange(data) {
      this.currentProtocolType = data.value['id']
      console.log(this.currentProtocolType)
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

      const ETHAssets = await getDefaultETHAssets(this);
      this.assetsTokenList = [].concat([ETHAssets], tokenList)
      this.allTokenList = [].concat([ETHAssets], tokenList)
      this.exchangeFromToken = this.assetsTokenList[0]
      this.exchangeToToken = this.allTokenList[0]
      this.setShowApproveButton()
    },
    setShowApproveButton() {
      const tokenInfo = this.exchangeFromToken
      const isEth = tokenInfo && tokenInfo['tokenName'] === 'ETH'
      const isWETH = tokenInfo && tokenInfo['tokenName'] === 'WETH'
      this.showApproveButton = !isEth && !isWETH
    }
  },
  created() {
    this.netWorkList = _.cloneDeep(NETWORKSFORTOKEN)
    window.ethereum && (this.defaultNetWork = web3.utils.hexToNumber(window.ethereum.chainId))
    this.netWorkList.map(item => {
      if (item.id == this.defaultNetWork) {
        this.defaultIcon = item.icon
      }
    })
  },
  async mounted() {
    await this.getTokenList()
  },
};
</script>
<style lang="scss" scoped>
  @import "index";
</style>