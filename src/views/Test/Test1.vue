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
import arbTs from 'arb-ts';
import { providers, utils, Wallet, BigNumber, constants } from 'ethers'
import { Bridge } from 'arb-ts';

import ABI from './rnt.json'
import CABI from './MetaCoinABI.json'
import ArbTokenBridgeABI from './ArbTokenBridge.json'
import { address } from './config';

import deployments from "./deployment.json" // ???


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
    sendTrade(){},
    getTransiton(){},
    aboutContract(){},

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
      const ethRPC = "http://localhost:7545";
      const arbRPC = "http://localhost:8547";

      const ethProvider = new providers.JsonRpcProvider(ethRPC)
      const arbProvider = new providers.JsonRpcProvider(arbRPC)

      const ethToL2DepositAmount = parseEther('0.0001')
      const ethFromL2WithdrawAmount = parseEther('0.00001')
      const testPk = "0x302e383630333233363431323935353034390000000000000000000000000000"

      const l1TestWallet= new ethers.Wallet(testPk, ethProvider)
      const l2TestWallet = new ethers.Wallet(testPk, arbProvider)
      const testBridge = new Bridge(
        deployments.ethERC20Bridge,
        deployments.arbTokenBridge,
        l1TestWallet,
        l2TestWallet
      )

      // const preFundedSignerPK = process.env['DEVNET_PRIVKEY']
      const preFundedSignerPK = '???' // ???
      if (!preFundedSignerPK) throw new Error('Missing l2 priv key')
      const preFundedWallet = new Wallet(preFundedSignerPK, ethProvider)

      // ------------------------ 公用数据 ------------------------------//

      // 判断账户是否有余额
      const accounts = await ethers.getSigners();
      accounts.forEach(function(acc,index){
        console.log(index, acc.address)
      })

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
        
      const res = await preFundedWallet.sendTransaction({
        to: l1TestWallet.address,
        value: utils.parseEther(depositAmount),
      })
      const rec = await res.wait()
      const testWalletBalance = await l1TestWallet.getBalance()
      console.log(testWalletBalance.toString())

      this.await(10000 * 5);
      const testWalletL1EthBalance = await testBridge.getAndUpdateL1EthBalance()
      const testWalletL2EthBalance = await testBridge.getAndUpdateL2EthBalance()
      console.log(testWalletL1EthBalance.toString(), testWalletL2EthBalance.toString())
      //expect(testWalletL1EthBalance.eq(parseEther(depositAmount))).to.be.true
      //expect(testWalletL2EthBalance.eq(Zero)).to.be.true
    },
    async depositEth() {
      // ------------------------ 公用数据 ------------------------------//
      const ethRPC = "http://localhost:7545";
      const arbRPC = "http://localhost:8547";

      const ethProvider = new providers.JsonRpcProvider(ethRPC)
      const arbProvider = new providers.JsonRpcProvider(arbRPC)

      const ethToL2DepositAmount = parseEther('0.0001')
      const ethFromL2WithdrawAmount = parseEther('0.00001')
      const testPk = "0x302e383630333233363431323935353034390000000000000000000000000000"

      const l1TestWallet= new ethers.Wallet(testPk, ethProvider)
      const l2TestWallet = new ethers.Wallet(testPk, arbProvider)
      const testBridge = new Bridge(
        deployments.ethERC20Bridge,
        deployments.arbTokenBridge,
        l1TestWallet,
        l2TestWallet
      )

      // const preFundedSignerPK = process.env['DEVNET_PRIVKEY']
      const preFundedSignerPK = '???' // ???
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
    },
    async withDrawEth() {
      // ------------------------ 公用数据 ------------------------------//
      const ethRPC = "http://localhost:7545";
      const arbRPC = "http://localhost:8547";

      const ethProvider = new providers.JsonRpcProvider(ethRPC)
      const arbProvider = new providers.JsonRpcProvider(arbRPC)

      const ethToL2DepositAmount = parseEther('0.0001')
      const ethFromL2WithdrawAmount = parseEther('0.00001')
      const testPk = "0x302e383630333233363431323935353034390000000000000000000000000000"

      const l1TestWallet= new ethers.Wallet(testPk, ethProvider)
      const l2TestWallet = new ethers.Wallet(testPk, arbProvider)
      const testBridge = new Bridge(
        deployments.ethERC20Bridge,
        deployments.arbTokenBridge,
        l1TestWallet,
        l2TestWallet
      )

      // const preFundedSignerPK = process.env['DEVNET_PRIVKEY']
      const preFundedSignerPK = '???' // ???
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
    },
    async result() {
      // ------------------------ 公用数据 ------------------------------//
      const ethRPC = "http://localhost:7545";
      const arbRPC = "http://localhost:8547";

      const ethProvider = new providers.JsonRpcProvider(ethRPC)
      const arbProvider = new providers.JsonRpcProvider(arbRPC)

      const ethToL2DepositAmount = parseEther('0.0001')
      const ethFromL2WithdrawAmount = parseEther('0.00001')
      const testPk = "0x302e383630333233363431323935353034390000000000000000000000000000"

      const l1TestWallet= new ethers.Wallet(testPk, ethProvider)
      const l2TestWallet = new ethers.Wallet(testPk, arbProvider)
      const testBridge = new Bridge(
        deployments.ethERC20Bridge,
        deployments.arbTokenBridge,
        l1TestWallet,
        l2TestWallet
      )

      // const preFundedSignerPK = process.env['DEVNET_PRIVKEY']
      const preFundedSignerPK = '???' // ???
      if (!preFundedSignerPK) throw new Error('Missing l2 priv key')
      const preFundedWallet = new Wallet(preFundedSignerPK, ethProvider)

      // ------------------------ 公用数据 ------------------------------//
      this.wait(1000000);
      const bal = await testBridge.getAndUpdateL2EthBalance()
      // lazy check, will update once gasPrice is activated
      console.log("balance after withdraw", bal.toString())
      //expect(bal.lt(ethToL2DepositAmount)).to.be.true
    },

    // 充值
    async deposit() {
      const toAddress = "0x5ae84b86ae52d218d108d0311e50bbd33aaf1c71";
      const {
        ethERC20Bridge: erc20BridgeAddress,
        arbTokenBridge: arbTokenBridgeAddress
      } = address;

      const ethToL2DepositAmount = utils.parseEther('0.0001');
      const ethFromL2WithdrawAmount = utils.parseEther('0.00001');


      const ethProvider = new providers.JsonRpcProvider(ethRPC);
      const arbProvider = new providers.JsonRpcProvider(arbRPC);
      const ethProviderSigner = ethProvider.getSigner();
      const arbProviderSigner = arbProvider.getSigner();

      // const myPrivateKey = utils.formatBytes32String(Math.random().toString());
      const node = ethers.Wallet.fromMnemonic(mnemonic);
      const myPrivateKey = node.privateKey;

      const connectedL1Wallet = new Wallet(myPrivateKey, ethProvider);
      const connectedL2Wallet = new Wallet(myPrivateKey, arbProvider);

      const bridge = new Bridge(
        erc20BridgeAddress,
        arbTokenBridgeAddress,
        connectedL1Wallet,
        connectedL2Wallet,
      )

      await bridge.initialize(address.inbox, '0x0000000000000000000000000000000000000020', arbTokenBridgeAddress)


      const testWalletL1EthBalance = await bridge.getAndUpdateL1EthBalance();
      const testWalletL2EthBalance = await bridge.getAndUpdateL2EthBalance();

      console.log('testWalletL1EthBalance',ethers.utils.formatEther(testWalletL1EthBalance))
      console.log('testWalletL2EthBalance',ethers.utils.formatEther(testWalletL2EthBalance))

      let balance = await ethProvider.getBalance(erc20BridgeAddress);
      console.log("balance", ethers.utils.formatEther(balance))

      // const inbox = await bridge.l1Bridge.getInbox();
      // const initialInboxBalance = await ethProvider.getBalance(inbox.address)
      // const res = await bridge.depositETH(ethToL2DepositAmount, arbTokenBridgeAddress) // L1->L2
      // const res = await bridge.withdrawETH(ethFromL2WithdrawAmount, erc20BridgeAddress)  // L2->L1

      /* bridge.withdrawETH(ethFromL2WithdrawAmount, erc20BridgeAddress).then(rs=>{
        console.log('withdrawETH',rs)
      }).catch(error=>{
        console.log(error)
      }) */
      console.log('bridge',bridge)
     
      bridge.depositETH(ethToL2DepositAmount, connectedL2Wallet.address).then(async rs=>{
        console.log('depositETH',rs)
        const testWalletL1EthBalance = await bridge.getAndUpdateL1EthBalance();
        const testWalletL2EthBalance = await bridge.getAndUpdateL2EthBalance();
        console.log('testWalletL1EthBalance',ethers.utils.formatEther(testWalletL1EthBalance))
        console.log('testWalletL2EthBalance',ethers.utils.formatEther(testWalletL2EthBalance))
      }).catch(error=>{
        console.log(error)
      })



      // const res = await bridge.depositETH(ethToL2DepositAmount);
      // const res = await bridge.depositETH(utils.parseEther('32'))
      // const rec = await res.wait();
      // console.log('wihraw', res)
      
    },
    // L2转账
    async transferL2() {
      /* let abi = [
          "event ValueChanged(address indexed author, string oldValue, string newValue)",
          "constructor(string value)",
          "function getValue() view returns (string value)",
          "function setValue(string value)"
      ]; */
      let abi = ArbTokenBridgeABI.abi;

      // let provider = ethers.getDefaultProvider();
      const provider = new providers.JsonRpcProvider('http://192.168.0.122:8547');

      // 地址来自上面部署的合约
      let contractAddress = "0xF9642f5aEfD3a56818A4ed0cb66804F210a634eD";

      // 使用Provider 连接合约，将只有对合约的可读权限
      let contract = new ethers.Contract(contractAddress, abi, provider);
      // let myAddress = '0x0FC258b501aAEA2Cab330084484bB7Ec3ff81d36'
      let myAddress = '0x38299D74a169e68df4Da85Fb12c6Fd22246aDD9F'
      console.log('contract.filters',contract.filters)
      let filterFromMe = contract.filters.Transfer(myAddress);
      
      contract.on(filterFromMe, (fromAddress, toAddress, value, event) => {
          console.log('I sent', value);
      });
      return
      /* const contractAddress = '0x8C7723d0791603849c166202162B2488fC0b8A23'; // ABI文件的合约地址
      const abi = CABI.abi;
      
      const accountsAddress = this.web3.eth.accounts[0]||'0x0FC258b501aAEA2Cab330084484bB7Ec3ff81d36';
      const myContract = new this.web3.eth.Contract(abi, contractAddress, {
        from: accountsAddress,    // 交易地址
        gasPrice: '20000000000'   // 默认gas
      });
      
      const receiveAddress = '0xDCc1614667ECF280cb2938405f339bFbC3Ab833D';
      const value = 0;
      myContract.methods.sendCoin(receiveAddress, value)
      .send({ from: accountsAddress })
      .on('transactionHash', function(hash){})
      .on('receipt', function(receipt){})
      .on('confirmation', function(confirmationNumber, receipt){})
      .on('error', function(error, receipt) {}); */
    },
    // 提现
    async withdraw() { },
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
