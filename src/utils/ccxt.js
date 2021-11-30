import ccxt from 'ccxt';

const apiKey = "254ffa69-ez2xc4vb6n-1220cb00-87a80"
const secret = "32e6549a-b15de06b-2d6b41cb-4cd09"

let exchange = new ccxt.huobi({
  apiKey: apiKey,
  secret: secret,
  timeout: 30000,
  enableRateLimit: true,
}) // default id

export async function transTickerClose(changeType) { //. ETH/USDT
  changeType ? changeType = changeType : changeType = 'ETH/USDT' //default
  return new Promise((resolve, reject) => {
    if (exchange.has['fetchTicker']) {
      exchange.fetchTicker(changeType)
      .then(res=>{
        resolve(res.close)
      })
      .catch(error => {
        resolve(null)
      })
    } else {
      resolve(null)
    }
  })
}

export async function transTickerObject(changeType) {
  changeType ? changeType = changeType : changeType = 'ETH/USDT' //default
  return new Promise((resolve, reject) => {
    if (exchange.has['fetchTicker']) {
      exchange.fetchTicker(changeType)
      .then(res => {
        resolve(res)
      })
      .catch(errpr => {
        resolve(null)
      })
      // this.ethUsdt = await (exchange.fetchTicker('ETH/USDT'))
      // let symbols = Object.keys (exchange.markets)
      // let random = Math.floor (Math.random () * (symbols.length - 1))
      // console.log (exchange.fetchTicker(symbols[random]))
    } else {
      resolve(null)
    }
  })
}