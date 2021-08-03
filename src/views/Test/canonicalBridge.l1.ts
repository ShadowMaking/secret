/*
 * Copyright 2019-2020, Offchain Labs, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *    http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

// 互转 eth和arbtoken
// TestERC20__factory @我不要变胖胖胖胖子 这个arb-ts貌似没有
// https://github.com/OffchainLabs/arbitrum/blob/d73c75d6b59b804c26316a9bb17ecccfb24bcb6d/packages/arb-ts/src/lib/abi/factories/TestERC20__factory.ts#L11 单独从这引入下

/* eslint-env node, mocha */
import chalk from 'chalk'
import { ethers } from 'hardhat'
import { providers, utils, Wallet, BigNumber, constants } from 'ethers'
const { Zero, AddressZero } = constants
import { assert, expect } from 'chai'
import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/dist/src/signer-with-address'
import { Contract, ContractFactory } from 'ethers'
const { parseEther } = utils
import deployments from "../deployment.json"
//import inbox_json from "../../arb-bridge-eth/build/contracts/contracts/bridge/Inbox.sol/Inbox.json"
import { Bridge, Inbox__factory } from "arb-ts"

const defaultWait = 10000
const wait = (ms = 0) => {
  return new Promise(res => setTimeout(res, ms || defaultWait))
}

const prettyLog = (text: string) => {
  console.log(chalk.blue(`    *** ${text}`))
  console.log()
}

