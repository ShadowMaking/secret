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


/***************************** KMS Encrypt Decrypt ***************************/
// curl -XPOST -H "Content-Type:application/json"  --url  "localhost:3000/kms/7/enc" -d '{"plain_key": "xxxx" }'
export const encryptPrivateKey = (data) => {
  const userId = data['userId'];
  return request({
    url: `/api/kms/${userId}/enc`,
    method: 'post',
    data: { plain_key: data.privateKey },
  })
}

// curl -XPOST -H "Content-Type:application/json"  --url  "localhost:3000/kms/7/dec" -d '{"cipher_key": "046a6e77e5a2aec30d4da418bbde87731be82c8b665040a8844a7d1b609c40d24bc3f401cea9f1c33856ec043b0141cd7089c794f5d454bfdf99948513e8eb527a46ddeb2ef0381ccb7bc1c02a6ecbea5dc4b7a26c48d89dce64c238eb2b1c8272338f3882b1a8ed0c5d55f21bc308b2b63d169dadc94ac5f2f74db6f2c71d9baf" }'
export const decryptPrivateKey = (data) => {
  const userId = data['userId'];
  return request({
    url: `/api/kms/${userId}/dec`,
    method: 'post',
    data: { cipher_key: data.encryptKey },
  })
}

// curl -XPOST -H "Content-Type:application/json"  --url  "localhost:3000/relay/7/upload" -d '{ "address": "2121", "cipher_key": "046a6e77e5a2aec30d4da418bbde87731be82c8b665040a8844a7d1b609c40d24bc3f401cea9f1c33856ec043b0141cd7089c794f5d454bfdf99948513e8eb527a46ddeb2ef0381ccb7bc1c02a6ecbea5dc4b7a26c48d89dce64c238eb2b1c8272338f3882b1a8ed0c5d55f21bc308b2b63d169dadc94ac5f2f74db6f2c71d9baf" }'
export const uploadEncrpytKey = (data) => {
  const userId = data['userId'];
  return request({
    url: `/api/relay/${userId}/upload`,
    method: 'post',
    data: { address: data.address, cipher_key: data.encryptKey },
  })
}

// TODO 接口传参是不是把address这个传参换成userId更为稳妥？因为有可能本地存储的address被清掉
// curl -XPOST -H "Content-Type:application/json"  --url  "localhost:3000/relay/7/download" -d '{ "address": "2121" }'
export const downloadEncrpytKey = (data) => {
  const userId = data['userId'];
  return request({
    url: `/api/relay/${userId}/download`,
    method: 'post',
    data: { address: data.address },
  })
}


