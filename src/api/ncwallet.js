import request from '@/utils/request';

//nc-wallet


/**
 * @description: Search Signers 
 * @param (with ens,with email)
 * @/user/{user_id}/signers&email=abc@google.com
  /user/{user_id}/signers&ens=test.ens
 */
 export const searchSigner = (data) => {
  const userId = data['userId'];
  let _data;
  if (data['value'] && data['value'].indexOf("@gmail.com") != -1) {//email
    _data = {
       email: data['value']
    }
  } else if (data['value'] && data['value'].indexOf(".") != -1){
    _data = {
       ens: data['value']
    }
  } else {
    _data = {
       address: data['value'].toLocaleLowerCase()
    }
  }
  return request({
    url: `/api/user/${userId}/friends_addresses`,
    method: 'get',
    params: _data
  })
}

/**
 * @description: Add a wallet (returns the corresponding wallet id)
 * @param {"name": "test", "address": "0x123", "ens": "test.ens", "signers": ["0x456", "0x789"]}
 * @return {*}
 */
 export const addWallet = (data) => {
  return request({
    url: `/api/user/wallet`,
    method: 'post',
    data: data,
  })
}

/**
 * @description: Get all wallets as owner(userid)
 * @param 
 * @return {*}
 */
 export const getWalletList = (data) => {
  // const userId = data['userId'];
  return request({
    url: `/api/user/wallets`,
    method: 'get',
    params: data,
  })
}

/**
 * @description: Get all wallets as owner(address)
 * @param address
 * @return {*}
 */
 export const getWalletListAsOwner = (data) => {
  return request({
    url: `/api/user/wallets`,
    method: 'get',
    params: data
  })
}

/**
 * @description: Get all wallets as signer
 * @param 
 * @return {*}
 */
 export const getWalletListAsSign = (data) => {
  return request({
    url: `/api/user/as_signers`,
    method: 'get',
    params: data
  })
}

/**
 * @description: Add a signer for a wallet
 * @param {"name": "name1", "ens": "example.ens", "address": "0x123"}
 * @return {*}
 */
 export const addSigner = (data) => {
  const walletId = data['walletId']
  let _data = {
    name: data['name'],
    address: data['address'],
    txid: data['txid'],
    network_id: data['network_id'],
  }
  return request({
    url: `/api/user/wallet/${walletId}/signer`,
    method: 'post',
    data: _data,
  })
}

/**
 * @description: Get all signers for a wallet (including states)
 * @param
 * @return {*}Status:1 to be confirmed 2 rejected  3 active
 */
 export const getSignerList = (data) => {
  const walletId = data['walletId']
  const _data = {
    network_id: data.network_id
  } 
  return request({
    url: `/api/user/wallet/${walletId}/signers`,
    method: 'get',
    params: _data,
  })
}

/**
 * @description: Update status for a signer
 * @param {"signer_address": "0x123", "status": 2}
 * @return 
 */
 export const updateSigner = (data) => {
  const walletId = data['walletId']
  let _data = {
    address: data['signerAddress'],
    status: data['status'],
    network_id: data['network_id'],
  }
  return request({
    url: `/api/user/wallet/${walletId}/signer`,
    method: 'post',
    data: _data,
  })
}

/**
 * @description: Detele a signer
 * @param {"signer_id": 1}
 * @return 
 */
 export const deleteSigner = (data) => {
  const walletId = data['walletId'] 
  let _data = {
    address: data['signerAddress'],
    txid: data['txid'],
    network_id: data['network_id'],
  }
  return request({
    url: `/api/user/wallet/${walletId}/signer`,
    method: 'delete',
    data: _data,
  })
}

/**
 * @description: Upload sign_message for a signer
 * @param {"address": "0x123", "sign_message": "abc"}
 * @return 
 */
 export const uploadSignmessage = (data) => {
  const walletId = data['walletId']
  let _data = {
    address: data['signerAddress'],
    sign_message: data['signMessage'],
    status: data['status'],
  }
  return request({
    url: `/api/user/wallet/${walletId}/signer`,
    method: 'post',
    data: _data,
  })
}

