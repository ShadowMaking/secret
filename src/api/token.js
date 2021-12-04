import request from '@/utils/request';

/***************************** send ***************************/
export const getAvailableTokenAssets = (data) => {
  const accountAddress = data['accountAddress'];
  return request({
    url: `/api/txhs?action=search&from=${accountAddress}`,
    method: 'get',
  })
}

// Save user's allowance for a token in a network for a swap contract
export const saveUserAllowanceForToken = (data) => {
  const userId = data['userId'];
  delete data['userId']
  return request({
    url: `/api/user/${userId}/allowance`,
    method: 'post',
    data,
  })
}

// Get user's allowance for a token in a network for a swap contract
export const getUserAllowanceForToken = (data) => {
  const userId = data['userId'];
  delete data['userId']
  return request({
    url: `/api/user/${userId}/allowance`,
    method: 'get',
    params: data
  })
}
