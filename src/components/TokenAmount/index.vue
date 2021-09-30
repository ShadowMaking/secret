<template>
  <div class="token-amount-wrap">
    <van-row class="token-amount-wrap-inner">
      <van-row class="top">
        <van-col span="12">
          <div class="slect-token-wrap flex">
            <i class="token token-ETH" @click="showChooseTokenModal"></i>
            <span class="token-span" @click="showChooseTokenModal">{{ selectedTokenInfo.symbol }}</span>
            <i class="icon-selected" @click="showChooseTokenModal" v-show="type!=='send'"></i>
            <a class="max-button" @click="setInputAmountMax">Max</a>
          </div>
        </van-col>
        <van-col span="12" style="text-align:right">
          <div class="flex flex-column">
            <van-field
              v-model="number"
              type="number"
              label=""
              placeholder="0.0"
              :formatter="formatter"
              class="recharge-amount-input"
              :disabled="this.walletIsLock"
              @input="handleInputTokenAmountChange" />
          </div>
        </van-col>
      </van-row>
      <div class="bottom">
        <div>
          <span>Balance：{{ selectedTokenInfo.balance }} {{ selectedTokenInfo.symbol }}</span>
        </div>
        <div style="text-align:right">
          <span>Amount</span>
        </div>
      </div>
    </van-row>
    <!-- TODO -->
    <!-- <div class="amount-fee-tip" v-show="type=='withdraw'" style="display:none!important"> -->
    <div class="amount-fee-tip" style="display:none!important">
      <span class="tip"><i class="info_icon"></i>Withdrawal Transaction Fee：0.000002 ETH($5.00)</span>
      <span class="tip"><i class="info_icon"></i>Withdrawal Amount：3.678766 ETH</span>
    </div>
    <van-button
      type="primary"
      block
      :color="buttonColor"
      class="opt-button"
      @click="submitTranction"
      :disabled="buttonDisabled"
      v-show="!walletIsLock">
      {{ dynamicButtonTxt }}
    </van-button>
    <v-unlockwallet
      key="unlockWalletButton"
      :show="showUnlockWalletButton"
      :showLockIcon="false"
      :expectNetType="expectNetType"
      v-show="walletIsLock" />
    <van-popup round closeable v-model="showTokenSelect" :position="checkBrower()" :style="{ minHeight: '30%' }" @close="closeChooseTokenModal">
      <div class="token-select-wrap">
        <div class="header"><h3>Choose Token</h3></div>
        <div class="choose-token-list">
          <div class="token-search-wrapper">
            <van-search
              v-model="serchTokenValue"
              placeholder="token name"
              class="serach-token-input"
              show-action
              :clearable="false"
              @search="onSearch"
              @cancel="onCancel"
              @clear="onCancel"
              @input="handleWatchInput" >
              <template #action>
                <div @click="onSearch"></div>
              </template>
            </van-search>
            <div class="token-search-result-wrapper" v-show="showSearchResult">
              <ul class="token-search-result" v-show="searchResult.length>0">
                <li v-for="(item,index) in searchResult" :key="index" @click="selectToken(item)">
                  {{ `${item.symbol} (${item.balance})` }}
                </li>
              </ul>
              <div :class="['token-search-result-none-data', {'hide': searchResult.length!==0}]">none data</div>
            </div>
          </div>
          <div class="common-base-token" v-show="!showSearchResult">
            <p>Common bases<i></i></p>
            <div class="common-bases-list">
              <a v-for="i in commomToken" :key="i">
                <i :class="['token', `token-${i}`]"></i><span>{{ i }}</span>
              </a>
            </div>
          </div>
          <ul class="choose-token-list-ul"  v-show="!showSearchResult">
            <li v-for="(item, index) in tokenList" :key="`token-${index}`" @click="selectToken(item)">
              <van-row class="flex" justify="space-between">
                <van-col span="12">
                  <div class="flex">
                    <i :class="['token', `token-${item.symbol}`]"></i>
                    <div class="token-name"><span>{{ item.symbol }}</span><span>{{ item.symbol }}</span></div>
                  </div>
                </van-col>
                <van-col span="12" class="textAlignRight token-balance"><span>{{ item.balance }}</span></van-col>
              </van-row>
            </li>
          </ul>
        </div>
      </div>
    </van-popup>
    <v-statusPop
      status="warning"
      title="Sign Lose Efficacy"
      timeTxt=""
      tip="Sign Again"
      :show="showStatusPop"
      @childEvent="changeVisible" />
  </div>
