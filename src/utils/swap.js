

export const PROTOCOLMAP = {
  'v2': { id: 'v2', name: 'UniswapV2', icon: require('@/assets/uniswap/swap2.png'), },
  'v3': { id: 'v3', name: 'UniswapV3', icon: require('@/assets/uniswap/swap3.png'), },
}

export const PROTOCOLList = Object.keys(PROTOCOLMAP).map(item => {
  return {
    id: PROTOCOLMAP[item].id,
    leftTitle: PROTOCOLMAP[item].name,
    icon: PROTOCOLMAP[item].icon,
  }
})