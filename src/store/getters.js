const getters = {
  metamaskInstall: state => state.metamask.metamaskInstall,
  searchList: state => state.transaction.searchList,
  OTPSecretMap: state => state.socailRecovery.OTPSecretMap,
  tokenABIMap: state => state.token.tokenABIMap,
  privateKeyInfoForAddress: state => state.relay.privateKeyInfoForAddress,
}
export default getters