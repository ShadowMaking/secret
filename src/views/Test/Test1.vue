<template>
  <div style="font-size:13px; " class="children-block">
    <a @click="before">获取余额等信息</a>
    <a @click="depositEth">depositEth</a>
    <a @click="withDrawEth">withDrawEth</a>
    <a @click="result">结果</a>
  </div>
</template>

<script>
import Vue from 'vue';
// import arbTs from 'arb-ts';
// import * as ethers from 'ethers';
import { providers, utils, Wallet, BigNumber, constants } from 'ethers'
import { Bridge } from 'arb-ts';
import {
  address,
  DEVNET_PRIVKEY,
  ethRPC,
  arbRPC
} from './config';

const { parseEther } = utils;

export default {
  name: 'Test',
  data() {
    return {
      defaultWait: 10000
    }
  },
  components: {},
  computed: {},
  methods: {
    wait(ms) {
      return new Promise(res => setTimeout(res, ms || this.defaultWait))
    },
    prettyLog(text) {
      // console.log(chalk.blue(`    *** ${text}`))
      console.log(`%c------------- ${text} ------------- \n`, 'background: #333; color: #8dc63f');
      console.log()
    },
    async before() {
      // ------------------------ 公用数据 ------------------------------//

      const ethProvider = new providers.JsonRpcProvider(ethRPC)
      const arbProvider = new providers.JsonRpcProvider(arbRPC)

      const ethToL2DepositAmount = parseEther('0.0001')
      const ethFromL2WithdrawAmount = parseEther('0.00001')
      
      const testPk = DEVNET_PRIVKEY;

      const l1TestWallet= new Wallet(testPk, ethProvider)
      const l2TestWallet = new Wallet(testPk, arbProvider)
      
      console.log(address.ethERC20Bridge)
      console.log(address.arbTokenBridge)

      const testBridge = new Bridge(
        address.ethERC20Bridge,
        address.arbTokenBridge,
        l1TestWallet,
        l2TestWallet
      )

      // const preFundedSignerPK = process.env['DEVNET_PRIVKEY']
      const preFundedSignerPK = testPk;
      if (!preFundedSignerPK) throw new Error('Missing l2 priv key')
      const preFundedWallet = new Wallet(preFundedSignerPK, ethProvider)

      // ------------------------ 公用数据 ------------------------------//

      // 判断账户是否有余额
      // const accounts = await ethers.getSigners();
      // accounts.forEach(function(acc,index){
      //   console.log(index, acc.address)
      // })

      const balance = await preFundedWallet.getBalance()
      const depositAmount = '0.01';
      const hasBalance = balance.gt(utils.parseEther(depositAmount))

      if (!hasBalance) {
        this.prettyLog(
          `${preFundedWallet.address} 
          not pre-funded; set a funded wallet via env-var DEVNET_PRIVKEY. exiting.`)
        return
      }

      this.prettyLog('Using preFundedWallet: ' + preFundedWallet.address);
      this.prettyLog('Randomly generated test wallet: ' + l1TestWallet.address);
        
      /* const res = await preFundedWallet.sendTransaction({
        to: l1TestWallet.address,
        value: utils.parseEther(depositAmount),
      })
      const rec = await res.wait()
      const testWalletBalance = await l1TestWallet.getBalance()
      console.log(testWalletBalance.toString())

      this.wait(10000 * 5);
      const testWalletL1EthBalance = await testBridge.getAndUpdateL1EthBalance()
      const testWalletL2EthBalance = await testBridge.getAndUpdateL2EthBalance()
      console.log(testWalletL1EthBalance.toString(), testWalletL2EthBalance.toString()) */

      //expect(testWalletL1EthBalance.eq(parseEther(depositAmount))).to.be.true
      //expect(testWalletL2EthBalance.eq(Zero)).to.be.true
    },
    async depositEth() {
      // ------------------------ 公用数据 ------------------------------//

      const ethProvider = new providers.JsonRpcProvider(ethRPC)
      const arbProvider = new providers.JsonRpcProvider(arbRPC)

      const ethToL2DepositAmount = parseEther('0.0001')
      const ethFromL2WithdrawAmount = parseEther('0.00001')
      
      const testPk = DEVNET_PRIVKEY;

      const l1TestWallet= new Wallet(testPk, ethProvider)
      const l2TestWallet = new Wallet(testPk, arbProvider)
      const testBridge = new Bridge(
        address.ethERC20Bridge,
        address.arbTokenBridge,
        l1TestWallet,
        l2TestWallet
      )

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
      // expect(rec.status).to.equal(1)
      const finalInboxBalance = await ethProvider.getBalance(inbox.address)
      // expect(initialInboxBalance.add(ethToL2DepositAmount).eq(finalInboxBalance))
      await this.wait()
      const testWalletL1EthBalance = await testBridge.getAndUpdateL1EthBalance()
      const testWalletL2EthBalance = await testBridge.getAndUpdateL2EthBalance()
      console.log(testWalletL1EthBalance.toString(), testWalletL2EthBalance.toString())
      //expect(testWalletL2EthBalance.eq(ethToL2DepositAmount)).to.be.true
      await this.wait()
      console.log('testWalletL2EthBalance', testWalletL2EthBalance)
    },
    async withDrawEth() {
      // ------------------------ 公用数据 ------------------------------//

      const ethProvider = new providers.JsonRpcProvider(ethRPC)
      const arbProvider = new providers.JsonRpcProvider(arbRPC)

      const ethToL2DepositAmount = parseEther('0.0001')
      const ethFromL2WithdrawAmount = parseEther('0.00001')
      
      const testPk = DEVNET_PRIVKEY;

      const l1TestWallet= new Wallet(testPk, ethProvider)
      const l2TestWallet = new Wallet(testPk, arbProvider)
      const testBridge = new Bridge(
        address.ethERC20Bridge,
        address.arbTokenBridge,
        l1TestWallet,
        l2TestWallet
      )

      // const preFundedSignerPK = process.env['DEVNET_PRIVKEY']
      const preFundedSignerPK = testPk;
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
    },
    async result() {
      // ------------------------ 公用数据 ------------------------------//

      const ethProvider = new providers.JsonRpcProvider(ethRPC)
      const arbProvider = new providers.JsonRpcProvider(arbRPC)

      const ethToL2DepositAmount = parseEther('0.0001')
      const ethFromL2WithdrawAmount = parseEther('0.00001')
     
      const testPk = DEVNET_PRIVKEY;

      const l1TestWallet= new ethers.Wallet(testPk, ethProvider)
      const l2TestWallet = new ethers.Wallet(testPk, arbProvider)
      const testBridge = new Bridge(
        address.ethERC20Bridge,
        address.arbTokenBridge,
        l1TestWallet,
        l2TestWallet
      )

      // const preFundedSignerPK = process.env['DEVNET_PRIVKEY']
      const preFundedSignerPK = testPk;
      if (!preFundedSignerPK) throw new Error('Missing l2 priv key')
      const preFundedWallet = new Wallet(preFundedSignerPK, ethProvider)

      // ------------------------ 公用数据 ------------------------------//
      this.wait(1000000);
      const bal = await testBridge.getAndUpdateL2EthBalance()
      // lazy check, will update once gasPrice is activated
      console.log("balance after withdraw", bal.toString())
      //expect(bal.lt(ethToL2DepositAmount)).to.be.true
    },
  },
  async mounted() {

  },
};
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
