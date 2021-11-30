import request from '@/utils/request';

/***************************** send ***************************/
export const getAvailableTokenAssets = (data) => {
  const accountAddress = data['accountAddress'];
  return request({
    url: `/api/txhs?action=search&from=${accountAddress}`,
    method: 'get',
  })
}