</template>
<script>
import Vue from 'vue';
import { Button, Col, Row, Field, Popup, Search } from 'vant';
import UnlockWallet from '@/components/UnlockWallet';
import StatusPop from '@/components/StatusPop';
import { minus, lteZero, isZero, retainDecimals } from '@/utils/number'
import { utils, BigNumber } from 'ethers'
import * as ethers from 'ethers'
import _ from 'lodash'
import { initBrideByNetType } from '@/utils/web3'
import { isPc } from '@/utils/index';
import { checkIsTokenBySymbol } from '@/utils/token';
import { initTokenTime, updateLoginTime, tokenIsExpires } from '@/utils/auth'
const { parseEther, formatEther } = utils;

Vue.use(Button);
Vue.use(Col);
Vue.use(Row);
Vue.use(Field);
Vue.use(Popup);
Vue.use(Search);

export default {
  name: "common-recharge-amount",
  props: {
    'type': String, // deposit | send | withdraw
    'buttonCode': Number,
    'buttonTxt': {
      type: String,
      default: 'Enter The Amount'
    },
    'disabled': Boolean,
    'address': String,
  },
  components: {
    "v-unlockwallet": UnlockWallet,
    'v-statusPop': StatusPop,
  },
  data() {
    return {
      number: '',
      showTokenSelect: false,
      serchTokenValue: '',
      ethAvailableBalance: '0.0',
      selectedTokenInfo: { symbol:'ETH', balance: 0.0 },
      buttonColor: '#A4ACDF',
      buttonDisabled: true,
      buttonText: this.buttonTxt,
      showStatusPop: false,
      commomToken: ["ETH"],
      tokenList: [
        { symbol:'ETH', balance: 0.0 },
      ],
      showSearchResult: false,
      searchResult: []
    }
  },
  watch: {
    buttonTxt() {
      this.buttonText = this.buttonTxt;
    },
    buttonCode: {
      async handler(newV, oldV) {
        switch(newV) {
          case 1: // 1: 'Enter The Amount'
            if (isZero(this.number)) {
              this.setButtonDisabled('Enter The Amount');
            } else {
              await this.setButtonStatusByBalance();
            }
            break;
          case 2: // 2: 'invalid address'
          default:
            this.setButtonDisabled('invalid address');
            break;
        }
      },
      deep: true,
    },
    dynamicButtonTxt: {
      // deep watch， watch object and array change
      handler(newV, oldV) {
        // console.log(newV, oldV)
      },
      deep: true,
    },
    '$store.state.metamask.walletIsLock': async function (res) {
      if (!this.walletIsLock) {
        const balance = await this.getETHAvailableBalance()
        this.ethAvailableBalance = this.dealAvailableBalance(balance && (formatEther(balance)) || 0);
        this.selectedTokenInfo = { symbol:'ETH', balance: this.ethAvailableBalance }
        const tokenList = await this.getTokenList()
        this.tokenList = tokenList
      }
    }
  },
  computed: {
    expectNetType() {
      return this.type === 'deposit' ? 'l1' : 'l2';
    },
    dynamicButtonTxt() {
      return this.buttonText;
    },
    metamaskInstall() {
      return this.$store.state.metamask.metamaskInstall;
    },
    walletIsLock() {
      return this.$store.state.metamask.walletIsLock;
    },
    showUnlockWalletButton() {
      return !this.metamaskInstall || this.walletIsLock;
    },
    typeTxt() {
      const erum = { deposit: 'Deposit', send: 'Send', withdraw: 'Withdraw' };
      return erum[this.type];
    },
  },
  methods: {
    generateSearchResult(data) {
      return data.map(item => {
        const target = _.find(this.tokenList, { symbol: item.symbol })
        const balance = target && target.balance || 0.0
        return { symbol: item.symbol, balance }
      })
    },
    async onSearch(val) {
      this.serchTokenValue = val;
      const result = await this.$store.dispatch('SearchToken', { token: val, netType: this.expectNetType })
      this.searchResult = this.generateSearchResult(_.cloneDeep(result))
      this.showSearchResult = true
      console.log('result',result, this.searchResult)
    },
    onCancel() {
      this.serchTokenValue = undefined
    },
    handleWatchInput(val) {
      !val && (this.showSearchResult = false)
    },
    dealAvailableBalance(amount) {
      // TODO
      if (!isNaN(amount)) {
        return retainDecimals(amount, 6)
      }
      return amount
    },
    checkBrower() {
      if (isPc()) { return 'center' };
      return 'bottom';
    },
    formatter(value) {
      const vls = value.split('.');
      if (vls.length > 1) {
        return `${parseInt(vls[0])}.${vls[1]}`;
      }
      return value;
    },
    closeChooseTokenModal() {
      this.showTokenSelect = false
      this.showSearchResult = false
      this.serchTokenValue = undefined
    },
    showChooseTokenModal() {
      if (this.walletIsLock || this.type === 'send') { return }
      this.showTokenSelect = true
    },
    setInputAmountMax() {
      this.number = this.selectedTokenInfo.balance
    },
    selectToken(record) {
      const { symbol, balance } = record;
      this.selectedTokenInfo = { symbol, balance }
      this.showTokenSelect = false
      this.number = undefined
      this.setButtonDisabled('Enter The Amount');
    },
    submitTranction() {
      // check sign wether lose effect
      /* if (tokenIsExpires()) {
        this.showStatusPop = true
      } else {
        this.$emit('childEvent',{amount: this.number});
      } */
      this.$emit('childEvent',{
        amount: this.number,
        tokenInfo: {
          symbol: this.selectedTokenInfo.symbol,
          isToken: checkIsTokenBySymbol(this.selectedTokenInfo.symbol)
        }
      });
    },
    changeVisible(eventInfo) {
      this.showStatusPop = false
      eventInfo.submit && (this.signToMetamask())
    },
    async signToMetamask() {
      const selectedAccountAddress = window.ethereum.selectedAddress;
      const message = `
        Access Eigen account.
        Only sign this message for a trusted client!
      `;
      // when signRes has value declare sign sucess
      const signRes = await this.web3.eth.personal.sign(this.web3.utils.fromUtf8(message), selectedAccountAddress);
      if (signRes!==undefined) {
        initTokenTime()
        this.$emit('childEvent',{amount: this.number});
      }
    },
    setButtonDisabled(btxt) {
      this.buttonText = btxt;
      this.buttonColor = '#A4ACDF';
      this.buttonDisabled = true;
    },
    handleWatchResetStatus() {
      this.number = '';
      this.ethAvailableBalance = '0.0';
      this.selectedTokenInfo = { symbol:'ETH', balance: this.ethAvailableBalance }
      this.setButtonDisabled('Enter The Amount');
    },
    async getL1tokenBalance(bridge) {
      const l1tokenAddress = '0x0c1ffAf1aA49178921fd23baA85ff84E50402814';
      const abi = L1TokenABIJSON.abi;
      const l1signerOrProvider = new ethers.providers.Web3Provider(window.ethereum);

      // for L1
      const ethProvider = new ethers.providers.Web3Provider(window.ethereum);
      const arbProvider = new ethers.providers.JsonRpcProvider('https://rpc.ieigen.com/eig/')
      const l1Signer = ethProvider.getSigner(0);
      const l2Signer = arbProvider.getSigner(window.ethereum.selectedAddress);


      // const myContract = new ethers.Contract( l1tokenAddress , abi , l1signerOrProvider )
      const myContract = new ethers.Contract( l1tokenAddress , abi , l1Signer )
      console.log('myContract', myContract)

      const balance = await myContract.balanceOf('0x4F5FD0eA6724DfBf825714c2742A37E0c0d6D7d9');
      // const balance = await myContract.balanceOf(l1tokenAddress);
      console.log(this.web3.utils.hexToNumberString(balance))  // balance.toString()
      console.log(formatEther(balance.toString()))

      // test deposit
      // const amountnum = BigNumber.from('0.0000000000000001')  // 0.0000000000498798
      const amountnum = BigNumber.from('800')  // 0.0000000000498798  18次方
      // const amountnum = formatEther('1') 
      console.log(amountnum)

      bridge.deposit(l1tokenAddress, amountnum)
      .then(async res=>{
        console.log(res)
      })
      .catch(error => {
        console.log(error)
      })
    },
    async getETHAvailableBalance() {
      const type = this.type
      const bridgeType = type === 'deposit'? 'l1':'l2';
      const bridge = initBrideByNetType(bridgeType)['bridge'];
      let balance;
      switch(type) {
        case 'deposit':
          balance = await bridge.getAndUpdateL1EthBalance();
          break;
        case 'withdraw':
        case 'send':
          balance = await bridge.getAndUpdateL2EthBalance();
          break;
      }
      return balance;
    },
    async handleInputTokenAmountChange(tokenAmount) {
      this.number = tokenAmount
      if (!tokenAmount || isZero(tokenAmount)) {
        this.setButtonDisabled('Enter The Amount');
        return;
      }
      if (this.address && !utils.isAddress(this.address) && this.type !== 'deposit') {
        this.setButtonDisabled('Invalid Address');
        return;
      }
      await this.setButtonStatusByBalance(tokenAmount);
    },
    async setButtonStatusByBalance(tokenAmount) {
      const _minus = await this.getMinus(tokenAmount||this.number);
      if (lteZero(_minus, false)) {
        this.setButtonDisabled('Insufficient Balance');
      } else {
        this.buttonText = 'Confirm';
        this.buttonColor = '#495ABE';
        this.buttonDisabled = false;
      }
    },
    async getMinus(tokenAmount) {
      let { symbol, balance: currentTokenBalance } = this.selectedTokenInfo;
      if (!currentTokenBalance && !checkIsTokenBySymbol(symbol)) {
        let availableBalance = await this.getETHAvailableBalance();
        currentTokenBalance = formatEther(availableBalance);
      }
      const formatAmount = parseEther(tokenAmount);
      const _minus  = minus(parseEther(currentTokenBalance+'').toString(), formatAmount.toString())
      console.log(`current token balance-${currentTokenBalance}；input amout为-${formatEther(formatAmount)}`)
      return _minus
    },
    async genTokenBalance(token) {
      const netType = this.expectNetType
      const selectedAccountAddress = window.ethereum.selectedAddress
      const { bridge, ethProvider, arbProvider, l1Signer, l2Signer } = initBrideByNetType(netType);
      const { tokenType, tokenAddress, symbol, decimals, image, json } = token;
      const abi = json.abi;
      const myContract = new ethers.Contract(tokenAddress, abi, netType === 'l1' ? l1Signer : l2Signer)
      console.log('myContract', myContract)

      const balance = await myContract.balanceOf(selectedAccountAddress);
      console.log(this.web3.utils.hexToNumberString(balance))  // balance.toString()
      console.log(formatEther(balance.toString()))

      return this.dealAvailableBalance(formatEther(balance.toString()))
    },
    async getTokenList() {
      const res = await this.$store.dispatch('GetTokenByNetType', { netType: this.expectNetType});
      const list = res.tokenList;
      const tokenList = [{
        symbol: "ETH",
        balance: this.ethAvailableBalance,
      }]
      for(let i=0; i<list.length; i+=1) {
        const balance = await this.genTokenBalance(list[i]);
        tokenList.push({ symbol: list[i]['symbol'], balance: balance })
      }
      return tokenList;
    },
  },
  async mounted() {
    if (!this.walletIsLock) {
      const balance = await this.getETHAvailableBalance();
      if (BigNumber.isBigNumber(balance)) {
        this.ethAvailableBalance = this.dealAvailableBalance(formatEther(balance));
        this.selectedTokenInfo = { symbol:'ETH', balance: this.ethAvailableBalance }
      }
      const tokenList = await this.getTokenList()
      this.tokenList = tokenList
    }
    this.$eventBus.$on('chainChanged', this.handleWatchResetStatus);
    this.$eventBus.$on('accountsChanged', this.handleWatchResetStatus);
    this.$eventBus.$on('disconnect', this.handleWatchResetStatus);
  }
}
</script>
<style lang="scss" scoped>
  @import 'index';
</style>
