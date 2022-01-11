import request from '@/utils/request';

// transaction history: (txid, from, to, status(0 | 1), type, sub_txid), where type can be :
/* 
const TX_TYPE_L1ToL1 = 0x0
const TX_TYPE_L1ToL2 = 0x1
const TX_TYPE_L2ToL1 = 0x2
const TX_TYPE_L2ToL2 = 0x3
*/

export const TRANSACTION_TYPE = {
  'L1ToL1': 0,
  'L1ToL2': 1,
  'L2ToL1': 2,
  'L2ToL2': 3,
}

/**
 * @description: add transaction history
 * @param {"txid": "1", "from": "0x1", "to": "0x1", "type":0, "block_num": 10, "from_type": 0}from_type 0-accountaddress 1-walletAddress
 * @return {*}
 */
export const addTransactionHistory = (data) => {
  data['from'] && (data['from'] = data['from'].toLocaleLowerCase());
  data['to'] && (data['to'] = data['to'].toLocaleLowerCase());
  data['txid'] && (data['txid'] = data['txid'].toLocaleLowerCase());
  return request({
    url: '/api/txh',
    method: 'post',
    data,
  })
}

/**
 * @description: update transaction history
 * @param {"status": 1, "sub_txid": "2121"}
 * @return {*}
 */
export const updateTransactionHistory = (data) => {
  const txid = data.txid
  data['from'] && (data['from'] = data['from'].toLocaleLowerCase());
  data['to'] && (data['to'] = data['to'].toLocaleLowerCase());
  data['txid'] && (data['txid'] = data['txid'].toLocaleLowerCase());
  return request({
    url: `/api/txh/${txid}`,
    method: 'put',
    data,
  })
}

/**
 * @description: search all transaction history
 * @param from
 * @return {*}
 */
 export const searchAllTransactionHistory = (data) => {
  const fromStr = data['from'];
  return request({
    url: `/api/txhs?action=search&from=${fromStr}`,
    method: 'get',
  })
}

/**
 * @description: query transaction
 * @param from
 * @return {*}
 */
 export const queryTransactionHistory = (data) => {
  const txid = data.txid;
  return request({
    url: `/api/txh?txid=${txid}`,
    method: 'get',
  })
}

// TODO
/**
 * @description: search all transaction history
 * @param from
 * @return {*}
 */
 export const searchAllTransactionHistory_forHistory = (data={}) => {
  let action = data['action'] || 'search';
  data['order'] = 1;
  data['action'] && (delete data['action'])
  let queryStr = "";
  Object.keys(data).forEach(key => {
    data[key] && (queryStr += `&${key}=${(data[key]+'').toLocaleLowerCase()}`)
  })
  const apiUrl = `/api/txhs?action=${action}${queryStr}`;
  return request({
    url: apiUrl,
    method: 'get',
  })
}

/**
 * @description: query Approval
 * @param from
 * @return {*}
 */
 export const queryApprovalList = (data) => {
  const userId = data['userId'];
  return request({
    url: `/api/user/${userId}/allowances`,
    method: 'get',
    params: data
  })
}