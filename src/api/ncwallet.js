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
    url: `/api/user/${userId}/addresses`,
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
  }
  return request({
    url: `/api/user/${userId}/wallet`,
    method: 'post',
    data: _data,
  })
}

/**
 * @description: Get all wallets as owner
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
 * @description: Get all wallets as signer
 * @param 
 * @return {*}
 */
 export const getWalletListAsSign = (data) => {
  const userId = data['userId'];
  return request({
    url: `/api/user/${userId}/as_signers`,
    method: 'get',
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
    ens: data['ens'],
    address: data['address'],
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
 * @param {"signer_id": 1, "status": 2}
 * @return 
 */
 export const updateSigner = (data) => {
  return request({
    url: `/api/user/{user_id}/wallet/{wallet_id}/signer`,
    method: 'post',
    data
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
    signer_id: data['signerId'],
  }
  return request({
    url: `/api/user/${userId}/wallet/${walletId}/signer`,
    method: 'delete',
    data: _data,
  })
}