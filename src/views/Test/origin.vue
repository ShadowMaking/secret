<template>
  <div style="font-size:13px; " class="children-block">
      <a @click="submitRecharge">depositETH-充值到L2（L1-L2）</a>
      <a @click="submitWithdraw">withdrawETH-提现到L1（L2-L1）</a>
    </div>
</template>
<script>

import Vue from 'vue';

import { providers, utils, Wallet, BigNumber, constants } from 'ethers'
import { Bridge } from 'arb-ts';
import {
  address,
  DEVNET_PRIVKEY,
  ethRPC,
  arbRPC
} from '@/utils/global';

const { parseEther } = utils;

export default {
  name: "Recharge",
  components: { },
  data() {
    return { }
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
    wait(ms) {
      return new Promise(res => setTimeout(res, ms || this.defaultWait))
    },
    prettyLog(text) {
      // console.log(chalk.blue(`    *** ${text}`))
      console.log(`%c------------- ${text} ------------- \n`, 'background: #333; color: #8dc63f');
      console.log()
    },
    
    // 充值
    async submitRecharge(info) {
      const ethProvider = new providers.JsonRpcProvider(ethRPC)
      const arbProvider = new providers.JsonRpcProvider(arbRPC)

      const ethToL2DepositAmount = parseEther(info.amount)
      // const ethFromL2WithdrawAmount = parseEther('0.00001')
      
      const testPk = DEVNET_PRIVKEY;

      const l1TestWallet= new Wallet(testPk, ethProvider)
      const l2TestWallet = new Wallet(testPk, arbProvider)
      const testBridge = new Bridge(
        address.ethERC20Bridge,
        address.arbTokenBridge,
        l1TestWallet,
        l2TestWallet
      )
      
      // const address_1 = await l1TestWallet.getAddress
      // console.log('address_1',address_1)
      return

      // const preFundedSignerPK = process.env['DEVNET_PRIVKEY']
      const preFundedSignerPK = testPk;
      if (!preFundedSignerPK) throw new Error('Missing l2 priv key')
      const preFundedWallet = new Wallet(preFundedSignerPK, ethProvider)

      // ------------------------ 公用数据 ------------------------------//

      const inbox = await testBridge.l1Bridge.getInbox()
      const initialInboxBalance = await ethProvider.getBalance(inbox.address)
      console.log('initialInboxBalance', initialInboxBalance.toNumber())
      let res = await testBridge.depositETH(ethToL2DepositAmount)
      let rec = await res.wait()
      const finalInboxBalance = await ethProvider.getBalance(inbox.address)
      await this.wait()
      const testWalletL1EthBalance = await testBridge.getAndUpdateL1EthBalance()
      const testWalletL2EthBalance = await testBridge.getAndUpdateL2EthBalance()
      console.log(testWalletL1EthBalance.toString(), testWalletL2EthBalance.toString())
      await this.wait()
      console.log('testWalletL2EthBalance', testWalletL2EthBalance)

      this.prettyLog('交易正在进行，请耐心等待10s....')
      await this.wait(10000);

      this.$router.push({ name: 'Home' })
    },
    // 提现
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
}
</script>
<style lang="scss" scoped>
.children-block{
  margin-bottom: 50px;
  a{
    border: 1px solid #ccc;
    display: block;
    margin: 20px;
    padding: 5px 10px;
  }
}
</style>