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
  } else {
    _data = {
       ens: data['value']
    }
  }
  return request({
    url: `/api/user/${userId}/signers`,
    method: 'get',
    params: _data
  })
}

/**
 * @description: Add a wallet (returns the corresponding wallet id)
 * @param {"name": "test", "address": "0x123", "ens": "test.ens"}
 * @return {*}
 */
 export const addWallet = (data) => {
  return request({
    url: `/api/user/{user_id}/wallet`,
    method: 'post',
    data,
  })
}

/**
 * @description: Get all wallets
 * @param 
 * @return {*}
 */
 export const getWalletList = (data) => {//todo
  return request({
    url: `/api/user/{user_id}/wallets`,
    method: 'get',
  })
}

/**
 * @description: Add a signer for a wallet
 * @param {"name": "name1", "ens": "example.ens", "address": "0x123"}
 * @return {*}
 */
 export const addSigner = (data) => {//todo
  return request({
    url: `/api/user/{user_id}/wallet/{wallet_id}/signer`,
    method: 'post',
    data
  })
}

/**
 * @description: Get all signers for a wallet (including states)
 * @param
 * @return {*}Status:1 to be confirmed 2 rejected  3 active
 */
 export const getSignerList = (data) => {
  return request({
    url: `/api/user/{user_id}/wallet/{wallet_id}/signers`,
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
  return request({
    url: `/api/user/{user_id}/wallet/{wallet_id}/signer`,
    method: 'delete',
    data
  })
}