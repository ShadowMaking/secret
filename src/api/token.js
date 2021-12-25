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

// curl -XPOST -H "Content-Type:application/json"  --url  "localhost:3000/relay/7/download" -d '{ "address": "2121" }'
export const downloadEncrpytKey = (data) => {
  const userId = data['userId'];
  return request({
    url: `/api/relay/${userId}/download`,
    method: 'post',
    // data: { address: data.address },
    data: { userId },
  })
}


// upload changed   curl -XPOST -H "Content-Type:application/json"  --url "localhost:3000/user/{user_id}/address" -d '{ "network_id": "1", "user_address": "0x2" , "cipher_key": "0x"}'
// download changed  curl -XGET -H "Content-Type:application/json"  --url "localhost:3000/user/{user_id}/addresses?network_id=1'

// curl -XPOST -H "Content-Type:application/json"  --url "localhost:3000/user/{user_id}/address" -d '{ "network_id": "1", "user_address": "0x2" , "cipher_key": "0x"}'
export const uploadEncrpytKeyByAddress= (data) => {
  const userId = data['userId'];
  const network_id = data['network_id'] || '1';
  const user_address = data['address'];
  return request({
    url: `/api/user/${userId}/address`,
    method: 'post',
    data: { network_id, user_address,  cipher_key: data.encryptKey },
  })
}

// curl -XGET -H "Content-Type:application/json"  --url "localhost:3000/user/{user_id}/addresses?network_id=1'
// get all privateKey
export const downloadAllEncrpytKey = (data) => {
  const userId = data['userId'];
  const network_id = data['network_id'] || '1';
  return request({
    url: `/api/user/${userId}/addresses?network_id=${network_id}`,
    method: 'get',
  })
}
