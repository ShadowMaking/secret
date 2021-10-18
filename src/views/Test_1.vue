<template>
  <div>
    <van-button @click="add">add</van-button>
    <van-button @click="contract">contract</van-button>
  </div>
</template>
<script>
import Web3 from "web3";
import { utils, ethers } from 'ethers'
import ArbTokenBridgeABI from './ArbTokenBridge.json'
import CABI from './MetaCoinABI.json'
import { getNetMode, getSelectedChainID, initBrideByNetType } from '@/utils/web3';

export default {
  name:'Test',
  methods: {
    // only L2
    async contract() {
      /* let abi = ArbTokenBridgeABI.abi;
      const bridge = initBrideByNetType('l2')['bridge'];
      let contractAddress = "0xF9642f5aEfD3a56818A4ed0cb66804F210a634eD";
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      let contract = new ethers.Contract(contractAddress, abi, provider);

      let myAddress = '0x38299D74a169e68df4Da85Fb12c6Fd22246aDD9F'
      console.log('contract.filters',contract.filters)
      let filterFromMe = contract.filters.Transfer(myAddress);
      
      contract.on(filterFromMe, (fromAddress, toAddress, value, event) => {
          console.log('I sent', value);
      }); */
      



      const contractAddress = '0x8C7723d0791603849c166202162B2488fC0b8A23'; // ABI文件的合约地址
      const abi = CABI.abi;
      
      const accountsAddress = window.ethereum.selectedAddress;
      const myContract = new this.web3.eth.Contract(abi, contractAddress, {
        from: accountsAddress,
        gasPrice: '0', // wei
        gas: '21000'   // gas limit
      });
      
      const receiveAddress = '0xDCc1614667ECF280cb2938405f339bFbC3Ab833D';
      const value = 0;
      myContract.methods.sendCoin(receiveAddress, value)
      .send({ from: accountsAddress })
      .on('transactionHash', function(hash){})
      .on('receipt', function(receipt){})
      .on('confirmation', function(confirmationNumber, receipt){})
      .on('error', function(error, receipt) {
        console.log('err',error)
      });
    },
    async add() {
      const res = await this.$store.dispatch('AddTransactionHistory', {
        txid: "1",
        from: "0x1",
        to: "0x1",
        type: 0,
        status: 1,
        value: 1,
      });
      console.log(res);
    },
  },
}
</script>
