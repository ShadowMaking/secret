<template>
  <div class="exchange-page content-box">
    <v-navTitle title="Exchange"></v-navTitle>
    <!-- <div class="send-from-box content-page">
      <v-transFrom @transFromChange="transFromChange"></v-transFrom>
    </div> -->
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
          :leftIcon="protocolList[0]['icon']"
          placeholder="chose protocol"
          @change="handleProtocolChange" />
      </div>
      <div class="from-box">
        <v-exchangItem
          key="fromToken"
          isMax=true
          type="From"
          :sourceData="assetsTokenList"
          :showLoading="tokenLoading"
          @selectChagne="val=>selectChagne('exchangeFrom', val)"
          @inputChange="val=>inputChange('exchangeFrom', val)"
          ref="tokenFromSelect" />
      </div>
      <div class="from-box">
        <v-exchangItem
          key="toToken"
          type="To"
          :sourceData="allTokenList"
          :showLoading="tokenLoading"
          :inputDisabled="true"
          :inputDefaultValue="exchangeTo"
          @selectChagne="val=>selectChagne('exchangeTo', val)"
          @inputChange="val=>inputChange('exchangeTo', val)"
          ref="tokenToSelect" />
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
      <!-- <van-popup v-model="showLoading" round :close-on-click-overlay="false" class="waiting-modal flex flex-center flex-column">
        <div class="inner-wrapper">
          <van-loading type="spinner" />
        </div>
      </van-popup> -->
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
      type="Swap"
      :metadata="sendMetadata"
      @close="showTradeConfirm=false"
      @reject="cancelExchange"
      @confirm="confirmExchange" />
    <v-approveModal
      :show="showApproveModal"
      :metadata="approveMetadata"
      @close="showApproveModal=false"
      @reject="cancelApprove"
      @confirm="confirmApprove" />
    <v-inputPsw :show="showInputPswModal" @cancel="showInputPswModal=false" @ok="confirmPswOk" :btnLoading="confirmPswBtnLoading" />
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
import ConfirmModal from '@/components/ConfirmModal';
import ApproveModal from '@/components/ApproveModal';
import InputPswModal from '@/components/InputPswModal'
import TransFrom from '@/components/TransFrom';
import { NETWORKSFORTOKEN, CHAINMAP } from '@/utils/netWorkForToken';
import {
  generateTokenList, getDefaultETHAssets, getConnectedAddress,
  getContractWallet, isLogin, getDATACode, getContractAt, 
  getDecryptPrivateKeyFromStore, getEncryptKeyByAddressFromStore, addTransHistory, getEstimateGas, getConnectedUserAddress} from '@/utils/dashBoardTools';
import { ethers, utils } from 'ethers'
import web3 from 'web3'
import { BigNumber } from "bignumber.js";
import { getFromStorage, getInfoFromStorageByKey } from '@/utils/storage';
import { CHAINIDMAP } from '@/utils/netWorkForToken'
import { PROTOCOLList, PROTOCOLMAP } from '@/utils/swap.js'
import StatusPop from '@/components/StatusPop';
import LoadingPopup from '@/components/LoadingPopup';
import { TRANSACTION_TYPE } from '@/api/transaction';
import IUniswapV2Router02 from "./JSON/IUniswapV2Router02.json";
import { IUniswapV3Router, approveV3Router } from '@/utils/v3swap.js'
import { promiseValue, formatErrorContarct } from '@/utils/index'
import { generateEncryptPswByPublicKey, generateCR1ByPublicKey, getDecryptPrivateKey } from '@/utils/relayUtils'


Vue.use(Icon);
Vue.use(Loading);
Vue.use(Toast);
Vue.use(Popup);

