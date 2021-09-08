<template>
  <div>
    <van-button @click="contract">contract</van-button>
    <van-button @click="getInfo">getInfo</van-button>
  </div>
</template>
<script>
import Web3 from "web3";
import { utils, ethers } from 'ethers'
import ArbTokenBridgeABI from './ArbTokenBridge.json'
import MetaCoinABI from '@/utils/MetaCoin.json'
import { getNetMode, getSelectedChainID, initBrideByTransanctionType } from '@/utils/web3';

export default {
  name:'Test',
  methods: {
    // only L2
    async contract() {
      const contractAddress = '0x6775b8E8483CC139516973F486d8F1E7182F4BDE'; // contract address
      const abi = MetaCoinABI.abi;
      
      const accountsAddress = window.ethereum.selectedAddress;
      const myContract = new this.web3.eth.Contract(abi, contractAddress, {
        from: accountsAddress,
        gasPrice: '0', // wei
        gas: '21000'   // gas limit
      });
      
      const receiveAddress = '0xDCc1614667ECF280cb2938405f339bFbC3Ab833D';
      const value = utils.parseEther('0.1')
      const hexStr = value.toHexString()

      myContract.methods.sendCoin(receiveAddress, value)
      .send({ from: accountsAddress })
      .on('transactionHash', function(hash){
        console.log('transactionHash', hash)
      })
      .on('receipt', function(receipt){
        console.log('receipt', receipt)
      })
      .on('confirmation', function(confirmationNumber, receipt){
        console.log('confirmation', confirmationNumber, receipt)
      })
      .on('error', function(error, receipt) {
        console.log('err',error)
      });
    },
    async getInfo() {
      const hash = '0xb58428e79596095f9e5502fdbcf572328030f566cbb7a9a37efd48077df68f00'
      const info = await this.web3.eth.getTransaction(hash)
      console.log(info)
    }
  },
}
</script>
