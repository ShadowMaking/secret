'use strict';
import * as ethers from 'ethers'
import { getContractAt } from '@/utils/dashBoardTools';
import V3SwapRouter from "./V3SwapRouter.json";
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
console.log(V3SwapRouter)

const v3routerAddress = '0xE592427A0AEce92De3Edee1F18E0157C05861564'
const weth = `0xc778417e063141139fce010982780140aa0cd5ab`; // Ropsten WETH9
const uni = "0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984"; // Ropsten UNI
const dai = `0xad6d458402f60fd3bd25163575031acdce07538d`; // Ropsten DAI
const factory = "0x1F98431c8aD98523631AE4a59f267346ea31F984"; // Ropten UniswapV3Factory


export const swapv3Router = () => {
  return new Promise( async (resolve, reject) => {
    const v3ROUTERContract = await getContractAt({ tokenAddress: v3routerAddress, abi: V3SwapRouter.abi })
    const tradeType = TradeType.EXACT_INPUT;
    const ETHER = Ether.onChain(3);
    const daiToken = new Token(3, dai, 18);
    const uniToken = new Token(3, uni, 18);
    const wethToken = new Token(3, weth, 18);
    const currencyIn = daiToken;
    const currencyOut = wethToken;

    const feeAmount = FeeAmount.MEDIUM;
    const sqrtRatioX96 = encodeSqrtRatioX96(1, 1);
    const liquidity = 1_000_000;
    const WETH = WETH9_[1];
    
    const pool = new Pool(
      daiToken,
      wethToken,
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
    );

    const DAIAmount = CurrencyAmount.fromRawAmount(daiToken, "100000000000");
    const slippageTolerance = new Percent(5, 1);
    const deadline = Math.floor(Date.now() / 1000) + 60 * 30;
    // const metamaskProvider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = metamaskProvider.getSigner(0);
    const recipient = window.ethereum.selectedAddress;

    // let user = metamaskProvider.getSigner(0);
    // console.log(user)

    const trade = await Trade.fromRoute(
      new Route([pool], daiToken, wethToken),
      DAIAmount,
      tradeType
    );

    const { calldata, value } = SwapRouter.swapCallParameters(trade, {
      slippageTolerance,
      recipient,
      deadline,
    });

    // let tx = await user.sendTransaction({
    //   from: user.address,
    //   to: SWAP_ROUTER.address,
    //   data: calldata,
    //   ...overrides,
    //   ...(value && !isZero(value) ? { value } : {}),
    // });
    // console.log(tx);
    // let res = await tx.wait();
    // console.log(res);
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
