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
 * @param {"txid": "1", "from": "0x1", "to": "0x1", "type":0, "block_num": 10}
 * @return {*}
 */
export const addTransactionHistory = (data) => {
  data['from'] && (data['from'] = data['from'].toLocaleLowerCase());
  // data['to'] && (data['to'] = data['to'].toLocaleLowerCase());
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
  // data['to'] && (data['to'] = data['to'].toLocaleLowerCase());
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
