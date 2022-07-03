import request from '@/utils/request';



/**
 * @description: Add a hide transaction history
 * @param {"sender_public_key":,"sender_address", "stealth_public_key", "stealth_address", "message", "nonce" ,"amount","user_id","token_name"}
 * @return {*}
 */
 export const addStealth = (data) => {
  return request({
    url: `/api/user/stealth_address`,
    method: 'post',
    data: data,
  })
}

/**
 * @description: Get Stealth list
 * @param {"user_id",receiver_address}
 * @return {*}
 */
 export const getStealthList = (data) => {
  return request({
    url: `/api/user/stealth_address`,
    method: 'get',
    params: data,
  })
}

/**
 * @description: update stealthList status
 * @param {"message", "status"}//0-noExported 1-exporting 2-hasExported
 * @return {*}
 */
 export const updateStealthStatus = (data) => {
  return request({
    url: `/api/user/stealth_address`,
    method: 'put',
    data: data,
  })
}

/**
 * @description: deposit
 * @param 
 * @return {*}
 */
 export const zkzruAccout = (data) => {
  return request({
    url: `/api/zkzru/account`,
    method: 'post',
    data: data,
  })
}

/**
 * @description: withdraw add tx history
 * @param 
 * @return {*}
 */
 export const zkzruTx = (data) => {
  return request({
    url: `/api/zkzru/tx`,
    method: 'post',
    data: data,
  })
}

/**
 * @description: Get account info
 * @param 
 * @return {*}
 */
 export const getZkzruAccountInfo = (address) => {
  return request({
    url: `/api/zkzru/account/${address}`,
    method: 'get',
  })
}

/**
 * @description: Get tx info
 * @param 
 * @return {*}
 */
 export const getZkzruTxStatus = (txid) => {
  return request({
    url: `/api/zkzru/tx/${txid}`,
    method: 'get',
  })
}

/**
 * @description: Get withdraw info
 * @param 
 * @return {*}
 */
 export const getWithdrawInfo = (data) => {
  return request({
    url: `/api/zkzru/proveWithdraw`,
    method: 'post',
    data: data,
  })
}