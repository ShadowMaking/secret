
import L1TokenABIJSON from '@/assets/contractJSON/TestCustomTokenL1.json'
import L2TokenABIJSON from '@/assets/contractJSON/TestArbCustomToken.json'
import _ from 'lodash'

const TOKEN_L1 = [
  {
    "tokenType": 'ERC20',
    "tokenAddress": "0xceD8dFd4b63e8B035f3B05fb36398C70E2900262",
    "symbol": "EETL1",
    "decimals": 18,
    // "image": "https: //foo.io/token-image.svg",
    "json": L1TokenABIJSON,
    "isToken": true,
  },
]

const TOKEN_L2 = [
  {
    "tokenType": 'ERC20',
    "tokenAddress": "0x32D292d23A277410e23Ef29e79E2FD165FCD8F3E",
    "symbol": "EETL2",
    "decimals": 18,
    // "image": "https: //foo.io/token-image.svg",
    "json": L2TokenABIJSON,
    "isToken": true,
  },
]

const checkIsTokenBySymbol = (symbol) => [].concat(TOKEN_L1, TOKEN_L2).some(item => {
  return item.symbol === symbol && item.isToken
})

const getTokenAddress = (symbol) => {
  const target = _.find([].concat(TOKEN_L1, TOKEN_L2), { symbol })
  return target && target['tokenAddress']
}

export { TOKEN_L1, TOKEN_L2, checkIsTokenBySymbol, getTokenAddress, L1TokenABIJSON, L2TokenABIJSON }
