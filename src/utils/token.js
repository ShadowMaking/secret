
import L1TokenABIJSON from '@/assets/contractJSON/TestCustomTokenL1.json'
import L2TokenABIJSON from '@/assets/contractJSON/TestArbCustomToken.json'
import _ from 'lodash'

const TOKEN_L1 = [
  {
    "tokenType": 'ERC20',
    "tokenAddress": "0xEe5455B2CacEC0f516362B8E88B0a145046B47f8",
    "symbol": "EIG",
    "decimals": 18,
    // "image": "https: //foo.io/token-image.svg",
    "json": L1TokenABIJSON,
    "isToken": true,
  },
]

const TOKEN_L2 = [
  {
    "tokenType": 'ERC20',
    "tokenAddress": "0x200CE14abF65Df2F7eB9e377AC765C09E13010Df",
    "symbol": "xEIG",
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
