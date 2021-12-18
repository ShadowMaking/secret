'use strict';
import Vue from 'vue';
import { Toast } from 'vant';
import { ethers, utils } from 'ethers'
import { getContractAt, getConnectedAddress, initRPCProvider } from '@/utils/dashBoardTools';
import V3SwapRouter from "./V3SwapRouter.json";
import web3 from 'web3';
import { CHAINMAP } from '@/utils/netWorkForToken';

Vue.use(Toast);
// import IERC20 from "./IERC20.json";
// import IWETH from "@uniswap/v3-periphery/artifacts/contracts/interfaces/external/IWETH9.sol/IWETH9.json";
import {
  CurrencyAmount,
  Ether,
  Percent,
  Token,
  TradeType,
  WETH9 as WETH9_,
  Currency,
} from "@uniswap/sdk-core";
import { 
  Pool,
  SwapRouter,
  nearestUsableTick,
  TickMath, 
  FeeAmount, 
  TICK_SPACINGS,
  encodeSqrtRatioX96,
  computePoolAddress,
  Route,
  Trade,  
} from "@uniswap/v3-sdk";


const netWorkId = 3
console.log(netWorkId)
const v3routerAddress = '0xE592427A0AEce92De3Edee1F18E0157C05861564'
const weth = `0xc778417e063141139fce010982780140aa0cd5ab`; // Ropsten WETH9
const uni = "0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984"; // Ropsten UNI
// const dai = `0xad6d458402f60fd3bd25163575031acdce07538d`; // Ropsten DAI
// const factory = "0x1F98431c8aD98523631AE4a59f267346ea31F984"; // Ropten UniswapV3Factory

// const overrides = {
//   gasLimit: 8000000,
//   gasPrice: 20000000000,
// };

export const IUniswapV3Router = (type, data, currentChainInfo, $this, contractWallet) => {//type = single and multiple
  console.log(currentChainInfo)
  return new Promise( async (resolve, reject) => {
    const v3ROUTERContract = await getContractAt({ tokenAddress: v3routerAddress, abi: V3SwapRouter.abi }, $this)
    const tradeType = TradeType.EXACT_INPUT;
    // const ETHER = Ether.onChain(3);
    const fromToken = new Token(netWorkId, data.tokenFrom, 18);
    let toToken = new Token(netWorkId, data.tokenTo, 18);
    const wethToken = new Token(netWorkId, weth, 18);
    const overrides = {
      gasLimit: data.gasInfo.gasLimit,
      gasPrice: Number(data.gasInfo.gasPrice),
    };
    const amount = data.amountin;
    

    // const WETH = WETH9_[1];
    
    const DAIAmount = CurrencyAmount.fromRawAmount(fromToken, "100000000000");
    const slippageTolerance = new Percent(5, 1);
    const deadline = Math.floor(Date.now() / 1000) + 60 * 30;
    
    const recipient = getConnectedAddress();
    // const metamaskProvider1 = new ethers.providers.Web3Provider(window.ethereum);
    // const metamasksigner1 = metamaskProvider1.getSigner(0);
    const currentChainId = currentChainInfo && currentChainInfo['id']
    const hexChainId = currentChainId && web3.utils.numberToHex(currentChainId)
    const rpcUrl = hexChainId && CHAINMAP[hexChainId]['rpcUrls'][0]
    const metamaskProvider = initRPCProvider(rpcUrl);
    // const metamasksigner = metamaskProvider.getSigner(recipient);
    const metamasksigner = contractWallet.connect(metamaskProvider);
    
    let pool, tokenFromPool, tokenToPool, trade;

    if (type == 'single') {
      pool = newPool(fromToken, toToken)
      trade = await Trade.fromRoute(
        new Route([pool], fromToken, wethToken),
        DAIAmount,
        tradeType
      );
    } else {
      tokenFromPool = newPool(fromToken, wethToken)
      toToken = new Token(netWorkId, uni, 18);//Ropsten support uni,dai,weth
      tokenToPool = newPool(wethToken, toToken)
      trade = await Trade.fromRoute(
        new Route([tokenFromPool, tokenToPool], fromToken, toToken),
        DAIAmount,
        tradeType
      );
    }
    
    const { calldata, value } = SwapRouter.swapCallParameters(trade, {
      slippageTolerance,
      recipient,
      deadline,
    });
    // const transferAmount = utils.parseEther(amount);
    const amountEth = ethers.utils.parseEther(amount);
    // {
    //   1: "0x4F5FD0eA6724DfBf825714c2742A37E0c0d6D7d9"
    //   2: "0x2386f26fc10000"
    //   gasLimit: 600000
    //   gasPrice: "20000000000"
    // }
    metamasksigner.sendTransaction({
      from: recipient,//recipient--0x4f5fd0ea6724dfbf825714c2742a37e0c0d6d7d9
      to: v3ROUTERContract.address,
      data: calldata,
      ...overrides,
      value: amountEth,
    }).then(async tx=>{
        console.log(tx)
        tx.wait()
        .then(async res=>{
          console.log(res)
          resolve(res)
        })
        .catch(error => {
          console.log(error)
          resolve(null)
        })
      })
      .catch(error=>{
        console.log(error)
        resolve(null)
      })
    // let tx = await metamasksigner.sendTransaction({
    //   from: recipient,
    //   to: v3ROUTERContract.address,
    //   data: calldata,
    //   ...overrides,
    //   value: amountVal,
    // });
    // console.log(tx);
    // let res = await tx.wait();
    // console.log(res);
  })
}

