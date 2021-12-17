import CoinGecko from 'coingecko-api'

const CoinGeckoClient = new CoinGecko()

export async function getTokenPrice(originAddress, toName) {//toname defaultvalue usd
  originAddress = originAddress && originAddress.toLocaleUpperCase()
  return new Promise((resolve, reject) => {
    if (CoinGeckoClient) {
      CoinGeckoClient.simple.fetchTokenPrice({
        contract_addresses: originAddress,
        vs_currencies: toName ? toName : 'usd',
      })
      .then(res=>{
        if (res.success && res.data) {
          let TokenPrice = res.data[originAddress.toLocaleLowerCase()].usd
          resolve(TokenPrice)
        } else {
          resolve(null)
        }
        // CoinGeckoClient.simple.supportedVsCurrencies().then(data => {
        //   console.log(data)
        // })
      })
      .catch(error => {
        resolve(null)
      })
    } else {
      resolve(null)
    }
  })
}

export async function getTokenAmountByUs(tokenAddress, usAmount) {
  return new Promise((resolve, reject) => {
    if (CoinGeckoClient) {
      getTokenPrice(tokenAddress)
      .then(res=>{
        let tokenAmount = usAmount/res
        resolve(tokenAmount)
      })
      .catch(error => {
        resolve(null)
      })
    } else {
      resolve(null)
    }
  })
}

export async function getTokenUs(tokenAddress, tokenAmount) {
  return new Promise((resolve, reject) => {
    if (CoinGeckoClient) {
      getTokenPrice(tokenAddress)
      .then(res=>{
        let tokenBalance = res * tokenAmount
        resolve(tokenBalance)
      })
      .catch(error => {
        resolve(null)
      })
    } else {
      resolve(null)
    }
  })
}