/**
 * @description: Update owner address for a wallet 
 * @param {"owner_address": "0x123"}
 * @return 
 */
 export const updateOwnerAddress = (data) => {
  const walletId = data['walletId']
  let _data
  if (data['txid']) {
    _data = {
      txid: data['txid'],
      action: 'to_execute_recover',
    }
  } else {
    _data = {
      owner_address: data['ownerAddress'],
      network_id: data['network_id'],
      action: 'to_recover',
    }
  }

  return request({
    url: `/api/user/wallet/${walletId}`,
    method: 'post',
    data: _data,
  })
}

/**
 * @description: cancel recover wallet 
 * @param {"owner_address": "0x123"}
 * @return 
 */
 export const cancelRecoverWallet = (data) => {
  const walletId = data['walletId']
  let _data = {
      owner_address: data['ownerAddress'],
      status: data['status'],
      action: 'to_cancel_recover',
      txid: data['txid'],
    }

  return request({
    url: `/api/user/wallet/${walletId}`,
    method: 'post',
    data: _data,
  })
}

/**
 * @description: Update status for a wallet 
 * @param {"status": "0", txid: ''}
 * @return 
 */
 export const updateWalletStatus = (data) => {
  const walletId = data['walletId']
  let _data = {
    status: data['status'],
    network_id: data['network_id'],
  }
  return request({
    url: `/api/user/wallet/${walletId}`,
    method: 'post',
    data: _data,
  })
}
/**
 * @description: Get sign_message if available (The signer address should be given to assure that it can get sign_message)
 * @param {"address": "0x123"}
 * @return 
 */
 export const getSignMessage = (data) => {
  const walletId = data['walletId']
  let _data = {
    address: data['signerAddress'],
    mtxid: data['mtxid'],
    network_id: data['network_id'],
  }
  return request({
    url: `/api/user/wallet/${walletId}/sign_message`,
    method: 'get',
    params: _data,
  })
}

/**
 * @description: add multi sig tx
 * @param {"network_id": "1", "user_id": 3, "wallet_address": "0x12", "to": "0x23", "value": "0x1", "data": encodeFunction(dai, (to, value, data)),"operation": 1}
 * @return 
 */
 export const addMultTx = (data) => {
  return request({
    url: `/api/mtx/meta`,
    method: 'post',
    data: data,
  })
}

/**
 * @description: query multi sig tx
 * @param 
 * @return 
 */
 export const getMultTxInfo = (mtxid) => {
  return request({
    url: `/api/mtx/meta/${mtxid}`,
    method: 'get',
  })
}

/**
 * @description: query siger messages
 * @param 
 * @return 
 */
 export const getSigerMessages = (mtxid) => {
  return request({
    url: `/api/mtx/sign/${mtxid}`,
    method: 'get',
  })
}

/**
 * @description: add signer message   transaction sign confirm
 * @param {"mtxid": 2, "signer_address": "0x12", "signer_address": "0x121", "status": 2,"operation": 1}
 * @return 
 */
 export const addSignerMultMessages = (data) => {
  return request({
    url: `/api/mtx/sign`,
    method: 'post',
    data: data,
  })
}

/**
 * @description: update txid of multi sig tx
 * @param {"id":2, "txid": "0x221"}
 * @return 
 */
 export const updateTransTx = (data) => {
  return request({
    url: `/api/mtx/meta`,
    method: 'put',
    data: data,
  })
}

/**
 * @description: create wallet store ProxyInfo 
 * @param {"user_address":, "wallet_address": "0x221", tx_id, name:''}
 * @return 
 */
 export const storeProxyInfo = (data) => {
  return request({
    url: `/api/user/wallet_address`,
    method: 'post',
    data: data,
  })
}

/**
 * @description: create wallet get ProxyInfo 
 * @param {"id":2, "txid": "0x221"}
 * @return 
 */
 export const getProxyInfo = (data) => {
  return request({
    url: `/api/user/wallet_address`,
    method: 'get',
    params: data,
  })
}