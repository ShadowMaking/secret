<template>
  <div>
    <van-button @click="contract">contract</van-button>
    <van-button @click="getInfo">getInfo</van-button>
    <van-button @click="send">Send</van-button>
  </div>
</template>
<script>
import MetaCoinABI from '@/utils/MetaCoin.json'
import { getNetMode, initBrideByNetType } from '@/utils/web3';
import { utils, ethers } from 'ethers'
import { BigNumber } from "bignumber.js";

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
    },
    async send() {
      // const tokenAddress = '0x32E6C34Cd57087aBBD59B5A4AECC4cB495924356'
      const tokenAddress = '0xe4815AE53B124e7263F08dcDBBB757d41Ed658c6'
      const toAddress = '0xDCc1614667ECF280cb2938405f339bFbC3Ab833D';
      const url = `https://api.etherscan.io/api?module=contract&action=getabi&address=${tokenAddress}&apikey=YourApiKeyToken`
      const ajaxObj = new XMLHttpRequest();
      ajaxObj.open('get', url);
      ajaxObj.send();
      ajaxObj.onreadystatechange = async () => {
        if (ajaxObj.readyState == 4 && ajaxObj.status == 200) {
          const response = ajaxObj.response && window.JSON.parse(ajaxObj.response)
          const abi = response && response['result'] && window.JSON.parse(response['result'])
          console.log('res', abi)

          const metamaskProvider = new ethers.providers.Web3Provider(window.ethereum);
          const l1Signer = metamaskProvider.getSigner(0);
          
          // const { l1Signer, l2Signer } = initBrideByNetType('l1');
          const myContract = new ethers.Contract(tokenAddress, abi, l1Signer)
          const balance = await myContract.balanceOf('0xDCc1614667ECF280cb2938405f339bFbC3Ab833D')
          console.log('myContract',myContract, balance)

          const tokenWithdrawAmount = this.web3.utils.toHex(BigNumber(Number(1*1000000000000000000)).toFixed())
          console.log('tokenWithdrawAmount', tokenWithdrawAmount)
          // address, uint256
          myContract.transfer(toAddress, 1)
          .then(async res=>{
            console.log(res)
          })
          .catch(error => {
            console.log(error)
          })
        }
      }
    },
  },
}
</script>