let newPool = (token1, token2) => {
  const feeAmount = FeeAmount.MEDIUM;
  const sqrtRatioX96 = encodeSqrtRatioX96(1, 1);
  const liquidity = 1_000_000;
  const thisPool = new Pool(
    token1,
    token2,
    feeAmount,
    sqrtRatioX96,
    liquidity,
    TickMath.getTickAtSqrtRatio(sqrtRatioX96),
    [
      {
        index: nearestUsableTick(TickMath.MIN_TICK, TICK_SPACINGS[feeAmount]),
        liquidityNet: liquidity,
        liquidityGross: liquidity,
      },
      {
        index: nearestUsableTick(TickMath.MAX_TICK, TICK_SPACINGS[feeAmount]),
        liquidityNet: -liquidity,
        liquidityGross: liquidity,
      },
    ]
  )
  return thisPool
}

const overridesApprove = {
  gasLimit: 8000000,
  gasPrice: 20000000000,
};
export const approveV3Router = (approveToken, $this) => {
  return new Promise( async (resolve, reject) => {
   const TokenContract = await getContractAt({ tokenAddress: approveToken.tokenAddress, abi: approveToken.abiJson }, $this)
    const approveTokenAmount = ethers.constants.MaxUint256; // max
    if (!TokenContract.approve) {
      Toast('No support')
      return
    }
    TokenContract.approve(v3routerAddress, approveTokenAmount, overridesApprove)
      .then(async res=>{
        console.log(res)
        res.wait()
        .then(async txRes => {
          console.log(txRes)
          resolve(txRes)
        }).catch(error => {
          console.log(error)
          resolve(null)
        })
      }).catch(error => {
        console.log(error)
        resolve(null)
      })
  })
}

// export const swapv3Router = (data) => {
//   return new Promise( async (resolve, reject) => {
//     const v3ROUTERContract = await getContractAt({ tokenAddress: v3routerAddress, abi: V3SwapRouter.abi })
//     console.log(v3ROUTERContract)
//     const tokenA = data.tokenFrom;
//     const tokenB = data.tokenTo;
//     console.log(data)
//     v3ROUTERContract.exactInputSingle(tokenA, tokenB, data.fee, '0x4F5FD0eA6724DfBf825714c2742A37E0c0d6D7d9',data.amountin, data.amountmin)
//     .then(async res => {
//       console.log('res1', res)
//       resolve(res)
      
//     })
//     .catch(error=>{
//       console.log(error)
//       reject(error)
//     })
//   })
// }
