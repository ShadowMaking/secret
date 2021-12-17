import * as ethers from 'ethers'
import { getContractAt } from '@/utils/dashBoardTools';
import IUniswapV2Router02 from "@uniswap/v2-periphery/build/IUniswapV2Router02.json";
import IERC20 from "@uniswap/v2-periphery/build/IERC20.json";
import IWETH from "@uniswap/v2-periphery/build/WETH9.json";
import { BigNumber } from "bignumber.js";

import {
  Currency,
  CurrencyAmount,
  Percent,
  Ether,
  Token,
  WETH9 as WETH9_,
  TradeType,
} from "@uniswap/sdk-core";

import { Pair, Router, Trade, Route } from "@uniswap/v2-sdk";
import JSBI from "jsbi";



const netWorkId = 3
const v2routerAddress = '0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D';
const weth = `0xc778417e063141139fce010982780140aa0cd5ab`; // Ropsten WETH9
const uni = "0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984"; // Ropsten UNI
const dai = `0xad6d458402f60fd3bd25163575031acdce07538d`; // Ropsten DAI

const overrides = {
  gasLimit: 8000000,
  gasPrice: 20000000000,
};
export const IUniswapV2Router = (type, data) => {//type = single and multiple

  return new Promise( async (resolve, reject) => {
    const v2ROUTERContract = await getContractAt({ tokenAddress: v2routerAddress, abi: IUniswapV2Router02.abi })
    // const expiryDate = Math.floor(Date.now() / 1000) + 900;
    const tradeType = TradeType.EXACT_INPUT
    const daiToken = new Token(3, dai, 18)
    const wethToken = new Token(3, weth, 18)
    
    const pair_dai_weth = new Pair(
      CurrencyAmount.fromRawAmount(daiToken, "1000"),
      CurrencyAmount.fromRawAmount(wethToken, "1000")
    )
    
    const trade = Trade.exactIn(
      new Route([pair_dai_weth], daiToken, wethToken),
      CurrencyAmount.fromRawAmount(daiToken, JSBI.BigInt(10000000))
    );

    const recipient = window.ethereum.selectedAddress
    const metamaskProvider = new ethers.providers.Web3Provider(window.ethereum)
    const metamasksigner = metamaskProvider.getSigner(0)


    const deadline = Math.floor(Date.now() / 1000) + 60 * 30
    const allowedSlippage = new Percent(100, 1)
    let swapMethods = []
    
    swapMethods.push(
      Router.swapCallParameters(trade, {
        ttl: deadline,
        recipient: recipient,
        allowedSlippage,
      })
    )
    if (trade.tradeType === TradeType.EXACT_INPUT) {
      swapMethods.push(
        Router.swapCallParameters(trade, {
          feeOnTransfer: true,
          allowedSlippage,
          recipient,
          deadline,
        })
      );
    }
    for (let i = 0; i < swapMethods.length; i++) {
      let { methodName, args, value } = swapMethods[i];
      let calldata = v2ROUTERContract.interface.encodeFunctionData(methodName, args);
      let tx = await metamasksigner.sendTransaction({
        from: recipient,
        to: v2ROUTERContract.address,
        data: calldata,
        ...overrides,
        ...(value ? { value } : {}),
      });
      console.log(tx);
      let res = await tx.wait();
      console.log(res);
    }
  })
}


