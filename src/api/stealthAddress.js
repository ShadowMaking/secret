import request from '@/utils/request';



/**
 * @description: Add a hide transaction history
 * @param {"sender_public_key":,"sender_address", "receiver_address", "message", "nonce" }
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