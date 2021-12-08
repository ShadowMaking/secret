

export const PROTOCOLMAP = {
  'v2': { id: 'v2', name: 'UniswapV2' },
  'v3': { id: 'v3', name: 'UniswapV3' },
}

export const PROTOCOLList = Object.keys(PROTOCOLMAP).map(item => {
  return {
    id: PROTOCOLMAP[item].id,
    leftTitle: PROTOCOLMAP[item].name
  }
})