export default {
  name: 'Exchange',
  data() {
    return {
      currentChainInfo: null,
      defaultNetWork: '',
      defaultIcon: null,
      netWorkList: _.cloneDeep(NETWORKSFORTOKEN),
      assetsTokenList: [],
      allTokenList: [],
      tokenLoading: false,
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

      exchangeType: '', // WET2Token、Token2WETH、Token2Token
      exchangeData: null,
      sendMetadata: null,
      showTradeConfirm: false,

      showApproveModal: false,
      approveMetadata: null,

      currentOptType:'', // exchangeSubmit||approveSubmit

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
    "v-exchangItem": exchangItem,
    "v-selectItem": selectItem,
    "v-formSelect": formSelect,
    'v-statusPop': StatusPop,
    'v-confirmModal': ConfirmModal,
    'v-approveModal': ApproveModal,
    // 'v-transFrom': TransFrom,
    'v-loadingPopup': LoadingPopup,
    'v-inputPsw': InputPswModal,
  },
  computed: {
    approveBtnTxt() {
      const protocolName = PROTOCOLMAP[this.currentProtocolType]['name']
      const tokenName = this.exchangeFromToken && this.exchangeFromToken['tokenName']
      return `Allow ${protocolName} to use your ${tokenName}`
    },
  },
  methods: {
    getDefaultNetWork() {
      const info = getInfoFromStorageByKey('netInfo')
      return info && info['id'] || 1
    },
    changeVisible(eventInfo) {
      this.showStatusPop = eventInfo.show;
      this.$router.push({
        path: `/overview`,
        query: {tabActive: 1},
      })
    },
    gasPriceValue(type) {
      return this.gasPriceInfo && this.gasPriceInfo[type].gasPrice;
    },
    gasPriceConfirmTime(type) {
      return `${this.gasPriceInfo && this.gasPriceInfo[type].confirmationTime}sec`
    },
    selectChagne(type, record) {
      this[`${type}Token`] = record
      this.$eventBus.$emit('resetExchangeTokenInputValue')
      this.setShowApproveButton()
    },
    async inputChange(type, record) {
      if (type === 'exchangeFrom') {
        const tokenA = this.exchangeFromToken
        const tokenB = this.exchangeToToken
        const tokenASymbol = tokenA && !!tokenA['tokenAddress'] ?  tokenA['symbol'] : 'ETH'
        const tokenBSymbol = tokenB && !!tokenB['tokenAddress'] ?  tokenB['symbol'] : 'ETH'
        if (tokenASymbol === tokenBSymbol) {
          this.exchangeTo = record
        } else {
          const changeType = `${tokenASymbol}/${tokenBSymbol}`
          const { hasError, forUsdt } = await this.$store.dispatch('GetTokenAxchangeForUS', {changeType});
          this.exchangeTo = record && (BigNumber(record).multipliedBy(BigNumber(forUsdt))).toFixed(4,1)
        }
        console.log(this.exchangeTo)
      }
      this[type] = record
    },
    checkData(data) {
      /* if (!data.tokenFrom && this.exchangeFromToken) {
        Toast.fail('Nonsupport ETH')
        return false
      } */
      if (!data.tokenFrom && this.exchangeFromToken && !data.tokenTo && this.exchangeToToken) {
        Toast.fail('No support')
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
      const selectedConnectAddress = getConnectedAddress()
      const tokenInfo = tokenType === 'from' ? this.exchangeFromToken : this.exchangeToToken
      const { tokenAddress, abiJson } = tokenInfo
      const TokenContract = await getContractAt({ tokenAddress, abi: abiJson }, this)
      const ROUTERContract = await getContractAt({ tokenAddress: this.routerAddress, abi: IUniswapV2Router02.abi }, this)
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
        selectedConnectAddress,
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
      const selectedConnectAddress = getConnectedAddress()
      const tokenA = tokenInfo.tokenA['tokenAddress']
      const tokenB = tokenInfo.tokenB['tokenAddress'] 
      const tokenAAddress = tokenA['tokenAddress']
      const tokenBAddress = tokenB['tokenAddress']
      
      const TokenAContract = await getContractAt({ tokenAAddress, abi: tokenA['abiJson'] }, this)
      const TokenBContract = await getContractAt({ tokenBAddress, abi: tokenB['abiJson'] }, this)
      const ROUTERContract = await getContractAt({ tokenAddress: this.routerAddress, abi: IUniswapV2Router02.abi }, this)
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
        selectedConnectAddress,
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
      const selectedConnectAddress = getConnectedAddress()

      const overrides = { ...data.gasInfo }
      const ROUTERContract = await getContractAt({ tokenAddress: this.routerAddress, abi: IUniswapV2Router02.abi }, this)
      
      let amount = ethers.utils.parseUnits(this.exchangeFrom);
      this.showLoading = true
      const inputData = {
        token: [data.tokenFrom, data.tokenTo],
        userAddress: selectedConnectAddress,
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
        selectedConnectAddress,
        ethers.constants.MaxUint256,
        {
          ...overrides,
          value: amount,
        }
      )
      .then(async tx=>{
        console.log('WETH2Token tx:', tx)
        await this.exchangeSuccess(tx, data)
        tx.wait()
        .then(async res=>{
          console.log("swapExactETHForTokensSupportingFeeOnTransferTokens: ", res);
          console.log('success')
          this.showLoading = false
          // Toast(`Exchange success`)
        })
        .catch(error => {
          this.showLoading = false
          // Toast(`Exchange Failed`)
          console.log("swapExactETHForTokensSupportingFeeOnTransferTokens: ", error);
          console.log('error')
        })
      })
      .catch(error=>{
        this.showLoading = false
        let errorValue = formatErrorContarct(error)
        Toast.fail(errorValue)
        console.log(error)
      })
    },
    // Token exchange for WETH
    async exchangeToken2WETH(data) {
      const selectedConnectAddress = getConnectedAddress()

      const overrides = { ...data.gasInfo }
      const ROUTERContract = await getContractAt({ tokenAddress: this.routerAddress, abi: IUniswapV2Router02.abi }, this)
      
      let amount = ethers.utils.parseUnits(this.exchangeFrom);
      this.showLoading = true
      const inputData = {
        token: [data.tokenFrom, data.tokenTo],
        userAddress: selectedConnectAddress,
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
        selectedConnectAddress,
        ethers.constants.MaxUint256,
        {
          ...overrides,
        }
      )
      .then(async tx=>{
        console.log('Token2WETH tx:', tx)
        await this.exchangeSuccess(tx, data)
        tx.wait()
        .then(async res=>{
          console.log("swapExactTokensForETHSupportingFeeOnTransferTokens: ", res);
          console.log('success')
          this.showLoading = false
          // Toast(`Exchange Success`)
        })
        .catch(error => {
          this.showLoading = false
          // Toast(`Exchange Failed`)
          console.log("swapExactTokensForETHSupportingFeeOnTransferTokens: ", error);
          console.log('error')
        })
      })
      .catch(error=>{
        this.showLoading = false
        let errorValue = formatErrorContarct(error)
        Toast.fail(errorValue)
        console.log(error)
      })
    },
    async exchangeSuccess(res, data) {
      const selectedConnectAddress = getConnectedAddress()
      const currentChainId = this.currentChainInfo && this.currentChainInfo['id']
      // this.tipTxt = 'In progress, waitting';
      const submitData = {
        txid: res.hash,
        // block_num: res.blockNumber,
        from: selectedConnectAddress,
        to: selectedConnectAddress,
        type: TRANSACTION_TYPE['L2ToL2'],
        status: 0,
        value: data.amountin,
        name: this.exchangeFromToken['tokenName'],
        operation: 'Swap',  // send、transfer、approve、swap ……
        network_id: currentChainId
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
        this.$eventBus.$emit('addTransactionHistory')
      }
      return { hasError: res.hasError };
    },
    // type: to || from (to:ETH2token, from:token2token)
    async exchangeToken(type, data) {
      const selectedConnectAddress = getConnectedAddress()

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
      const ROUTERContract = await getContractAt({ tokenAddress: this.routerAddress, abi: IUniswapV2Router02.abi }, this)
      if (type === 'from') {
        this.showLoading = true
        const logData = {
          1: amountIn,
          2: [data.tokenFrom, data.tokenTo],
          3: selectedConnectAddress,
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
          selectedConnectAddress,
          ethers.constants.MaxUint256,
          overrides
        )
        .then(async tx=>{
          console.log('Token2Token tx:', tx)
          await this.exchangeSuccess(tx, data)
          tx.wait()
          .then(async res=>{
            console.log("swapExactTokensForTokensSupportingFeeOnTransferTokens: ", res);
            console.log('success')
            
            this.showLoading = false
            // Toast(`Exchange Suucess`)
          })
          .catch(error => {
            this.showLoading = false
            // Toast(`Exchange Failed`)
            console.log("swapExactTokensForTokensSupportingFeeOnTransferTokens: ", error);
            console.log('error')
          })
        })
        .catch(error=>{
          this.showLoading = false
          let errorValue = formatErrorContarct(error)
          Toast.fail(errorValue)
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
          selectedConnectAddress,
          ethers.constants.MaxUint256,
          {
            ...overrides,
            value: ETHAmount,
          }
        )
        .then(async tx=>{
          await this.exchangeSuccess(tx, data)
          tx.wait()
          .then(async res=>{
            console.log("swapExactETHForTokensSupportingFeeOnTransferTokens: ", res);
            console.log('success')
            this.showLoading = false
            // Toast(`Exchange Suucess`)
          })
          .catch(error => {
            this.showLoading = false
            // Toast(`Exchange Failed`)
            console.log("swapExactETHForTokensSupportingFeeOnTransferTokens: ", error);
            console.log('error')
          })
        })
        .catch(error=>{
          this.showLoading = false
          let errorValue = formatErrorContarct(error)
          Toast.fail(errorValue)
          console.log("swapExactETHForTokensSupportingFeeOnTransferTokens: ", error);
        })
        
      }
    },
    // *********************************************************** uniswap2 test ropsten *********************************************************** /
    async getSubmitData() {
      let gasPrice = '20' // 20 Gwei
      if (this.gasPriceType !== '~~') {
        gasPrice = this.gasPriceInfo && this.gasPriceInfo[this.gasPriceType].gasPrice
      } else {
        let gasPriceWei = await getEstimateGas('gasPrice')
        gasPrice = web3.utils.fromWei(gasPriceWei.toString(), 'gwei')
      }
      // gasPrice = web3.utils.toWei(gasPrice, 'gwei')
      const data = {
        tokenFrom: this.exchangeFromToken && this.exchangeFromToken['tokenAddress'],
        tokenTo: this.exchangeToToken && this.exchangeToToken['tokenAddress'],
        amountin: this.exchangeFrom, // 100
        amountmin: BigNumber(this.exchangeFrom||0).minus((BigNumber(this.exchangeFrom||0) * BigNumber(this.slippageKey).div(100))),
        fee: 3000,
        gasInfo: { gasLimit: 1000000, gasPrice } // const gasInfo = { gasLimit: 100000, gasPrice: 20000000000 }
      }
      return data
    },
    async getUserAllowanceForToken(getAllowanceTokenData=false) {
      const token = this.exchangeFromToken;
      const selectedConnectAddress = getConnectedAddress()
      const chainId = this.currentChainInfo && this.currentChainInfo['id']
      const allowanceTokenData = {
        userId: getFromStorage('gUID'),
        network_id: chainId,
        token_address: token['tokenAddress'],
        user_address: selectedConnectAddress,
        swap_address: (this.currentProtocolType === 'v3') ? this.v3routerAddress : this.routerAddress,

      }
      if (getAllowanceTokenData) {
        return { hasError: false, isApprove: false, allowanceTokenData }
      }
      const { hasError, isApprove } = await this.$store.dispatch('GetUserAllowanceForToken', {...allowanceTokenData})
      return { hasError, isApprove, allowanceTokenData }
    },
    hasBalance() {
      const ETHToken = _.find(this.assetsTokenList, {tokenName: 'ETH'})
      if (ETHToken && ETHToken.balance.lte(0)) {
        return false
      }
      return true
    },
    connectedWallet() {
      const chainId = this.currentChainInfo && this.currentChainInfo['id']
      const selectedConnectAddress = getConnectedAddress()
      if (!chainId || !selectedConnectAddress) {
        Toast('Need Connect Wallet')
        return false
      }
      return true
    },
    async dealDataBeforeApprove() {
      const token = this.exchangeFromToken
      const submitData = await this.getSubmitData()
      console.log('submitData', submitData)

      const selectedConnectAddress = getConnectedAddress()
      const gasPrice = submitData.gasInfo['gasPrice']
      let estimatedGasFee = await getEstimateGas('gasUsed')
      this.approveMetadata = {
        userAddress: selectedConnectAddress,
        tokenName: token.tokenName,
        tokenAddress: token.tokenAddress,
        gas: 21000,
        gasPrice,
        netInfo: this.currentChainInfo,
        estimatedGasFee: estimatedGasFee,
      }
      
      submitData.gasInfo['gasPrice'] = web3.utils.toWei(gasPrice, 'gwei')
      this.approveData = _.cloneDeep(submitData)
      console.log('approveData', this.approveData)

      this.showApproveModal = true
    },
    async approveSubmit() {
      // if (this.currentProtocolType === 'v3') {
      //   Toast('Comming Soon')
      //   return 
      // }
      if (!isLogin()) {
        Toast('Need Login')
        return
      }
      if(!this.connectedWallet()) { return }

      if (!this.hasBalance()) {
        Toast('Not Enough ETH')
        return
      }

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

      this.showLoading = true
      const { hasError, isApprove, allowanceTokenData } = await this.getUserAllowanceForToken()
      if (isApprove) {
        this.showLoading = false
        Toast('Already Approved')
        return
      }
      this.showLoading = false

      this.currentOptType = 'approveSubmit'
      // check privateKey whether is existed
      const privateKey = await getDecryptPrivateKeyFromStore(this)
      if (!privateKey) {
        this.showInputPswModal = true;
        return
      }
      await this.dealDataBeforeApprove()
    },

    // exchangeType - Token2Token || WETH2Token || Token2WETH
    getExchangeType(data) {
      let type = 'Token2Token'
      const fromIsETH = !data.tokenFrom && this.exchangeFromToken
      const toIsETH = !data.tokenTo && this.exchangeToToken
      const fromIsToken = data.tokenFrom && this.exchangeFromToken
      const toIsToken = data.tokenTo && this.exchangeToToken

      fromIsETH && toIsToken && (type = 'WETH2Token')
      fromIsToken && toIsETH && (type = 'Token2WETH')
      fromIsToken && toIsToken && (type = 'Token2Token')

      return type
    },
    async getDATAForTransaction(exchangeType, getEstimateGas=false) {
      let datacode = '0x'
      let tempgasfixlimit = '0'
      if (this.currentProtocolType === 'v3') { // todo
        return { datacode, tempgasfixlimit }
      }
      const abi = IUniswapV2Router02.abi;
      const data = await this.getSubmitData()
      const overrides = { ...data.gasInfo }
      const gasPrice = overrides['gasPrice']
      overrides['gasPrice'] = web3.utils.toWei(gasPrice, 'gwei')
      const selectedConnectAddress = getConnectedAddress()
      let fucName = ''
      let paramsObj = {}
      switch(exchangeType) {
        case 'WETH2Token':
          fucName = 'swapExactETHForTokensSupportingFeeOnTransferTokens';
          paramsObj['amountOutMin'] = 0
          paramsObj['address'] = [this.WETHAddress, data.tokenTo]
          paramsObj['addressTo'] = selectedConnectAddress
          paramsObj['deadline'] = ethers.constants.MaxUint256
          // paramsObj['overrides'] = { ...overrides, value: amount }
          break;
        case 'Token2Token':
          fucName = 'swapExactTokensForTokensSupportingFeeOnTransferTokens';
          const amountIn = ethers.utils.parseUnits(data.amountin);
          paramsObj['amountIn'] = amountIn
          paramsObj['amountOutMin'] = 0
          paramsObj['address'] = [data.tokenFrom, data.tokenTo]
          paramsObj['addressTo'] = selectedConnectAddress
          paramsObj['deadline'] = ethers.constants.MaxUint256
          // paramsObj['overrides'] = overrides
          break;
        case 'Token2WETH':
          fucName = 'swapExactTokensForETHSupportingFeeOnTransferTokens';
          let amount = ethers.utils.parseUnits(this.exchangeFrom);
          paramsObj['amountIn'] = amount
          paramsObj['amountOutMin'] = amount
          paramsObj['address'] = [data.tokenFrom, this.WETHAddress]
          paramsObj['addressTo'] = selectedConnectAddress
          paramsObj['deadline'] = ethers.constants.MaxUint256
          // paramsObj['overrides'] = { ...overrides }
          break;
      }
      datacode = getDATACode(abi, fucName, paramsObj)
      if (getEstimateGas) {
        let { hasError, res } = await this.getEstimateGas(exchangeType, paramsObj)
        !hasError && res && (tempgasfixlimit = res)
      }
      return { datacode, tempgasfixlimit }
    },
    async getEstimateGas(exchangeType, paramsObj) {
      let hasError;
      let data;
      let fucName;
      const ROUTERContract = await getContractAt({ tokenAddress: this.routerAddress, abi: IUniswapV2Router02.abi }, this)
      switch(exchangeType) {
        case 'WETH2Token':
          fucName = 'swapExactETHForTokensSupportingFeeOnTransferTokens';
          const { hasError: err1, res: data1 } = await promiseValue(ROUTERContract.estimateGas[fucName](
            // paramsObj['amountIn'],
            paramsObj['amountOutMin'],
            paramsObj['address'],
            paramsObj['addressTo'],
            paramsObj['deadline'],
            // paramsObj['overrides']
          ))
          hasError = err1
          data = data1
          break;
        case 'Token2Token':
        case 'Token2WETH':
          fucName = exchangeType === 'Token2Token' ? 'swapExactTokensForTokensSupportingFeeOnTransferTokens' : 'swapExactTokensForETHSupportingFeeOnTransferTokens';
          const { hasError:err2, res: data2 } = await promiseValue(ROUTERContract.estimateGas[fucName](
            paramsObj['amountIn'],
            paramsObj['amountOutMin'],
            paramsObj['address'],
            paramsObj['addressTo'],
            paramsObj['deadline'],
            // {...paramsObj['overrides']}
          ))
          hasError = err2
          data = data2
          break;
      }
      if (hasError) {
        console.log(`excute ${fucName} estimateGas error`, data)
      }
      return { hasError, res: data }
    },
    async dealDataBeforeExchange() {
      const token = this.exchangeFromToken
      const data = await this.getSubmitData()

      this.showLoading = true
      
      const isEth = token && token['tokenName'] === 'ETH'
      const isWETH = token && token['tokenName'] === 'WETH'
      if (!(isEth || isWETH)) {
        const { hasError, isApprove, allowanceTokenData } = await this.getUserAllowanceForToken()
        if (!isApprove) {
          this.showLoading = false
          Toast('need Approved')
          return
        
        }
      }

      const exchangeType = this.getExchangeType(data)
      this.exchangeType = exchangeType

      const { datacode, tempgasfixlimit } = await this.getDATAForTransaction(exchangeType, true)
      console.log('datacode',datacode)
      console.log('tempgasfixlimit',tempgasfixlimit)

      const selectedConnectAddress = getConnectedAddress()
      const { amountin } = data
      const gasInfo = _.cloneDeep(data.gasInfo)
      this.sendMetadata = {
        from: selectedConnectAddress,
        to: selectedConnectAddress,
        gas: gasInfo.gasLimit,
        gasPrice: gasInfo.gasPrice,
        value: amountin,
        symbolName: this.exchangeFromToken['tokenName'],
        netInfo: this.currentChainInfo,
        DATA: datacode,
        estimatedGasFee: utils.formatEther(tempgasfixlimit) // todo
      }

      const gasPrice = data.gasInfo['gasPrice']
      data.gasInfo['gasPrice'] = web3.utils.toWei(gasPrice, 'gwei')
      this.exchangeData = _.cloneDeep(data)
      console.log('exchangeData', this.exchangeData)
      this.showLoading = false
      this.showTradeConfirm = true
    },
    async exchangeSubmit() {
      // if (this.currentProtocolType === 'v3') { Toast('Comming Soon'); return; }
      if (!isLogin()) { Toast('Need Login'); return; }
      if(!this.connectedWallet()) { return; }
      if (!this.hasBalance()) {
        Toast('Not Enough ETH')
        return
      }
      const token = this.exchangeFromToken
      console.log(token)
      if (!token) {
        Toast('Choose Token')
        return
      }

      const data = await this.getSubmitData()
      if (!this.checkData(data)) { this.showLoading = false; return }

      this.currentOptType = 'exchangeSubmit'
      
      // check privateKey whether is existed
      const privateKey = await getDecryptPrivateKeyFromStore(this)
      if (!privateKey) {
        this.showInputPswModal = true;
        return
      }
      await this.dealDataBeforeExchange()
    },
    async exchangeV3(type, data, isNeedApprove) {
      const contractWallet = await getContractWallet(this)
      IUniswapV3Router(type, data, this.currentChainInfo, this, contractWallet).then(async res => {
        if (res) {
          console.log("swapv3success: ", res);
          await this.exchangeSuccess(res, data)//TODO
          this.showLoading = false

          tx.wait().then(async res=>{
            console.log(res)
          })
          .catch(error => {
            console.log(error)
          })
        } else {
          this.showLoading = false
          Toast(`Exchange Submitted Failed`)
          console.log("swapv3error: ");
        }
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
    resetVal() {
      this.exchangeFrom = ''
      this.exchangeTo = ''
      this.exchangeFromToken = null
      this.exchangeTOToken = null
      this.assetsTokenList = [],
      this.allTokenList = [],
      this.$refs.tokenFromSelect && this.$refs.tokenFromSelect.resetSelectVal()
      this.$refs.tokenToSelect && this.$refs.tokenToSelect.resetSelectVal()
    },
    async handleNetworkChange(data, emitEvent) {
      this.resetVal()
      const chainInfo = CHAINMAP[web3.utils.numberToHex(data.value.id)]
      this.currentChainInfo = chainInfo
      await this.$store.dispatch('StoreSelectedNetwork', { netInfo: this.currentChainInfo })
      // emitEvent && (this.$eventBus.$emit('networkChange', { chainInfo, from:'exchange' }))
      this.$eventBus.$emit('networkChange', { chainInfo, from:'exchange' })
      await this.getTokenList(true)
    },
    handleProtocolChange(data) {
      this.currentProtocolType = data.value['id']
      console.log(this.currentProtocolType)
    },
    async getTokenList(forAccounts) {
      this.allTokenList = []
      this.assetsTokenList = []
      this.tokenLoading = true
      const selectedConnectAddress = getConnectedAddress()
      if (!selectedConnectAddress) { return }
      const methodName = forAccounts ? 'GetAvailableTokenAssets' : 'GetAllTokenList'
      const { hasError, list } = await this.$store.dispatch(methodName, { selectedConnectAddress, chainInfo: this.currentChainInfo });
      const tokenList = await generateTokenList(_.cloneDeep(list), this, forAccounts)

      const currentChainId = this.currentChainInfo && this.currentChainInfo['id']
      const hexChainId = currentChainId && web3.utils.numberToHex(currentChainId)
      const rpcUrl = hexChainId && CHAINMAP[hexChainId]['rpcUrls'][0]
      const ETHAssets = await getDefaultETHAssets(this, rpcUrl);
      this.assetsTokenList = [].concat([ETHAssets], tokenList)
      this.allTokenList = [].concat([ETHAssets], tokenList)
      this.exchangeFromToken = this.assetsTokenList[0]
      this.exchangeToToken = this.allTokenList[0]
      this.setShowApproveButton()
      this.tokenLoading = false
    },
    setShowApproveButton() {
      const tokenInfo = this.exchangeFromToken
      const isEth = tokenInfo && tokenInfo['tokenName'] === 'ETH'
      const isWETH = tokenInfo && tokenInfo['tokenName'] === 'WETH'
      this.showApproveButton = !isEth && !isWETH
    },
    cancelExchange() {
      this.showTradeConfirm = false
      Toast('Cancel Transaction')
    },
    async confirmExchange({ overrides }) {
      this.showTradeConfirm = false
      const exchangeType = this.exchangeType
      const data = _.cloneDeep(this.exchangeData)
      data['gasInfo']['gasLimit'] = overrides.gasLimit
      data['gasInfo']['gasPrice'] = web3.utils.toWei(overrides.gasPrice, 'gwei')
      
      if (this.currentProtocolType === 'v3') {
        // const netWorkIsROPSTEN = window.ethereum.chainId === CHAINIDMAP['ROPSTEN']
        // if (!netWorkIsROPSTEN) { 
        //   Toast('Comming Soon') 
        //   return 
        // }
        if (exchangeType == 'Token2Token') {
          this.exchangeV3('multiple', data)
        } else {
          !data.tokenFrom && (data.tokenFrom = this.WETHAddress)
          !data.tokenTo && (data.tokenTo = this.WETHAddress)
          this.exchangeV3('single', data)
        }
        return
      }
      switch(exchangeType) {
        case 'WETH2Token':
          const tokenFrom = this.WETHAddress // For WETH tokenAddress
          await this.exchangeWETH2Token({...data, tokenFrom})
          break;
        case 'Token2WETH':
          const tokenTo = this.WETHAddress // For WETH tokenAddress
          await this.exchangeToken2WETH({...data, tokenTo})
          break
        case 'Token2Token':
          await this.exchangeToken2Token(data)
          break;
      }
    },
    cancelApprove() {
      this.showApproveModal = false
      Toast('Cancel Approve')
    },
    async confirmApprove() {
      this.showApproveModal = false
      if (this.currentProtocolType === 'v3') {
        this.approveV3Submit()
        return 
      }

      const token = this.exchangeFromToken
      let tokenAddress;
      let tokenAbi;
      const isEth = token && token['tokenName'] === 'ETH'
      const isWETH = token && token['tokenName'] === 'WETH'
      if (isEth) {
        tokenAddress = this.WETHAddress
        const WETHToken = _.find(this.allTokenList, {tokenName: 'WETH'})
        tokenAbi = WETHToken && WETHToken['abiJson']
      } else {
        tokenAddress = token.tokenAddress
        tokenAbi = token.abiJson
      }
      const TokenContract = await getContractAt({ tokenAddress, abi: tokenAbi }, this)
      const approveTokenAmount = ethers.constants.MaxUint256; // max
      const data = _.cloneDeep(this.approveData)
      const overrides = data.gasInfo

      this.showLoading = true
      if (!TokenContract.approve) {
        this.showLoading = false
        Toast('No support')
        return
      }
      const logData = {
        1: this.routerAddress,
        2: approveTokenAmount,
        overrides
      }
      console.log('approveData', logData)
      TokenContract.approve(this.routerAddress, approveTokenAmount, overrides)
      .then(async res=>{
          console.log(`Approve Token-${token.tokenName} tx: `, res);
          addTransHistory(res, 'Approve', this, 'Infinite')
          const { allowanceTokenData } = await this.getUserAllowanceForToken(true)
          const saveTokenData = {
            ...allowanceTokenData,
            // allowance: approveTokenAmount
            allowance: "Infinite"
          }
          const { hasError, data, error } = await this.$store.dispatch('SaveUserAllowanceForToken', {...saveTokenData})
          this.showLoading = false
          if (!hasError) {
            Toast(`Submitted ${token.tokenName} Success`)
            console.log(`SaveUserAllowanceForToken ${token.tokenName} Suucess`)
          } else {
            Toast(`Approve ${token.tokenName} Failed`)
            console.log('SaveUserAllowanceForToken Error', error)
          }
          
          
        res.wait()
        .then(async txRes => { // approve success
          console.log(`Approve Token-${token.tokenName} res: `, txRes);
        })
        .catch(error=>{
          this.showLoading = false
          // Toast(`Approve ${token.tokenName} Failed`)
          console.log(`Approve Token-${token.tokenName} error: `, err);
        })
      })
      .catch(err => {
        this.showLoading = false
        let errorValue = formatErrorContarct(err)
        Toast.fail(errorValue)
        console.log(`Approve Token-${token.tokenName} error: `, err);
      })

    },
    approveV3Submit() {
      approveV3Router(this.exchangeFromToken, this).then(async res => {
        console.log(res)
        if (res) {
          
          addTransHistory(res, 'Approve', this, 'Infinite')
          const { allowanceTokenData } = await this.getUserAllowanceForToken(true)
          const saveTokenData = {
            ...allowanceTokenData,
            allowance: "Infinite"
          }
          saveTokenData.swap_address = this.v3routerAddress
          const { hasError, data, error } = await this.$store.dispatch('SaveUserAllowanceForToken', {...saveTokenData})
          this.showLoading = false
          if (!hasError) {
            Toast('Submitted success')
            console.log(`SaveUserAllowanceForToken  Success`)
          } else {
            Toast('Approve Failed')
            console.log('SaveUserAllowanceForToken Error', error)
          }


          res.wait().then(async txRes => {
            console.log(txRes)
          }).catch(error => {
            console.log(error)
          })
          
        } else {
          Toast('Approve Failed')
        }
      })
    },

    transFromChange(data) {
      console.log(data)
    },
    async handleAccountChange(addressInfo) {
      this.showLoading = true;
      await this.getTokenList()
      this.showLoading = false;

    },
    _handleNetworkChange({ chainInfo, from }) {
      if (from === 'exchange') { return }
      this.defaultNetWork = chainInfo.id
      this.defaultIcon = chainInfo.icon
      this.handleNetworkChange({value:{id:chainInfo.id}}, true)
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

      if (this.currentOptType === 'exchangeSubmit') {
        await this.dealDataBeforeExchange()
      }
      if (this.currentOptType === 'approveSubmit') {
        await this.dealDataBeforeApprove()
      }
      
    },
  },
  async created() {
    this.defaultNetWork = this.getDefaultNetWork()
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
    this.$eventBus.$on('networkChange', this._handleNetworkChange)
    this.$eventBus.$on('changeAccout', this.handleAccountChange)
    await this.getTokenList()
  },
};
</script>
<style lang="scss" scoped>
  @import "index";
</style>