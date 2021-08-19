
// 获取metamask连接的网络ID
export const getSelectedChainID = () => {
  return window.ethereum.networkVersion;
}