describe('Bridge peripherals layer 1', () => {
  let accounts: SignerWithAddress[]
  //let TestBridge: ContractFactory
  //let testBridge: Contract
  //let testBridge: Bridge

  let inbox: Contract
  const maxSubmissionCost = 0
  const maxGas = 1000000000
  const gasPrice = 0
  const depositAmount = '0.01'
  //const l2Template20 = '0x0000000000000000000000000000000000000020'
  //const l2Address = '0x1100000000000000000000000000000000000031'
  const l2Template20 = deployments.standardArbERC20
  const l2Address = deployments.arbTokenBridge
  const TestCustomTokenL1Name = "TestERC20"
  const ethToL2DepositAmount = parseEther('0.0001')
  const ethFromL2WithdrawAmount = parseEther('0.00001')
  
  const ethRPC = "http://localhost:7545";
  const arbRPC = "http://localhost:8547";
  const ethProvider = new providers.JsonRpcProvider(ethRPC)
  const arbProvider = new providers.JsonRpcProvider(arbRPC)
  
  
  const preFundedSignerPK = process.env['DEVNET_PRIVKEY']
  if (!preFundedSignerPK) throw new Error('Missing l2 priv key')
  const preFundedWallet = new Wallet(preFundedSignerPK, ethProvider)

  //const testPk = utils.formatBytes32String(Math.random().toString())
  //console.log(testPk)
  const testPk = "0x302e383630333233363431323935353034390000000000000000000000000000"
  const l1TestWallet= new ethers.Wallet(testPk, ethProvider)
  const l2TestWallet = new ethers.Wallet(testPk, arbProvider)
  const testBridge = new Bridge(
      deployments.ethERC20Bridge,
      deployments.arbTokenBridge,
      l1TestWallet,
      l2TestWallet
    )
  let testWalletL1EthBalance: BigNumber
  let testWalletL2EthBalance: BigNumber

  //accounts = await ethers.getSigners()
  before(async function () {
    accounts = await ethers.getSigners()
      accounts.forEach(function(acc,index){
          console.log(index, acc.address)
      })

    const balance = await preFundedWallet.getBalance()
    const hasBalance = balance.gt(utils.parseEther(depositAmount))
    expect(hasBalance).to.be.true
    if (!hasBalance) {
      prettyLog(
        preFundedWallet.address +
          ' not pre-funded; set a funded wallet via env-var DEVNET_PRIVKEY. exiting.'
      )
      process.exit()
    }

    prettyLog('Using preFundedWallet: ' + preFundedWallet.address)
    prettyLog('Randomly generated test wallet: ' + l1TestWallet.address)

    const res = await preFundedWallet.sendTransaction({
      to: l1TestWallet.address,
      value: utils.parseEther(depositAmount),
    })
    const rec = await res.wait()
    const testWalletBalance = await l1TestWallet.getBalance()
    console.log(testWalletBalance.toString())
    //expect(testWalletBalance.eq(parseEther(depositAmount))).to.be.true

    await(10000 * 5)
    testWalletL1EthBalance = await testBridge.getAndUpdateL1EthBalance()
    testWalletL2EthBalance = await testBridge.getAndUpdateL2EthBalance()
    console.log(testWalletL1EthBalance.toString(), testWalletL2EthBalance.toString())
    //expect(testWalletL1EthBalance.eq(parseEther(depositAmount))).to.be.true
    //expect(testWalletL2EthBalance.eq(Zero)).to.be.true
  })

  it('should escrow depositted tokens', async function () {
    const inbox = await testBridge.l1Bridge.getInbox()
    const initialInboxBalance = await ethProvider.getBalance(inbox.address)
    console.log('initialInboxBalance', initialInboxBalance.toNumber())
    let res = await testBridge.depositETH(ethToL2DepositAmount)
    let rec = await res.wait()
    expect(rec.status).to.equal(1)
    const finalInboxBalance = await ethProvider.getBalance(inbox.address)
    expect(initialInboxBalance.add(ethToL2DepositAmount).eq(finalInboxBalance))
    await wait()
    testWalletL1EthBalance = await testBridge.getAndUpdateL1EthBalance()
    testWalletL2EthBalance = await testBridge.getAndUpdateL2EthBalance()
    console.log(testWalletL1EthBalance.toString(), testWalletL2EthBalance.toString())
    //expect(testWalletL2EthBalance.eq(ethToL2DepositAmount)).to.be.true
  })

  it('withdraw Ether transaction succeeds and emits event', async () => {
    const withdrawEthRes = await testBridge.withdrawETH(ethFromL2WithdrawAmount)
    const withdrawEthRec = await withdrawEthRes.wait()

    expect(withdrawEthRec.status).to.equal(1)
    const withdrawEventData = (
      await testBridge.getWithdrawalsInL2Transaction(withdrawEthRec)
    )[0]
    expect(withdrawEventData).to.exist
  })
  it('balance deducted after withdraw eth', async () => {
    wait(1000000)
    const bal = await testBridge.getAndUpdateL2EthBalance()
    // lazy check, will update once gasPrice is activated
    console.log("balance after withdraw", bal.toString())
    //expect(bal.lt(ethToL2DepositAmount)).to.be.true
  })

    /*
  it('should escrow depositted tokens', async function () {
    const Token = await ethers.getContractFactory(TestCustomTokenL1Name)
    //const token = await Token.deploy(testBridge.address)
    const token = await Token.deploy()
    // send escrowed tokens to bridge
    const tokenAmount = 100
    let res = await token.mint()
    let rec = await res.wait()
    expect(rec.status).to.eq(1)
    res = await token.approve(testBridge.address, tokenAmount)
    rec = await res.wait()
    expect(rec.status).to.eq(1)
    const accountBalance = await token.balanceOf(accounts[0].address)
    console.log(ethers.utils.formatUnits(accountBalance, 'wei'))

    res = await testBridge.deposit(
      token.address,
      accounts[0].address,
      tokenAmount,
      maxSubmissionCost,
      maxGas,
      gasPrice,
      '0x'
    )
    rec = await res.wait()
    expect(rec.status).to.eq(1)
    console.log(res)
    console.log("account[0]", accounts[0].address)
    console.log("token address", token.address)

    const accountBalance2 = await token.balanceOf(accounts[0].address)
    console.log(ethers.utils.formatUnits(accountBalance2, 'wei'))

    const escrowedTokens = await token.balanceOf(testBridge.address)
    console.log("deposited amount", escrowedTokens.toNumber())
    assert.equal(escrowedTokens.toNumber(), tokenAmount, 'Tokens not escrowed')
  })

  it('should withdraw erc20 tokens from L2', async function () {
    const Token = await ethers.getContractFactory(TestCustomTokenL1Name)
    //const token = await Token.deploy(testBridge.address)
    const token = await Token.deploy()
    // send escrowed tokens to bridge
    const tokenAmount = 100

    let res = await token.mint()
    await res.wait()
    res = await token.approve(testBridge.address, tokenAmount)
    await res.wait()
    res = await testBridge.deposit(
      token.address,
      accounts[0].address,
      tokenAmount,
      maxSubmissionCost,
      maxGas,
      gasPrice,
      '0x'
    )
    await res.wait()

    res = await inbox.setL2ToL1Sender(l2Address)
    await res.wait()

    const prevUserBalance = await token.balanceOf(accounts[0].address)
    console.log("prevUserBalance", ethers.utils.formatUnits(prevUserBalance, 'wei'));

    const prevUserBalance2 = await token.balanceOf(token.address)
    console.log("token address", ethers.utils.formatUnits(prevUserBalance2, 'wei'));

    const exitNum = 0
    res = await testBridge.withdrawFromL2(
      exitNum,
      token.address,
      accounts[0].address,
      tokenAmount
    )
    await res.wait()

    const postUserBalance = await token.balanceOf(accounts[0].address)

    assert.equal(
      prevUserBalance.toNumber() + tokenAmount,
      postUserBalance.toNumber(),
      'Tokens not escrowed'
    )
  })

  it('should process fast withdrawal correctly', async function () {
    const Token = await ethers.getContractFactory(TestCustomTokenL1Name)
    //const token = await Token.deploy(testBridge.address)
    const token = await Token.deploy()
    // send escrowed tokens to bridge
    const tokenAmount = 100

    let res = await token.mint()
    await res.wait()
    res = await token.approve(testBridge.address, tokenAmount)
    await res.wait()
    res = await testBridge.deposit(
      token.address,
      accounts[0].address,
      tokenAmount,
      0,
      1000000,
      0,
      '0x'
    )
    await res.wait()

    // parameters used for exit
    const exitNum = 0
    const maxFee = 10
    const liquidityProof = '0x'

    const FastExitMock = await ethers.getContractFactory('FastExitMock')
    const fastExitMock = await FastExitMock.deploy()

    await fastExitMock.setFee(maxFee)

    // send tokens to liquidity provider
    const liquidityProviderBalance = 10000
    res = await token.transfer(fastExitMock.address, liquidityProviderBalance)
    await res.wait()

    const prevUserBalance = await token.balanceOf(accounts[0].address)

    // request liquidity from them
    const PassiveFastExitManager = await ethers.getContractFactory(
      'PassiveFastExitManager'
    )
    const passiveFastExitManager = await PassiveFastExitManager.deploy()
    await passiveFastExitManager.setBridge(testBridge.address)

    const data = ethers.utils.defaultAbiCoder.encode(
      ['address', 'uint256', 'uint256', 'address', 'bytes', 'bytes'],
      [
        accounts[0].address,
        exitNum,
        maxFee,
        fastExitMock.address,
        liquidityProof,
        '0x',
      ]
    )

    console.log('testBridge.transferExitAndCall')
    res = await testBridge.transferExitAndCall(
      accounts[0].address,
      token.address,
      tokenAmount,
      exitNum,
      passiveFastExitManager.address,
      data
    )
    await res.wait()

    const postUserBalance = await token.balanceOf(accounts[0].address)

    assert.equal(
      prevUserBalance.toNumber() + tokenAmount - maxFee,
      postUserBalance.toNumber(),
      'Tokens not escrowed'
    )

    console.log('inbox.setL2ToL1Sender')
    res = await inbox.setL2ToL1Sender(l2Address)
    await res.wait()

    // withdrawal should now be sent to liquidity provider
    // const prevLPBalance = await token.balanceOf(expensiveFastExitMock[0].address)

    console.log('testBridge.withdrawFromL2')
    res = await testBridge.withdrawFromL2(
      exitNum,
      token.address,
      accounts[0].address,
      tokenAmount
    )
    await res.wait()

    const postLPBalance = await token.balanceOf(fastExitMock.address)

    assert.equal(
      postLPBalance.toNumber(),
      liquidityProviderBalance + maxFee,
      'Liquidity provider balance not as expected'
    )
  })*/
})
