import request from '@/utils/request';



/**
 * @description: Add a hide transaction history
 * @param {"sender_public_key":,"sender_address", "stealth_public_key", "stealth_address", "message", "nonce" ,"amount"}
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
 * @param {"userPublick", "sender_public_key", message, none}
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
    params: data,
  })
}