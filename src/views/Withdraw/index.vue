<template>
  <div class="withdraw-page">
    <van-row type="flex" justify="space-between" align="center" class="top-address">
      <van-col span="12" class="textAlignLeft">提现地址</van-col>
      <van-col span="12" class="textAlignRight">
        <van-button color="#E4E6F5" size="mini" @click="setMyAddress">
          <span slots="default" style="coloe:#495ABE">我的地址</span>
        </van-button>
      </van-col>
    </van-row>
    <div class="withdraw-opt-area">
      <div class="flex flex-center address-wrapper">
        <textarea placeholder="请输入提现地址" class="address-textarea"></textarea>
      </div>
      <v-tokenAmount key="tokenAmount-withdraw" type="withdraw" @childEvent="submitWithdraw"/>
    </div>
    <v-exchangeList key="comon-exchangeList" type="withdraw" v-show="!walletIsLock"/>
    <v-statusPop
      :status="popStatus"
      title="您的提现已提交"
      timeTxt="预计等待 20-40 分钟汇出"
      tip="请在链上钱包中查看到账情况"
      :show="showStatusPop"
      @childEvent="changeVisible" />
  </div>
</template>
<script>
import TokenAmount from '@/components/TokenAmount';
import ExchangeList from '@/components/ExchangeList';
import StatusPop from '@/components/StatusPop';

import { providers, utils, Wallet, BigNumber, constants } from 'ethers'
import { Bridge } from 'arb-ts';
import {
  // DEFAULTIMG,
  address,
  DEVNET_PRIVKEY,
  ethRPC,
  arbRPC
} from '@/utils/global';

const { parseEther } = utils;

export default {
  name: "withdraw",
  components: {
    'v-exchangeList': ExchangeList,
    'v-tokenAmount': TokenAmount,
    'v-statusPop': StatusPop,
  },
  data() {
    return {
      popStatus: 'sucess',
      showStatusPop: false
    }
  },
  computed: {
    walletIsLock() {
      return this.$store.state.metamask.walletIsLock;
    },
    metamaskInstall() {
      return this.$store.state.metamask.metamaskInstall;
    },
  },
  methods: {
    setMyAddress() { },
    changeVisible() {},
    wait(ms) {
      return new Promise(res => setTimeout(res, ms || this.defaultWait))
    },
    prettyLog(text) {
      // console.log(chalk.blue(`    *** ${text}`))
      console.log(`%c------------- ${text} ------------- \n`, 'background: #333; color: #8dc63f');
      console.log()
    },
    async submitWithdraw(info) {
      this.showStatusPop = false;
      // ------------------------ 公用数据 ------------------------------//

      const ethProvider = new providers.JsonRpcProvider(ethRPC)
      const arbProvider = new providers.JsonRpcProvider(arbRPC)

      // const ethFromL2WithdrawAmount = parseEther('0.00001')
      const ethFromL2WithdrawAmount = parseEther(info.amount)
      
      const l1TestWallet= new Wallet(DEVNET_PRIVKEY, ethProvider)
      const l2TestWallet = new Wallet(DEVNET_PRIVKEY, arbProvider)
      const testBridge = new Bridge(
        address.ethERC20Bridge,
        address.arbTokenBridge,
        l1TestWallet,
        l2TestWallet
      )

      // const preFundedSignerPK = process.env['DEVNET_PRIVKEY']
      const preFundedSignerPK = DEVNET_PRIVKEY;
      if (!preFundedSignerPK) throw new Error('Missing l2 priv key')
      const preFundedWallet = new Wallet(preFundedSignerPK, ethProvider)

      // ------------------------ 公用数据 ------------------------------//

      const withdrawEthRes = await testBridge.withdrawETH(ethFromL2WithdrawAmount)
      const withdrawEthRec = await withdrawEthRes.wait()

      // expect(withdrawEthRec.status).to.equal(1)
      const withdrawEventData = (
        await testBridge.getWithdrawalsInL2Transaction(withdrawEthRec)
      )[0]
      // expect(withdrawEventData).to.exist

      await this.wait();
      const testWalletL1EthBalance = await testBridge.getAndUpdateL1EthBalance()
      const testWalletL2EthBalance = await testBridge.getAndUpdateL2EthBalance()
      console.log(testWalletL1EthBalance.toString(), testWalletL2EthBalance.toString())

      this.prettyLog('交易正在进行，请耐心等待10s....')
      await this.wait(10000);
    
      this.$router.push({ name: 'Home' })
    }
  },
  mounted() {
    console.log("metamask是否安装", this.$store.state.metamask.metamaskInstall)
    console.log('钱包账户是否锁定', this.$store.state.metamask.walletIsLock);
  },
}
</script>

<style lang="scss" scoped>
  @import 'index';
</style>