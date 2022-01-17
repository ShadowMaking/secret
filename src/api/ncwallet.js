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
  const userId = data['userId'];
  const _data = {
    name: data['name'],
    address: data['address'],
    signers: data['signers'],
    wallet_address: data['walletAddress'],
    txid: data['txid'],
  }
  return request({
    url: `/api/user/${userId}/wallet`,
    method: 'post',
    data: _data,
  })
}

/**
 * @description: Get all wallets as owner(userid)
 * @param 
 * @return {*}
 */
 export const getWalletList = (data) => {
  const userId = data['userId'];
  return request({
    url: `/api/user/${userId}/wallets`,
    method: 'get',
  })
}

/**
 * @description: Get all wallets as owner(address)
 * @param address
 * @return {*}
 */
 export const getWalletListAsOwner = (data) => {
  const userId = data['userId'];
  const _data = {
    address: data['ownerAddress'].toLocaleLowerCase()
  }
  return request({
    url: `/api/user/${userId}/wallets`,
    method: 'get',
    params: _data
  })
}

/**
 * @description: Get all wallets as signer
 * @param 
 * @return {*}
 */
 export const getWalletListAsSign = (data) => {
  const userId = data['userId'];
  let _data = {
    address: data['address']
  }
  return request({
    url: `/api/user/${userId}/as_signers`,
    method: 'get',
    params: _data
  })
}

/**
 * @description: Add a signer for a wallet
 * @param {"name": "name1", "ens": "example.ens", "address": "0x123"}
 * @return {*}
 */
 export const addSigner = (data) => {
  const userId = data['userId'] 
  const walletId = data['walletId']
  let _data = {
    name: data['name'],
    address: data['address'],
    txid: data['txid']
  }
  return request({
    url: `/api/user/${userId}/wallet/${walletId}/signer`,
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
  const userId = data['userId'] 
  const walletId = data['walletId'] 
  return request({
    url: `/api/user/${userId}/wallet/${walletId}/signers`,
    method: 'get',
  })
}

/**
 * @description: Update status for a signer
 * @param {"signer_address": "0x123", "status": 2}
 * @return 
 */
 export const updateSigner = (data) => {
  const userId = data['userId'] 
  const walletId = data['walletId']
  let _data = {
    address: data['signerAddress'],
    status: data['status'],
  }
  return request({
    url: `/api/user/${userId}/wallet/${walletId}/signer`,
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
  const userId = data['userId'] 
  const walletId = data['walletId'] 
  let _data = {
    address: data['signerAddress'],
    txid: data['txid'],
  }
  return request({
    url: `/api/user/${userId}/wallet/${walletId}/signer`,
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
  const userId = data['userId'] 
  const walletId = data['walletId']
  let _data = {
    address: data['signerAddress'],
    sign_message: data['signMessage'],
    status: data['status']
  }
  return request({
    url: `/api/user/${userId}/wallet/${walletId}/signer`,
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
  const userId = data['userId'] 
  const walletId = data['walletId']
  let _data = {
    owner_address: data['ownerAddress'],
  }
  return request({
    url: `/api/user/${userId}/wallet/${walletId}`,
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
  const userId = data['userId'] 
  const walletId = data['walletId']
  let _data = {
    address: data['signerAddress'],
  }
  return request({
    url: `/api/user/${userId}/wallet/${walletId}/sign_message`,
    method: 'get',
    params: _data,
  })
}